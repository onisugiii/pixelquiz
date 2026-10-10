import { go } from '../router.js';
import { getCards } from '../storage.js';
import { current, isAdmin, signOut } from '../auth.js';

export function homeView(app) {
  const cards = getCards();

  app.innerHTML = `
    <div class="row" style="margin-bottom:14px">
      <span class="muted" id="who"></span>
      <div>
        ${isAdmin() ? '<button class="btn small" id="b-admin" style="margin:0 6px 0 0">ADMIN</button>' : ''}
        <button class="btn small btn-danger" id="b-out" style="margin:0">LOGOUT</button>
      </div>
    </div>
    <h1>PIXEL<br>QUIZ</h1>
    <div class="box">
      <p class="muted">${cards.length} flashcard${cards.length === 1 ? '' : 's'} saved</p>
      <button class="btn" id="b-cards">&gt; MAKE FLASHCARDS</button>
      <button class="btn" id="b-study" ${cards.length ? '' : 'disabled'}>&gt; STUDY</button>
      <button class="btn" id="b-quiz" ${cards.length ? '' : 'disabled'}>&gt; START QUIZ</button>
      ${cards.length ? '' : '<p class="muted">Add at least 1 flashcard to unlock study and quiz.</p>'}
    </div>`;

  const name = (current.profile && current.profile.full_name) || (current.user && current.user.email) || '';
  document.getElementById('who').textContent = name;

  document.getElementById('b-cards').onclick = () => go('editor');
  document.getElementById('b-study').onclick = () => go('study');
  document.getElementById('b-quiz').onclick = () => go('quiz');
  document.getElementById('b-out').onclick = async () => {
    await signOut();
    go('login');
  };
  const adminBtn = document.getElementById('b-admin');
  if (adminBtn) adminBtn.onclick = () => go('admin');
}
