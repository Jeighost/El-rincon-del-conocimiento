(function() {
  'use strict';

  const REFLEXIONES_KEY = 'reflexiones_count';
  const NOTIFICATION_SENT_KEY = 'notification_sent_for';
  const CURRENT_REFLEXIONES_COUNT = 10;

  function checkForNewReflections() {
    // Verificar que Notification esté disponible
    if (typeof Notification === 'undefined') {
      console.log('⚠️ Notificaciones no disponibles en este entorno');
      return;
    }

    const lastCount = parseInt(localStorage.getItem(REFLEXIONES_KEY) || '0');
    
    if (CURRENT_REFLEXIONES_COUNT > lastCount) {
      const newCount = CURRENT_REFLEXIONES_COUNT - lastCount;
      
      localStorage.setItem(REFLEXIONES_KEY, CURRENT_REFLEXIONES_COUNT.toString());
      
      const notificationSent = localStorage.getItem(NOTIFICATION_SENT_KEY);
      
      if (notificationSent !== CURRENT_REFLEXIONES_COUNT.toString() && Notification.permission === 'granted') {
        sendNotification(newCount, CURRENT_REFLEXIONES_COUNT);
        localStorage.setItem(NOTIFICATION_SENT_KEY, CURRENT_REFLEXIONES_COUNT.toString());
      }
    }
  }

  function sendNotification(count, total) {
    if (typeof Notification === 'undefined') return;

    const titles = {
      1: 'La percepción', 2: 'La historia', 3: 'Último mensaje',
      4: 'No soy nadie', 5: 'Un sueño despierto', 6: 'Un solitario',
      7: 'El titulo va al final', 8: 'Otro dia', 9: 'Desgaste invisible', 10: 'La identidad'
    };

    const title = count === 1 ? `🧠 Nueva: "${titles[total]}"` : `🧠 ${count} nuevas reflexiones`;

    new Notification(title, {
      body: count === 1 ? 'Explora este nuevo pensamiento' : `Ahora hay ${total} reflexiones`,
      icon: 'icon-192.png',
      tag: `new-${total}`
    });
  }

  function updateStatsCounter() {
    const statNumber = document.querySelector('.stats-bar .stat-number');
    if (statNumber) statNumber.textContent = CURRENT_REFLEXIONES_COUNT;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      checkForNewReflections();
    }
    updateStatsCounter();
  });

})();