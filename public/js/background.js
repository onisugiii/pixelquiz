const ICONS = {
  heart: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  star: ['...X...', '...X...', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', '.X...X.'],
  coin: ['..XXX..', '.X...X.', 'X..X..X', 'X.XXX.X', 'X..X..X', '.X...X.', '..XXX..'],
  arrow: ['...X...', '....X..', 'XXXXXXX', '....X..', '...X...'],
  check: ['......X', '.....X.', 'X...X..', '.X.X...', '..X....'],
  cross: ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
  plus: ['..X..', '..X..', 'XXXXX', '..X..', '..X..'],
  play: ['X...', 'XX..', 'XXX.', 'XXXX', 'XXX.', 'XX..', 'X...'],
};

const NAMES = Object.keys(ICONS);
const COLORS = ['#fff8d6', '#4f7396', '#6f93b8'];

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function iconSVG(name, px, color) {
  const map = ICONS[name];
  const h = map.length;
  const w = map[0].length;
  let rects = '';
  map.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === 'X') rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    });
  });
  return `<svg viewBox="0 0 ${w} ${h}" width="${w * px}" height="${h * px}" shape-rendering="crispEdges" fill="${color}">${rects}</svg>`;
}

export function initBackground() {
  let bg = document.getElementById('bg');
  if (!bg) {
    bg = document.createElement('div');
    bg.id = 'bg';
    document.body.prepend(bg);
  }
  bg.innerHTML = '';

  const cols = Math.max(3, Math.ceil(window.innerWidth / 190));
  const rows = Math.max(3, Math.ceil(window.innerHeight / 190));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const name = pick(NAMES);
      const color = name === 'heart' ? '#e8665d' : pick(COLORS);
      const px = pick([3, 4, 5, 6]);

      const d = document.createElement('div');
      d.className = 'bg-icon';
      d.style.left = ((c + rand(0.1, 0.8)) / cols) * 100 + '%';
      d.style.top = ((r + rand(0.1, 0.8)) / rows) * 100 + '%';
      d.style.opacity = rand(0.12, 0.28).toFixed(2);
      d.style.setProperty('--d', rand(5, 10).toFixed(1) + 's');
      d.style.animationDelay = '-' + rand(0, 8).toFixed(1) + 's';
      d.innerHTML = iconSVG(name, px, color);
      bg.appendChild(d);
    }
  }
}
