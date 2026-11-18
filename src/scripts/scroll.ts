import { reduceMotion } from './env';

/**
 * Fades sections in as they enter the viewport. Only elements that are still
 * below the fold are ever hidden, so nothing can get stuck invisible.
 */
export function initReveal() {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  if (reduceMotion.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-revealing');
        el.classList.remove('is-pending');
        el.addEventListener('transitionend', () => el.classList.remove('is-revealing'), {
          once: true,
        });
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  for (const el of targets) {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('is-pending');
      observer.observe(el);
    }
  }

  // Printing should never meet invisible content.
  window.addEventListener('beforeprint', () => {
    for (const el of targets) el.classList.remove('is-pending');
  });
}

/** Marks the nav link of the section currently under the header. */
export function initScrollSpy() {
  const links = new Map<string, HTMLAnchorElement>();
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')) {
    const id = link.hash.slice(1);
    if (id) links.set(id, link);
  }
  if (links.size === 0 || !('IntersectionObserver' in window)) return;

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        // The hero has no nav link, so reaching it clears the highlight.
        for (const [id, link] of links) {
          if (id === entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    },
    // A thin band just under the header decides which section is "current".
    { rootMargin: '-25% 0px -70% 0px' },
  );

  for (const id of links.keys()) {
    const section = document.getElementById(id);
    if (section) spy.observe(section);
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) spy.observe(hero);
}

/** Counts numeric stats up from zero the first time they scroll into view. */
export function initCounters() {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) return;

  const DURATION = 1400;
  const easeOut = (t: number) => 1 - (1 - t) ** 4;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      observer.unobserve(el);

      const target = Number(el.dataset['countTo']);
      const suffix = el.dataset['countSuffix'] ?? '';
      // "3,000+" keeps its thousands separator while it counts.
      const format = (n: number) =>
        el.dataset['countGrouped'] ? n.toLocaleString('en-US') : `${n}`;
      const start = performance.now() + 450; // let the hero settle first

      const tick = (now: number) => {
        const progress = Math.min(1, Math.max(0, (now - start) / DURATION));
        el.textContent = `${format(Math.round(target * easeOut(progress)))}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  });

  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    const match = /^(\d[\d,]*)(.*)$/.exec(el.textContent?.trim() ?? '');
    if (!match) continue;
    const digits = match[1] ?? '0';
    if (digits.includes(',')) el.dataset['countGrouped'] = 'true';
    el.dataset['countTo'] = digits.replaceAll(',', '');
    el.dataset['countSuffix'] = match[2] ?? '';
    el.textContent = `0${match[2] ?? ''}`;
    observer.observe(el);
  }
}
