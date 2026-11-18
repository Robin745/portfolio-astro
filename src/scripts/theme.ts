import { withViewTransition } from './env';

type Theme = 'light' | 'dark';

const root = document.documentElement;
const toggles = () => document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');

export function currentTheme(): Theme {
  const explicit = root.dataset['theme'];
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function sync() {
  for (const toggle of toggles()) {
    toggle.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
  }
}

function apply(theme: Theme) {
  root.dataset['theme'] = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* private mode: the choice just lasts for this page view */
  }
  sync();
}

/** Switches theme with a short cross-fade where the browser supports it. */
export function toggleTheme() {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  withViewTransition(() => apply(next));
}

export function initTheme() {
  sync();
  for (const toggle of toggles()) {
    toggle.addEventListener('click', toggleTheme);
  }
}
