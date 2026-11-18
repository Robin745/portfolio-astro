# moshiur-dev — portfolio

Personal portfolio of Moshiur Rahman, Software Engineer.
Live at **https://moshiur-dev.netlify.app**

A static site built with [Astro](https://astro.build) and TypeScript. It ships
almost no JavaScript (a few KB of progressive enhancement), self-hosts its
fonts, and is tested for accessibility on every change.

## Highlights

| Area          | What’s in place                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance   | Static HTML, inlined CSS, AVIF/WebP responsive images, preloaded variable fonts with metric-matched fallbacks (no layout shift)                                               |
| Accessibility | Semantic landmarks, skip link, visible focus, reduced-motion support, WCAG 2.2 AA checked by axe in both themes                                                               |
| Security      | Strict Content Security Policy with per-script/style hashes (no `unsafe-inline`), plus `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS via `public/_headers` |
| SEO           | Canonical URL, Open Graph card, JSON-LD `Person` schema, sitemap, `robots.txt`                                                                                                |
| Theming       | Light and dark themes via CSS `light-dark()`; follows the OS, remembers a manual choice, no flash on load                                                                     |
| Resilience    | Works fully without JavaScript — navigation is plain anchors and no content is ever hidden behind a script                                                                    |
| Quality gates | Prettier, `astro check` (strictest TypeScript), Playwright end-to-end tests, GitHub Actions CI                                                                                |

## Interactions

All of these are progressive enhancements — with JavaScript off, the page still
shows every section and every project (there is a test for that).

- **Command menu** — `Ctrl`/`⌘` + `K` to jump to a section, copy the email, switch theme or open a link. Native `<dialog>` with the ARIA combobox pattern.
- **Live summary report** — the hero card plays through its checks like a test run and can be re-run.
- **Theme switch** — a short cross-fade between light and dark.
- **Pointer effects** — the hero grid lights up around the cursor and cards carry a cursor-tracking glow (mouse only).
- **Scroll-driven details** — the reading progress bar and timeline rail use CSS scroll timelines, with no JavaScript.

Motion is switched off for visitors who ask for reduced motion.

## Updating content

Everything the site says lives in one typed file: [`src/data/site.ts`](src/data/site.ts).
Edit it and the pages update — TypeScript will flag anything missing.

- **Add a project** — append to `projects`. Add `liveUrl` / `repoUrl` to show links.
- **Add the CV buttons** — drop a PDF into `public/` and set `profile.resumeUrl`. “Download CV” then appears in the hero, the contact panel and the command menu.
- **Link a certification** — add `url` to an entry in `certifications`.
- **Change the portrait** — replace `src/assets/portrait.jpg` (4:5 crop works best).
- **Changed name, headline or colours?** — run `npm run assets` to regenerate the
  social card and favicons.

## Commands

Requires Node.js 22.

| Command           | Action                                                         |
| ----------------- | -------------------------------------------------------------- |
| `npm install`     | Install dependencies                                           |
| `npm run dev`     | Start the dev server at `localhost:4321`                       |
| `npm run build`   | Build the production site into `dist/`                         |
| `npm run preview` | Serve the production build locally                             |
| `npm run check`   | Type-check `.astro` and `.ts` files                            |
| `npm run format`  | Format with Prettier                                           |
| `npm test`        | Build, then run the Playwright suite (smoke, a11y, theme, CSP) |
| `npm run assets`  | Regenerate `og.png`, `apple-touch-icon.png`, `favicon.ico`     |

First time running tests: `npx playwright install chromium`.

> The CSP is only applied to production builds, so verify script or style
> changes with `npm run build && npm run preview` (the tests do this for you).

## Project structure

```
src/
  data/site.ts        all content, typed
  components/         one component per page section
  layouts/Base.astro  <head>, SEO, fonts, header and footer
  pages/              index, 404, robots.txt
  scripts/            theme bootstrap + one small module per interaction
  styles/global.css   design tokens, reset, shared primitives, print styles
public/               favicons, social card, Netlify _headers
tests/                Playwright end-to-end and accessibility tests
scripts/              asset generation
```

## Deployment (Netlify)

**Recommended — continuous deployment.** Push this repository to GitHub, then in
Netlify open the site → _Site configuration → Build & deploy → Link repository_.
Build settings are read from [`netlify.toml`](netlify.toml) (`npm run build`,
publish `dist`). Every push to `main` deploys; every pull request gets a preview URL.

**Manual.** Run `npm run build` and drag the `dist/` folder onto the site’s
_Deploys_ page. Security headers still apply because they ship inside `dist/_headers`.

If the site ever moves to a custom domain, update `site` in
[`astro.config.mjs`](astro.config.mjs) so canonical URLs and the sitemap follow.
