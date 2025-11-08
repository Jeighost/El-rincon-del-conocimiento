// ============================================
// FEATURES.JS - Sistema completo de funcionalidades
// ============================================

(function() {
  'use strict';

  // ==========================================
  // 1. BARRA DE PROGRESO DE LECTURA
  // ==========================================
  function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.pageYOffset;
      const progress = (scrolled / documentHeight) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
  }

  // ==========================================
  // 2. CONTADOR DE REFLEXIONES
  // ==========================================
  function addStatsBar() {
    if (!window.location.pathname.includes('index') && window.location.pathname !== '/') return;

    const header = document.querySelector('header');
    if (!header) return;

    const statsBar = document.createElement('div');
    statsBar.className = 'stats-bar';
    statsBar.innerHTML = `
      <div class="stat-item"><span class="stat-number">12</span><span class="stat-label">Reflexiones</span></div>
      <div class="stat-item"><span class="stat-number">8</span><span class="stat-label">Temas</span></div>
      <div class="stat-item"><span class="stat-number" id="view-count">-</span><span class="stat-label">Visitas</span></div>
    `;
    header.after(statsBar);

    const visits = parseInt(localStorage.getItem('counter_visits') || '0');
    document.getElementById('view-count').textContent = visits > 0 ? visits : '🔥';
  }

  // ==========================================
  // 3. BREADCRUMB (Migas de pan)
  // ==========================================
  function addBreadcrumb() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const path = window.location.pathname;
    if (path.includes('index') || path === '/') return;

    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'breadcrumb';

    let html = '<a href="index.html">🏠 Inicio</a>';
    if (path.includes('galeria')) {
      html += '<span class="breadcrumb-separator">›</span><span>Galería</span>';
    } else if (path.includes('reflexiones')) {
      html += '<span class="breadcrumb-separator">›</span><span>Reflexiones</span>';
    } else if (path.match(/reflexion\d+/)) {
      const num = path.match(/reflexion(\d+)/)?.[1];
      html += '<span class="breadcrumb-separator">›</span><a href="reflexiones.html">Reflexiones</a>';
      html += `<span class="breadcrumb-separator">›</span><span>Reflexión ${num}</span>`;
    }

    breadcrumb.innerHTML = html;
    nav.after(breadcrumb);
  }

  // ==========================================
  // 4. TIEMPO DE LECTURA
  // ==========================================
  function addReadingTime() {
    const content = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!content) return;

    const words = content.textContent.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);

    const timeElement = document.createElement('div');
    timeElement.className = 'reading-time';
    timeElement.textContent = `${readingTime} min de lectura`;

    const header = document.querySelector('header');
    if (header) header.after(timeElement);
  }

  // ==========================================
  // 5. BOTONES DE COMPARTIR
  // ==========================================
  function addSocialShare() {
    const reflexionContent = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!reflexionContent) return;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'social-share';
    shareContainer.innerHTML = `
      <button class="social-btn" onclick="window.features.share('twitter')" title="Compartir en Twitter">🐦</button>
      <button class="social-btn" onclick="window.features.share('whatsapp')" title="Compartir en WhatsApp">💬</button>
      <button class="social-btn" onclick="window.features.share('facebook')" title="Compartir en Facebook">📘</button>
      <button class="social-btn" onclick="window.features.share('copy')" title="Copiar enlace">🔗</button>
    `;

    const mensajeFinal = document.querySelector('.mensaje-final');
    (mensajeFinal || reflexionContent).before(shareContainer);
  }

  function shareContent(platform) {
    const url = window.location.href;
    const title = document.title;
    const text = `Leyendo: ${title}`;

    switch(platform) {
      case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`); break;
      case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`); break;
      case 'copy': navigator.clipboard.writeText(url).then(() => showNotification('✅ Enlace copiado al portapapeles')); break;
    }
  }

  // ==========================================
  // 6. NAVEGACIÓN FLOTANTE
  // ==========================================
  function addFloatingNav() {
    const match = window.location.pathname.match(/reflexion(\d+)/);
    if (!match) return;

    const current = parseInt(match[1]);
    const total = 12;
    const floatingNav = document.createElement('div');
    floatingNav.className = 'floating-nav';

    floatingNav.innerHTML = `
      ${current > 1 ? `<button onclick="location.href='reflexion${current - 1}.html'" title="Anterior">↩</button>` : ''}
      <button onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Arriba">⬆</button>
      ${current < total ? `<button onclick="location.href='reflexion${current + 1}.html'" title="Siguiente">↪</button>` : ''}
    `;
    document.body.appendChild(floatingNav);
  }

  // ==========================================
  // 7. FRASE ROTATIVA
  // ==========================================
  function addRotatingQuote() {
    if (!window.location.pathname.includes('index') && window.location.pathname !== '/') return;

    const quotes = [
      "El conocimiento es el único tesoro que nadie puede quitarte",
      "La reflexión es el puente entre la ignorancia y la sabiduría",
      "Cada pensamiento crítico es un paso hacia la verdad",
      "La percepción moldea nuestra realidad",
      "Pensar por uno mismo es el acto más revolucionario",
      "Tu sonrisa hace magia con mi mente",
      "Estaba perdido pero tu sonrisa fue mi guía",
      "Sé lo que valgo, y valgo mucho",
      "Deseo que todos pudieran ser felices"
    ];

    const quoteElement = document.createElement('div');
    quoteElement.className = 'frase-rotativa';
    quoteElement.textContent = quotes[0];
    const intro = document.querySelector('.intro');
    if (intro) intro.before(quoteElement);

    let i = 0;
    setInterval(() => {
      i = (i + 1) % quotes.length;
      quoteElement.style.opacity = '0';
      setTimeout(() => {
        quoteElement.textContent = quotes[i];
        quoteElement.style.opacity = '1';
      }, 400);
    }, 8000);
  }

  // ==========================================
  // 8. MODO LECTURA SUGERIDO
  // ==========================================
  function addReadingModeSuggestion() {
    const suggestion = document.createElement('div');
    suggestion.className = 'reading-mode-suggestion';
    suggestion.innerHTML = '💡 Modo lectura activado';
    suggestion.style.display = 'none';
    document.body.appendChild(suggestion);

    let shown = false;
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500 && !shown) {
        shown = true;
        suggestion.style.display = 'block';
        setTimeout(() => suggestion.style.display = 'none', 3000);
      }
    });
  }

  // ==========================================
  // 9. ÍNDICE DE CONTENIDOS
  // ==========================================
  function addTableOfContents() {
    const content = document.querySelector('.texto-reflexion');
    if (!content || window.innerWidth < 1400) return;

    const headers = content.querySelectorAll('b, strong');
    if (headers.length < 2) return;

    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h3>En esta reflexión</h3><ul></ul>';
    const ul = toc.querySelector('ul');

    headers.forEach((h, i) => {
      const id = `section-${i}`;
      h.id = id;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = h.textContent.substring(0, 30) + '...';
      a.addEventListener('click', e => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.appendChild(a);
      ul.appendChild(li);
    });

    document.body.appendChild(toc);
  }

  // ==========================================
  // UTILIDAD DE NOTIFICACIÓN
  // ==========================================
  function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'notif';
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
  }

  // ==========================================
  // EXPONER Y EJECUTAR
  // ==========================================
  window.features = { share: shareContent };

  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Iniciando funcionalidades...');
    initReadingProgress();
    addStatsBar();
    addBreadcrumb();
    addReadingTime();
    addSocialShare();
    addFloatingNav();
    addRotatingQuote();
    addReadingModeSuggestion();
    addTableOfContents();
    console.log('✅ Funcionalidades cargadas');
  });
})();