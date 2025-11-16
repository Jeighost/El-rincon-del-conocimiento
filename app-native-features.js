// ========================================
// APP NATIVE FEATURES JS
// Funcionalidades para experiencia de app
// ========================================

(function() {
  'use strict';

  // ====== DETECCIÓN DE APP INSTALADA ======
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone || 
                       document.referrer.includes('android-app://');

  // Agregar clase al body si es app
  if (isStandalone) {
    document.body.classList.add('installed-app');
    console.log('✅ Modo App detectado');
  }

  // ====== ANIMACIÓN DE ENTRADA DE PÁGINA ======
  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-transition-enter');
  });

  // ====== SCROLL ANIMATIONS ======
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observar elementos para animación
  const animateElements = document.querySelectorAll(
    '.reflexion-card, .hero-image-card, .intro-text, .interactive-section'
  );
  
  animateElements.forEach(el => {
    el.classList.add('fade-in-on-scroll');
    observer.observe(el);
  });

  // ====== PULL TO REFRESH ======
  let pullStartY = 0;
  let pullMoveY = 0;
  let isPulling = false;
  let pullElement = null;

  // Solo en app instalada
  if (isStandalone) {
    // Crear elemento visual de pull
    pullElement = document.createElement('div');
    pullElement.className = 'pull-to-refresh';
    document.body.appendChild(pullElement);

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        pullStartY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isPulling) return;
      
      pullMoveY = e.touches[0].clientY - pullStartY;
      
      if (pullMoveY > 80) {
        pullElement.classList.add('visible');
      } else {
        pullElement.classList.remove('visible');
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (pullMoveY > 150) {
        // Recargar página
        showToast('Actualizando...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
      pullElement.classList.remove('visible');
      isPulling = false;
      pullStartY = 0;
      pullMoveY = 0;
    });
  }

  // ====== TOAST NOTIFICATIONS ======
  function showToast(message, duration = 3000) {
    // Crear toast si no existe
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // Hacer función global
  window.showToast = showToast;

  // ====== HAPTIC FEEDBACK (VIBRACIÓN) ======
  function hapticFeedback(type = 'light') {
    if (!('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 30, 50]
    };

    navigator.vibrate(patterns[type] || patterns.light);
  }

  // Agregar feedback a botones importantes
  document.querySelectorAll('.btn, button').forEach(btn => {
    btn.addEventListener('click', () => {
      hapticFeedback('light');
    });
  });

  // ====== MEJORAR FORMULARIOS ======
  const inputs = document.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    // Validación visual
    input.addEventListener('invalid', (e) => {
      e.preventDefault();
      input.classList.add('error-shake');
      hapticFeedback('error');
      
      setTimeout(() => {
        input.classList.remove('error-shake');
      }, 300);
    });

    // Feedback al completar
    input.addEventListener('change', () => {
      if (input.value.trim() !== '') {
        hapticFeedback('success');
      }
    });
  });

  // ====== NAVEGACIÓN SUAVE ======
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        hapticFeedback('light');
      }
    });
  });

  // ====== LINK ACTIVO EN NAVEGACIÓN ======
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || 
        (currentPage === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ====== PREVENIR ZOOM EN INPUTS (MÓVIL) ======
  if (isStandalone) {
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  // ====== OCULTAR SPLASH SCREEN NATIVO ======
  window.addEventListener('load', () => {
    // Remover cualquier splash screen después de cargar
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);
  });

  // ====== ESTADO DE CONEXIÓN ======
  window.addEventListener('online', () => {
    showToast('✓ Conectado', 2000);
  });

  window.addEventListener('offline', () => {
    showToast('⚠ Sin conexión - Modo offline', 3000);
  });

  // ====== PREVENIR COMPORTAMIENTOS DE NAVEGADOR ======
  if (isStandalone) {
    // Prevenir abrir links externos en la app
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (target && target.hostname !== window.location.hostname) {
        e.preventDefault();
        // Abrir en navegador externo
        if (confirm('¿Abrir este enlace en el navegador?')) {
          window.open(target.href, '_blank');
        }
      }
    });
  }

  // ====== MEJORAR RENDIMIENTO ======
  // Lazy loading mejorado para imágenes
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.src; // Forzar lazy loading
    });
  } else {
    // Fallback para navegadores antiguos
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }

  // ====== LOG DE INFORMACIÓN ======
  console.log('🚀 App Native Features cargadas');
  console.log('📱 Modo:', isStandalone ? 'App instalada' : 'Navegador');
  console.log('🌐 Online:', navigator.onLine);
  
})();