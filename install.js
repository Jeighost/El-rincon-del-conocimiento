// ============================================
// INSTALL.JS - Sistema de instalación PWA
// ============================================

(function() {
  'use strict';

  let deferredPrompt;
  let installButton;
  let installBanner;

  // Esperar a que el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    createInstallUI();
    registerServiceWorker();
  });

  // Crear interfaz de instalación
  function createInstallUI() {
    // Banner de instalación
    installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.style.display = 'none';
    installBanner.innerHTML = `
      <div class="install-content">
        <div class="install-icon">📱</div>
        <div class="install-text">
          <strong>Instalar El Rincón</strong>
          <p>Accede más rápido y lee sin conexión</p>
        </div>
        <div class="install-actions">
          <button id="install-button" class="btn-install">Instalar</button>
          <button id="dismiss-button" class="btn-dismiss">✕</button>
        </div>
      </div>
    `;

    // Estilos del banner
    const style = document.createElement('style');
    style.textContent = `
      #install-banner {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(20,20,20,0.98), rgba(30,30,30,0.98));
        backdrop-filter: blur(10px);
        border: 1px solid rgba(212,175,55,0.3);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.2);
        z-index: 1000;
        max-width: 90%;
        width: 450px;
        animation: slideDown 0.4s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      .install-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .install-icon {
        font-size: 2.5rem;
        line-height: 1;
      }

      .install-text {
        flex: 1;
      }

      .install-text strong {
        color: #d4af37;
        font-size: 1.1rem;
        display: block;
        margin-bottom: 0.3rem;
      }

      .install-text p {
        color: #ccc;
        font-size: 0.9rem;
        margin: 0;
      }

      .install-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .btn-install {
        background: #d4af37;
        color: #000;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.95rem;
      }

      .btn-install:hover {
        background: #fff5cc;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(212,175,55,0.4);
      }

      .btn-dismiss {
        background: transparent;
        color: #888;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        font-size: 1.2rem;
        transition: color 0.3s;
      }

      .btn-dismiss:hover {
        color: #d4af37;
      }

      @media (max-width: 768px) {
        #install-banner {
          top: 10px;
          width: 95%;
          padding: 0.8rem 1rem;
        }

        .install-content {
          gap: 0.7rem;
        }

        .install-icon {
          font-size: 2rem;
        }

        .install-text strong {
          font-size: 1rem;
        }

        .install-text p {
          font-size: 0.85rem;
        }

        .btn-install {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(installBanner);

    // Event listeners
    installButton = document.getElementById('install-button');
    const dismissButton = document.getElementById('dismiss-button');

    installButton.addEventListener('click', installApp);
    dismissButton.addEventListener('click', dismissBanner);
  }

  // Registrar Service Worker
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/El-rincon-del-conocimiento/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.log('❌ Error al registrar Service Worker:', error);
        });
    }
  }

  // Capturar evento de instalación
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Verificar si ya fue instalada o descartada
    const dismissed = localStorage.getItem('install-dismissed');
    const installed = localStorage.getItem('app-installed');

    if (!dismissed && !installed) {
      // Mostrar banner después de 3 segundos
      setTimeout(() => {
        installBanner.style.display = 'block';
      }, 3000);
    }
  });

  // Función para instalar
  function installApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar');
        localStorage.setItem('app-installed', 'true');
        showSuccessMessage();
      } else {
        console.log('❌ Usuario canceló la instalación');
      }

      deferredPrompt = null;
      installBanner.style.display = 'none';
    });
  }

  // Descartar banner
  function dismissBanner() {
    installBanner.style.display = 'none';
    localStorage.setItem('install-dismissed', 'true');

    // Permitir mostrar nuevamente después de 7 días
    setTimeout(() => {
      localStorage.removeItem('install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  }

  // Mensaje de éxito
  function showSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20,20,20,0.98);
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;
    successMsg.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
      <div style="color: #d4af37; font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem;">
        ¡App instalada!
      </div>
      <div style="color: #ccc; font-size: 1rem;">
        Ahora puedes acceder desde tu pantalla de inicio
      </div>
    `;

    document.body.appendChild(successMsg);

    setTimeout(() => {
      successMsg.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => successMsg.remove(), 300);
    }, 3000);
  }

  // Detectar si ya está instalada
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente');
    localStorage.setItem('app-installed', 'true');
  });

})();