// ============================================
// FAVORITOS.JS - Sistema de favoritos
// ============================================

(function() {
  'use strict';

  const FAVORITES_KEY = 'reflexiones_favoritas';

  // Obtener favoritos del localStorage
  function getFavorites() {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Guardar favoritos
  function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }

  // Verificar si una reflexión está en favoritos
  function isFavorite(reflexionId) {
    const favorites = getFavorites();
    return favorites.includes(reflexionId);
  }

  // Agregar a favoritos
  function addToFavorites(reflexionId, reflexionTitle) {
    const favorites = getFavorites();
    
    if (!favorites.includes(reflexionId)) {
      favorites.push(reflexionId);
      saveFavorites(favorites);
      
      showNotification(`⭐ "${reflexionTitle}" agregada a favoritos`);
      
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
    favorites = favorites.filter(id => id !== reflexionId);
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
    const match = path.match(/reflexion(\d+)/);
    
    if (!match) return;
    
    const reflexionId = match[1];
    const reflexionTitle = document.querySelector('header h1')?.textContent || `Reflexión ${reflexionId}`;
    
    const header = document.querySelector('header');
    if (!header) return;

    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.innerHTML = isFavorite(reflexionId) ? '⭐ En favoritos' : '☆ Agregar a favoritos';
    
    if (isFavorite(reflexionId)) {
      favoriteBtn.classList.add('is-favorite');
    }
    
    favoriteBtn.addEventListener('click', () => {
      const isFav = toggleFavorite(reflexionId, reflexionTitle);
      
      if (isFav) {
        favoriteBtn.innerHTML = '⭐ En favoritos';
        favoriteBtn.classList.add('is-favorite');
      } else {
        favoriteBtn.innerHTML = '☆ Agregar a favoritos';
        favoriteBtn.classList.remove('is-favorite');
      }
    });

    // Insertar después del header
    header.after(favoriteBtn);
  }

  // Agregar enlaces de favorito en la lista de reflexiones
  function addFavoriteLinks() {
    if (!window.location.pathname.includes('reflexiones.html')) return;

    const reflexionItems = document.querySelectorAll('.reflexion-item');
    
    reflexionItems.forEach((item, index) => {
      const reflexionId = String(index + 1);
      const link = item.querySelector('.enlace-reflexion');
      const reflexionTitle = link?.textContent || `Reflexión ${reflexionId}`;
      
      const favoriteIcon = document.createElement('span');
      favoriteIcon.className = 'favorite-icon-small';
      favoriteIcon.innerHTML = isFavorite(reflexionId) ? '⭐' : '☆';
      favoriteIcon.title = isFavorite(reflexionId) ? 'Quitar de favoritos' : 'Agregar a favoritos';
      
      favoriteIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isFav = toggleFavorite(reflexionId, reflexionTitle);
        favoriteIcon.innerHTML = isFav ? '⭐' : '☆';
        favoriteIcon.title = isFav ? 'Quitar de favoritos' : 'Agregar a favoritos';
      });
      
      if (link) {
        link.parentNode.insertBefore(favoriteIcon, link);
      }
    });
  }

  // Crear página de favoritos (enlace en menú)
  function addFavoritesLink() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const favCount = getFavorites().length;
    
    // Solo agregar si hay favoritos
    if (favCount > 0) {
      const favLink = document.createElement('a');
      favLink.href = '#favoritos';
      favLink.className = 'favorites-link';
      favLink.innerHTML = `⭐ Favoritos (${favCount})`;
      
      favLink.addEventListener('click', (e) => {
        e.preventDefault();
        showFavoritesModal();
      });
      
      nav.appendChild(favLink);
    }
  }

  // Modal de favoritos
  function showFavoritesModal() {
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
      showNotification('No tienes reflexiones favoritas aún');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'favorites-modal';
    
    let favoritesHTML = '<div class="favorites-modal-content"><div class="favorites-modal-header"><h2>⭐ Mis Reflexiones Favoritas</h2><button class="favorites-modal-close">✕</button></div><div class="favorites-list">';
    
    const reflexionTitles = {
      '1': 'La percepción',
      '2': 'La historia',
      '3': 'Último mensaje',
      '4': 'No soy nadie',
      '5': 'Un sueño despierto',
      '6': 'Un solitario',
      '7': 'El titulo va al final'
    };
    
    favorites.forEach(id => {
      const title = reflexionTitles[id] || `Reflexión ${id}`;
      favoritesHTML += `
        <div class="favorite-item">
          <a href="reflexion${id}.html">
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
        showFavoritesModal(); // Reabrir con lista actualizada
      });
    });
    
    // Animación de entrada
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // Mostrar notificación
  function showNotification(message) {
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

  // Estilos
  function addFavoriteStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Botón de favorito principal */
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

      .favorite-btn:hover {
        background: rgba(212,175,55,0.1);
        border-color: #d4af37;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(212,175,55,0.3);
      }

      .favorite-btn.is-favorite {
        background: rgba(212,175,55,0.2);
        border-color: #d4af37;
      }

      /* Icono pequeño en lista */
      .favorite-icon-small {
        font-size: 1.2rem;
        cursor: pointer;
        margin-right: 0.5rem;
        transition: transform 0.3s;
        display: inline-block;
      }

      .favorite-icon-small:hover {
        transform: scale(1.3);
      }

      /* Link de favoritos en menú */
      .favorites-link {
        color: #d4af37 !important;
        background: rgba(212,175,55,0.1);
        padding: 0.4rem 0.8rem !important;
        border-radius: 20px;
        font-size: 0.85rem !important;
      }

      /* Modal de favoritos */
      .favorites-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .favorites-modal.show {
        opacity: 1;
      }

      .favorites-modal-content {
        background: rgba(20,20,20,0.98);
        border: 1px solid rgba(212,175,55,0.3);
        border-radius: 16px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }

      .favorites-modal.show .favorites-modal-content {
        transform: scale(1);
      }

      .favorites-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid rgba(212,175,55,0.2);
      }

      .favorites-modal-header h2 {
        color: #d4af37;
        margin: 0;
        font-size: 1.5rem;
      }

      .favorites-modal-close {
        background: transparent;
        border: none;
        color: #888;
        font-size: 1.5rem;
        cursor: pointer;
        transition: color 0.3s;
      }

      .favorites-modal-close:hover {
        color: #d4af37;
      }

      .favorites-list {
        padding: 1rem;
      }

      .favorite-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: rgba(255,255,255,0.03);
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.1);
        transition: all 0.3s ease;
      }

      .favorite-item:hover {
        background: rgba(255,255,255,0.05);
        border-color: rgba(212,175,55,0.3);
        transform: translateX(5px);
      }

      .favorite-item a {
        display: flex;
        align-items: center;
        gap: 1rem;
        text-decoration: none;
        color: #ddd;
        flex: 1;
      }

      .favorite-number {
        background: rgba(212,175,55,0.2);
        color: #d4af37;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-family: 'Cinzel', serif;
      }

      .favorite-title {
        flex: 1;
        color: #d4af37;
        font-weight: 600;
      }

      .favorite-arrow {
        color: #888;
        font-size: 1.2rem;
      }

      .remove-favorite {
        background: transparent;
        border: 1px solid rgba(255,100,100,0.3);
        color: #ff6b6b;
        padding: 0.4rem 0.6rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s;
      }

      .remove-favorite:hover {
        background: rgba(255,100,100,0.2);
        border-color: #ff6b6b;
      }

      /* Notificación */
      .favorite-notification {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: rgba(20,20,20,0.98);
        color: #d4af37;
        padding: 1rem 2rem;
        border-radius: 8px;
        border: 1px solid rgba(212,175,55,0.3);
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        z-index: 10001;
        opacity: 0;
        transition: all 0.3s ease;
      }

      .favorite-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      @media (max-width: 768px) {
        .favorites-modal-content {
          width: 95%;
          max-height: 85vh;
        }

        .favorite-item a {
          gap: 0.7rem;
        }

        .favorite-title {
          font-size: 0.9rem;
        }
      }
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

  // Inicializar
  document.addEventListener('DOMContentLoaded', () => {
    addFavoriteStyles();
    addFavoriteButton();
    addFavoriteLinks();
    addFavoritesLink();
    
    console.log('⭐ Sistema de favoritos cargado');
  });

})();