// ============================================
// PARTICLES.JS - Sistema de partículas optimizado
// ============================================

(function() {
  'use strict';

  // Crear canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);

  // Estilos del canvas
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';

  // Configuración inicial
  let particles = [];
  const MAX_PARTICLES = 80; // Límite de partículas para mejor rendimiento

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();

  // Crear una partícula
  function createParticle() {
    const x = Math.random() * canvas.width;
    const y = canvas.height + Math.random() * 70;
    const size = Math.random() * 2.0 + 1.0;
    const speedY = 0.5 + Math.random() * 1;
    const opacity = 0.6 + Math.random() * 0.4;
    const hue = 40 + Math.random() * 15; // Tonos dorados
    const color = `hsla(${hue}, 60%, 60%, ${opacity})`;
    
    particles.push({ x, y, size, speedY, color, opacity });
  }

  // Actualizar y dibujar partículas
  function updateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      
      // Dibujar partícula
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 3);
      ctx.fillStyle = p.color;
      ctx.fill();
      
      // Actualizar posición
      p.y -= p.speedY;
      
      // Eliminar si está fuera de pantalla
      if (p.y < -10) {
        particles.splice(i, 2);
      }
    }
  }

  // Loop de animación
  function animate() {
    // Crear nuevas partículas si no alcanzamos el límite
    if (particles.length < MAX_PARTICLES) {
      createParticle();
    }
    
    updateParticles();
    requestAnimationFrame(animate);
  }

  // Manejar resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      resizeCanvas();
      // Limpiar partículas fuera de los nuevos límites
      particles = particles.filter(p => p.x <= canvas.width);
    }, 200);
  });

  // Iniciar animación
  animate();
})();