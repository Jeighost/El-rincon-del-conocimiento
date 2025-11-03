// ============================================
// NOTIFICATIONS.JS - Sistema de notificaciones
// ============================================

(function() {
  'use strict';

  let notificationPermission = 'default';

  // Inicializar sistema de notificaciones
  function initNotifications() {
    if (!('Notification' in window)) {
      console.log('❌ Este navegador no soporta notificaciones');
      return;
    }

    notificationPermission = Notification.permission;
    console.log('🔔 Estado de notificaciones:', notificationPermission);

    // Si ya hay permiso, registrar para notificaciones
    if (notificationPermission === 'granted') {
      subscribeToPushNotifications();
    }

    // Agregar botón de notificaciones al menú
    addNotificationButton();
  }

  // Solicitar permiso de notificaciones
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showMessage('Tu navegador no soporta notificaciones', 'error');
      return false;
    }

    if (notificationPermission === 'granted') {
      showMessage('Las notificaciones ya están activadas', 'success');
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      notificationPermission = permission;

      if (permission === 'granted') {
        showMessage('¡Notificaciones activadas! Te avisaremos de nuevas reflexiones', 'success');
        subscribeToPushNotifications();
        updateNotificationButton();
        
        // Enviar notificación de bienvenida
        showWelcomeNotification();
        return true;
      } else {
        showMessage('Notificaciones bloqueadas. Puedes activarlas desde la configuración', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  // Suscribirse a notificaciones push
  function subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('✅ Registrado para notificaciones push');
        
        // Guardar fecha de suscripción
        localStorage.setItem('notification-subscribed', new Date().toISOString());
        
        // Registrar en analytics si está disponible
        if (window.gtag) {
          gtag('event', 'notification_subscribe', {
            'event_category': 'Engagement',
            'event_label': 'Usuario activó notificaciones'
          });
        }
      });
    }
  }

  // Notificación de bienvenida
  function showWelcomeNotification() {
    if (Notification.permission === 'granted') {
      const notification = new Notification('¡Bienvenido al Rincón! 📚', {
        body: 'Te notificaremos cuando publiquemos nuevas reflexiones.',
        icon: 'icon-192.png',
        badge: 'icon-96.png',
        tag: 'welcome',
        requireInteraction: false,
        vibrate: [200, 100, 200]
      });

      notification.onclick = function() {
        window.focus();
        notification.close();
      };

      // Auto cerrar después de 5 segundos
      setTimeout(() => notification.close(), 5000);
    }
  }

  // Enviar notificación de nueva reflexión (llamar manualmente cuando agregues una)
  function notifyNewReflection(title, preview) {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Nueva reflexión publicada 🧠', {
        body: `"${title}"\n${preview}`,
        icon: 'icon-192.png',
        badge: 'icon-96.png',
        tag: 'new-reflection',
        requireInteraction: false,
        vibrate: [200, 100, 200, 100, 200],
        actions: [
          { action: 'read', title: 'Leer ahora' },
          { action: 'later', title: 'Más tarde' }
        ]
      });

      notification.onclick = function() {
        window.open('/El-rincon-del-conocimiento/reflexiones.html', '_blank');
        notification.close();
      };
    }
  }

  // Botón de notificaciones en el menú
  function addNotificationButton() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const notifButton = document.createElement('button');
    notifButton.id = 'notification-toggle';
    notifButton.className = 'notification-btn';
    
    updateNotificationButtonContent(notifButton);
    
    notifButton.addEventListener('click', async () => {
      if (notificationPermission === 'granted') {
        showMessage('Las notificaciones ya están activadas', 'info');
      } else {
        await requestNotificationPermission();
      }
    });

    nav.appendChild(notifButton);
  }

  // Actualizar contenido del botón
  function updateNotificationButtonContent(button) {
    if (notificationPermission === 'granted') {
      button.innerHTML = '🔔 <span class="notif-text">Notificaciones ON</span>';
      button.classList.add('active');
    } else {
      button.innerHTML = '🔕 <span class="notif-text">Activar notificaciones</span>';
      button.classList.remove('active');
    }
  }

  // Actualizar botón después de cambios
  function updateNotificationButton() {
    const button = document.getElementById('notification-toggle');
    if (button) {
      updateNotificationButtonContent(button);
    }
  }

  // Mostrar mensaje temporal
  function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `notification-message ${type}`;
    message.textContent = text;
    
    message.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#2d5016' : type === 'error' ? '#5a1a1a' : '#1a3a4a'};
      color: ${type === 'success' ? '#90ee90' : type === 'error' ? '#ff6b6b' : '#87ceeb'};
      padding: 1rem 2rem;
      border-radius: 8px;
      border: 1px solid ${type === 'success' ? '#4a7c2f' : type === 'error' ? '#8b3a3a' : '#2d5a7a'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 10000;
      font-size: 0.95rem;
      max-width: 90%;
      text-align: center;
      animation: slideInDown 0.3s ease;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.style.animation = 'slideOutUp 0.3s ease';
      setTimeout(() => message.remove(), 300);
    }, 4000);
  }

  // Estilos del botón de notificaciones
  function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .notification-btn {
        background: transparent;
        color: #888;
        border: 1px solid rgba(212,175,55,0.3);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
      }

      .notification-btn:hover {
        border-color: #d4af37;
        color: #d4af37;
        background: rgba(212,175,55,0.1);
      }

      .notification-btn.active {
        border-color: #4a7c2f;
        color: #90ee90;
        background: rgba(45,80,22,0.2);
      }

      .notification-btn.active:hover {
        border-color: #90ee90;
        background: rgba(45,80,22,0.3);
      }

      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      @keyframes slideOutUp {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
      }

      @media (max-width: 768px) {
        .notif-text {
          display: none;
        }
        
        .notification-btn {
          padding: 0.5rem 0.8rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Verificar nuevas reflexiones periódicamente
  function checkForNewReflections() {
    // Obtener última reflexión vista
    const lastSeen = localStorage.getItem('last-reflection-seen') || '0';
    const currentReflections = 7; // Actualizar cuando agregues más

    if (parseInt(lastSeen) < currentReflections) {
      const newCount = currentReflections - parseInt(lastSeen);
      
      if (newCount > 0 && Notification.permission === 'granted') {
        notifyNewReflection(
          'Hay nuevas reflexiones disponibles',
          `${newCount} nueva${newCount > 1 ? 's' : ''} reflexión${newCount > 1 ? 'es' : ''} publicada${newCount > 1 ? 's' : ''}`
        );
      }
    }
  }

  // Marcar reflexión como vista
  function markReflectionAsSeen(number) {
    const current = parseInt(localStorage.getItem('last-reflection-seen') || '0');
    if (number > current) {
      localStorage.setItem('last-reflection-seen', number.toString());
    }
  }

  // Detectar si estamos en una página de reflexión y marcar como vista
  function autoMarkReflectionSeen() {
    const path = window.location.pathname;
    const match = path.match(/reflexion(\d+)\.html/);
    if (match) {
      markReflectionAsSeen(parseInt(match[1]));
    }
  }

  // Exponer funciones públicas
  window.notifications = {
    request: requestNotificationPermission,
    notify: notifyNewReflection,
    markSeen: markReflectionAsSeen
  };

  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    addNotificationStyles();
    initNotifications();
    autoMarkReflectionSeen();
    
    // Verificar nuevas reflexiones al cargar
    checkForNewReflections();
  });

})();