// splash-detector.js
// Detecta si es la primera vez que se abre la app y muestra el splash

(function() {
  'use strict';

  // Solo ejecutar si es una PWA instalada
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone || 
                       document.referrer.includes('android-app://');

  if (!isStandalone) {
    return; // Si no es app instalada, no hacer nada
  }

  // Verificar si ya se mostró el splash en esta sesión
  const splashShown = sessionStorage.getItem('splashShown');

  if (!splashShown) {
    // Redirigir al splash solo en la primera apertura
    sessionStorage.setItem('splashShown', 'true');
    
    // Guardar la URL actual para volver después
    sessionStorage.setItem('returnUrl', window.location.href);
    
    // Redirigir al splash
    window.location.href = '/splash.html';
  }
})();