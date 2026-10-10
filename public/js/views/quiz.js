import { go } from '../router.js';
import { getCards } from '../storage.js';
import { MAX_HEARTS, shuffle, heartsHTML } from '../utils.js';

// Ignore upper/lower case and extra spaces when checking answers
const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export function quizView(app) {
  const cards = getCards();
  const state = {
    order: shuffle(cards),
    i: 0,
    hearts: MAX_HEARTS,
    score: 0,
    answered: false,
  };

  function exitQuiz() {
    if (confirm('Exit the quiz? Your progress will be lost.')) go('home');
  }

  function question() {
    const c = state.order[state.i];
    state.answered = false;

    app.innerHTML = `
      <div class="row" style="margin-bottom:14px">
        <button class="btn small btn-danger" id="exit" style="margin:0">&lt; EXIT</button>
        ${heartsHTML(state.hearts)}
      </div>
      <p class="muted">Question ${state.i + 1} / ${state.order.length}</p>
      <div class="bar"><div style="width:${(state.i / state.order.length) * 100}%"></div></div>
      <div class="box" id="qbox"><h2 id="qt"></h2></div>
      <label>TYPE YOUR ANSWER</label>
      <input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false">
      <button class="btn" id="submit" style="text-align:center">SUBMIT</button>
      <div id="feedback"></div>
      <div id="next"></div>`;

    document.getElementById('qt').textContent = c.q;
    document.getElementById('exit').onclick = exitQuiz;
    const input = document.getElementById('ans');
    input.focus();
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(c); };
    document.getElementById('submit').onclick = () => submit(c);
  }

  function submit(c) {
    if (state.answered) return;
    const input = document.getElementById('ans');
    const value = input.value;
    if (!value.trim()) return;
    state.answered = true;

    input.disabled = true;
    document.getElementById('submit').disabled = true;

    const right = normalize(value) === normalize(c.a);
    const fb = document.getElementById('feedback');

    if (right) {
      state.score++;
      fb.innerHTML = '<div class="box fb-ok"><h2>CORRECT!</h2></div>';
    } else {
      state.hearts--;
      document.getElementById('qbox').classList.add('shake');
      document.querySelector('.hearts').outerHTML = heartsHTML(state.hearts);
      fb.innerHTML = '<div class="box fb-no"><h2>WRONG!</h2><p class="muted">Correct answer:</p><p id="correct"></p></div>';
      document.getElementById('correct').textContent = c.a;
    }

    const last = state.i === state.order.length - 1;
    const nb = document.createElement('button');
    nb.className = 'btn';
    nb.style.textAlign = 'center';
    nb.textContent = state.hearts <= 0 ? 'CONTINUE >' : last ? 'FINISH >' : 'NEXT >';
    nb.onclick = () => {
      if (state.hearts <= 0 || last) result();
      else { state.i++; question(); }
    };
    document.getElementById('next').appendChild(nb);
    nb.focus();
  }

  function result() {
    const dead = state.hearts <= 0;
    app.innerHTML = `
      <h1>${dead ? 'GAME OVER' : 'YOU WIN!'}</h1>
      <div class="box big">
        <div style="display:flex;justify-content:center;margin-bottom:14px">${heartsHTML(state.hearts)}</div>
        <p>SCORE: ${state.score} / ${state.order.length}</p>
        <p class="blink muted">${dead ? 'No hearts left. Review and try again!' : 'Great job!'}</p>
      </div>
      <button class="btn" id="again">&gt; PLAY AGAIN</button>
      <button class="btn" id="home">&gt; MENU</button>`;
    document.getElementById('again').onclick = () => go('quiz');
    document.getElementById('home').onclick = () => go('home');
  }

  question();
}