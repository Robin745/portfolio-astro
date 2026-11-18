// @ts-check
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The theme bootstrap runs inline in <head> (before first paint) so a saved
// theme never flashes. Inline scripts are blocked by our CSP unless their
// exact hash is allow-listed, so we hash the source file here at build time.
const themeInit = readFileSync(new URL('./src/scripts/theme-init.js', import.meta.url), 'utf8');
const themeInitHash = /** @type {const} */ (
  `sha256-${createHash('sha256').update(themeInit).digest('base64')}`
);

export default defineConfig({
  site: 'https://moshiur-dev.netlify.app',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // No Markdown code blocks on this site; Shiki's inline styles would also
  // conflict with the strict CSP below.
  markdown: { syntaxHighlight: false },
  build: {
    // One page, small CSS: inlining removes a render-blocking request.
    inlineStylesheets: 'always',
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        hashes: [themeInitHash],
      },
    },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-sans',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
