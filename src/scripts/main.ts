/**
 * Progressive enhancements. The page is fully usable without any of this:
 * the theme follows the OS, navigation is plain anchors, every project is
 * listed and no content is hidden.
 */
import { initPalette } from './palette';
import { initPointerEffects } from './pointer';
import { initReport } from './report';
import { initCounters, initReveal, initScrollSpy } from './scroll';
import { initTheme } from './theme';

initTheme();
initReport();
initCounters();
initReveal();
initScrollSpy();
initPalette();
initPointerEffects();

/* --- Mobile menu: close after choosing a destination ----------------------- */

for (const link of document.querySelectorAll<HTMLElement>('[data-close-popover]')) {
  link.addEventListener('click', () => {
    link.closest<HTMLElement>('[popover]')?.hidePopover();
  });
}

/* --- Copy email ------------------------------------------------------------ */

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
  const original = label?.textContent ?? 'Copy';

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset['copy'] ?? '');
      if (label) label.textContent = 'Copied';
      if (status) status.textContent = 'Email address copied to clipboard';
    } catch {
      if (label) label.textContent = 'Press Ctrl+C';
    }
    window.setTimeout(() => {
      if (label) label.textContent = original;
      if (status) status.textContent = '';
    }, 2000);
  });
}
