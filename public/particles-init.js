// Minimal particle background using Canvas
// Lightweight and friendly for Chromebooks: not heavy like full particles.js

const canvas = document.createElement('canvas');
canvas.id = 'particles-canvas';
canvas.style.position = 'fixed';
canvas.style.inset = '0';
canvas.style.zIndex = '-1';
canvas.style.pointerEvents = 'none';
document.getElementById('bg')?.appendChild(canvas);

const ctx = canvas.getContext('2d');
let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;

const particles = [];
const count = Math.max(20, Math.floor((w * h) / 80000)); // scale with screen

function rand(min, max) { return Math.random() * (max - min) + min; }

for (let i = 0; i < count; i++) {
  particles.push({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(1, 3),
    vx: rand(-0.3, 0.3),
    vy: rand(-0.2, 0.2),
    hue: rand(200, 260),
  });
}

function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
}

addEventListener('resize', resize);

function draw() {
  ctx.clearRect(0, 0, w, h);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < -10) p.x = w + 10;
    if (p.x > w + 10) p.x = -10;
    if (p.y < -10) p.y = h + 10;
    if (p.y > h + 10) p.y = -10;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue},60%,60%,0.12)`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // subtle connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = dx * dx + dy * dy;
      if (d < 9000) {
        ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2},60%,60%,${0.08})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}

draw();
