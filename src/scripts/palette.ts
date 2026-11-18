import { toggleTheme } from './theme';

/**
 * Command menu (Ctrl/Cmd + K). A native <dialog> gives us the focus trap, Esc
 * handling and focus restoration; the list follows the ARIA combobox pattern
 * (focus stays in the input, aria-activedescendant points at the option).
 */
export function initPalette() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-palette]');
  const input = dialog?.querySelector<HTMLInputElement>('[data-palette-input]');
  const list = dialog?.querySelector<HTMLElement>('[data-palette-list]');
  const empty = dialog?.querySelector<HTMLElement>('[data-palette-empty]');
  if (!dialog || !input || !list || typeof dialog.showModal !== 'function') return;

  const options = [...list.querySelectorAll<HTMLElement>('[role="option"]')];
  const visible = () => options.filter((option) => !option.hidden);
  const selected = () => options.find((option) => option.getAttribute('aria-selected') === 'true');

  function select(option: HTMLElement | undefined, scroll = true) {
    for (const item of options) item.setAttribute('aria-selected', String(item === option));
    if (option) {
      input?.setAttribute('aria-activedescendant', option.id);
      if (scroll) option.scrollIntoView({ block: 'nearest' });
    } else {
      input?.removeAttribute('aria-activedescendant');
    }
  }

  function filter() {
    const terms = (input?.value ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    for (const option of options) {
      const haystack = option.dataset['search'] ?? '';
      option.hidden = !terms.every((term) => haystack.includes(term));
    }
    const matches = visible();
    if (empty) empty.hidden = matches.length > 0;
    select(matches[0]);
  }

  function open() {
    if (dialog?.open) return;
    if (input) input.value = '';
    filter();
    dialog?.showModal();
    input?.focus();
  }

  const close = () => dialog.close();

  function go(hash: string) {
    close();
    // Wait a frame so the dialog's focus restoration doesn't fight the scroll.
    requestAnimationFrame(() => {
      if (hash === '#top') {
        window.scrollTo({ top: 0 });
        history.pushState(null, '', location.pathname);
        return;
      }
      document.querySelector(hash)?.scrollIntoView();
      history.pushState(null, '', hash);
    });
  }

  async function copyEmail(option: HTMLElement) {
    const label = option.querySelector<HTMLElement>('.label');
    const original = label?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(dialog?.dataset['email'] ?? '');
      if (label) label.textContent = 'Copied to clipboard';
    } catch {
      if (label) label.textContent = 'Copy failed — use the contact section';
    }
    window.setTimeout(() => {
      if (label) label.textContent = original;
      close();
    }, 900);
  }

  function run(option: HTMLElement) {
    const { kind, value = '' } = option.dataset;
    if (kind === 'hash') {
      go(value);
    } else if (kind === 'url') {
      close();
      if (value.startsWith('http')) window.open(value, '_blank', 'noopener,noreferrer');
      else location.href = value;
    } else if (value === 'copy-email') {
      void copyEmail(option);
    } else if (value === 'toggle-theme') {
      close();
      toggleTheme();
    }
  }

  input.addEventListener('input', filter);

  input.addEventListener('keydown', (event) => {
    const matches = visible();
    const current = selected();
    const index = current ? matches.indexOf(current) : -1;
    const last = matches.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        select(matches[index >= last ? 0 : index + 1]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        select(matches[index <= 0 ? last : index - 1]);
        break;
      case 'Home':
        event.preventDefault();
        select(matches[0]);
        break;
      case 'End':
        event.preventDefault();
        select(matches[last]);
        break;
      case 'Enter':
        event.preventDefault();
        if (current) run(current);
        break;
    }
  });

  const optionFrom = (event: Event) =>
    event.target instanceof Element ? event.target.closest<HTMLElement>('[role="option"]') : null;

  list.addEventListener('click', (event) => {
    const option = optionFrom(event);
    if (option) run(option);
  });

  list.addEventListener('pointermove', (event) => {
    const option = optionFrom(event);
    if (option && option !== selected()) select(option, false);
  });

  // A click that lands on the dialog element itself is a click on the backdrop.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });

  document.addEventListener('keydown', (event) => {
    const isShortcut =
      (event.metaKey || event.ctrlKey) &&
      !event.shiftKey &&
      !event.altKey &&
      event.key.toLowerCase() === 'k';
    if (!isShortcut) return;
    event.preventDefault();
    if (dialog.open) close();
    else open();
  });

  // Entry points are rendered hidden and only shown once the menu works.
  const shortcut = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K';
  for (const key of document.querySelectorAll<HTMLElement>('[data-palette-kbd]')) {
    key.textContent = shortcut;
  }
  for (const hint of document.querySelectorAll<HTMLElement>('[data-palette-hint]')) {
    hint.hidden = false;
  }
  for (const opener of document.querySelectorAll<HTMLButtonElement>('[data-palette-open]')) {
    opener.hidden = false;
    opener.addEventListener('click', open);
  }
}
