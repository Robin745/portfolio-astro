import { reduceMotion, sleep } from './env';

/**
 * The hero "summary report" plays like a real test run: each check goes
 * pending -> running -> passed. The server-rendered markup is the finished
 * state, so with no JavaScript (or reduced motion) it simply reads as passed.
 */
export function initReport() {
  const card = document.querySelector<HTMLElement>('[data-report]');
  if (!card || reduceMotion.matches) return;

  const rows = [...card.querySelectorAll<HTMLElement>('[data-report-row]')];
  const status = card.querySelector<HTMLElement>('[data-report-status]');
  const count = card.querySelector<HTMLElement>('[data-report-count]');
  const bar = card.querySelector<HTMLElement>('[data-report-bar]');
  const rerun = card.querySelector<HTMLButtonElement>('[data-report-rerun]');

  const setProgress = (done: number) => {
    if (count) count.textContent = String(done);
    bar?.style.setProperty('--progress', String(done / rows.length));
  };

  let running = false;

  async function run(leadIn: number) {
    if (running) return;
    running = true;
    card?.classList.add('is-running');
    if (rerun) rerun.disabled = true;
    if (status) status.textContent = 'running';
    for (const row of rows) {
      row.classList.remove('is-running');
      row.classList.add('is-pending');
    }
    setProgress(0);
    await sleep(leadIn);

    for (const [index, row] of rows.entries()) {
      row.classList.replace('is-pending', 'is-running');
      await sleep(320);
      row.classList.remove('is-running');
      setProgress(index + 1);
      await sleep(110);
    }

    if (status) status.textContent = 'passed';
    card?.classList.remove('is-running');
    if (rerun) rerun.disabled = false;
    running = false;
  }

  if (rerun) {
    rerun.hidden = false;
    rerun.addEventListener('click', () => void run(200));
  }

  void run(900);
}
