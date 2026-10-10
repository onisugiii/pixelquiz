import { current } from './auth.js';

const views = {};
const PUBLIC = ['login', 'signup', 'forgot', 'reset'];

export function register(name, fn) {
  views[name] = fn;
}

export function go(name, params) {
  if (!PUBLIC.includes(name) && !current.user) name = 'login';
  if (name === 'admin' && !(current.profile && current.profile.role === 'admin')) name = 'home';

  const app = document.getElementById('app');
  views[name](app, params);
}
