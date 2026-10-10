import { go } from '../router.js';
import { getCards, saveCards } from '../storage.js';
import { el } from '../utils.js';

export function editorView(app) {
  let cards = getCards();

  app.innerHTML = `
    <h1>FLASHCARDS</h1>
    <div class="box">
      <h2>NEW CARD</h2>
      <label>QUESTION</label>
      <textarea id="fq" rows="2"></textarea>
      <label>ANSWER</label>
      <input id="fa" autocomplete="off">
      <button class="btn small" id="add">+ ADD</button>
      <button class="btn small" id="back">BACK</button>
    </div>
    <div class="box" id="list"></div>`;

  const list = document.getElementById('list');

  function draw() {
    list.innerHTML = `
      <div class="row">
        <h2 style="margin:0">YOUR CARDS (${cards.length})</h2>
        ${cards.length ? '<button class="btn small btn-danger" id="del-all" style="margin:0">DELETE ALL</button>' : ''}
      </div>`;
    if (!cards.length) list.innerHTML += '<p class="muted">No cards yet.</p>';

    cards.forEach((c, i) => {
      const item = el(
        '<div class="card-item"><div class="card-text"><div class="q"></div><div class="muted a"></div></div><button class="btn small btn-danger" style="margin:0">DELETE</button></div>'
      ).firstChild;
      item.querySelector('.q').textContent = 'Q: ' + c.q;
      item.querySelector('.a').textContent = 'A: ' + c.a;
      item.querySelector('button').onclick = () => {
        if (!confirm('Delete this flashcard?')) return;
        cards.splice(i, 1);
        saveCards(cards);
        draw();
      };
      list.appendChild(item);
    });

    const delAll = document.getElementById('del-all');
    if (delAll) {
      delAll.onclick = () => {
        if (!confirm('Delete ALL flashcards? This cannot be undone.')) return;
        cards = [];
        saveCards(cards);
        draw();
      };
    }
  }

  function add() {
    const qq = document.getElementById('fq');
    const aa = document.getElementById('fa');
    if (!qq.value.trim() || !aa.value.trim()) return;
    cards.push({ q: qq.value.trim(), a: aa.value.trim() });
    saveCards(cards);
    qq.value = '';
    aa.value = '';
    qq.focus();
    draw();
  }

  draw();
  document.getElementById('add').onclick = add;
  document.getElementById('fa').onkeydown = (e) => { if (e.key === 'Enter') add(); };
  document.getElementById('back').onclick = () => go('home');
}
