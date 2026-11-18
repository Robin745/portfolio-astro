/** Shared capability checks for the progressive-enhancement scripts. */

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

export const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** View Transitions are a nice-to-have: absent API or reduced motion means "just do it". */
export function withViewTransition(update: () => void): ViewTransition | undefined {
  if (reduceMotion.matches || typeof document.startViewTransition !== 'function') {
    update();
    return undefined;
  }
  return document.startViewTransition(update);
}
