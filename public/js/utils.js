export const MAX_HEARTS = 5;

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];

function heartSVG(full) {
  let rects = '';
  HEART.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === 'X') rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    });
  });
  return `<svg viewBox="0 0 7 7" shape-rendering="crispEdges" fill="${full ? '#e8665d' : '#34506b'}">${rects}</svg>`;
}

export function heartsHTML(n) {
  return `<div class="hearts">${Array.from({ length: MAX_HEARTS }, (_, i) => heartSVG(i < n)).join('')}</div>`;
}

export function el(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d;
}
