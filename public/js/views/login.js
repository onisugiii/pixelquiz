import { go } from '../router.js';
import { signIn, loadSession } from '../auth.js';

export function loginView(app) {
  app.innerHTML = `
    <h1>PIXEL<br>QUIZ</h1>
    <div class="box">
      <h2>LOGIN</h2>
      <label>EMAIL</label>
      <input id="email" type="email" autocomplete="email">
      <label>PASSWORD</label>
      <input id="pw" type="password" autocomplete="current-password">
      <p class="msg-err" id="err"></p>
      <button class="btn" id="go" style="text-align:center">LOGIN</button>
      <button class="btn link" id="forgot">Forgot password?</button>
      <button class="btn link" id="signup">Create an account</button>
    </div>`;

  const err = document.getElementById('err');
  const btn = document.getElementById('go');

  async function submit() {
    err.textContent = '';
    const email = document.getElementById('email').value.trim();
    const pw = document.getElementById('pw').value;
    if (!email || !pw) { err.textContent = 'Enter your email and password.'; return; }

    btn.disabled = true;
    btn.textContent = 'LOADING...';
    const { error } = await signIn(email, pw);
    if (error) {
      err.textContent = error.message;
      btn.disabled = false;
      btn.textContent = 'LOGIN';
      return;
    }
    await loadSession();
    go('home');
  }

  btn.onclick = submit;
  document.getElementById('pw').onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  document.getElementById('forgot').onclick = () => go('forgot');
  document.getElementById('signup').onclick = () => go('signup');
}
