const views = {};

export function register(name, fn) {
  views[name] = fn;
}

export function go(name, params) {
  const app = document.getElementById('app');
  views[name](app, params);
}
