import { go } from '../router.js';
import { getCards, addCard, deleteCard, deleteAllCards } from '../storage.js';
import { el } from '../utils.js';

export async function editorView(app) {
  app.innerHTML = '<p class="muted">LOADING...</p>';
  let cards = await getCards();

  app.innerHTML = `
    <h1>FLASHCARDS</h1>
    <div class="box">
      <h2>NEW CARD</h2>
      <label>QUESTION</label>
      <textarea id="fq" rows="2"></textarea>
      <label>ANSWER</label>
      <input id="fa" autocomplete="off">
      <p class="msg-err" id="err"></p>
      <button class="btn small" id="add">+ ADD</button>
      <button class="btn small" id="back">BACK</button>
    </div>
    <div class="box" id="list"></div>`;

  const list = document.getElementById('list');
  const err = document.getElementById('err');

  function draw() {
    list.innerHTML = `
      <div class="row">
        <h2 style="margin:0">YOUR CARDS (${cards.length})</h2>
        ${cards.length ? '<button class="btn small btn-danger" id="del-all" style="margin:0">DELETE ALL</button>' : ''}
      </div>`;
    if (!cards.length) list.innerHTML += '<p class="muted">No cards yet.</p>';

    cards.forEach((c) => {
      const item = el(
        '<div class="card-item"><div class="card-text"><div class="q"></div><div class="muted a"></div></div><button class="btn small btn-danger" style="margin:0">DELETE</button></div>'
      ).firstChild;
      item.querySelector('.q').textContent = 'Q: ' + c.q;
      item.querySelector('.a').textContent = 'A: ' + c.a;
      item.querySelector('button').onclick = async () => {
        if (!confirm('Delete this flashcard?')) return;
        err.textContent = '';
        const { error } = await deleteCard(c.id);
        if (error) { err.textContent = error.message; return; }
        cards = await getCards();
        draw();
      };
      list.appendChild(item);
    });

    const delAll = document.getElementById('del-all');
    if (delAll) {
      delAll.onclick = async () => {
        if (!confirm('Delete ALL flashcards? This cannot be undone.')) return;
        err.textContent = '';
        const { error } = await deleteAllCards();
        if (error) { err.textContent = error.message; return; }
        cards = await getCards();
        draw();
      };
    }
  }

  async function add() {
    const qq = document.getElementById('fq');
    const aa = document.getElementById('fa');
    const addBtn = document.getElementById('add');
    err.textContent = '';
    if (!qq.value.trim() || !aa.value.trim()) return;

    addBtn.disabled = true;
    const { error } = await addCard(qq.value.trim(), aa.value.trim());
    addBtn.disabled = false;
    if (error) { err.textContent = error.message; return; }

    qq.value = '';
    aa.value = '';
    qq.focus();
    cards = await getCards();
    draw();
  }

  draw();
  document.getElementById('add').onclick = add;
  document.getElementById('fa').onkeydown = (e) => { if (e.key === 'Enter') add(); };
  document.getElementById('back').onclick = () => go('home');
}
