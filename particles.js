const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.pointerEvents = 'none';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

function createParticle() {
  const x = Math.random() * canvas.width;
  const y = canvas.height + Math.random() * 100;
  const size = Math.random() * 2;
  const speedY = 0.8 + Math.random() * 2;
  const color = `rgba(${200 + Math.random() * 55}, ${80 + Math.random() * 50}, 0, ${0.8})`;
  particles.push({ x, y, size, speedY, color });
}

function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    p.y -= p.speedY;
    if (p.y < -10) particles.splice(i, 1);
  }
}

function animate() {
  if (particles.length < 100) createParticle();
  updateParticles();
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});