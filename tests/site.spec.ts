import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** Collects console errors — which is also where CSP violations surface. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.describe('home page', () => {
  test('renders every section with a sound heading structure', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');

    await expect(page).toHaveTitle(/Moshiur Rahman/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('businesses use every day');

    for (const id of ['work', 'experience', 'skills', 'about', 'contact']) {
      await expect(page.locator(`section#${id}`)).toBeVisible();
    }

    expect(errors, 'no console errors or CSP violations').toEqual([]);
  });

  test('every in-page link points at something that exists', async ({ page }) => {
    await page.goto('/');
    const hashes = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href') ?? ''))]);

    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) {
      await expect(page.locator(hash), `target for ${hash}`).toHaveCount(1);
    }
  });

  test('external links open safely', async ({ page }) => {
    await page.goto('/');
    const external = page.locator('a[target="_blank"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const link of await external.all()) {
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link).toHaveAttribute('href', /^https:\/\//);
    }
  });

  test('never scrolls sideways', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('ships SEO and social metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.png$/);

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(jsonLd ?? '{}');
    expect(data.mainEntity['@type']).toBe('Person');
    expect(data.mainEntity.name).toBe('Moshiur Rahman');
  });

  test('declares a Content Security Policy without unsafe-inline', async ({ page }) => {
    await page.goto('/');
    const csp = await page
      .locator('meta[http-equiv="content-security-policy"]')
      .getAttribute('content');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain('unsafe-eval');
  });
});

test.describe('accessibility', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`has no WCAG 2.2 AA violations in ${colorScheme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.goto('/');
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('skip link is the first stop and moves focus to the content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard navigation is a desktop concern');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });
});

test.describe('theme', () => {
  test('follows the system preference by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await page.emulateMedia({ colorScheme: 'light' });
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    expect(dark).not.toBe(light);
  });

  test('toggle switches theme and the choice survives a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: 'Switch colour theme' });

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Switch colour theme' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('navigation', () => {
  test('desktop nav jumps to sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop layout only');
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Experience' })
      .click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.locator('#experience-title')).toBeInViewport();
  });

  test('mobile menu opens, navigates and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile layout only');
    await page.goto('/');
    const menu = page.locator('#mobile-nav');
    await expect(menu).toBeHidden();

    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await expect(menu).toBeVisible();

    await menu.getByRole('link', { name: /Skills/ }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#skills$/);
  });
});

test.describe('interactions', () => {
  test('summary report replays its checks', async ({ page }) => {
    await page.goto('/');
    const status = page.locator('[data-report-status]');
    const rerun = page.getByRole('button', { name: 'Re-run' });

    await expect(rerun).toBeEnabled({ timeout: 10_000 });
    await expect(status).toHaveText('passed');

    await rerun.click();
    await expect(status).toHaveText('running');
    await expect(status).toHaveText('passed', { timeout: 10_000 });
    const checks = await page.locator('[data-report-row]').count();
    await expect(page.locator('[data-report-count]')).toHaveText(String(checks));
  });

  test('command menu opens from the keyboard and navigates', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard shortcut is a desktop feature');
    await page.goto('/');
    const menu = page.getByRole('dialog', { name: 'Command menu' });
    await expect(menu).toBeHidden();

    await page.keyboard.press('Control+k');
    await expect(menu).toBeVisible();
    const input = menu.getByRole('combobox');
    await expect(input).toBeFocused();

    await input.fill('skil');
    const options = menu.getByRole('option').filter({ visible: true });
    await expect(options).toHaveCount(1);
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#skills$/);
    await expect(page.locator('#skills-title')).toBeInViewport();
  });

  test('command menu is accessible and supports arrow keys', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard shortcut is a desktop feature');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Search' }).click();
    const menu = page.getByRole('dialog', { name: 'Command menu' });
    const input = menu.getByRole('combobox');

    const first = await input.getAttribute('aria-activedescendant');
    await page.keyboard.press('ArrowDown');
    expect(await input.getAttribute('aria-activedescendant')).not.toBe(first);
    await page.keyboard.press('ArrowUp');
    expect(await input.getAttribute('aria-activedescendant')).toBe(first);

    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('all content is present and nothing depends on scripts', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-projects] > li').filter({ visible: true })).toHaveCount(4);
    await expect(page.locator('[data-report-status]')).toHaveText('passed');
    await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();

    // Controls that need JavaScript stay out of the way.
    await expect(page.locator('[data-palette-open]')).toBeHidden();
  });
});

test.describe('contact', () => {
  test('email link and copy button work', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#contact');

    const email = page.locator('#contact a[href^="mailto:"]');
    await expect(email).toBeVisible();
    const address = (await email.getAttribute('href'))?.replace('mailto:', '');

    await page.getByRole('button', { name: 'Copy' }).click();
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(address);
  });
});

test('unknown routes get the custom 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('returned nothing');
  await expect(page.getByRole('link', { name: 'Back to the homepage' })).toBeVisible();
});
