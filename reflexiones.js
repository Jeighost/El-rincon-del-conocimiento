// ============================================
// REFLEXIONES.JS - Efectos de aparición y brillo
// ============================================

(function() {
  'use strict';

  // Seleccionar todas las reflexiones
  const reflexiones = document.querySelectorAll('.reflexion-item');

  if (reflexiones.length === 0) return;

  // Intersection Observer para aparición progresiva
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Opcional: dejar de observar después de aparecer
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar cada reflexión
  reflexiones.forEach(reflexion => {
    observer.observe(reflexion);
  });

  // Animación de brillo dorado suave
  let pulso = 0;
  let animationFrameId;

  function animarBrillo() {
    pulso += 0.015; // Velocidad del pulso
    
    reflexiones.forEach(reflexion => {
      if (reflexion.classList.contains('visible')) {
        // Calcular intensidad del brillo (0 a 0.35)
        const intensidad = (Math.sin(pulso) + 1) / 2 * 0.35;
        const blur = 15 + (intensidad * 15); // 15px a 30px
        
        reflexion.style.boxShadow = `0 0 ${blur}px rgba(212, 175, 55, ${intensidad})`;
      }
    });
    
    animationFrameId = requestAnimationFrame(animarBrillo);
  }

  // Iniciar animación solo si hay reflexiones visibles
  animarBrillo();

  // Limpiar al salir de la página
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
})();