// ============================================
// HEADER ENHANCED - Mejoras del header
// ============================================

(function() {
  'use strict';

  function enhanceHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    // Crear nombre "Jeighost" fijo
    const brand = document.createElement('div');
    brand.className = 'header-brand';
    brand.textContent = 'Jeighost';
    document.body.appendChild(brand);

    // Mover botones existentes a contenedor temporal
    const installBtn = document.querySelector('[data-action="install"]');
    const notifBtn = document.querySelector('[data-action="notifications"]');
    
    if (installBtn || notifBtn) {
      const tempButtons = document.createElement('div');
      tempButtons.className = 'header-temp-buttons';
      
      if (installBtn) {
        tempButtons.appendChild(installBtn.cloneNode(true));
        installBtn.remove();
      }
      
      if (notifBtn) {
        tempButtons.appendChild(notifBtn.cloneNode(true));
        notifBtn.remove();
      }
      
      document.body.appendChild(tempButtons);

      // Ocultar después de 3 segundos
      setTimeout(() => {
        tempButtons.classList.add('hidden');
        
        // Eliminar del DOM después de la transición
        setTimeout(() => {
          tempButtons.remove();
        }, 500);
      }, 3000);
    }

    // Crear contenedor de controles permanentes
    const controls = document.createElement('div');
    controls.className = 'header-controls';
    
    // Mover botón de menú hamburguesa
    const menuBtn = document.querySelector('.menu-toggle, [data-action="menu"]');
    if (menuBtn) {
      controls.appendChild(menuBtn);
    }
    
    // Mover botón de tema
    const themeBtn = document.querySelector('.theme-toggle-btn, [data-action="theme"]');
    if (themeBtn) {
      controls.appendChild(themeBtn);
    }
    
    document.body.appendChild(controls);

    console.log('✅ Header mejorado cargado');
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceHeader);
  } else {
    enhanceHeader();
  }
})();