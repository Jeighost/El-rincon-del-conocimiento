// ============================================
// ANALYTICS.JS - Sistema de estadísticas completo
// ============================================

(function() {
  'use strict';

  // ⚠️ REEMPLAZA 'G-XXXXXXXXXX' con tu ID real de Google Analytics
  const GA_MEASUREMENT_ID = 'G-CV6RG5X5P1';

  // Cargar Google Analytics
  function loadGoogleAnalytics() {
    // Script de Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Configuración
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      'send_page_view': true,
      'anonymize_ip': true
    });

    console.log('✅ Google Analytics cargado');
  }

  // Tracking de instalación de PWA
  function trackPWAInstall() {
    window.addEventListener('appinstalled', () => {
      if (window.gtag) {
        gtag('event', 'pwa_install', {
          'event_category': 'PWA',
          'event_label': 'App instalada',
          'value': 1
        });
        console.log('📱 Instalación de PWA registrada');
      }

      // Contador local (opcional)
      incrementCounter('installs');
    });
  }

  // Tracking cuando se abre la PWA instalada
  function trackPWAOpen() {
    // Detectar si se abrió como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      if (window.gtag) {
        gtag('event', 'pwa_open', {
          'event_category': 'PWA',
          'event_label': 'App abierta desde pantalla inicio'
        });
        console.log('📱 PWA abierta como app');
      }
    }
  }

  // Tracking de lectura de reflexiones
  function trackReflectionViews() {
    const reflexionPages = [
      'reflexion1.html',
      'reflexion2.html',
      'reflexion3.html',
      'reflexion4.html',
      'reflexion5.html',
      'reflexion6.html',
      'reflexion7.html'
    ];

    const currentPage = window.location.pathname;
    const isReflexion = reflexionPages.some(page => currentPage.includes(page));

    if (isReflexion) {
      const reflexionNumber = currentPage.match(/reflexion(\d+)/)?.[1];
      
      if (window.gtag && reflexionNumber) {
        gtag('event', 'reflection_view', {
          'event_category': 'Contenido',
          'event_label': `Reflexión ${reflexionNumber}`,
          'value': parseInt(reflexionNumber)
        });

        // Tracking de lectura completa (después de 30 segundos)
        setTimeout(() => {
          gtag('event', 'reflection_complete', {
            'event_category': 'Contenido',
            'event_label': `Reflexión ${reflexionNumber} completada`,
            'value': parseInt(reflexionNumber)
          });
        }, 30000); // 30 segundos
      }
    }
  }

  // Tracking de clics en reflexiones (desde la lista)
  function trackReflectionClicks() {
    document.querySelectorAll('.enlace-reflexion').forEach(link => {
      link.addEventListener('click', function() {
        const titulo = this.textContent.trim();
        if (window.gtag) {
          gtag('event', 'click', {
            'event_category': 'Navegación',
            'event_label': `Clic en reflexión: ${titulo}`
          });
        }
      });
    });
  }

  // Tracking de galería
  function trackGalleryView() {
    if (window.location.pathname.includes('galeria.html')) {
      if (window.gtag) {
        gtag('event', 'gallery_view', {
          'event_category': 'Contenido',
          'event_label': 'Visita a galería'
        });
      }
    }
  }

  // Tracking de interacción con el módulo "¿Qué es la vida?"
  function trackLifeQuestion() {
    const enviarBtn = document.getElementById('enviar');
    if (enviarBtn) {
      enviarBtn.addEventListener('click', () => {
        if (window.gtag) {
          gtag('event', 'interaction', {
            'event_category': 'Interacción',
            'event_label': 'Pregunta sobre la vida respondida'
          });
        }
      });
    }
  }

  // Tracking de banner de instalación descartado
  function trackBannerDismiss() {
    const dismissBtn = document.getElementById('dismiss-button');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (window.gtag) {
          gtag('event', 'install_banner_dismiss', {
            'event_category': 'PWA',
            'event_label': 'Banner de instalación cerrado'
          });
        }
      });
    }
  }

  // Tracking de tiempo en página
  function trackTimeOnPage() {
    let startTime = Date.now();

    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000); // segundos
      
      if (window.gtag && timeSpent > 5) { // Solo si estuvo más de 5 segundos
        gtag('event', 'timing_complete', {
          'event_category': 'Engagement',
          'event_label': window.location.pathname,
          'value': timeSpent
        });
      }
    });
  }

  // Sistema de contadores locales (opcional - backup sin internet)
  function incrementCounter(type) {
    const key = `counter_${type}`;
    const current = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (current + 1).toString());
  }

  function getLocalStats() {
    return {
      installs: parseInt(localStorage.getItem('counter_installs') || '0'),
      visits: parseInt(localStorage.getItem('counter_visits') || '0')
    };
  }

  // Registrar visita local
  incrementCounter('visits');

  // Función pública para ver stats locales (desde consola)
  window.getLocalStats = getLocalStats;

  // Inicializar todo cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    loadGoogleAnalytics();
    trackPWAInstall();
    trackPWAOpen();
    trackReflectionViews();
    trackReflectionClicks();
    trackGalleryView();
    trackLifeQuestion();
    trackBannerDismiss();
    trackTimeOnPage();

    console.log('📊 Sistema de analytics iniciado');
    console.log('📈 Stats locales:', getLocalStats());
  });

})();