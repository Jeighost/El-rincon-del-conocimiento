// ========================================
// SISTEMA DE COMENTARIOS REAL - FIREBASE
// =======================================

// 🔥 IMPORTS DESDE CDN (SOLO ESTOS)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, Timestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// 🔥 CONFIGURACIÓN REAL
const firebaseConfig = {
  apiKey: "AIzaSyDKJ3TmQJgVTEzPfrP-oNyhFI6Qtcl-4m8",
  authDomain: "jeighost-comments.firebaseapp.com",
  projectId: "jeighost-comments",
  storageBucket: "jeighost-comments.firebasestorage.app",
  messagingSenderId: "940192175516",
  appId: "1:940192175516:web:d22a733acfd45bb7746459"
};

// SOLO UNA INICIALIZACIÓN
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Estado global
let currentReflectionId = null;
let unsubscribeComments = null;

// ========================================
// INICIALIZAR SISTEMA
// ========================================
function initCommentsSystem() {
  // Detectar ID de reflexión actual
  const path = window.location.pathname;
  const match = path.match(/reflexion(\d+)/i);
  
  if (!match) {
    console.log('No es una página de reflexión');
    return;
  }
  
  currentReflectionId = match[1];
  console.log('🔥 Sistema de comentarios cargado para reflexión:', currentReflectionId);
  
  // Crear interfaz de comentarios
  createCommentsUI();
  
  // Cargar comentarios en tiempo real
  loadComments();
}

// ========================================
// CREAR INTERFAZ
// ========================================
function createCommentsUI() {
  // Buscar dónde insertar los comentarios
  const footer = document.querySelector('footer');
  const reflexionSection = document.querySelector('.reflexion-completa');
  
  if (!footer && !reflexionSection) {
    console.log('No se encontró dónde insertar comentarios');
    return;
  }
  
  const commentsHTML = `
    <section class="comments-section" id="comments-section">
      <div class="comments-container">
        
        <div class="comments-header">
          <h2>💬 Comentarios</h2>
          <span class="comments-count" id="comments-count">0</span>
        </div>

        <div class="comment-form">
          <input 
            type="text" 
            id="comment-name" 
            placeholder="Tu nombre (opcional)"
            maxlength="50"
          />
          <textarea 
            id="comment-text" 
            placeholder="Comparte tu reflexión..."
            rows="4"
            maxlength="1000"
          ></textarea>
          <div class="comment-form-footer">
            <span class="char-count" id="char-count">0/1000</span>
            <button class="btn-submit-comment" id="btn-submit-comment">
              <span>Publicar</span>
            </button>
          </div>
        </div>

        <div class="comments-list" id="comments-list">
          <div class="loading-comments">
            <div class="spinner"></div>
            <p>Cargando comentarios...</p>
          </div>
        </div>

      </div>
    </section>
  `;
  
  // Insertar antes del footer
  if (footer) {
    footer.insertAdjacentHTML('beforebegin', commentsHTML);
  } else {
    reflexionSection.insertAdjacentHTML('afterend', commentsHTML);
  }
  
  // Agregar estilos
  addCommentsStyles();
  
  // Agregar event listeners
  setupEventListeners();
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
  const submitBtn = document.getElementById('btn-submit-comment');
  const commentText = document.getElementById('comment-text');
  const charCount = document.getElementById('char-count');
  
  // Botón de enviar
  submitBtn.addEventListener('click', submitComment);
  
  // Enter para enviar (Ctrl+Enter)
  commentText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      submitComment();
    }
  });
  
  // Contador de caracteres
  commentText.addEventListener('input', () => {
    const count = commentText.value.length;
    charCount.textContent = `${count}/1000`;
    
    if (count > 950) {
      charCount.style.color = '#ef4444';
    } else {
      charCount.style.color = '#d4af37';
    }
  });
}

// ========================================
// CARGAR COMENTARIOS (TIEMPO REAL)
// ========================================
function loadComments() {
  const commentsList = document.getElementById('comments-list');
  
  // Query a Firestore
  const q = query(
    collection(db, 'comments'),
    where('reflectionId', '==', currentReflectionId),
    orderBy('timestamp', 'desc')
  );
  
  // Escuchar cambios en tiempo real
  unsubscribeComments = onSnapshot(q, (snapshot) => {
    const comments = [];
    
    snapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Actualizar contador
    document.getElementById('comments-count').textContent = comments.length;
    
    // Renderizar comentarios
    renderComments(comments);
  }, (error) => {
    console.error('Error cargando comentarios:', error);
    commentsList.innerHTML = `
      <div class="error-message">
        <p>❌ Error al cargar comentarios. Por favor recarga la página.</p>
      </div>
    `;
  });
}

// ========================================
// RENDERIZAR COMENTARIOS
// ========================================
function renderComments(comments) {
  const commentsList = document.getElementById('comments-list');
  
  if (comments.length === 0) {
    commentsList.innerHTML = `
      <div class="no-comments">
        <p>💭 Sé el primero en comentar esta reflexión</p>
      </div>
    `;
    return;
  }
  
  const commentsHTML = comments.map(comment => {
    const date = comment.timestamp?.toDate();
    const timeAgo = date ? getTimeAgo(date) : 'Hace un momento';
    const name = comment.name || 'Anónimo';
    
    return `
      <div class="comment-item" data-id="${comment.id}">
        <div class="comment-avatar">
          ${getInitials(name)}
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(name)}</span>
            <span class="comment-time">${timeAgo}</span>
          </div>
          <p class="comment-text">${escapeHtml(comment.text)}</p>
        </div>
      </div>
    `;
  }).join('');
  
  commentsList.innerHTML = commentsHTML;
}

// ========================================
// ENVIAR COMENTARIO
// ========================================
async function submitComment() {
  const nameInput = document.getElementById('comment-name');
  const textInput = document.getElementById('comment-text');
  const submitBtn = document.getElementById('btn-submit-comment');
  
  const name = nameInput.value.trim() || 'Anónimo';
  const text = textInput.value.trim();
  
  // Validación
  if (!text || text.length < 3) {
    showNotification('❌ El comentario debe tener al menos 3 caracteres', 'error');
    return;
  }
  
  if (text.length > 1000) {
    showNotification('❌ El comentario es demasiado largo (máx 1000 caracteres)', 'error');
    return;
  }
  
  // Deshabilitar botón mientras se envía
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Enviando...</span>';
  
  try {
    // Guardar en Firestore
    await addDoc(collection(db, 'comments'), {
      reflectionId: currentReflectionId,
      name: name,
      text: text,
      timestamp: Timestamp.now(),
      userAgent: navigator.userAgent.substring(0, 100) // Para moderar spam
    });
    
    // Limpiar formulario
    nameInput.value = '';
    textInput.value = '';
    document.getElementById('char-count').textContent = '0/1000';
    
    // Notificación de éxito
    showNotification('✅ Comentario publicado correctamente', 'success');
    
    // Registrar en analytics
    if (window.gtag) {
      gtag('event', 'comment_posted', {
        'event_category': 'Engagement',
        'event_label': `Reflexión ${currentReflectionId}`
      });
    }
    
  } catch (error) {
    console.error('Error al publicar comentario:', error);
    showNotification('❌ Error al publicar. Intenta de nuevo.', 'error');
  } finally {
    // Rehabilitar botón
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Publicar</span>';
  }
}

// ========================================
// UTILIDADES
// ========================================
function getInitials(name) {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60
  };
  
  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `Hace ${interval} ${name}${interval > 1 ? (name === 'mes' ? 'es' : 's') : ''}`;
    }
  }
  
  return 'Hace un momento';
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.comment-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `comment-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ========================================
// ESTILOS
// ========================================
function addCommentsStyles() {
  if (document.getElementById('comments-firebase-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'comments-firebase-styles';
  style.textContent = `
    /* Sección de comentarios */
    .comments-section {
      max-width: 800px;
      margin: 3rem auto;
      padding: 2rem 1rem;
    }
    
    .comments-container {
      background: rgba(0,0,0,0.3);
      border: 2px solid rgba(212,175,55,0.3);
      border-radius: 16px;
      padding: 2rem;
    }
    
    .comments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid rgba(212,175,55,0.2);
    }
    
    .comments-header h2 {
      font-family: 'Cinzel', serif;
      color: #d4af37;
      font-size: 1.8rem;
      margin: 0;
    }
    
    .comments-count {
      background: rgba(212,175,55,0.2);
      color: #d4af37;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.9rem;
    }
    
    /* Formulario */
    .comment-form {
      margin-bottom: 2rem;
    }
    
    .comment-form input,
    .comment-form textarea {
      width: 100%;
      padding: 1rem;
      margin-bottom: 1rem;
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(212,175,55,0.3);
      border-radius: 10px;
      color: #f5e6d3;
      font-family: 'Crimson Pro', serif;
      font-size: 1rem;
      transition: all 0.3s;
    }
    
    .comment-form input:focus,
    .comment-form textarea:focus {
      outline: none;
      border-color: #d4af37;
      background: rgba(255,255,255,0.08);
    }
    
    .comment-form textarea {
      resize: vertical;
      min-height: 100px;
      line-height: 1.6;
    }
    
    .comment-form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .char-count {
      color: #d4af37;
      font-size: 0.85rem;
      opacity: 0.7;
    }
    
    .btn-submit-comment {
      background: linear-gradient(135deg, #d4af37, #ffd700);
      color: #0b0b0c;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .btn-submit-comment:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(212,175,55,0.5);
    }
    
    .btn-submit-comment:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Lista de comentarios */
    .comments-list {
      margin-top: 2rem;
    }
    
    .loading-comments,
    .no-comments,
    .error-message {
      text-align: center;
      padding: 2rem;
      color: #d4af37;
      opacity: 0.7;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 1rem;
      border: 3px solid rgba(212,175,55,0.2);
      border-top-color: #d4af37;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .comment-item {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(212,175,55,0.15);
      border-radius: 12px;
      transition: all 0.3s;
    }
    
    .comment-item:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(212,175,55,0.3);
    }
    
    .comment-avatar {
      width: 45px;
      height: 45px;
      min-width: 45px;
      background: rgba(212,175,55,0.2);
      border: 2px solid rgba(212,175,55,0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #d4af37;
      font-weight: 700;
      font-size: 0.9rem;
    }
    
    .comment-content {
      flex: 1;
      min-width: 0;
    }
    
    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .comment-author {
      color: #d4af37;
      font-weight: 600;
      font-size: 1rem;
    }
    
    .comment-time {
      color: #f5e6d3;
      opacity: 0.5;
      font-size: 0.85rem;
    }
    
    .comment-text {
      color: #f5e6d3;
      line-height: 1.7;
      word-wrap: break-word;
    }
    
    /* Notificación */
    .comment-notification {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: linear-gradient(135deg, rgba(20,20,20,0.98), rgba(30,25,20,0.98));
      padding: 1rem 2rem;
      border-radius: 12px;
      border: 2px solid rgba(212,175,55,0.5);
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      z-index: 100000;
      opacity: 0;
      transition: all 0.3s ease;
      font-weight: 600;
      max-width: 90%;
    }
    
    .comment-notification.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    
    .comment-notification.success {
      color: #86efac;
      border-color: #22c55e;
    }
    
    .comment-notification.error {
      color: #fca5a5;
      border-color: #ef4444;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .comments-container {
        padding: 1.5rem 1rem;
      }
      
      .comments-header h2 {
        font-size: 1.4rem;
      }
      
      .comment-item {
        padding: 1rem;
      }
      
      .comment-avatar {
        width: 38px;
        height: 38px;
        min-width: 38px;
        font-size: 0.8rem;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// ========================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCommentsSystem);
} else {
  initCommentsSystem();
}

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
  if (unsubscribeComments) {
    unsubscribeComments();
  }
  
  // Iniciar sistema cuando cargue
document.addEventListener('DOMContentLoaded', initCommentsSystem);
});