// ============================================
// COMMENTS.JS - Sistema de comentarios Utterances
// ============================================

(function() {
  'use strict';

  function initComments() {
    const path = window.location.pathname;
    
    // Solo en páginas de reflexión
    if (!path.includes('reflexion')) return;

    const content = document.querySelector('.texto-reflexion, .contenido-reflexion, article, main');
    if (!content) return;

    // Crear sección de comentarios
    const commentsSection = document.createElement('section');
    commentsSection.className = 'comments-section';
    commentsSection.innerHTML = `
      <h3 class="comments-title">💬 Comparte tu reflexión</h3>
      <p class="comments-subtitle">Inicia sesión con GitHub para comentar y dialogar con otros lectores</p>
      <div id="comments-container"></div>
    `;

    // Insertar después del contenido
    const mensajeFinal = document.querySelector('.mensaje-final');
    const socialShare = document.querySelector('.social-share');
    
    if (mensajeFinal) {
      mensajeFinal.after(commentsSection);
    } else if (socialShare) {
      socialShare.after(commentsSection);
    } else {
      content.after(commentsSection);
    }

    // Cargar Utterances
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'jeighost/El-rincon-del-conocimiento'); // ← TU REPOSITORIO
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', document.body.getAttribute('data-theme') === 'light' ? 'github-light' : 'github-dark');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    document.getElementById('comments-container').appendChild(script);

    // Cambiar tema de comentarios cuando se cambia el tema de la página
    window.addEventListener('themeChanged', () => {
      const iframe = document.querySelector('.utterances-frame');
      if (iframe) {
        const theme = document.body.getAttribute('data-theme') === 'light' ? 'github-light' : 'github-dark';
        iframe.contentWindow.postMessage(
          { type: 'set-theme', theme: theme },
          'https://utteranc.es'
        );
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initComments);
})();