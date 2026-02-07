// ============================================
// REFLEXIONES ENHANCED - Sistema de Categorías + Favoritos
// ============================================

(function() {
  'use strict';

  // ============================================
  // CONFIGURACIÓN Y DATOS
  // ============================================

  // Mapeo de reflexiones a categorías
  const reflexionData = {
    1: { 
      categories: ['Filosofía', 'Conciencia'],
      title: 'LA PERCEPCIÓN',
      description: 'Primera reflexión. Aquí empieza todo'
    },
    2: { 
      categories: ['Filosofía', 'Existencialismo'],
      title: 'LA HISTORIA',
      description: 'A veces...'
    },
    3: { 
      categories: ['Amor', 'Relaciones', 'Poesía'],
      title: 'ÚLTIMO MENSAJE',
      description: 'Un corto poema'
    },
    4: { 
      categories: ['Propósito', 'Crecimiento Personal'],
      title: 'NO SOY NADIE',
      description: 'Nunca lo seré, pero para mí lo soy'
    },
    5: { 
      categories: ['Crecimiento Personal', 'Propósito'],
      title: 'UN SUEÑO DESPIERTO',
      description: 'Todos podemos soñar con lo mismo'
    },
    6: { 
      categories: ['Existencialismo', 'Conciencia'],
      title: 'UN SOLITARIO',
      description: 'Anhelando una compañía real'
    },
    7: { 
      categories: ['Filosofía', 'Existencialismo'],
      title: 'EL TÍTULO VA AL FINAL',
      description: 'Ya pude leerlo'
    },
    8: { 
      categories: ['Amor', 'Poesía'],
      title: 'OTRO DÍA',
      description: 'Poesía de tu inmensidad'
    },
    9: { 
      categories: ['Crecimiento Personal', 'Conciencia'],
      title: 'DESGASTE INVISIBLE',
      description: '¿Cómo estoy cuidando lo importante?'
    },
    10: { 
      categories: ['Filosofía', 'Conciencia'],
      title: 'LA IDENTIDAD',
      description: 'Una mirada hacia el ser interior, donde las máscaras, los recuerdos y el tiempo difuminan lo que creemos ser'
    },
    11: { 
      categories: ['Propósito', 'Conciencia'],
      title: 'LA CONCIENCIA QUE SE BASTA ASÍ MISMA',
      description: 'Reflexión filosófica sobre la plenitud interior y la conciencia como fuente inagotable de felicidad'
    },
    12: { 
      categories: ['Filosofía', 'Propósito'],
      title: 'EL MUNDO QUE SUEÑO',
      description: 'Una visión posible'
    },
    13: { 
      categories: ['Poesía', 'Melancolía'],
      title: '6:50',
      description: 'Este mar, cómo te adoro y odio'
    },
    14: { 
      categories: ['Relaciones', 'Engaño'],
      title: 'El espejo y la sombra',
      description: 'Un relato filosófico sobre la infidelidad entendida no como un acto físico, sino como una consecuencia del vacío interior y la falta de empatía consigo mismo y con los demás'
    },
    15: { 
      categories: ['Poesía', 'Melancolía'],
      title: 'Vacío',
      description: 'No logro ver el final'
    },
    16: { 
      categories: ['Melancolía', 'Tristeza'],
      title: '¿Desea reiniciar?',
      description: ''
    },
    17: { 
      categories: ['Filosofía', 'Propósito'],
      title: 'Egoísmo',
      description: 'Explicación sobre los puntos importantes del concepto'
    },
    18: { 
      categories: ['Filosofía', 'Conciencia'],
      title: 'No es un buen negocio',
      description: 'No lo es'
    },
    19: { 
      categories: ['Crecimiento Personal', 'Poesía'],
      title: 'La noche y el niño',
      description: 'Entre la noche y el día'
    },
    20: { 
      categories: ['Amor', 'Relaciones', 'Poesía'],
      title: 'Lo último de mi para ti',
      description: ''
    },
    21: { 
      categories: ['Filosofía', 'Propósito'],
      title: 'Mi pensamiento',
      description: 'Solo es un pensamiento más de mi parte'
    },
    22: { 
      categories: ['Melancolía', 'Poesía'],
      title: 'De tanto pensar',
      description: 'Una mas'
    }
  };

  // Definición de categorías con iconos y descripciones
  const categoryDefinitions = {
    'Filosofía': {
      icon: '🧠',
      color: '#9b59b6',
      description: 'Reflexiones sobre la existencia, el conocimiento y la realidad'
    },
    'Conciencia': {
      icon: '💭',
      color: '#3498db',
      description: 'Exploraciones sobre el ser consciente y la percepción'
    },
    'Amor': {
      icon: '❤️',
      color: '#e74c3c',
      description: 'Pensamientos sobre el amor, sus formas y manifestaciones'
    },
    'Relaciones': {
      icon: '✨',
      color: '#FF00FF',
      description: 'Reflexiones sobre vínculos humanos y conexiones'
    },
    'Crecimiento Personal': {
      icon: '🌱',
      color: '#2ecc71',
      description: 'Caminos hacia el desarrollo y la evolución personal'
    },
    'Poesía': {
      icon: '📖',
      color: '#f39c12',
      description: 'Expresiones artísticas y literarias del pensamiento'
    },
    'Propósito': {
      icon: '🎯',
      color: '#1abc9c',
      description: 'Búsqueda de sentido y dirección en la vida'
    },
    'Existencialismo': {
      icon: '🌌',
      color: '#34495e',
      description: 'Cuestionamientos sobre el sentido de la existencia'
    },
    'Melancolía': {
      icon: '🌙',
      color: '#0000FF',
      description: 'Reflexiones desde la nostalgia y la introspección'
    },
    'Engaño': {
      icon: '🪤',
      color: '#FFFF00',
      description: 'Análisis sobre la verdad, la mentira y sus consecuencias'
    },
    'Tristeza': {
      icon: '🥀',
      color: '#0D0D0D',
      description: 'Exploraciones del dolor y la melancolía humana'
    }
  };

  // ============================================
  // ESTADO DE LA APLICACIÓN
  // ============================================
  
  let currentView = 'categories'; // 'categories', 'filtered', 'favorites'
  let currentFilter = null;

  // ============================================
  // INTEGRACIÓN CON FAVORITOS.JS EXISTENTE
  // ============================================

  function getFavorites() {
    // Usar el sistema existente de favoritos.js
    if (window.favoritos && typeof window.favoritos.getAll === 'function') {
      return window.favoritos.getAll();
    }
    // Fallback si favoritos.js no está cargado aún
    try {
      const stored = localStorage.getItem('reflexiones_favoritas');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function toggleFavorite(reflexionId, reflexionTitle) {
    if (window.favoritos && typeof window.favoritos.toggle === 'function') {
      return window.favoritos.toggle(reflexionId, reflexionTitle);
    }
    return false;
  }

  function isFavorite(reflexionId) {
    if (window.favoritos && typeof window.favoritos.isFavorite === 'function') {
      return window.favoritos.isFavorite(reflexionId);
    }
    const favorites = getFavorites();
    return favorites.includes(String(reflexionId));
  }

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  function init() {
    // Solo ejecutar en la página de reflexiones
    if (!window.location.pathname.includes('/reflexiones/')) return;

    checkURLParameters();
    setupPage();
    addCategoriesToReflectionPages();
  }

  // ============================================
  // PARÁMETROS DE URL
  // ============================================

  function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('categoria');
    
    if (category) {
      currentFilter = category;
      currentView = 'filtered';
    }
  }

  function updateURL(category) {
    if (category && category !== 'all') {
      const url = `/reflexiones/?categoria=${encodeURIComponent(category)}`;
      window.history.pushState({ category }, '', url);
    } else {
      window.history.pushState({}, '', '/reflexiones/');
    }
  }

  // ============================================
  // CONFIGURACIÓN DE LA PÁGINA
  // ============================================

  function setupPage() {
    const reflexionesContainer = document.querySelector('.reflexiones');
    if (!reflexionesContainer) return;

    // Ocultar el contenido original
    const originalH2 = document.querySelector('h2');
    if (originalH2 && originalH2.textContent.includes('lista')) {
      originalH2.style.display = 'none';
    }
    
    const originalCards = document.querySelectorAll('.reflexion-card');
    originalCards.forEach(card => card.style.display = 'none');

    const finalSection = document.querySelector('section');
    if (finalSection) finalSection.style.display = 'none';

    // Crear el nuevo contenedor
    const container = document.createElement('div');
    container.id = 'enhanced-reflexiones-container';
    reflexionesContainer.parentNode.insertBefore(container, reflexionesContainer);

    // Renderizar la vista apropiada
    if (currentView === 'categories') {
      renderCategories(container);
    } else if (currentView === 'filtered') {
      renderFilteredReflexiones(container, currentFilter);
    }

    // Manejar navegación del navegador
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.category) {
        currentFilter = event.state.category;
        currentView = 'filtered';
        renderFilteredReflexiones(container, currentFilter);
      } else {
        currentView = 'categories';
        renderCategories(container);
      }
    });
  }

  // ============================================
  // RENDERIZADO DE CATEGORÍAS
  // ============================================

  function renderCategories(container) {
    const categoryCounts = calculateCategoryCounts();
    const favorites = getFavorites();
    
    const html = `
      <div class="categories-container">
        <div class="categories-header">
          <h2>🏷️ Explora por Categorías</h2>
          <p>Selecciona una categoría para descubrir reflexiones relacionadas</p>
        </div>
        
        ${favorites.length > 0 ? `
          <div class="categories-actions">
            <button class="btn-show-favorites" onclick="if(window.favoritos && window.favoritos.showModal) window.favoritos.showModal();">
              ❤️ Ver Favoritos (${favorites.length})
            </button>
          </div>
        ` : ''}
        
        <div class="categories-grid">
          ${Object.entries(categoryDefinitions)
            .filter(([name]) => categoryCounts[name] > 0)
            .map(([name, data]) => `
              <div class="category-card" onclick="window.reflexionesEnhanced.filterByCategory('${name}')" tabindex="0" role="button" aria-label="Ver reflexiones de ${name}">
                <span class="category-icon">${data.icon}</span>
                <h3 class="category-name">${name}</h3>
                <span class="category-count">${categoryCounts[name]} ${categoryCounts[name] === 1 ? 'reflexión' : 'reflexiones'}</span>
                <p class="category-description">${data.description}</p>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Añadir eventos de teclado para accesibilidad
    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  // ============================================
  // RENDERIZADO DE REFLEXIONES FILTRADAS
  // ============================================

  function renderFilteredReflexiones(container, category) {
    const filteredReflexiones = getReflexionesByCategory(category);
    const categoryData = categoryDefinitions[category];
    const favorites = getFavorites();

    if (!categoryData) {
      console.error('Categoría no encontrada:', category);
      return;
    }

    const html = `
      <div class="filtered-reflexiones">
        <div class="categories-actions">
          <button class="btn-back-categories" onclick="window.reflexionesEnhanced.backToCategories()">
            ← Volver a Categorías
          </button>
        </div>
        
        <div class="filtered-header">
          <h2>${categoryData.icon} ${category}</h2>
          <p>${categoryData.description}</p>
          <p>${filteredReflexiones.length} ${filteredReflexiones.length === 1 ? 'reflexión encontrada' : 'reflexiones encontradas'}</p>
        </div>

        ${filteredReflexiones.length > 0 ? `
          <div class="reflexiones-grid-enhanced">
            ${filteredReflexiones.map(reflexion => createReflexionCard(reflexion)).join('')}
          </div>
        ` : `
          <div class="no-results">
            <div class="no-results-icon">📭</div>
            <h3>No hay reflexiones en esta categoría</h3>
            <p>Intenta explorar otras categorías</p>
          </div>
        `}
      </div>
    `;

    container.innerHTML = html;
    attachFavoriteListeners(container);
  }

  // ============================================
  // CREACIÓN DE TARJETAS
  // ============================================

  function createReflexionCard(reflexion) {
    const categories = reflexion.categories.map(cat => {
      const catData = categoryDefinitions[cat];
      return catData ? `
        <a href="/reflexiones/?categoria=${encodeURIComponent(cat)}" 
           class="category-badge"
           onclick="event.preventDefault(); window.reflexionesEnhanced.filterByCategory('${cat}')">
          ${catData.icon} ${cat}
        </a>
      ` : '';
    }).join('');

    const isFav = isFavorite(reflexion.id);
    const starIcon = isFav ? '❤️': '🤍';

    return `
      <div class="reflexion-card-enhanced" data-id="${reflexion.id}">
        <div class="reflexion-header">
          <div class="reflexion-title">
            <a href="/reflexion${reflexion.id}/">${reflexion.title}</a>
          </div>
          <button class="favorite-btn ${isFav ? 'active' : ''}" 
                  data-id="${reflexion.id}"
                  aria-label="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
                  title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
            ${starIcon}
          </button>
        </div>
        ${reflexion.description ? `<p class="reflexion-description">${reflexion.description}</p>` : ''}
        <div class="reflexion-categories">
          ${categories}
        </div>
      </div>
    `;
  }

  // ============================================
  // HELPERS
  // ============================================

  function calculateCategoryCounts() {
    const counts = {};
    Object.keys(categoryDefinitions).forEach(cat => counts[cat] = 0);
    
    Object.values(reflexionData).forEach(reflexion => {
      reflexion.categories.forEach(cat => {
        if (counts[cat] !== undefined) counts[cat]++;
      });
    });
    
    return counts;
  }

  function getReflexionesByCategory(category) {
    return Object.entries(reflexionData)
      .filter(([_, data]) => data.categories.includes(category))
      .map(([id, data]) => ({ id: parseInt(id), ...data }))
      .sort((a, b) => a.id - b.id);
  }

  function attachFavoriteListeners(container) {
    container.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const reflexionId = parseInt(btn.dataset.id);
        const reflexionTitle = reflexionData[reflexionId]?.title || `Reflexión ${reflexionId}`;
        
        const isNowFavorite = toggleFavorite(reflexionId, reflexionTitle);
        
        // Cambiar el contenido y la clase
        btn.textContent = isNowFavorite ? '❤️' : '🤍';
        btn.classList.toggle('active', isNowFavorite);
        btn.setAttribute('aria-label', isNowFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos');
        btn.setAttribute('title', isNowFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos');

        // Actualizar contador de favoritos en botones
        const favorites = getFavorites();
        const favBtns = document.querySelectorAll('.btn-show-favorites');
        favBtns.forEach(favBtn => {
          favBtn.innerHTML = `❤️ ${favorites.length > 0 ? `Favoritos (${favorites.length})` : 'Ver Favoritos'}`;
        });

        // Actualizar el contador en el nav de favoritos.js también
        if (window.favoritos && window.favoritos.updateCount) {
          window.favoritos.updateCount();
        }
      });
    });
  }

  // ============================================
  // AÑADIR CATEGORÍAS A PÁGINAS DE REFLEXIÓN
  // ============================================

  function addCategoriesToReflectionPages() {
    const path = window.location.pathname;
    const match = path.match(/reflexion(\d+)/);
    
    if (!match) return;

    const reflexionId = parseInt(match[1]);
    const data = reflexionData[reflexionId];
    
    if (!data || !data.categories.length) return;

    const header = document.querySelector('.encabezado, header, h1');
    if (!header) return;

    // Verificar si ya existe el contenedor
    if (document.querySelector('.reflexion-categories')) return;

    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'reflexion-categories';
    categoriesContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.5rem 0; justify-content: center;';
    
    data.categories.forEach(category => {
      const catData = categoryDefinitions[category];
      if (!catData) return;

      const categoryBadge = document.createElement('a');
      categoryBadge.href = `/reflexiones/?categoria=${encodeURIComponent(category)}`;
      categoryBadge.className = 'category-badge';
      categoryBadge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: rgba(212, 175, 55, 0.1);
        color: #d4af37;
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        border: 1px solid rgba(212, 175, 55, 0.3);
        transition: all 0.3s ease;
        text-decoration: none;
        font-weight: 500;
      `;
      categoryBadge.innerHTML = `${catData.icon} ${category}`;
      
      categoryBadge.addEventListener('mouseenter', () => {
        categoryBadge.style.background = 'rgba(212, 175, 55, 0.2)';
        categoryBadge.style.borderColor = '#d4af37';
        categoryBadge.style.transform = 'translateY(-2px)';
        categoryBadge.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.3)';
      });

      categoryBadge.addEventListener('mouseleave', () => {
        categoryBadge.style.background = 'rgba(212, 175, 55, 0.1)';
        categoryBadge.style.borderColor = 'rgba(212, 175, 55, 0.3)';
        categoryBadge.style.transform = 'translateY(0)';
        categoryBadge.style.boxShadow = 'none';
      });

      categoriesContainer.appendChild(categoryBadge);
    });

    header.after(categoriesContainer);
  }

  // ============================================
  // API PÚBLICA
  // ============================================

  window.reflexionesEnhanced = {
    filterByCategory: (category) => {
      currentFilter = category;
      currentView = 'filtered';
      updateURL(category);
      
      const container = document.getElementById('enhanced-reflexiones-container');
      if (container) {
        renderFilteredReflexiones(container, category);
      }
    },

    backToCategories: () => {
      currentView = 'categories';
      currentFilter = null;
      updateURL(null);
      
      const container = document.getElementById('enhanced-reflexiones-container');
      if (container) {
        renderCategories(container);
      }
    },

    // Para uso externo
    getFavorites: getFavorites,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite
  };

  // ============================================
  // INICIAR CUANDO EL DOM ESTÉ LISTO
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();