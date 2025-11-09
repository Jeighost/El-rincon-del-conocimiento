// ============================================
// MENU.JS - Control del menú mejorado (refactor)
// ============================================
(function () {
  'use strict';

  let indicatorEl = null;      // único indicador
  let updateIndicatorFn = null; // referencia para resize

  // Normaliza una ruta para comparar
  function normalizePath(pathname) {
    try {
      // Quitar query/hash
      const url = new URL(pathname, location.href);
      let p = url.pathname;
      // Quitar doble slash, trailing slash (excepto raíz)
      p = p.replace(/\/{2,}/g, '/');
      if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
      // Tratar index.html como raíz de su carpeta
      if (p.endsWith('/index.html')) p = p.slice(0, -('/index.html'.length));
      if (p === '') p = '/';
      return p;
    } catch {
      return '/';
    }
  }

  // Reestructurar el menú al cargar
  function restructureMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Evitar ejecutar dos veces
    if (nav.querySelector('.nav-container')) return;

    // Guardar elementos actuales
    const existingLinks = Array.from(nav.querySelectorAll('a'));
    const existingButtons = Array.from(nav.querySelectorAll('button'));

    // Crear nueva estructura
    const navContainer = document.createElement('div');
    navContainer.className = 'nav-container';
    navContainer.setAttribute('role', 'navigation');

    // Sección de acciones (botones)
    const navActions = document.createElement('div');
    navActions.className = 'nav-actions';
    existingButtons.forEach((btn) => navActions.appendChild(btn));

    // Sección de enlaces
    const navLinks = document.createElement('div');
    navLinks.className = 'nav-links';
    navLinks.setAttribute('role', 'menubar');
    existingLinks.forEach((link) => {
      link.setAttribute('role', 'menuitem');
      navLinks.appendChild(link);
    });

    // Botón hamburguesa
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.type = 'button';
    navToggle.setAttribute('aria-label', 'Abrir navegación');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = '☰';

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.innerHTML = isOpen ? '✕' : '☰';
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Ensamblar estructura
    navContainer.appendChild(navActions);
    navContainer.appendChild(navLinks);
    navContainer.appendChild(navToggle);

    // Limpiar y agregar nueva estructura
    nav.innerHTML = '';
    nav.appendChild(navContainer);

    // Cerrar menú al hacer clic en un enlace (móvil)
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 968) {
          navLinks.classList.remove('open');
          navToggle.innerHTML = '☰';
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Cerrar menú al hacer clic fuera (móvil)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 968) {
        if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          navToggle.innerHTML = '☰';
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Marcar página activa automáticamente
    markActivePage();
  }

  // Marcar la página actual como activa
  function markActivePage() {
    const current = normalizePath(location.pathname);
    const links = document.querySelectorAll('nav a');

    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const linkPath = normalizePath(href);

      // Remover clases activas anteriores
      link.classList.remove('active', 'activo');

      // Igualdad exacta o carpeta que contiene (evitando raíz)
      if (current === linkPath || (linkPath !== '/' && current.startsWith(linkPath))) {
        link.classList.add('active');
      }

      // Caso especial para home
      if (
        (current === '/' || current === '') &&
        (linkPath === '/' || /index\.html$/i.test(href) || link.textContent.trim().toLowerCase() === 'inicio')
      ) {
        link.classList.add('active');
      }
    });
  }

  // Agregar separador visual entre botones
  function addSeparators() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const buttons = Array.from(navActions.querySelectorAll('button'));
    if (buttons.length > 1) {
      // Evitar duplicados si se vuelve a llamar
      navActions.querySelectorAll('.nav-separator').forEach((s) => s.remove());
      buttons.forEach((button, index) => {
        if (index < buttons.length - 1) {
          const separator = document.createElement('div');
          separator.className = 'nav-separator';
          button.after(separator);
        }
      });
    }
  }

  // Efecto de scroll - eficiente
  function addScrollEffect() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.pageYOffset || document.documentElement.scrollTop || 0;
          if (y > 100) {
            nav.style.background = 'rgba(10,10,10,0.99)';
            nav.style.boxShadow = '0 6px 24px rgba(0,0,0,0.8)';
          } else {
            nav.style.background = 'rgba(10,10,10,0.98)';
            nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
  }

  // Indicador visual debajo del enlace activo (único)
  function setupActiveIndicator() {
    const nav = document.querySelector('nav');
    if (!nav || window.innerWidth <= 968) return;

    // Crear una sola vez
    if (!indicatorEl) {
      indicatorEl = document.createElement('div');
      indicatorEl.className = 'nav-indicator';
      indicatorEl.style.position = 'absolute';
      indicatorEl.style.bottom = '0';
      indicatorEl.style.height = '2px';
      indicatorEl.style.background = '#d4af37';
      indicatorEl.style.transition = 'left 0.3s ease, width 0.3s ease';
      nav.style.position = nav.style.position || 'relative';
      nav.appendChild(indicatorEl);
    }

    updateIndicatorFn = function updateIndicator() {
      const activeLink = nav.querySelector('a.active, a.activo');
      if (activeLink) {
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        indicatorEl.style.width = `${linkRect.width}px`;
        indicatorEl.style.left = `${linkRect.left - navRect.left}px`;
        indicatorEl.style.opacity = '1';
      } else {
        indicatorEl.style.opacity = '0';
        indicatorEl.style.width = '0px';
      }
    };

    updateIndicatorFn();
  }

  // Animar entrada del menú al cargar
  function animateMenuEntrance() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    nav.style.transform = 'translateY(-100%)';
    nav.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    // pequeño retraso para permitir pintura inicial
    setTimeout(() => {
      nav.style.transform = 'translateY(0)';
    }, 100);
  }

  // Inicializar todo
  document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que otros scripts creen sus botones/enlaces si hace falta
    setTimeout(() => {
      restructureMenu();
      addSeparators();
      addScrollEffect();
      setupActiveIndicator();
      animateMenuEntrance();
    }, 100);
  });

  // Recalcular indicador al redimensionar (sin crear otro)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupActiveIndicator();
      if (typeof updateIndicatorFn === 'function') updateIndicatorFn();
    }, 200);
  });

  // Recalcular cuando cambie el historial (navegación interna)
  window.addEventListener('popstate', () => {
    markActivePage();
    if (typeof updateIndicatorFn === 'function') updateIndicatorFn();
  });

})();