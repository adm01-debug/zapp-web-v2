import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface PreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

const MAX_BYTES = 512 * 1024; // 512KB cap
const FETCH_TIMEOUT_MS = 6000;

function isPublicHttpUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase();
    // Block obvious SSRF targets
    if (
      host === 'localhost' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return null;
    }
    return u;
  } catch {
    return null;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractMeta(html: string, names: string[]): string | undefined {
  for (const name of names) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`,
      'i',
    );
    const alt = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`,
      'i',
    );
    const m = html.match(re) || html.match(alt);
    if (m?.[1]) return decodeEntities(m[1]).trim();
  }
  return undefined;
}

function extractTitle(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1] ? decodeEntities(m[1]).trim() : undefined;
}

function absolutize(maybeUrl: string | undefined, base: URL): string | undefined {
  if (!maybeUrl) return undefined;
  try {
    return new URL(maybeUrl, base).toString();
  } catch {
    return undefined;
  }
}

async function fetchPreview(rawUrl: string): Promise<PreviewData | null> {
  const url = isPublicHttpUrl(rawUrl);
  if (!url) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZAPPLinkPreview/1.0; +https://zapp.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
  } catch {
    clearTimeout(timer);
    return null;
  }
  clearTimeout(timer);

  if (!resp.ok || !resp.body) return null;
  const ct = resp.headers.get('content-type') || '';
  if (!ct.includes('text/html') && !ct.includes('application/xhtml')) return null;

  const reader = resp.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
    }
  } finally {
    try { await reader.cancel(); } catch { /* noop */ }
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
  const html = new TextDecoder('utf-8', { fatal: false }).decode(buf);

  const title =
    extractMeta(html, ['og:title', 'twitter:title']) || extractTitle(html);
  const description = extractMeta(html, [
    'og:description',
    'twitter:description',
    'description',
  ]);
  const image = absolutize(
    extractMeta(html, ['og:image', 'og:image:url', 'twitter:image']),
    url,
  );
  const siteName = extractMeta(html, ['og:site_name', 'application-name']);

  if (!title && !description && !image) return null;

  return {
    url: url.toString(),
    title,
    description,
    image,
    siteName,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body?.url === 'string' ? body.url : '';
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Missing "url" string in body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const preview = await fetchPreview(url);
    return new Response(JSON.stringify({ preview }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'unexpected_error', message: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});