import { go } from '../router.js';
import { signUp, loadSession } from '../auth.js';

export function signupView(app) {
  app.innerHTML = `
    <h1>SIGN UP</h1>
    <div class="box">
      <label>FULL NAME</label>
      <input id="name" autocomplete="name">
      <label>EMAIL</label>
      <input id="email" type="email" autocomplete="email">
      <label>PASSWORD (6+ CHARACTERS)</label>
      <input id="pw" type="password" autocomplete="new-password">
      <label>CONFIRM PASSWORD</label>
      <input id="pw2" type="password" autocomplete="new-password">
      <p class="msg-err" id="err"></p>
      <p class="msg-ok" id="ok"></p>
      <button class="btn" id="go" style="text-align:center">CREATE ACCOUNT</button>
      <button class="btn link" id="back">Back to login</button>
    </div>`;

  const err = document.getElementById('err');
  const ok = document.getElementById('ok');
  const btn = document.getElementById('go');

  async function submit() {
    err.textContent = '';
    ok.textContent = '';
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const pw = document.getElementById('pw').value;
    const pw2 = document.getElementById('pw2').value;

    if (!name || !email || !pw) { err.textContent = 'Fill in all fields.'; return; }
    if (pw.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
    if (pw !== pw2) { err.textContent = 'Passwords do not match.'; return; }

    btn.disabled = true;
    btn.textContent = 'LOADING...';
    const { data, error } = await signUp(name, email, pw);
    btn.disabled = false;
    btn.textContent = 'CREATE ACCOUNT';

    if (error) { err.textContent = error.message; return; }

    if (data.session) {
      await loadSession();
      go('home');
    } else {
      ok.textContent = 'Account created! Check your email to confirm it, then log in.';
    }
  }

  btn.onclick = submit;
  document.getElementById('pw2').onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  document.getElementById('back').onclick = () => go('login');
}
