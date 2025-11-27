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
/* ========================================
       BOTÓN DE FAVORITO EN REFLEXIONES
    ======================================== */
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

    /* ========================================
       ICONO PEQUEÑO EN LISTA DE REFLEXIONES
    ======================================== */
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

    /* ========================================
       LINK DE FAVORITOS EN NAV
    ======================================== */
    .favorites-link {
      position: relative;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 14px;
      background: rgba(212,175,55,0.15);
      border: 2px solid rgba(212,175,55,0.4);
      border-radius: 25px;
      color: #d4af37 !important;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
      font-size: 0.95rem;
      margin-right: 15px;
    }

    .favorites-link:hover {
      background: rgba(212,175,55,0.3);
      border-color: #d4af37;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(212,175,55,0.4);
    }

    .favorites-link .fav-icon {
      font-size: 1.3rem;
      line-height: 1;
    }

    .favorites-link .fav-count {
      min-width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(212,175,55,0.3);
      border-radius: 50%;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0 6px;
      color: #ffd700;
    }

    .favorites-link.empty {
      opacity: 0.6;
    }

    /* ========================================
       MODAL FLOTANTE (LA BURBUJA)
    ======================================== */
    .favorites-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      padding: 20px;
    }

    .favorites-modal.show {
      opacity: 1;
    }

    /* ========================================
       CONTENEDOR DEL MODAL (LA BURBUJA)
    ======================================== */
    .favorites-modal-content {
      background: linear-gradient(135deg, rgba(20,20,20,0.98), rgba(30,25,20,0.98));
      border: 2px solid rgba(212,175,55,0.5);
      border-radius: 20px;
      max-width: 650px;
      width: 100%;
      max-height: 85vh;
      overflow: hidden;
      box-shadow: 
        0 25px 80px rgba(0,0,0,0.8),
        0 0 40px rgba(212,175,55,0.3),
        inset 0 1px 1px rgba(255,255,255,0.1);
      transform: scale(0.9) translateY(20px);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .favorites-modal.show .favorites-modal-content {
      transform: scale(1) translateY(0);
    }

    /* ========================================
       HEADER DEL MODAL
    ======================================== */
    .favorites-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 2px solid rgba(212,175,55,0.3);
      background: rgba(0,0,0,0.3);
      flex-shrink: 0;
    }

    .favorites-modal-header h2 {
      color: #d4af37;
      margin: 0;
      font-size: 1.6rem;
      font-family: 'Cinzel', serif;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .favorites-modal-close {
      background: transparent;
      border: 2px solid rgba(212,175,55,0.3);
      color: #d4af37;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .favorites-modal-close:hover {
      background: rgba(212,175,55,0.2);
      border-color: #d4af37;
      transform: rotate(90deg);
    }

    /* ========================================
       LISTA DE FAVORITOS (SCROLLABLE)
    ======================================== */
    .favorites-list {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    /* Personalizar scrollbar */
    .favorites-list::-webkit-scrollbar {
      width: 8px;
    }

    .favorites-list::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.3);
      border-radius: 10px;
    }

    .favorites-list::-webkit-scrollbar-thumb {
      background: rgba(212,175,55,0.5);
      border-radius: 10px;
    }

    .favorites-list::-webkit-scrollbar-thumb:hover {
      background: rgba(212,175,55,0.7);
    }

    /* ========================================
       ITEMS DE FAVORITOS
    ======================================== */
    .favorite-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.2rem;
      margin-bottom: 0.8rem;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      border: 1px solid rgba(212,175,55,0.15);
      transition: all 0.3s ease;
      gap: 15px;
    }

    .favorite-item:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(212,175,55,0.4);
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(212,175,55,0.2);
    }

    .favorite-item a {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: #ddd;
      flex: 1;
      min-width: 0;
    }

    .favorite-number {
      background: rgba(212,175,55,0.25);
      color: #d4af37;
      min-width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      flex-shrink: 0;
      border: 1px solid rgba(212,175,55,0.3);
    }

    .favorite-title {
      flex: 1;
      color: #f5e6d3;
      font-weight: 600;
      font-size: 1.05rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .favorite-arrow {
      color: #d4af37;
      font-size: 1.3rem;
      opacity: 0.6;
      transition: all 0.3s;
      flex-shrink: 0;
    }

    .favorite-item:hover .favorite-arrow {
      opacity: 1;
      transform: translateX(5px);
    }

    /* ========================================
       BOTÓN DE ELIMINAR
    ======================================== */
    .remove-favorite {
      background: rgba(255,100,100,0.1);
      border: 2px solid rgba(255,100,100,0.3);
      color: #ff6b6b;
      padding: 0.5rem 0.7rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.3s;
      flex-shrink: 0;
    }

    .remove-favorite:hover {
      background: rgba(255,100,100,0.25);
      border-color: #ff6b6b;
      transform: scale(1.1);
    }

    /* ========================================
       NOTIFICACIÓN FLOTANTE
    ======================================== */
    .favorite-notification {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: linear-gradient(135deg, rgba(20,20,20,0.98), rgba(30,25,20,0.98));
      color: #d4af37;
      padding: 1rem 2rem;
      border-radius: 12px;
      border: 2px solid rgba(212,175,55,0.5);
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      z-index: 100000;
      opacity: 0;
      transition: all 0.3s ease;
      font-weight: 600;
      font-size: 0.95rem;
      max-width: 90%;
    }

    .favorite-notification.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ========================================
       RESPONSIVE
    ======================================== */
    @media (max-width: 768px) {
      .favorites-modal-content {
        max-width: 95%;
        max-height: 90vh;
        border-radius: 16px;
      }

      .favorites-modal-header {
        padding: 1rem 1.5rem;
      }

      .favorites-modal-header h2 {
        font-size: 1.3rem;
      }

      .favorites-list {
        padding: 1rem;
      }

      .favorite-item {
        padding: 0.8rem 1rem;
      }

      .favorite-item a {
        gap: 0.7rem;
      }

      .favorite-number {
        min-width: 35px;
        height: 35px;
        font-size: 0.9rem;
      }

      .favorite-title {
        font-size: 0.95rem;
      }

      .favorites-link {
        padding: 6px 12px;
        margin-right: 10px;
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