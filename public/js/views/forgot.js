import { go } from '../router.js';
import { supabase } from '../supabase.js';

export function forgotView(app) {
  app.innerHTML = `
    <h1>RESET</h1>
    <div class="box">
      <h2>FORGOT PASSWORD</h2>
      <p class="muted">Enter your email. Your admin will approve the request and give you a temporary password.</p>
      <label>EMAIL</label>
      <input id="email" type="email" autocomplete="email">
      <p class="msg-err" id="err"></p>
      <p class="msg-ok" id="ok"></p>
      <button class="btn" id="go" style="text-align:center">SEND REQUEST</button>
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
    const { error } = await supabase.rpc('request_password_reset', { p_email: email });
    btn.disabled = false;
    btn.textContent = 'SEND REQUEST';

    if (error) { err.textContent = error.message; return; }
    ok.textContent = 'Request sent! Ask your admin for your temporary password, then log in with it.';
  }

  btn.onclick = submit;
  document.getElementById('email').onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  document.getElementById('back').onclick = () => go('login');
}
