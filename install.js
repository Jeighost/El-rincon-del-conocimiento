// ============================================
// INSTALL.JS - Sistema de instalación PWA OPTIMIZADO
// ============================================

(function() {
  'use strict';

  let deferredPrompt;
  let installBanner;
  let permanentInstallBtn;

  // Detectar ruta base del proyecto
  const BASE_PATH = window.location.pathname.includes('El-rincon-del-conocimiento') 
    ? '/El-rincon-del-conocimiento' 
    : '';

  document.addEventListener('DOMContentLoaded', () => {
    createInstallUI();
    registerServiceWorker();
    addPermanentInstallStyles();
    addPermanentInstallButton();
  });

  // Registrar Service Worker con ruta corregida
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      const swPath = `${BASE_PATH}/service-worker.js`;
      
      navigator.serviceWorker.register(swPath)
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);
          
          // Verificar actualizaciones cada 60 segundos
          setInterval(() => {
            registration.update();
          }, 60000);
        })
        .catch((error) => {
          console.log('❌ Error al registrar Service Worker:', error);
        });
    }
  }

  // Crear interfaz de instalación
  function createInstallUI() {
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

    installButton = document.getElementById('install-button');
    const dismissButton = document.getElementById('dismiss-button');

    installButton.addEventListener('click', installApp);
    dismissButton.addEventListener('click', dismissBanner);
  }

  // Capturar evento de instalación
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 Evento de instalación capturado');

    const dismissed = localStorage.getItem('install-dismissed');
    const dismissTime = localStorage.getItem('install-dismiss-time');
    const installed = localStorage.getItem('app-installed');

    // Si fue descartado hace menos de 7 días, no mostrar
    if (dismissTime) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        return;
      }
    }

    if (!dismissed && !installed) {
      setTimeout(() => {
        installBanner.style.display = 'block';
      }, 3000);
    }

    updatePermanentButton();
  });

  // Función para instalar
  function installApp() {
    if (!deferredPrompt) {
      console.log('❌ No hay prompt de instalación disponible');
      showInstallInstructions();
      return;
    }

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar');
        localStorage.setItem('app-installed', 'true');
        showSuccessMessage();
        updatePermanentButton();
        
        // Analytics
        if (window.gtag) {
          gtag('event', 'pwa_install_success', {
            'event_category': 'PWA',
            'event_label': 'Instalación completada'
          });
        }
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
    localStorage.setItem('install-dismiss-time', Date.now().toString());
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

  // Estilos para botón permanente
  function addPermanentInstallStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .install-permanent-btn {
        background: transparent;
        color: #d4af37;
        border: 1px solid rgba(212,175,55,0.3);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
      }

      .install-permanent-btn:hover {
        border-color: #d4af37;
        background: rgba(212,175,55,0.1);
        transform: translateY(-2px);
      }

      .install-permanent-btn.installed {
        color: #90ee90;
        border-color: rgba(144,238,144,0.3);
        cursor: default;
      }

      .install-permanent-btn.installed:hover {
        border-color: #90ee90;
        background: rgba(45,80,22,0.2);
        transform: none;
      }

      @media (max-width: 768px) {
        .install-text {
          display: none;
        }
        
        .install-permanent-btn {
          padding: 0.5rem 0.8rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Agregar botón permanente
  function addPermanentInstallButton() {
    const checkNav = setInterval(() => {
      const nav = document.querySelector('nav');
      if (nav) {
        clearInterval(checkNav);
        
        permanentInstallBtn = document.createElement('button');
        permanentInstallBtn.id = 'permanent-install-btn';
        permanentInstallBtn.className = 'install-permanent-btn';
        permanentInstallBtn.title = 'Instalar aplicación';
        
        updatePermanentButton();
        
        permanentInstallBtn.addEventListener('click', handlePermanentButtonClick);
        
        nav.appendChild(permanentInstallBtn);
        console.log('✅ Botón permanente agregado');
      }
    }, 100);

    setTimeout(() => clearInterval(checkNav), 5000);
  }

  // Manejar clic en botón permanente
  function handlePermanentButtonClick() {
    const isInstalled = localStorage.getItem('app-installed') === 'true';
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isInstalled || isPWA) {
      showInstalledMessage();
    } else if (deferredPrompt) {
      installApp();
    } else {
      showInstallInstructions();
    }
  }

  // Actualizar estado del botón permanente
  function updatePermanentButton() {
    if (!permanentInstallBtn) return;

    const isInstalled = localStorage.getItem('app-installed') === 'true';
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isInstalled || isPWA) {
      permanentInstallBtn.innerHTML = '✅ <span class="install-text">App instalada</span>';
      permanentInstallBtn.classList.add('installed');
      permanentInstallBtn.title = 'La app ya está instalada';
    } else {
      permanentInstallBtn.innerHTML = '📱 <span class="install-text">Instalar App</span>';
      permanentInstallBtn.classList.remove('installed');
      permanentInstallBtn.title = 'Instalar como aplicación';
    }
  }

  // Mensaje cuando ya está instalada
  function showInstalledMessage() {
    showInfoMessage('✅', '¡App ya instalada!', 'Puedes acceder desde tu pantalla de inicio');
  }

  // Instrucciones si no se puede instalar automáticamente
  function showInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      showInfoMessage('💡', 'Cómo instalar en iOS', 'Toca el botón Compartir (□↑) y selecciona "Agregar a pantalla de inicio"');
    } else {
      showInfoMessage('💡', 'Cómo instalar', 'Abre el menú del navegador (⋮) y selecciona "Instalar app" o "Agregar a pantalla de inicio"');
    }
  }

  // Mostrar mensaje informativo genérico
  function showInfoMessage(icon, title, message) {
    const infoMsg = document.createElement('div');
    infoMsg.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(20,20,20,0.98);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(212,175,55,0.3);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      z-index: 10000;
      max-width: 90%;
      width: 400px;
      animation: slideDown 0.4s ease;
    `;
    
    infoMsg.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 1rem;">
        <div style="font-size: 2rem; line-height: 1;">${icon}</div>
        <div style="flex: 1;">
          <strong style="color: #d4af37; font-size: 1.1rem; display: block; margin-bottom: 0.5rem;">${title}</strong>
          <p style="color: #ccc; font-size: 0.9rem; margin: 0; line-height: 1.5;">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; border: none; color: #888; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;">✕</button>
      </div>
    `;
    
    document.body.appendChild(infoMsg);
    setTimeout(() => infoMsg.remove(), 8000);
  }

  // Detectar si ya está instalada
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente');
    localStorage.setItem('app-installed', 'true');
    updatePermanentButton();
  });

  // Actualizar estado al cargar si ya está instalada como PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    localStorage.setItem('app-installed', 'true');
  }

})();