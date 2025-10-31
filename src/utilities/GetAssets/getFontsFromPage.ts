import puppeteer, { Browser } from 'puppeteer';

const IGNORED_FONTS = new Set([
  'Icons',
  'icons',
  'fontello',
  'Glyphicons Halflings',
  'slick',
  'swiper-icons',
]);

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
  provider: string;
  delivery: FontDelivery;
  sourceUrl?: string | null;
}

interface EvaluateResult {
  fontFaces: Array<{
    family: string;
    status: string;
    weight?: string;
    style?: string;
  }>;
  computedFamilies: string[];
}

function detectProvider(url: string): string {
  const lower = url.toLowerCase();
  for (const p of KNOWN_FONT_PROVIDERS) {
    if (p.match.some((m) => lower.includes(m))) {
      return p.name;
    }
  }
  return '';
}

function detectDelivery(url: string, pageOrigin: string): FontDelivery {
  const lower = url.toLowerCase();

  if (
    KNOWN_CDNS.some((c) => lower.includes(c)) ||
    lower.includes('fonts.gstatic.com') ||
    lower.includes('fonts.googleapis.com')
  ) {
    return 'cdn';
  }

  if (lower.startsWith(pageOrigin.toLowerCase())) {
    return 'local';
  }

  if (lower.includes('/wp-content/') || lower.includes('/themes/')) {
    return 'local';
  }

  return '';
}

export async function getFontsFromPage(url: string): Promise<DetectedFont[]> {
  // optional: skip in build
  if (typeof process !== 'undefined' && process.env.PUPPETEER_SKIP === '1') {
    return [];
  }

  const pageUrl = new URL(url);
  const pageOrigin = pageUrl.origin;

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const fontRequests = new Set<string>();

    page.on('requestfinished', (req) => {
      const rUrl = req.url();
      if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(rUrl)) {
        fontRequests.add(rUrl);
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // NOTE: simplest TS-safe way
    const result = (await page.evaluate(async () => {
      const fontsObj = (document as any).fonts;

      if (fontsObj && typeof fontsObj.ready === 'object') {
        try {
          await fontsObj.ready;
        } catch {
          // ignore
        }
      }

      const fontFaces: Array<{
        family: string;
        status: string;
        weight?: string;
        style?: string;
      }> = [];

      for (const f of (fontsObj || [])) {
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
    })) as EvaluateResult;

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

    // 3) font files captured from network
    const rawFontFiles = Array.from(fontRequests).filter((reqUrl) => {
      return !/icons\.woff2?|fontello|glyphicons|slick/i.test(reqUrl);
    });

    // 4) build final array
    const fonts: DetectedFont[] = runtimeFontFaces.map((f) => {
      const familyLower = f.family.toLowerCase();

      const matchUrl = rawFontFiles.find((fileUrl) =>
        fileUrl.toLowerCase().includes(familyLower)
      );

      if (matchUrl) {
        const provider = detectProvider(matchUrl);
        const delivery = detectDelivery(matchUrl, pageOrigin);
        const finalProvider = provider || (delivery === 'local' ? 'Local' : '');
        return {
          family: f.family,
          provider: finalProvider,
          delivery,
          sourceUrl: matchUrl,
        };
      }

      return {
        family: f.family,
        provider: '',
        delivery: '',
        sourceUrl: null,
      };
    });

    return fonts;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[getFontsFromPage] Failed to detect fonts for', url, err);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
