// AUTO-UPDATE.JS - Actualización automática de contadores
(function() {
  'use strict';

  // ======================================
  // CONFIGURACIÓN - Solo cambiar aquí
  // ======================================
  
  const REFLEXIONES = [
    { id: 1, title: 'La percepción', tags: ['Percepción', 'Conciencia', 'Conocimiento'] },
    { id: 2, title: 'La historia', tags: ['Futuro', 'Humanidad', 'Cambio'] },
    { id: 3, title: 'Último mensaje', tags: ['Memoria', 'Relaciones', 'Identidad'] },
    { id: 4, title: 'No soy nadie', tags: ['Individualidad', 'Reconocimiento', 'Propósito'] },
   { id: 5, title: 'Un sueño despierto', tags: ['Sueños', 'Futuro', 'Responsabilidad'] },
  { id: 6, title: 'Un solitario', tags: ['Soledad', 'Existencia', 'Conciencia'] },
    { id: 7, title: 'El titulo va al final', tags: ['Vida', 'Muerte', 'Decisiones'] },
    { id: 8, title: 'Otro dia', tags: ['Universo', 'Amor', 'Enamoramiento'] },
    { id: 9, title: 'Desgaste invicible', tags: ['Salud', 'Bienestar', 'Cambio'] },
    { id: 10, title: 'La Identidad', tags: ['Percepción', 'Conciencia', 'Conocimiento'] },
    { id: 11, title: 'La conciencia que se basta asi misma', tags: ['Conciencia', 'Plenitud', 'Cambio'] }
    { id: 12, title: 'El mundo que sueño', tags: ['Consciencia', 'Unidad', 'Preservacion'] }
    // AGREGAR NUEVAS AQUÍ:
    // { id: 8, title: 'Tu nueva reflexión', tags: ['Tag1', 'Tag2', 'Tag3'] }
  ];

  const TEMAS_COUNT = 8; // Actualizar manualmente si cambian los temas

  // ======================================
  // ACTUALIZACIÓN AUTOMÁTICA
  // ======================================

  function updateCounters() {
    const totalReflexiones = REFLEXIONES.length;
    
    // Actualizar contador en stats
    const statNumber = document.querySelector('.stats-bar .stat-number');
    if (statNumber) {
      statNumber.textContent = totalReflexiones;
    }

    // Actualizar en auto-notifications.js
    if (window.autoNotifications) {
      localStorage.setItem('reflexiones_count', totalReflexiones.toString());
    }
  }

  function updateTags() {
    const path = window.location.pathname;
    const match = path.match(/reflexion(\d+)/);
    
    if (!match) return;

    const currentId = parseInt(match[1]);
    const reflexion = REFLEXIONES.find(r => r.id === currentId);
    
    if (!reflexion) return;

    // Actualizar tags
    const tagsContainer = document.querySelector('.tags');
    if (tagsContainer && tagsContainer.children.length === 0) {
      tagsContainer.innerHTML = reflexion.tags
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');
    }
  }

  function updateFavoritesData() {
    // Sincronizar con favoritos.js
    window.REFLEXIONES_DATA = REFLEXIONES;
  }

  function updateSearchData() {
    // Sincronizar con advanced-features.js
    if (window.location.pathname.includes('reflexiones.html')) {
      window.SEARCH_DATA = REFLEXIONES.map(r => ({
        id: r.id,
        title: r.title,
        tags: r.tags.map(t => t.toLowerCase()),
        preview: getPreview(r.id)
      }));
    }
  }

  function getPreview(id) {
    const previews = {
      1: 'Reflexión sobre la forma que vemos',
      2: 'irónico',
      3: 'Un corto poema',
      4: 'Nunca lo seré, pero para mí lo soy',
      5: 'Todos podemos soñar con lo mismo',
      6: 'Anhelando una compañía real',
      7: 'Ya pude leerlo',
      8: 'Otro dia',
      9: 'Desgaste invicible',
      10: 'La Identidad',
      11: 'La conciencia que se basta asi misma'
      12: 'El mundo que sueño'
    };
    return previews[id] || 'Nueva reflexión';
  }

  // Inicializar
  document.addEventListener('DOMContentLoaded', () => {
    updateCounters();
    updateTags();
    updateFavoritesData();
    updateSearchData();
    console.log(`📊 ${REFLEXIONES.length} reflexiones cargadas`);
  });

  // Exponer datos globalmente
  window.REFLEXIONES_CONFIG = {
    reflexiones: REFLEXIONES,
    count: REFLEXIONES.length,
    temas: TEMAS_COUNT
  };

})();