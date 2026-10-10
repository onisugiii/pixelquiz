import { go } from '../router.js';
import { getCards } from '../storage.js';

export function homeView(app) {
  const cards = getCards();

  app.innerHTML = `
    <h1>PIXEL<br>QUIZ</h1>
    <div class="box">
      <p class="muted">${cards.length} flashcard${cards.length === 1 ? '' : 's'} saved</p>
      <button class="btn" id="b-cards">&gt; MAKE FLASHCARDS</button>
      <button class="btn" id="b-study" ${cards.length ? '' : 'disabled'}>&gt; STUDY</button>
      <button class="btn" id="b-quiz" ${cards.length ? '' : 'disabled'}>&gt; START QUIZ</button>
      ${cards.length ? '' : '<p class="muted">Add at least 1 flashcard to unlock study and quiz.</p>'}
    </div>`;

  document.getElementById('b-cards').onclick = () => go('editor');
  document.getElementById('b-study').onclick = () => go('study');
  document.getElementById('b-quiz').onclick = () => go('quiz');
}
