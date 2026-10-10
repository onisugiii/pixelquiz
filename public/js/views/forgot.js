import { go } from '../router.js';
import { requestReset } from '../auth.js';

export function forgotView(app) {
  app.innerHTML = `
    <h1>RESET</h1>
    <div class="box">
      <h2>FORGOT PASSWORD</h2>
      <p class="muted">Enter your email and we will send you a reset link.</p>
      <label>EMAIL</label>
      <input id="email" type="email" autocomplete="email">
      <p class="msg-err" id="err"></p>
      <p class="msg-ok" id="ok"></p>
      <button class="btn" id="go" style="text-align:center">SEND RESET LINK</button>
      <button class="btn link" id="back">Back to login</button>
    </div>`;

  const err = document.getElementById('err');
  const ok = document.getElementById('ok');
  const btn = document.getElementById('go');

  async function submit() {
    err.textContent = '';
    ok.textContent = '';
    const email = document.getElementById('email').value.trim();
    if (!email) { err.textContent = 'Enter your email.'; return; }

    btn.disabled = true;
    btn.textContent = 'SENDING...';
    const { error } = await requestReset(email);
    btn.disabled = false;
    btn.textContent = 'SEND RESET LINK';

    if (error) { err.textContent = error.message; return; }
    ok.textContent = 'If that email has an account, a reset link is on its way.';
  }

  btn.onclick = submit;
  document.getElementById('email').onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  document.getElementById('back').onclick = () => go('login');
}
