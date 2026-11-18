/**
 * Generates the static brand assets in /public:
 *   og.png (1200×630 social card), apple-touch-icon.png (180×180), favicon.ico (32×32)
 *
 * Run with `npm run assets` after changing your name, role or brand colours.
 * Uses the Playwright Chromium that the test suite already depends on.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('../', import.meta.url);
const pub = (name) => fileURLToPath(new URL(`public/${name}`, root));

/** Inline a font as a data URI so the page needs no file or network access. */
async function font(pkg, file) {
  const bytes = await readFile(
    new URL(`node_modules/@fontsource-variable/${pkg}/files/${file}`, root),
  );
  return `data:font/woff2;base64,${bytes.toString('base64')}`;
}

const displayFont = await font('geist', 'geist-latin-wght-normal.woff2');
const monoFont = await font('geist-mono', 'geist-mono-latin-wght-normal.woff2');

const fonts = `
  @font-face { font-family: Display; font-weight: 100 900;
    src: url('${displayFont}') format('woff2'); }
  @font-face { font-family: Mono; font-weight: 100 900;
    src: url('${monoFont}') format('woff2'); }
`;

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fonts}
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: #09090b; color: #fafafa;
    font-family: Display, sans-serif; display: flex; flex-direction: column;
    justify-content: space-between; padding: 72px 80px; position: relative; overflow: hidden; }
  body::before { content: ''; position: absolute; inset: 0;
    background-image: linear-gradient(rgb(255 255 255 / .09) 1px, transparent 1px),
      linear-gradient(90deg, rgb(255 255 255 / .09) 1px, transparent 1px);
    background-size: 70px 70px;
    mask-image: radial-gradient(ellipse 75% 95% at 90% 0%, #000, transparent 72%); }
  body::after { content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 50% 70% at 100% 0%, rgb(59 110 245 / .38), transparent 70%),
      radial-gradient(ellipse 40% 60% at 55% 115%, rgb(56 189 248 / .16), transparent 70%); }
  .row { display: flex; align-items: center; gap: 20px; position: relative; }
  .mark { width: 60px; height: 60px; border-radius: 16px; background: #2563eb; color: #ffffff;
    display: grid; place-items: center; font: 600 22px Mono, monospace; }
  .name { font-size: 30px; font-weight: 600; letter-spacing: -0.01em; }
  h1 { position: relative; font-size: 82px; line-height: 1; font-weight: 600;
    letter-spacing: -0.04em; max-width: 960px; }
  h1 em { font-style: normal; color: transparent;
    background: linear-gradient(100deg, #7aa7ff 10%, #38bdf8 100%); -webkit-background-clip: text; background-clip: text; }
  h1 .stop { color: #fafafa; -webkit-text-fill-color: #fafafa; }
  .meta { position: relative; display: flex; justify-content: space-between;
    font: 400 22px Mono, monospace; color: #a1a1aa; letter-spacing: .02em; }
</style></head><body>
  <div class="row"><div class="mark">MR</div><div class="name">Moshiur Rahman</div></div>
  <h1>I turn complex workflows into software that <em>businesses use every day</em><span class="stop">.</span></h1>
  <div class="meta"><span>Software Engineer · Dhaka</span><span>moshiur-dev.netlify.app</span></div>
</body></html>`;

const iconHtml = (size) => `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fonts}
  html, body { margin: 0; width: ${size}px; height: ${size}px; }
  body { background: #2563eb; color: #fff; display: grid; place-items: center;
    font: 700 ${Math.round(size * 0.42)}px Mono, monospace; letter-spacing: -0.03em; }
</style></head><body>MR</body></html>`;

/** Wraps a PNG in a single-image ICO container (PNG-in-ICO is valid since Vista). */
function pngToIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(size, 6); // width
  header.writeUInt8(size, 7); // height
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14); // image size
  header.writeUInt32LE(22, 18); // image offset
  return Buffer.concat([header, png]);
}

// Set PW_CHANNEL=chrome to use an installed Google Chrome instead of Playwright's Chromium.
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });

async function render(html, width, height, path) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buffer = await page.screenshot({ type: 'png', ...(path ? { path } : {}) });
  await page.close();
  return buffer;
}

await render(ogHtml, 1200, 630, pub('og.png'));
await render(iconHtml(180), 180, 180, pub('apple-touch-icon.png'));
await writeFile(pub('favicon.ico'), pngToIco(await render(iconHtml(32), 32, 32), 32));

await browser.close();
console.log('Generated public/og.png, public/apple-touch-icon.png, public/favicon.ico');
