// ============================================
// FEATURES.JS - Sistema completo de funcionalidades (optimizado)
// ============================================
(function () {
  'use strict';

  // Guard contra dobles inyecciones
  if (window.__featuresInit) return;
  window.__featuresInit = true;

  // ==========================================
  // 1. BARRA DE PROGRESO DE LECTURA
  // ==========================================
  function initReadingProgress() {
    if (document.querySelector('.reading-progress')) return;

    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    let docHeight = 1;
    let ticking = false;

    const computeDocHeight = () => {
      const winH = window.innerHeight;
      const fullH = document.documentElement.scrollHeight;
      docHeight = Math.max(1, fullH - winH);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.pageYOffset || document.documentElement.scrollTop || 0;
        const progress = Math.min(100, Math.max(0, (y / docHeight) * 100));
        progressBar.style.width = `${progress}%`;
        ticking = false;
      });
    };

    // Recalcular en resize y tras cargas diferidas (imágenes)
    const onResize = () => {
      computeDocHeight();
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // Recalcular cuando cargan imágenes
    window.addEventListener('load', onResize);

    computeDocHeight();
    onScroll();
  }

  // ===================================
  // 3. BREADCRUMB (Migas de pan)
  // ==========================================
  function addBreadcrumb() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const path = location.pathname;
    const isHome = path.endsWith('index.html') || path === '/';
    if (isHome) return;
    if (document.querySelector('.breadcrumb')) return;

    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'breadcrumb';

    let html = '<a href="index.html">🏠 Inicio</a>';
    if (/galeria/i.test(path)) {
      html += '<span class="breadcrumb-separator">›</span><span>Galería</span>';
    } else if (/reflexiones(\.html)?$/i.test(path)) {
      html += '<span class="breadcrumb-separator">›</span><span>Reflexiones</span>';
    } else if (/reflexion\d+\.html$/i.test(path)) {
      const num = path.match(/reflexion(\d+)/i)?.[1];
      html += '<span class="breadcrumb-separator">›</span><a href="reflexiones.html">Reflexiones</a>';
      html += `<span class="breadcrumb-separator">›</span><span>Reflexión ${num}</span>`;
    } else if (/sobre-mi/i.test(path)) {
      html += '<span class="breadcrumb-separator">›</span><span>Sobre mí</span>';
    }

    breadcrumb.innerHTML = html;
    nav.after(breadcrumb);
  }

  // ==========================================
  // 4. TIEMPO DE LECTURA
  // ==========================================
  function addReadingTime() {
    if (document.querySelector('.reading-time')) return;

    const content = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!content) return;

    const words = content.textContent.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);

    const timeElement = document.createElement('div');
    timeElement.className = 'reading-time';
    timeElement.textContent = `${readingTime} min de lectura`;

    const header = document.querySelector('header');
    (header || document.body).after
      ? header.after(timeElement)
      : document.body.appendChild(timeElement);
  }

  // ==========================================
  // 5. BOTONES DE COMPARTIR
  // ==========================================
  function addSocialShare() {
    if (document.querySelector('.social-share')) return;

    const reflexionContent = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!reflexionContent) return;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'social-share';
    shareContainer.innerHTML = `
      <button class="social-btn" data-platform="twitter" title="Compartir en Twitter">🐦</button>
      <button class="social-btn" data-platform="whatsapp" title="Compartir en WhatsApp">💬</button>
      <button class="social-btn" data-platform="facebook" title="Compartir en Facebook">📘</button>
      <button class="social-btn" data-platform="copy" title="Copiar enlace">🔗</button>
    `;

    const mensajeFinal = document.querySelector('.mensaje-final');
    (mensajeFinal || reflexionContent).before(shareContainer);

    // Delegación de eventos
    shareContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.social-btn');
      if (!btn) return;
      shareContent(btn.dataset.platform);
    });
  }

  function shareContent(platform) {
    const url = location.href;
    const title = document.title;
    const text = `Leyendo: ${title}`;

    // Web Share API
    if (navigator.share && (platform === 'copy' || platform === 'whatsapp')) {
      navigator
        .share({ title, text, url })
        .catch(() => {
          // si el usuario cancela, no pasa nada
        });
      return;
    }

    // Fallback
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => showNotification('✅ Enlace copiado'));
          } else {
            // fallback de copia
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            showNotification('✅ Enlace copiado');
          }
        } catch {
          showNotification('❌ No se pudo copiar el enlace');
        }
        break;
    }
  }

  // ==========================================
  // 6. NAVEGACIÓN FLOTANTE
  // ==========================================
  function addFloatingNav() {
    if (document.querySelector('.floating-nav')) return;

    const match = location.pathname.match(/reflexion(\d+)\.html/i);
    if (!match) return;

    const current = parseInt(match[1], 10);
    const total = 16;
    const floatingNav = document.createElement('div');
    floatingNav.className = 'floating-nav';
    floatingNav.innerHTML = `
      ${current > 1 ? `<button data-go="${current - 1}" title="Anterior">↩</button>` : ''}
      <button data-top="1" title="Arriba">⬆</button>
      ${current < total ? `<button data-go="${current + 1}" title="Siguiente">↪</button>` : ''}
    `;
    document.body.appendChild(floatingNav);

    // Delegación
    floatingNav.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.top) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (btn.dataset.go) {
        location.href = `reflexion${btn.dataset.go}.html`;
      }
    });
  }

  // ==========================================
  // 7. FRASE ROTATIVA
  // ==========================================
  function addRotatingQuote() {
    const isHome = location.pathname.endsWith('index.html') || location.pathname === '/';
    if (!isHome) return;
    if (document.querySelector('.frase-rotativa')) return;

    const quotes = [
      'El conocimiento es el único tesoro que nadie puede quitarte',
      'La reflexión es el puente entre la ignorancia y la sabiduría',
      'Cada pensamiento crítico es un paso hacia la verdad',
      'La percepción moldea nuestra realidad',
      'Pensar por uno mismo es el acto más revolucionario',
      'Tu sonrisa hace magia con mi mente',
      'Estaba perdido pero tu sonrisa fue mi guía',
      'Sé lo que valgo, y valgo mucho',
      'Deseo que todos pudieran ser felices',
      'No voy a llegar al cielo'
    ];

    const quoteElement = document.createElement('div');
    quoteElement.className = 'frase-rotativa';
    quoteElement.textContent = quotes[0];

    const intro = document.querySelector('.intro');
    (intro || document.body).before
      ? intro.before(quoteElement)
      : document.body.insertBefore(quoteElement, document.body.firstChild);

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
  // 9. ÍNDICE DE CONTENIDOS
  // ==========================================
  function addTableOfContents() {
    if (document.querySelector('.table-of-contents')) return;

    const content = document.querySelector('.texto-reflexion');
    if (!content || window.innerWidth < 1400) return;

    const headers = content.querySelectorAll('b, strong');
    if (headers.length < 2) return;

    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h3>En esta reflexión</h3><ul></ul>';
    const ul = toc.querySelector('ul');

    headers.forEach((h, i) => {
      const id = h.id || `section-${i}`;
      h.id = id;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = (h.textContent || '').trim().slice(0, 30) + (h.textContent.length > 30 ? '…' : '');
      a.addEventListener('click', (e) => {
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