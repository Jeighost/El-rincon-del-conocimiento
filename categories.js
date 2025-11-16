// ============================================
// CATEGORIES.JS - Sistema de categorías
// ============================================

(function() {
  'use strict';

  // Mapeo de reflexiones a categorías
  const reflexionCategories = {
    1: ['Filosofía', 'Conciencia'],
    2: ['Filosofía', 'Existencialismo'],
    3: ['Amor', 'Relaciones', 'Poesía'],
    4: ['Propósito', 'Crecimiento Personal'],
    5: ['Crecimiento Personal', 'Propósito'],
    6: ['Existencialismo', 'Conciencia'],
    7: ['Filosofía', 'Existencialismo'],
    8: ['Amor', 'Poesía'],
    9: ['Crecimiento Personal', 'Conciencia'],
    10: ['Filosofía', 'Conciencia'],
    11: ['Propósito', 'Conciencia'],
    12: ['Filosofía', 'Propósito'],
    13: ['Poesía', 'Melancolia'],
    14: ['Relaciones', 'Engaño'],
    15: ['Poesía', 'Melancolia'],
    16: ['Melancolia', 'Tristeza']
  };

  // Iconos por categoría
  const categoryIcons = {
    'Filosofía': '🧠',
    'Conciencia': '💭',
    'Amor': '❤️',
    'Relaciones': '✨',   
    'Crecimiento Personal': '🌱',
    'Poesía': '📖',
    'Propósito': '🎯',
    'Existencialismo': '🌌',
    'Melancolia': '🙍',
    'Engaño': '🪤',
    'Tristeza': '🥀'
  };

  // Colores por categoría
  const categoryColors = {
    'Filosofía': '#9b59b6',
    'Conciencia': '#3498db',
    'Amor': '#e74c3c',
    'Crecimiento Personal': '#2ecc71',
    'Poesía': '#f39c12',
    'Propósito': '#1abc9c',
    'Existencialismo': '#34495e',
    'Melancolia': '#0000FF',
    'Relaciones': '#FF00FF',
    'Engaño': '#FFFF00',
    'Tristeza': '#0D0D0D'
  };

  function addCategoriesToReflection() {
    const path = window.location.pathname;
    const match = path.match(/reflexion(\d+)/);
    
    if (!match) return;

    const reflexionId = parseInt(match[1]);
    const categories = reflexionCategories[reflexionId];
    
    if (!categories || categories.length === 0) return;

    const header = document.querySelector('.encabezado, header, h1');
    if (!header) return;

    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'reflexion-categories';
    
    categories.forEach(category => {
      const categoryBadge = document.createElement('a');
      categoryBadge.href = `reflexiones.html?categoria=${encodeURIComponent(category)}`;
      categoryBadge.className = 'category-badge';
      categoryBadge.setAttribute('data-category', category);
      categoryBadge.style.borderColor = categoryColors[category];
      categoryBadge.innerHTML = `${categoryIcons[category]} ${category}`;
      categoriesContainer.appendChild(categoryBadge);
    });

    header.after(categoriesContainer);
  }

  function addCategoryFilterToReflexionesPage() {
    if (!window.location.pathname.includes('reflexiones.html')) return;

    const header = document.querySelector('header, .encabezado');
    if (!header) return;

    const filterContainer = document.createElement('div');
    filterContainer.className = 'category-filter';
    filterContainer.innerHTML = `
      <h3>🏷️ Filtrar por categoría</h3>
      <div class="category-buttons">
        <button class="category-btn active" data-category="all">Todas</button>
        ${Object.keys(categoryIcons).map(cat => 
          `<button class="category-btn" data-category="${cat}">${categoryIcons[cat]} ${cat}</button>`
        ).join('')}
      </div>
    `;

    header.after(filterContainer);

    // Leer categoría de URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('categoria');
    
    if (selectedCategory) {
      const btn = filterContainer.querySelector(`[data-category="${selectedCategory}"]`);
      if (btn) {
        filterContainer.querySelector('.active').classList.remove('active');
        btn.classList.add('active');
        filterReflexions(selectedCategory);
      }
    }

    // Event listeners
    filterContainer.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterContainer.querySelector('.active').classList.remove('active');
        btn.classList.add('active');
        
        const category = btn.getAttribute('data-category');
        filterReflexions(category);
        
        // Actualizar URL
        if (category === 'all') {
          window.history.pushState({}, '', 'reflexiones.html');
        } else {
          window.history.pushState({}, '', `reflexiones.html?categoria=${encodeURIComponent(category)}`);
        }
      });
    });
  }

  function filterReflexions(category) {
    const reflexiones = document.querySelectorAll('.reflexion-item, .enlace-reflexion');
    let visibleCount = 0;

    reflexiones.forEach(item => {
      const link = item.getAttribute('href') || item.querySelector('a')?.getAttribute('href');
      if (!link) return;

      const match = link.match(/reflexion(\d+)/);
      if (!match) return;

      const reflexionId = parseInt(match[1]);
      const reflexionCats = reflexionCategories[reflexionId] || [];

      if (category === 'all' || reflexionCats.includes(category)) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    // Mostrar mensaje si no hay resultados
    let noResultsMsg = document.querySelector('.no-results-category');
    if (visibleCount === 0) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.className = 'no-results-category';
        noResultsMsg.textContent = `No se encontraron reflexiones en la categoría "${category}"`;
        document.querySelector('.reflexiones').appendChild(noResultsMsg);
      }
      noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
      noResultsMsg.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    addCategoriesToReflection();
    addCategoryFilterToReflexionesPage();
  });
})();