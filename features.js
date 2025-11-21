// ============================================
// FEATURES.JS - Sistema completo de funcionalidades (optimizado)
// ============================================
(function () {
  'use strict';

  if (window.__featuresInit) return;
  window.__featuresInit = true;

  // ==========================================
  // 1. BARRA DE PROGRESO
  // ==========================================
  function initReadingProgress() {
    if (document.querySelector('.reading-progress')) return;

    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    document.body.appendChild(bar);

    let docHeight = 1;
    let ticking = false;

    const compute = () => {
      const winH = window.innerHeight;
      const fullH = document.documentElement.scrollHeight;
      docHeight = Math.max(1, fullH - winH);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const y = window.pageYOffset || 0;
        const progress = Math.min(100, Math.max(0, (y / docHeight) * 100));
        bar.style.width = `${progress}%`;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);
    window.addEventListener('load', compute);

    compute();
    onScroll();
  }

  // ===================================
  // 2. BREADCRUMB - RUTAS CORREGIDAS
  // ==========================================
  function addBreadcrumb() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const path = location.pathname;

    const isHome =
      path.endsWith("index.html") ||
      path === "/" ||
      path === "/index.html";

    if (isHome) return;
    if (document.querySelector(".breadcrumb")) return;

    const crumbs = document.createElement("div");
    crumbs.className = "breadcrumb";

    let html = `<a href="../index.html">🏠 Inicio</a>`;

    if (/galeria/.test(path)) {
      html += ' › <span>Galería</span>';
    } 
    else if (/reflexiones/.test(path)) {
      html += ' › <span>Reflexiones</span>';
    }
    else if (/reflexion\d+\//.test(path)) {
      const num = path.match(/reflexion(\d+)\//)?.[1];
      html += ' › <a href="../reflexiones/index.html">Reflexiones</a>';
      html += ` › <span>Reflexión ${num}</span>`;
    }
    else if (/sobre-mi/.test(path)) {
      html += ' › <span>Sobre mí</span>';
    }

    crumbs.innerHTML = html;
    nav.after(crumbs);
  }

  // ==========================================
  // 3. TIEMPO DE LECTURA
  // ==========================================
  function addReadingTime() {
    if (document.querySelector('.reading-time')) return;

    const content = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!content) return;

    const words = content.textContent.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);

    const block = document.createElement('div');
    block.className = 'reading-time';
    block.textContent = `${minutes} min de lectura`;

    const header = document.querySelector('header');
    if (header) header.after(block);
  }

  // ==========================================
  // 4. COMPARTIR
  // ==========================================
  function addSocialShare() {
    if (document.querySelector('.social-share')) return;

    const ref = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!ref) return;

    const box = document.createElement('div');
    box.className = 'social-share';

    box.innerHTML = `
      <button class="social-btn" data-platform="twitter">🐦</button>
      <button class="social-btn" data-platform="whatsapp">💬</button>
      <button class="social-btn" data-platform="facebook">📘</button>
      <button class="social-btn" data-platform="copy">🔗</button>
    `;

    ref.before(box);

    box.addEventListener('click', (e) => {
      const btn = e.target.closest('.social-btn');
      if (!btn) return;
      shareContent(btn.dataset.platform);
    });
  }

  function shareContent(platform) {
    const url = location.href;
    const title = document.title;
    const text = `Leyendo: ${title}`;

    if (navigator.share && (platform === "copy" || platform === "whatsapp")) {
      navigator.share({ title, text, url }).catch(() => {});
      return;
    }

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        break;
    }
  }

  // ==========================================
  // 5. NAVEGACIÓN FLOTANTE - RUTAS CORREGIDAS
  // ==========================================
  function addFloatingNav() {
    if (document.querySelector('.floating-nav')) return;

    const match = location.pathname.match(/reflexion(\d+)\//);
    if (!match) return;

    const id = parseInt(match[1]);
    const total = 17;

    const nav = document.createElement('div');
    nav.className = 'floating-nav';

    nav.innerHTML = `
      ${id > 1 ? `<button data-go="${id - 1}" title="Anterior">↩</button>` : ""}
      <button data-top="1" title="Arriba">⬆</button>
      ${id < total ? `<button data-go="${id + 1}" title="Siguiente">↪</button>` : ""}
    `;

    document.body.appendChild(nav);

    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      if (btn.dataset.top) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (btn.dataset.go) {
        location.href = `../reflexion${btn.dataset.go}/`;
      }
    });
  }

  // ==========================================
  // 6. FRASE ROTATIVA
  // ==========================================
  function addRotatingQuote() {
    const home =
      location.pathname.endsWith("index.html") ||
      location.pathname === "/" ||
      location.pathname === "/index.html";

    if (!home) return;
    if (document.querySelector(".frase-rotativa")) return;

    const frases = [
      'El conocimiento es el único tesoro que nadie puede quitarte',
      'La reflexión es el puente entre la ignorancia y la sabiduría',
      'Cada pensamiento crítico es un paso hacia la verdad',
      'La percepción moldea nuestra realidad',
      'Pensar por uno mismo es el acto más revolucionario',
      'Deseo que todos pudieran ser felices'
    ];

    const el = document.createElement("div");
    el.className = "frase-rotativa";
    el.textContent = frases[0];

    const intro = document.querySelector(".intro-text");
    intro.before(el);

    let i = 0;
    setInterval(() => {
      i = (i + 1) % frases.length;
      el.style.opacity = "0";
      setTimeout(() => {
        el.textContent = frases[i];
        el.style.opacity = "1";
      }, 400);
    }, 8000);
  }

  // ==========================================
  // 7. ÍNDICE DE CONTENIDOS
  // ==========================================
  function addTableOfContents() {
    if (document.querySelector('.table-of-contents')) return;

    const content = document.querySelector('.texto-reflexion');
    if (!content) return;
    if (window.innerWidth < 1400) return;

    const headers = content.querySelectorAll('b, strong');
    if (headers.length < 2) return;

    const toc = document.createElement("div");
    toc.className = "table-of-contents";
    toc.innerHTML = "<h3>En esta reflexión</h3><ul></ul>";
    const ul = toc.querySelector("ul");

    headers.forEach((h, i) => {
      const id = h.id || `section-${i}`;
      h.id = id;

      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = `#${id}`;
      a.textContent =
        h.textContent.trim().slice(0, 25) +
        (h.textContent.length > 25 ? "…" : "");

      a.addEventListener("click", (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: "smooth" });
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    document.body.appendChild(toc);
  }

  // ==========================================
  // BOOT
  // ==========================================
  document.addEventListener("DOMContentLoaded", () => {
    initReadingProgress();
    addBreadcrumb();
    addReadingTime();
    addSocialShare();
    addFloatingNav();
    addRotatingQuote();
    addTableOfContents();
  });
})();