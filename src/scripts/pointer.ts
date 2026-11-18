import { finePointer, reduceMotion } from './env';

/**
 * Mouse-driven polish, skipped entirely on touch devices and for reduced motion:
 *  - [data-spotlight]: a glow that follows the cursor across a card
 *  - hero backdrop:    the grid lights up around the cursor
 *
 * Everything is written as CSS custom properties, once per animation frame.
 */
export function initPointerEffects() {
  if (!finePointer.matches || reduceMotion.matches) return;

  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const backdrop = hero?.querySelector<HTMLElement>('[data-hero-backdrop]');

  let pending: PointerEvent | undefined;
  let frame = 0;

  const update = () => {
    frame = 0;
    const event = pending;
    if (!event) return;

    const card =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-spotlight]')
        : null;
    if (card) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }

    if (!hero || !backdrop) return;
    const area = backdrop.getBoundingClientRect();
    const inside = event.clientY >= area.top && event.clientY <= area.bottom;
    hero.classList.toggle('is-pointing', inside);

    if (inside) {
      backdrop.style.setProperty('--hx', `${event.clientX - area.left}px`);
      backdrop.style.setProperty('--hy', `${event.clientY - area.top}px`);
    }
  };

  document.addEventListener(
    'pointermove',
    (event) => {
      pending = event;
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );

  document.documentElement.addEventListener('pointerleave', () => {
    hero?.classList.remove('is-pointing');
  });
}
