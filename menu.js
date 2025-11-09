// ============================================
// MENU.JS - Control del menú mejorado
// ============================================

(function() {
  'use strict';

  // Reestructurar el menú al cargar
  function restructureMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Guardar elementos actuales
    const existingLinks = Array.from(nav.querySelectorAll('a'));
    const existingButtons = Array.from(nav.querySelectorAll('button'));

    // Crear nueva estructura
    const navContainer = document.createElement('div');
    navContainer.className = 'nav-container';

    // Sección de enlaces
    const navLinks = document.createElement('div');
    navLinks.className = 'nav-links';
    existingLinks.forEach(link => navLinks.appendChild(link));

    // Sección de acciones (botones)
    const navActions = document.createElement('div');
    navActions.className = 'nav-actions';
    existingButtons.forEach(button => navActions.appendChild(button));

    // Botón hamburguesa
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '☰';
    navToggle.setAttribute('aria-label', 'Toggle navigation');
    
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.innerHTML = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    // Ensamblar estructura
    navContainer.appendChild(navActions);
    navContainer.appendChild(navLinks);
    navContainer.appendChild(navToggle);

    // Limpiar y agregar nueva estructura
    nav.innerHTML = '';
    nav.appendChild(navContainer);

    // Cerrar menú al hacer clic en un enlace (móvil)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 968) {
          navLinks.classList.remove('open');
          navToggle.innerHTML = '☰';
        }
      });
    });

    // Cerrar menú al hacer clic fuera (móvil)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 968) {
        if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          navToggle.innerHTML = '☰';
        }
      }
    });

    // Marcar página activa automáticamente
    markActivePage();
  }

  // Marcar la página actual como activa
  function markActivePage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      
      // Remover clases activas anteriores
      link.classList.remove('active', 'activo');
      
      // Comparar paths
      if (currentPath === linkPath || 
          (currentPath.includes(linkPath) && linkPath !== '/')) {
        link.classList.add('active');
      }
      
      // Caso especial para index
      if ((currentPath === '/' || currentPath.endsWith('/')) && 
          (linkPath.includes('index.html') || link.textContent.trim() === 'Inicio')) {
        link.classList.add('active');
      }
    });
  }

  // Agregar separador visual entre botones
  function addSeparators() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const buttons = navActions.querySelectorAll('button');
    if (buttons.length > 1) {
      buttons.forEach((button, index) => {
        if (index < buttons.length - 1) {
          const separator = document.createElement('div');
          separator.className = 'nav-separator';
          button.after(separator);
        }
      });
    }
  }

  // Efecto de scroll - cambiar opacidad del menú
  function addScrollEffect() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        nav.style.background = 'rgba(10,10,10,0.99)';
        nav.style.boxShadow = '0 6px 24px rgba(0,0,0,0.8)';
      } else {
        nav.style.background = 'rgba(10,10,10,0.98)';
        nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
      }

      lastScroll = currentScroll;
    });
  }

  // Agregar indicador visual debajo del enlace activo
  function addActiveIndicator() {
    const nav = document.querySelector('nav');
    if (!nav || window.innerWidth <= 968) return;

    const indicator = document.createElement('div');
    indicator.className = 'nav-indicator';
    nav.appendChild(indicator);

    function updateIndicator() {
      const activeLink = nav.querySelector('a.active, a.activo');
      if (activeLink) {
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.left = `${linkRect.left - navRect.left}px`;
      }
    }

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
  }

  // Animar entrada del menú al cargar
  function animateMenuEntrance() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    nav.style.transform = 'translateY(-100%)';
    nav.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    setTimeout(() => {
      nav.style.transform = 'translateY(0)';
    }, 100);
  }

  // Inicializar todo
  document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que otros scripts creen sus botones
    setTimeout(() => {
      restructureMenu();
      addSeparators();
      addScrollEffect();
      addActiveIndicator();
      animateMenuEntrance();
    }, 100);
  });
  
  requestAnimationFrame(() => {
  // aquí el código que lee geometría
});

  // Actualizar al redimensionar ventana
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      addActiveIndicator();
    }, 250);
  });

})();