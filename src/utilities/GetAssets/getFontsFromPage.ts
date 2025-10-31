import puppeteer from 'puppeteer';

const IGNORED_FONTS = new Set([
  'Icons',
  'icons',
  'fontello',
  'Glyphicons Halflings',
  'slick',
  'swiper-icons',
]);

// who actually provides the font set
const KNOWN_FONT_PROVIDERS = [
  {
    name: 'Google',
    match: ['fonts.gstatic.com', 'fonts.googleapis.com'],
  },
  {
    name: 'Adobe',
    match: ['use.typekit.net', 'use.typekit.com', 'use.adobe.com'],
  },
  {
    name: 'Bunny',
    match: ['fonts.bunny.net', 'api.fonts.bunny.net'],
  },
  {
    name: 'Font Awesome',
    match: ['use.fontawesome.com'],
  },
];

// CDNs / delivery hosts
const KNOWN_CDNS = [
  'fonts.gstatic.com',
  'fonts.googleapis.com',
  'use.typekit.net',
  'use.adobe.com',
  'fonts.bunny.net',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdn.shopify.com',
];

type FontDelivery = 'cdn' | 'local' | '';

export interface DetectedFont {
  family: string;
  provider: string;       // e.g. "Google", "Adobe", "Local", ""
  delivery: FontDelivery; // always set
  sourceUrl?: string | null;
}

function detectProvider(url: string): string | '' {
  const lower = url.toLowerCase();
  for (const p of KNOWN_FONT_PROVIDERS) {
    if (p.match.some((m) => lower.includes(m))) {
      return p.name;
    }
  }
  return '';
}

// IMPORTANT: check “looks like CDN” first, then fall back to “is it local”
function detectDelivery(url: string, pageOrigin: string): FontDelivery {
  const lower = url.toLowerCase();

  // 1) known CDN / proxied Google
  if (
    KNOWN_CDNS.some((c) => lower.includes(c)) ||
    lower.includes('fonts.gstatic.com') ||
    lower.includes('fonts.googleapis.com')
  ) {
    return 'cdn';
  }

  // 2) same origin → local
  if (lower.startsWith(pageOrigin.toLowerCase())) {
    return 'local';
  }

  // 3) typical WP paths → local
  if (lower.includes('/wp-content/') || lower.includes('/themes/')) {
    return 'local';
  }

  return '';
}

export async function getFontsFromPage(url: string): Promise<DetectedFont[]> {
  const pageUrl = new URL(url);
  const pageOrigin = pageUrl.origin;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const fontRequests = new Set<string>();

  page.on('requestfinished', (req) => {
    const rUrl = req.url();
    if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(rUrl)) {
      fontRequests.add(rUrl);
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // wait until document.fonts exists and has something
  await page.waitForFunction(() => {
    // @ts-ignore
    const fonts = (document as any).fonts;
    // @ts-ignore
    return fonts && fonts.size >= 1;
  }, { timeout: 10000 });

  const result = await page.evaluate(() => {
    const fontFaces: Array<{
      family: string;
      status: string;
      weight?: string;
      style?: string;
    }> = [];

    // @ts-ignore
    for (const f of (document as any).fonts || []) {
      fontFaces.push({
        family: f.family,
        status: f.status,
        weight: f.weight,
        style: f.style,
      });
    }

    const selectors = ['body', 'p', 'h1', 'h2', 'h3', 'span', '.wp-block', '.entry-content'];
    const computedFamilies = new Set<string>();
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.fontFamily) computedFamilies.add(cs.fontFamily);
      });
    });

    return {
      fontFaces,
      computedFamilies: Array.from(computedFamilies),
    };
  });

  await browser.close();

  // 1) filter icons
  const runtimeFontFacesRaw = result.fontFaces.filter(
    (f) => !IGNORED_FONTS.has(f.family)
  );

  // 2) dedupe by family
  const seenFamilies = new Set<string>();
  const runtimeFontFaces = runtimeFontFacesRaw.filter((f) => {
    const key = f.family.toLowerCase();
    if (seenFamilies.has(key)) return false;
    seenFamilies.add(key);
    return true;
  });

  // 3) fetch file URLs
  const rawFontFiles = Array.from(fontRequests).filter((url) => {
    return !/icons\.woff2?|fontello|glyphicons|slick/i.test(url);
  });

  // 4) build final array
  const fonts: DetectedFont[] = runtimeFontFaces.map((f) => {
    const familyLower = f.family.toLowerCase();

    // try to match file by substring
    const matchUrl = rawFontFiles.find((fileUrl) =>
      fileUrl.toLowerCase().includes(familyLower)
    );

    if (matchUrl) {
      const provider = detectProvider(matchUrl);
      const delivery = detectDelivery(matchUrl, pageOrigin);
      // if provider is empty but delivery is local, call it Local
      const finalProvider = provider || (delivery === 'local' ? 'Local' : '');
      return {
        family: f.family,
        provider: finalProvider,
        delivery,            // ALWAYS present
        sourceUrl: matchUrl,
      };
    }

    // no file matched → still return, but mark unknown
    return {
      family: f.family,
      provider: '',
      delivery: '',
      sourceUrl: null,
    };
  });

  return fonts;
}
