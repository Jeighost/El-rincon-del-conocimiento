// ============================================
// AUTO-NOTIFICATIONS.JS - Sistema automático de notificaciones
// ============================================

(function() {
  'use strict';

  const REFLEXIONES_KEY = 'reflexiones_count';
  const LAST_CHECK_KEY = 'last_check_date';
  const NOTIFICATION_SENT_KEY = 'notification_sent_for';

  // Detectar automáticamente número de reflexiones
  async function detectReflexionesCount() {
    let count = 0;
    
    // Intentar detectar archivos reflexionX.html
    for (let i = 1; i <= 50; i++) {
      try {
        const response = await fetch(`reflexion${i}.html`, { method: 'HEAD' });
        if (response.ok) {
          count = i;
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }
    
    return count;
  }

  // Sistema de detección de nuevas reflexiones
  async function checkForNewReflections() {
    try {
      const lastCount = parseInt(localStorage.getItem(REFLEXIONES_KEY) || '0');
      const currentCount = await detectReflexionesCount();
      
      console.log(`📊 Reflexiones: ${lastCount} → ${currentCount}`);
      
      if (currentCount > lastCount) {
        const newReflections = currentCount - lastCount;
        
        // Guardar nuevo contador
        localStorage.setItem(REFLEXIONES_KEY, currentCount.toString());
        localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
        
        // Verificar si ya se envió notificación
        const notificationSent = localStorage.getItem(NOTIFICATION_SENT_KEY);
        
        if (notificationSent !== currentCount.toString()) {
          await sendNewReflectionNotification(newReflections, currentCount);
          localStorage.setItem(NOTIFICATION_SENT_KEY, currentCount.toString());
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error detectando reflexiones:', error);
      return false;
    }
  }

  // Enviar notificación de nueva reflexión
  async function sendNewReflectionNotification(count, totalCount) {
    if (Notification.permission !== 'granted') {
      console.log('⚠️ Sin permiso para notificaciones');
      return;
    }

    const titles = {
      1: 'La percepción',
      2: 'La historia',
      3: 'Último mensaje',
      4: 'No soy nadie',
      5: 'Un sueño despierto',
      6: 'Un solitario',
      7: 'El titulo va al final',
      8: 'Nueva reflexión', // Default para reflexiones futuras
      9: 'Nueva reflexión',
      10: 'Nueva reflexión'
    };

    const title = count === 1 
      ? `🧠 Nueva reflexión: "${titles[totalCount] || 'Reflexión ' + totalCount}"` 
      : `🧠 ${count} nuevas reflexiones disponibles`;

    const body = count === 1
      ? 'Explora este nuevo pensamiento'
      : `Ahora hay ${totalCount} reflexiones para explorar`;

    const notification = new Notification(title, {
      body: body,
      icon: 'icon-192.png',
      badge: 'icon-96.png',
      tag: `new-reflection-${totalCount}`,
      requireInteraction: false,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        url: count === 1 ? `reflexion${totalCount}.html` : 'reflexiones.html'
      }
    });

    notification.onclick = function() {
      window.open(this.data.url, '_self');
      notification.close();
    };

    // Registrar en analytics
    if (window.gtag) {
      gtag('event', 'new_reflection_detected', {
        'event_category': 'Content',
        'event_label': `${count} nuevas reflexiones`,
        'value': totalCount
      });
    }
  }

  // Programar verificaciones periódicas
  function scheduleChecks() {
    // Verificar al cargar la página
    checkForNewReflections();

    // Verificar cada 30 minutos
    setInterval(() => {
      checkForNewReflections();
    }, 30 * 60 * 1000);

    // Verificar cuando el usuario regresa a la pestaña
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
        const now = new Date();
        
        if (!lastCheck) {
          checkForNewReflections();
          return;
        }
        
        const lastCheckDate = new Date(lastCheck);
        const hoursSinceCheck = (now - lastCheckDate) / (1000 * 60 * 60);
        
        // Si pasaron más de 2 horas, verificar de nuevo
        if (hoursSinceCheck > 2) {
          checkForNewReflections();
        }
      }
    });
  }

  // Sistema de programación de notificaciones
  function scheduleNotification(date, title, message) {
    const now = new Date();
    const scheduledTime = new Date(date);
    const delay = scheduledTime - now;

    if (delay > 0) {
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: 'icon-192.png',
            badge: 'icon-96.png',
            vibrate: [200, 100, 200]
          });
        }
      }, delay);

      console.log(`📅 Notificación programada para ${scheduledTime.toLocaleString()}`);
      return true;
    }

    return false;
  }

  // API pública para programar notificaciones personalizadas
  window.autoNotifications = {
    check: checkForNewReflections,
    schedule: scheduleNotification,
    // Programar recordatorio semanal
    scheduleWeeklyReminder: () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(19, 0, 0, 0); // 7 PM

      return scheduleNotification(
        nextWeek,
        '📚 El Rincón del Conocimiento',
        '¿Leíste todas las reflexiones esta semana?'
      );
    }
  };

  // Inicializar sistema
  document.addEventListener('DOMContentLoaded', () => {
    // Solo iniciar si hay permiso de notificaciones
    if (Notification.permission === 'granted') {
      console.log('🔔 Sistema de notificaciones automáticas iniciado');
      scheduleChecks();
    } else {
      console.log('⏸️ Sistema de notificaciones en espera de permiso');
      
      // Escuchar cuando se otorgue permiso
      const checkPermission = setInterval(() => {
        if (Notification.permission === 'granted') {
          console.log('✅ Permiso otorgado, iniciando sistema');
          scheduleChecks();
          clearInterval(checkPermission);
        }
      }, 1000);
    }
  });

})();

// ============================================
// BONUS: Sistema de actualización de contador automático en stats
// ============================================

(function() {
  'use strict';

  async function updateReflexionesCounter() {
    const statNumber = document.querySelector('.stats-bar .stat-number');
    if (!statNumber) return;

    try {
      let count = 0;
      for (let i = 1; i <= 50; i++) {
        const response = await fetch(`reflexion${i}.html`, { method: 'HEAD' });
        if (response.ok) count = i;
        else break;
      }

      if (count > 0) {
        statNumber.textContent = count;
        console.log(`📊 Contador actualizado: ${count} reflexiones`);
      }
    } catch (e) {
      console.log('⚠️ No se pudo actualizar contador automáticamente');
    }
  }

  // Actualizar al cargar
  if (window.location.pathname.includes('index.html') || 
      window.location.pathname === '/' ||
      window.location.pathname.endsWith('/El-rincon-del-conocimiento/')) {
    
    window.addEventListener('load', () => {
      setTimeout(updateReflexionesCounter, 1000);
    });
  }

})();