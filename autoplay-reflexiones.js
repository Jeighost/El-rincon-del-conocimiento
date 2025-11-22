// ===========================================
// SISTEMA DE AUTOPLAY PARA REFLEXIONES
// Reproducción automática consecutiva
// ===========================================

(function() {
  'use strict';

  const AUTOPLAY_KEY = 'reflexiones_autoplay';
  const TOTAL_REFLEXIONES = 17; // Ajustar según tu cantidad total

  // Obtener configuración de autoplay
  function getAutoplayEnabled() {
    const stored = localStorage.getItem(AUTOPLAY_KEY);
    return stored === 'true';
  }

  // Guardar configuración de autoplay
  function setAutoplayEnabled(enabled) {
    localStorage.setItem(AUTOPLAY_KEY, enabled.toString());
  }

  // Obtener ID de reflexión actual
  function getCurrentReflexionId() {
    const match = window.location.pathname.match(/reflexion(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  // Obtener siguiente reflexión
  function getNextReflexionId(currentId) {
    if (currentId >= TOTAL_REFLEXIONES) {
      return null; // Última reflexión
    }
    return currentId + 1;
  }

  // Navegar a siguiente reflexión
  function navigateToNext() {
    const currentId = getCurrentReflexionId();
    if (!currentId) return;

    const nextId = getNextReflexionId(currentId);
    if (!nextId) {
      showAutoplayNotification('✓ Has completado todas las reflexiones', 3000);
      return;
    }

    showAutoplayNotification(`⏭️ Pasando a la siguiente reflexión...`, 2000);
    
    setTimeout(() => {
      window.location.href = `/reflexion${nextId}/`;
    }, 2000);
  }

  // Agregar controles de autoplay
  function addAutoplayControls() {
    const currentId = getCurrentReflexionId();
    if (!currentId) return;

    // Verificar si ya existe el control
    if (document.querySelector('.autoplay-control')) return;

    const audioPlayer = document.querySelector('.audio-player-mini') || 
                       document.querySelector('.audio-player');
    
    if (!audioPlayer) return;

    // Crear controles
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'autoplay-control';
    
    const isEnabled = getAutoplayEnabled();
    const nextId = getNextReflexionId(currentId);
    
    if (nextId) {
      controlsContainer.innerHTML = `
        <div class="autoplay-toggle">
          <label class="autoplay-label">
            <input type="checkbox" id="autoplayCheckbox" ${isEnabled ? 'checked' : ''}>
            <span class="autoplay-text">⏭️ Reproducir siguiente automáticamente</span>
          </label>
        </div>
        <div class="next-reflexion-info">
          <span class="next-label">Siguiente:</span>
          <a href="/reflexion${nextId}/" class="next-link">Reflexión ${nextId}</a>
        </div>
      `;
    } else {
      controlsContainer.innerHTML = `
        <div class="last-reflexion-notice">
          ✓ Esta es la última reflexión
        </div>
      `;
    }

    audioPlayer.after(controlsContainer);

    // Event listener para el checkbox
    const checkbox = document.getElementById('autoplayCheckbox');
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        setAutoplayEnabled(e.target.checked);
        showAutoplayNotification(
          e.target.checked ? 
          '✓ Autoplay activado' : 
          '✗ Autoplay desactivado',
          2000
        );
      });
    }
  }

  // Configurar listeners de finalización de audio
  function setupAutoplayListeners() {
    if (!getAutoplayEnabled()) return;

    const currentId = getCurrentReflexionId();
    if (!currentId) return;

    const nextId = getNextReflexionId(currentId);
    if (!nextId) return;

    // Para audio MP3 (ElevenLabs)
    const audioElement = document.getElementById('miniAudio');
    if (audioElement) {
      audioElement.addEventListener('ended', () => {
        console.log('Audio MP3 terminado, pasando a siguiente...');
        navigateToNext();
      });
    }

    // Para TTS nativo (buscar el evento de finalización)
    const ttsBtn = document.getElementById('miniPlayBtn');
    if (ttsBtn && !audioElement) {
      // Interceptar el evento de finalización del TTS
      const originalSpeechSynthesis = window.speechSynthesis;
      
      if (originalSpeechSynthesis) {
        // Hook en el utterance.onend cuando se cree
        const originalSpeak = originalSpeechSynthesis.speak;
        originalSpeechSynthesis.speak = function(utterance) {
          const originalOnEnd = utterance.onend;
          
          utterance.onend = function() {
            if (originalOnEnd) {
              originalOnEnd.apply(this, arguments);
            }
            
            if (getAutoplayEnabled()) {
              console.log('TTS terminado, pasando a siguiente...');
              navigateToNext();
            }
          };
          
          return originalSpeak.apply(this, arguments);
        };
      }
    }
  }

  // Mostrar notificación de autoplay
  function showAutoplayNotification(message, duration = 3000) {
    const notif = document.createElement('div');
    notif.className = 'autoplay-notification';
    notif.textContent = message;
    
    document.body.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 10);
    
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, duration);
  }

  // Agregar estilos
  function addAutoplayStyles() {
    if (document.getElementById('autoplay-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'autoplay-styles';
    style.textContent = `
      /* Controles de autoplay */
      .autoplay-control {
        max-width: 600px;
        margin: 1rem auto;
        padding: 0 1rem;
      }

      .autoplay-toggle {
        background: rgba(212, 175, 55, 0.05);
        border: 1px solid rgba(212, 175, 55, 0.2);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 0.8rem;
      }

      .autoplay-label {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        cursor: pointer;
        user-select: none;
      }

      #autoplayCheckbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #d4af37;
      }

      .autoplay-text {
        color: #d4af37;
        font-size: 0.95rem;
        font-weight: 600;
      }

      .next-reflexion-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.8rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 8px;
        border: 1px solid rgba(212, 175, 55, 0.1);
      }

      .next-label {
        color: #888;
        font-size: 0.85rem;
      }

      .next-link {
        color: #d4af37;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s;
      }

      .next-link:hover {
        text-decoration: underline;
        transform: translateX(3px);
      }

      .last-reflexion-notice {
        text-align: center;
        padding: 1rem;
        background: rgba(212, 175, 55, 0.08);
        border-radius: 8px;
        color: #d4af37;
        font-size: 0.9rem;
        border: 1px solid rgba(212, 175, 55, 0.2);
      }

      /* Notificación de autoplay */
      .autoplay-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(212, 175, 55, 0.95);
        color: #0b0b0c;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        z-index: 10002;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
      }

      .autoplay-notification.show {
        opacity: 1;
        transform: translateX(0);
      }

      @media (max-width: 768px) {
        .autoplay-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          text-align: center;
        }

        .autoplay-text {
          font-size: 0.85rem;
        }

        .next-reflexion-info {
          flex-direction: column;
          gap: 0.3rem;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // Inicializar
  function init() {
    // Solo ejecutar en páginas de reflexiones individuales
    if (!getCurrentReflexionId()) return;

    addAutoplayStyles();
    
    // Esperar a que el reproductor de audio se cargue
    setTimeout(() => {
      addAutoplayControls();
      setupAutoplayListeners();
    }, 300);

    console.log('🎵 Sistema de autoplay inicializado');
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();