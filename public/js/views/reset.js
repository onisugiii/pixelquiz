import { go } from '../router.js';
import { updatePassword, loadSession } from '../auth.js';

export function resetView(app) {
  app.innerHTML = `
    <h1>NEW<br>PASSWORD</h1>
    <div class="box">
      <label>NEW PASSWORD (6+ CHARACTERS)</label>
      <input id="pw" type="password" autocomplete="new-password">
      <label>CONFIRM PASSWORD</label>
      <input id="pw2" type="password" autocomplete="new-password">
      <p class="msg-err" id="err"></p>
      <p class="msg-ok" id="ok"></p>
      <button class="btn" id="go" style="text-align:center">SAVE PASSWORD</button>
    </div>`;

  const err = document.getElementById('err');
  const ok = document.getElementById('ok');
  const btn = document.getElementById('go');

  async function submit() {
    err.textContent = '';
    ok.textContent = '';
    const pw = document.getElementById('pw').value;
    const pw2 = document.getElementById('pw2').value;

    if (pw.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
    if (pw !== pw2) { err.textContent = 'Passwords do not match.'; return; }

    btn.disabled = true;
    btn.textContent = 'SAVING...';
    const { error } = await updatePassword(pw);
    if (error) {
      err.textContent = error.message;
      btn.disabled = false;
      btn.textContent = 'SAVE PASSWORD';
      return;
    }

    ok.textContent = 'Password updated! Taking you in...';
    await loadSession();
    setTimeout(() => go('home'), 1200);
  }

  btn.onclick = submit;
  document.getElementById('pw2').onkeydown = (e) => { if (e.key === 'Enter') submit(); };
}
