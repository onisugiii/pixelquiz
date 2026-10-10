import { go } from '../router.js';
import { supabase } from '../supabase.js';
import { current, requestReset } from '../auth.js';

export async function adminView(app) {
  app.innerHTML = `
    <div class="row" style="margin-bottom:14px">
      <button class="btn small" id="back" style="margin:0">&lt; BACK</button>
    </div>
    <h1>ADMIN</h1>
    <div class="box">
      <h2>USERS (<span id="count">0</span>)</h2>
      <input id="search" placeholder="search name or email" autocomplete="off">
      <p class="muted" id="msg"></p>
      <div id="users"></div>
    </div>`;

  const listEl = document.getElementById('users');
  const countEl = document.getElementById('count');
  const msg = document.getElementById('msg');
  const search = document.getElementById('search');
  let users = [];

  const say = (t) => { msg.textContent = t; };

  function button(label, cls, fn) {
    const b = document.createElement('button');
    b.className = 'btn small ' + cls;
    b.style.margin = '0 6px 6px 0';
    b.textContent = label;
    b.onclick = fn;
    return b;
  }

  function row(u) {
    const me = u.id === current.user.id;
    const d = document.createElement('div');
    d.className = 'user-row';
    d.innerHTML =
      '<div class="user-info"><div class="u-name"></div><div class="muted u-mail"></div><div class="muted u-meta"></div></div><div class="user-actions"></div>';

    d.querySelector('.u-name').textContent = (u.full_name || '(no name)') + (me ? ' (you)' : '');
    d.querySelector('.u-mail').textContent = u.email || '';
    d.querySelector('.u-meta').textContent =
      u.role.toUpperCase() + ' - joined ' + new Date(u.created_at).toLocaleDateString();

    const actions = d.querySelector('.user-actions');

    actions.appendChild(button('RESET PW', '', async () => {
      if (!confirm('Send a password reset email to ' + u.email + '?')) return;
      const { error } = await requestReset(u.email);
      say(error ? error.message : 'Reset email sent to ' + u.email);
    }));

    if (!me) {
      actions.appendChild(button(u.role === 'admin' ? 'MAKE USER' : 'MAKE ADMIN', '', async () => {
        const role = u.role === 'admin' ? 'user' : 'admin';
        if (!confirm('Change ' + u.email + ' to ' + role + '?')) return;
        const { error } = await supabase.from('profiles').update({ role }).eq('id', u.id);
        if (error) { say(error.message); return; }
        u.role = role;
        draw();
        say('Role updated.');
      }));

      actions.appendChild(button('DELETE', 'btn-danger', async () => {
        if (!confirm('Delete ' + u.email + ' permanently? This cannot be undone.')) return;
        const { error } = await supabase.rpc('admin_delete_user', { target: u.id });
        if (error) { say(error.message); return; }
        users = users.filter((x) => x.id !== u.id);
        draw();
        say('User deleted.');
      }));
    }

    return d;
  }

  function draw() {
    const term = search.value.trim().toLowerCase();
    const shown = users.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(term) ||
        (u.full_name || '').toLowerCase().includes(term)
    );
    countEl.textContent = users.length;
    listEl.innerHTML = '';
    if (!shown.length) {
      listEl.innerHTML = '<p class="muted">No users found.</p>';
      return;
    }
    shown.forEach((u) => listEl.appendChild(row(u)));
  }

  document.getElementById('back').onclick = () => go('home');
  search.oninput = draw;

  say('Loading...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { say(error.message); return; }
  users = data;
  say('');
  draw();
}
