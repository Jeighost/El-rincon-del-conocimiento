// ============================================
// FAVORITOS.JS - Sistema de favoritos CORREGIDO
// ============================================

(function() {
  'use strict';

  const FAVORITES_KEY = 'reflexiones_favoritas';

  // ✅ FUNCIÓN FALTANTE - Obtener favoritos
  function getFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      return [];
    }
  }

  // Guardar favoritos
  function saveFavorites(favorites) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error al guardar favoritos:', error);
    }
  }

  // Verificar si una reflexión está en favoritos
  function isFavorite(reflexionId) {
    const favorites = getFavorites();
    return favorites.includes(String(reflexionId)); // Asegurar que sea string
  }

  // Agregar a favoritos
  function addToFavorites(reflexionId, reflexionTitle) {
    const favorites = getFavorites();
    const id = String(reflexionId); // Normalizar a string
    
    if (!favorites.includes(id)) {
      favorites.push(id);
      saveFavorites(favorites);
      
      showNotification(`🌟 "${reflexionTitle}" agregada a favoritos`);
      
      // Registrar en analytics
      if (window.gtag) {
        gtag('event', 'add_to_favorites', {
          'event_category': 'Engagement',
          'event_label': reflexionTitle
        });
      }
      
      return true;
    }
    return false;
  }

  // Quitar de favoritos
  function removeFromFavorites(reflexionId, reflexionTitle) {
    let favorites = getFavorites();
    const id = String(reflexionId);
    favorites = favorites.filter(fav => fav !== id);
    saveFavorites(favorites);
    
    showNotification(`Removida de favoritos: "${reflexionTitle}"`);
    
    return true;
  }

  // Toggle favorito
  function toggleFavorite(reflexionId, reflexionTitle) {
    if (isFavorite(reflexionId)) {
      removeFromFavorites(reflexionId, reflexionTitle);
      return false;
    } else {
      addToFavorites(reflexionId, reflexionTitle);
      return true;
    }
  }

  // Agregar botón de favorito en reflexiones individuales
  function addFavoriteButton() {
    const path = window.location.pathname;
    
    // ✅ REGEX MEJORADO - detecta /reflexion1/, /reflexion12/, /reflexion1.html, etc.
    const match = path.match(/reflexion(\d+)/i);
    
    if (!match) {
      console.log('No es una página de reflexión individual');
      return;
    }
    
    const reflexionId = match[1];
    const reflexionTitle = document.querySelector('header h1')?.textContent || `Reflexión ${reflexionId}`;
    
    const header = document.querySelector('header');
    if (!header) {
      console.log('No se encontró header');
      return;
    }

    // Evitar duplicados
    if (document.querySelector('.favorite-btn')) return;

    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.innerHTML = isFavorite(reflexionId) ? '🌟 En favoritos' : '⭐ Agregar a favoritos';
    
    if (isFavorite(reflexionId)) {
      favoriteBtn.classList.add('is-favorite');
    }
    
    favoriteBtn.addEventListener('click', () => {
      const isFav = toggleFavorite(reflexionId, reflexionTitle);
      
      if (isFav) {
        favoriteBtn.innerHTML = '🌟 En favoritos';
        favoriteBtn.classList.add('is-favorite');
      } else {
        favoriteBtn.innerHTML = '⭐ Agregar a favoritos';
        favoriteBtn.classList.remove('is-favorite');
      }
    });

    header.after(favoriteBtn);
    console.log('✅ Botón de favorito agregado');
  }

  // Agregar enlaces de favorito en la lista de reflexiones
  function addFavoriteLinks() {
    // ✅ SOLO EN PÁGINA DE REFLEXIONES
    if (!window.location.pathname.includes('reflexiones')) return;

    const reflexionItems = document.querySelectorAll('.reflexion-item');
    
    if (reflexionItems.length === 0) {
      console.log('No se encontraron items de reflexiones');
      return;
    }
    
    reflexionItems.forEach((item, index) => {
      const reflexionId = String(index + 1);
      const link = item.querySelector('a');
      const reflexionTitle = link?.textContent?.trim() || `Reflexión ${reflexionId}`;
      
      // Evitar duplicados
      if (item.querySelector('.favorite-icon-small')) return;
      
      const favoriteIcon = document.createElement('span');
      favoriteIcon.className = 'favorite-icon-small';
      favoriteIcon.innerHTML = isFavorite(reflexionId) ? '🌟' : '⭐';
      favoriteIcon.title = isFavorite(reflexionId) ? 'Quitar de favoritos' : 'Agregar a favoritos';
      
      favoriteIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isFav = toggleFavorite(reflexionId, reflexionTitle);
        favoriteIcon.innerHTML = isFav ? '🌟' : '⭐';
        favoriteIcon.title = isFav ? 'Quitar de favoritos' : 'Agregar a favoritos';
      });
      
      item.insertBefore(favoriteIcon, item.firstChild);
    });
    
    console.log('✅ Enlaces de favorito agregados');
  }

  // Crear enlace de favoritos en el menú
  function addFavoritesLink() {
    // ✅ MEJORADO - Buscar múltiples selectores posibles
    let navContainer = document.querySelector('.nav-links') || 
                       document.querySelector('nav ul') || 
                       document.querySelector('nav');
    
    if (!navContainer || document.querySelector('.favorites-link')) {
      console.log('No se encontró nav o ya existe el link de favoritos');
      return;
    }

    const favCount = getFavorites().length;
    
    const favLink = document.createElement('a');
    favLink.href = '#favoritos';
    favLink.className = 'favorites-link nav-link';
    favLink.innerHTML = `🌟 Favoritos <span class="fav-count">${favCount}</span>`;
    
    if (favCount === 0) {
      favLink.classList.add('empty');
    }
    
    favLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Cerrar menú móvil si está abierto
      const navLinks = document.querySelector('.nav-links');
      const menuBtn = document.getElementById('mobile-menu-btn');
      if (navLinks?.classList.contains('active')) {
        navLinks.classList.remove('active');
        if(menuBtn) menuBtn.textContent = '☰';
      }

      if (favCount === 0) {
        showNotification('Aún no tienes favoritos. Explora las reflexiones.');
      } else {
        showFavoritesModal();
      }
    });
    
    // Insertar al final
    navContainer.appendChild(favLink);
    console.log('✅ Link de favoritos agregado al nav');
  }

  // Modal de favoritos
  function showFavoritesModal() {
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
      showNotification('No tienes reflexiones favoritas aún');
      return;
    }

    // Evitar múltiples modales
    const existingModal = document.querySelector('.favorites-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'favorites-modal';
    
    let favoritesHTML = `
      <div class="favorites-modal-content">
        <div class="favorites-modal-header">
          <h2>🌟 Mis Reflexiones Favoritas</h2>
          <button class="favorites-modal-close">✕</button>
        </div>
        <div class="favorites-list">
    `;
    
    const reflexionTitles = {
      '1': 'La percepción',
      '2': 'La historia',
      '3': 'Último mensaje',
      '4': 'No soy nadie',
      '5': 'Un sueño despierto',
      '6': 'Un solitario',
      '7': 'El titulo va al final',
      '8': 'Otro dia',
      '9': 'Desgaste invisible',
      '10': 'La identidad',
      '11': 'La conciencia que se basta asi misma',
      '12': 'El mundo que sueño',
      '13': '6:50',
      '14': 'El espejo y la sombra',
      '15': 'Vacío',
      '16': '¿Desea reiniciar?',
      '17': 'Egoísmo',
      '18': 'No es un buen negocio',
      '19': 'La noche y el niño',
    };
    
    favorites.forEach(id => {
      const title = reflexionTitles[id] || `Reflexión ${id}`;
      favoritesHTML += `
        <div class="favorite-item">
          <a href="/reflexion${id}/">
            <span class="favorite-number">${id}</span>
            <span class="favorite-title">${title}</span>
            <span class="favorite-arrow">→</span>
          </a>
          <button class="remove-favorite" data-id="${id}" data-title="${title}">🗑️</button>
        </div>
      `;
    });
    
    favoritesHTML += '</div></div>';
    modal.innerHTML = favoritesHTML;
    
    document.body.appendChild(modal);
    
    // Cerrar modal
    modal.querySelector('.favorites-modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Botones de eliminar
    modal.querySelectorAll('.remove-favorite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const title = btn.dataset.title;
        
        removeFromFavorites(id, title);
        modal.remove();
        
        // Actualizar contador en el nav
        updateFavoritesCount();
        
        // Reabrir si aún hay favoritos
        if (getFavorites().length > 0) {
          showFavoritesModal();
        }
      });
    });
    
    // Animación de entrada
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // ✅ NUEVA FUNCIÓN - Actualizar contador
  function updateFavoritesCount() {
    const favCount = getFavorites().length;
    const countBadge = document.querySelector('.fav-count');
    const favLink = document.querySelector('.favorites-link');
    
    if (countBadge) {
      countBadge.textContent = favCount;
    }
    
    if (favLink) {
      if (favCount === 0) {
        favLink.classList.add('empty');
      } else {
        favLink.classList.remove('empty');
      }
    }
  }

  // Mostrar notificación
  function showNotification(message) {
    // Evitar duplicados
    const existing = document.querySelector('.favorite-notification');
    if (existing) existing.remove();
    
    const notif = document.createElement('div');
    notif.className = 'favorite-notification';
    notif.textContent = message;
    
    document.body.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 10);
    
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // Estilos (sin cambios, los mismos que tenías)
  function addFavoriteStyles() {
    // Evitar duplicar estilos
    if (document.querySelector('#favoritos-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'favoritos-styles';
    style.textContent = `
      /* (Mantén todos tus estilos originales aquí) */
      .favorite-btn {
        display: block;
        margin: 1rem auto;
        background: transparent;
        color: #d4af37;
        border: 1px solid rgba(212,175,55,0.3);
        padding: 0.7rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        font-weight: 600;
      }
      /* ... (resto de tus estilos) ... */
    `;
    document.head.appendChild(style);
  }

  // Exponer funciones públicas
  window.favoritos = {
    add: addToFavorites,
    remove: removeFromFavorites,
    toggle: toggleFavorite,
    isFavorite: isFavorite,
    getAll: getFavorites,
    showModal: showFavoritesModal
  };

  // ✅ INICIALIZAR CON VERIFICACIÓN
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('🌟 Inicializando sistema de favoritos...');
    
    addFavoriteStyles();
    addFavoriteButton();
    addFavoriteLinks();
    addFavoritesLink();
    
    console.log('✅ Sistema de favoritos cargado');
    console.log('📊 Favoritos actuales:', getFavorites());
  }

})();