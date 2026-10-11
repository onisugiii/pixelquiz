import { go } from '../router.js';
import { supabase } from '../supabase.js';
import { current } from '../auth.js';

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function tempPassword() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export async function adminView(app) {
  app.innerHTML = `
    <div class="row" style="margin-bottom:14px">
      <button class="btn small" id="back" style="margin:0">&lt; BACK</button>
      <button class="btn small btn-danger" id="out" style="margin:0">LOGOUT</button>
    </div>
    <h1>ADMIN</h1>
    <p class="muted" id="msg"></p>
    <div class="box">
      <h2>RESET REQUESTS (<span id="rcount">0</span>)</h2>
      <div id="reqs"></div>
    </div>
    <div class="box">
      <h2>USERS (<span id="count">0</span>)</h2>
      <input id="search" placeholder="search name or email" autocomplete="off">
      <div id="users"></div>
    </div>`;

  const listEl = document.getElementById('users');
  const countEl = document.getElementById('count');
  const reqEl = document.getElementById('reqs');
  const rcountEl = document.getElementById('rcount');
  const msg = document.getElementById('msg');
  const search = document.getElementById('search');
  let users = [];
  let requests = [];

  const say = (t) => { msg.textContent = t; };

  function button(label, cls, fn) {
    const b = document.createElement('button');
    b.className = 'btn small ' + cls;
    b.style.margin = '0 6px 6px 0';
    b.textContent = label;
    b.onclick = fn;
    return b;
  }

  // ----- reset requests -----
  function reqRow(r) {
    const d = document.createElement('div');
    d.className = 'user-row';
    d.innerHTML =
      '<div class="user-info"><div class="u-mail"></div><div class="muted u-meta"></div></div><div class="user-actions"></div>';
    d.querySelector('.u-mail').textContent = r.email;
    d.querySelector('.u-meta').textContent = 'requested ' + new Date(r.created_at).toLocaleString();

    const actions = d.querySelector('.user-actions');

    actions.appendChild(button('APPROVE', '', async () => {
      if (!confirm('Approve and create a temporary password for ' + r.email + '?')) return;
      const pw = tempPassword();
      const { error } = await supabase.rpc('admin_approve_reset', { req_id: r.id, new_password: pw });
      if (error) { say(error.message); return; }
      requests = requests.filter((x) => x.id !== r.id);
      drawRequests();
      say('Approved ' + r.email);
      prompt('Give this temporary password to ' + r.email + '. They can log in with it now:', pw);
    }));

    actions.appendChild(button('DISMISS', 'btn-danger', async () => {
      const { error } = await supabase
        .from('password_requests')
        .update({ status: 'dismissed' })
        .eq('id', r.id);
      if (error) { say(error.message); return; }
      requests = requests.filter((x) => x.id !== r.id);
      drawRequests();
    }));

    return d;
  }

  function drawRequests() {
    rcountEl.textContent = requests.length;
    reqEl.innerHTML = '';
    if (!requests.length) {
      reqEl.innerHTML = '<p class="muted">No pending requests.</p>';
      return;
    }
    requests.forEach((r) => reqEl.appendChild(reqRow(r)));
  }

  // ----- users -----
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

    actions.appendChild(button('SET PW', '', async () => {
      const pw = prompt('New password for ' + u.email + ' (6+ characters):');
      if (pw === null) return;
      if (pw.length < 6) { say('Password must be at least 6 characters.'); return; }
      const { error } = await supabase.rpc('admin_set_password', { target: u.id, new_password: pw });
      say(error ? error.message : 'Password updated for ' + u.email + '. Tell them the new password.');
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
  document.getElementById('out').onclick = async () => {
    const { signOut } = await import('../auth.js');
    await signOut();
    go('login');
  };
  search.oninput = draw;

  say('Loading...');
  const [u, r] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase
      .from('password_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
  ]);

  if (u.error) { say(u.error.message); return; }
  users = u.data;
  requests = r.error ? [] : r.data;
  say(r.error ? 'Run password_requests.sql in Supabase to enable reset requests.' : '');
  drawRequests();
  draw();
}
