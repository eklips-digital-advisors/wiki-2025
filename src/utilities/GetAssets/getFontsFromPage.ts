import fetch from 'node-fetch';

type FontDelivery = 'cdn' | 'local' | '';

export type DetectedFont = {
  family: string
  provider: string
  delivery: 'cdn' | 'local' | ''
  sourceUrl?: string | null
}

const KNOWN_FONT_PROVIDERS = [
  { name: 'Google', match: ['fonts.gstatic.com', 'fonts.googleapis.com'] },
  { name: 'Adobe', match: ['use.typekit.net', 'use.typekit.com', 'use.adobe.com'] },
  { name: 'Bunny', match: ['fonts.bunny.net', 'api.fonts.bunny.net'] },
  { name: 'Font Awesome', match: ['use.fontawesome.com'] },
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

// regexes
const STYLE_LINK_RE = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
const HREF_RE = /href=["']([^"']+)["']/i;
const STYLE_TAG_RE = /<style[^>]*>([\s\S]*?)<\/style>/gi;
const FONT_FACE_RE = /@font-face\s*{[\s\S]*?}/gi;
const URL_RE = /url\(([^)]+)\)/gi;
const IMPORT_RE = /@import\s+(?:url\()?["']?([^"')]+)["']?\)?\s*;/gi;

function absoluteUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
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

function detectDelivery(url: string, origin: string): FontDelivery {
  const lower = url.toLowerCase();

  // CDN / proxied Google
  if (
    KNOWN_CDNS.some((c) => lower.includes(c)) ||
    lower.includes('fonts.gstatic.com') ||
    lower.includes('fonts.googleapis.com')
  ) {
    return 'cdn';
  }

  // same origin
  if (lower.startsWith(origin.toLowerCase())) {
    return 'local';
  }

  // WP-ish
  if (lower.includes('/wp-content/') || lower.includes('/themes/')) {
    return 'local';
  }

  return '';
}

// heuristic: pick one main css from <link>s
function pickMainCss(links: string[]): string | null {
  if (!links.length) return null;

  const scored = links.map((href) => {
    const lower = href.toLowerCase();
    let score = 0;
    if (lower.includes('app')) score += 5;       // your case
    if (lower.includes('main')) score += 4;
    if (lower.includes('theme')) score += 3;
    if (/\/dist\/.+\.css/.test(lower)) score += 2;
    if (/[a-f0-9]{8,}\.css/.test(lower)) score += 1;
    return { href, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].href;
}

function parseFontFacesFromCss(css: string, baseUrl: string) {
  const perFamily = new Map<string, { family: string; urls: string[] }>();

  let m: RegExpExecArray | null;
  while ((m = FONT_FACE_RE.exec(css)) !== null) {
    const block = m[0];

    const famMatch = block.match(/font-family\s*:\s*([^;]+);/i);
    if (!famMatch) continue;
    const rawName = famMatch[1].trim().replace(/^["']|["']$/g, '');
    if (!rawName) continue;

    const lower = rawName.toLowerCase();
    // skip icon-ish
    if (
      lower.includes('icon') ||
      lower.includes('glyphicons') ||
      lower.includes('fontello') ||
      lower.includes('slick') ||
      lower.includes('swiper')
    ) {
      continue;
    }

    let entry = perFamily.get(lower);
    if (!entry) {
      entry = { family: rawName, urls: [] };
      perFamily.set(lower, entry);
    }

    let u: RegExpExecArray | null;
    while ((u = URL_RE.exec(block)) !== null) {
      const rawUrl = u[1].trim().replace(/^["']|["']$/g, '');
      const abs = absoluteUrl(rawUrl, baseUrl);
      entry.urls.push(abs);
    }
  }

  return Array.from(perFamily.values());
}

function parseImportsFromCss(css: string, baseUrl: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(css)) !== null) {
    const raw = m[1].trim();
    if (!raw) continue;
    out.push(absoluteUrl(raw, baseUrl));
  }
  return out;
}

export async function getFontsFromPage(url: string): Promise<DetectedFont[]> {
  const u = new URL(url);
  const origin = u.origin;

  // 1) fetch HTML
  const res = await fetch(url);
  const html = await res.text();

  // 2) inline <style> … </style>  ← your Inter is here
  const inlineFaces: Array<{ family: string; urls: string[] }> = [];
  let st: RegExpExecArray | null;
  while ((st = STYLE_TAG_RE.exec(html)) !== null) {
    const css = st[1];
    const faces = parseFontFacesFromCss(css, url);
    inlineFaces.push(...faces);
  }

  // 3) collect <link rel="stylesheet">
  const cssLinks: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = STYLE_LINK_RE.exec(html)) !== null) {
    const tag = m[0];
    const hrefMatch = tag.match(HREF_RE);
    if (hrefMatch?.[1]) {
      cssLinks.push(absoluteUrl(hrefMatch[1], url));
    }
  }

  // 4) pick main css and fetch it
  const mainCssUrl = pickMainCss(cssLinks);
  const externalFaces: Array<{ family: string; urls: string[] }> = [];
  if (mainCssUrl) {
    try {
      const cssRes = await fetch(mainCssUrl);
      if (cssRes.ok) {
        const css = await cssRes.text();
        // parse faces in main css
        externalFaces.push(...parseFontFacesFromCss(css, mainCssUrl));

        // follow @import (for safety)
        const imports = parseImportsFromCss(css, mainCssUrl).slice(0, 5);
        for (const imp of imports) {
          try {
            const impRes = await fetch(imp);
            if (impRes.ok) {
              const impCss = await impRes.text();
              externalFaces.push(...parseFontFacesFromCss(impCss, imp));
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 5) merge inline + external, dedupe by family
  const perFamily = new Map<string, { name: string; urls: string[] }>();
  const all = [...inlineFaces, ...externalFaces];
  for (const face of all) {
    const lower = face.family.toLowerCase();
    if (!perFamily.has(lower)) {
      perFamily.set(lower, { name: face.family, urls: [...face.urls] });
    } else {
      perFamily.get(lower)!.urls.push(...face.urls);
    }
  }

  // 6) build final
  const out: DetectedFont[] = [];
  for (const { name, urls } of perFamily.values()) {
    let sourceUrl: string | null = null;
    let provider = '';
    let delivery: FontDelivery = '';

    if (urls.length > 0) {
      // prefer provider-looking url (will catch /fonts.gstatic.com/... even when proxied!)
      const providerUrl = urls.find((u) =>
        KNOWN_FONT_PROVIDERS.some((p) =>
          p.match.some((m) => u.toLowerCase().includes(m))
        )
      );
      const chosen = providerUrl ?? urls[0];
      sourceUrl = chosen;
      provider = detectProvider(chosen);
      delivery = detectDelivery(chosen, origin);
      if (!provider && delivery === 'local') {
        provider = 'Local';
      }
    }

    out.push({
      family: name,
      provider,
      delivery,
      sourceUrl,
    });
  }

  return out;
}
