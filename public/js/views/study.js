import { go } from '../router.js';
import { getCards } from '../storage.js';

export function studyView(app, state) {
  const cards = getCards();
  state = state || { i: 0, flip: false };
  const c = cards[state.i];

  app.innerHTML = `
    <h1>STUDY</h1>
    <p class="muted">Card ${state.i + 1} / ${cards.length} &mdash; tap card to flip</p>
    <div class="box flash" id="fc"></div>
    <button class="btn small" id="prev">&lt; PREV</button>
    <button class="btn small" id="next">NEXT &gt;</button>
    <button class="btn small" id="back">BACK</button>`;

  document.getElementById('fc').textContent = state.flip ? c.a : c.q;
  document.getElementById('fc').onclick = () => go('study', { i: state.i, flip: !state.flip });
  document.getElementById('prev').onclick = () => go('study', { i: (state.i - 1 + cards.length) % cards.length, flip: false });
  document.getElementById('next').onclick = () => go('study', { i: (state.i + 1) % cards.length, flip: false });
  document.getElementById('back').onclick = () => go('home');
}
