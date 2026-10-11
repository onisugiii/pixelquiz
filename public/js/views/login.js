import { go } from '../router.js';
import { signIn, signOut, loadSession, isAdmin } from '../auth.js';

export function loginView(app, mode) {
  const admin = mode === 'admin';

  app.innerHTML = `
    <h1>PIXEL<br>QUIZ</h1>
    <div style="margin-bottom:14px">
      <button class="btn small ${admin ? '' : 'ok'}" id="t-student">STUDENT</button>
      <button class="btn small ${admin ? 'ok' : ''}" id="t-admin">ADMIN</button>
    </div>
    <div class="box">
      <h2>${admin ? 'ADMIN LOGIN' : 'STUDENT LOGIN'}</h2>
      <label>EMAIL</label>
      <input id="email" type="email" autocomplete="email">
      <label>PASSWORD</label>
      <input id="pw" type="password" autocomplete="current-password">
      <p class="msg-err" id="err"></p>
      <button class="btn" id="go" style="text-align:center">LOGIN</button>
      ${admin ? '' : '<button class="btn link" id="forgot">Forgot password?</button>'}
      ${admin ? '' : '<button class="btn link" id="signup">Create an account</button>'}
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

    if (admin && !isAdmin()) {
      await signOut();
      err.textContent = 'This account is not an admin.';
      btn.disabled = false;
      btn.textContent = 'LOGIN';
      return;
    }

    go(admin ? 'admin' : 'home');
  }

  btn.onclick = submit;
  document.getElementById('pw').onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  document.getElementById('t-student').onclick = () => go('login');
  document.getElementById('t-admin').onclick = () => go('login', 'admin');
  if (!admin) {
    document.getElementById('forgot').onclick = () => go('forgot');
    document.getElementById('signup').onclick = () => go('signup');
  }
}
