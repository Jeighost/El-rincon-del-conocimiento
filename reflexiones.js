// --- Efecto de aparición y brillo en reflexiones --- //

const reflexiones = document.querySelectorAll('.reflexion-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

reflexiones.forEach(reflexion => observer.observe(reflexion));

// --- Suave brillo dorado --- //
let pulso = 0;
function animarBrillo() {
  pulso += 0.02;
  reflexiones.forEach(reflexion => {
    if (reflexion.classList.contains('visible')) {
      const intensidad = (Math.sin(pulso) + 1) / 2 * 0.4; // 0 a 0.4
      reflexion.style.boxShadow = `0 0 ${20 * intensidad}px rgba(212,175,55,${intensidad})`;
    }
  });
  requestAnimationFrame(animarBrillo);
}
animarBrillo();