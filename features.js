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
    // Solo en página principal
    if (!window.location.pathname.includes('index.html') && 
        window.location.pathname !== '/' && 
        !window.location.pathname.endsWith('/El-rincon-del-conocimiento/')) return;

    const header = document.querySelector('header');
    if (!header) return;

    const statsBar = document.createElement('div');
    statsBar.className = 'stats-bar';
    statsBar.innerHTML = `
      <div class="stat-item">
        <span class="stat-number">11</span>
        <span class="stat-label">Reflexiones</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">8</span>
        <span class="stat-label">Temas</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" id="view-count">-</span>
        <span class="stat-label">Visitas</span>
      </div>
    `;

    header.after(statsBar);

    // Actualizar contador de visitas (local)
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
    
    // NO mostrar breadcrumb en la página principal
    if (path.includes('index.html') || 
        path === '/' || 
        path.endsWith('/El-rincon-del-conocimiento/') ||
        path.endsWith('/El-rincon-del-conocimiento')) return;

    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'breadcrumb';

    let breadcrumbHTML = '<a href="index.html">🏠 Inicio</a>';

    if (path.includes('galeria')) {
      breadcrumbHTML += '<span class="breadcrumb-separator">›</span><span>Galería</span>';
    } else if (path.includes('reflexiones.html')) {
      breadcrumbHTML += '<span class="breadcrumb-separator">›</span><span>Reflexiones</span>';
    } else if (path.includes('reflexion')) {
      const num = path.match(/reflexion(\d+)/)?.[1];
      breadcrumbHTML += '<span class="breadcrumb-separator">›</span><a href="reflexiones.html">Reflexiones</a>';
      breadcrumbHTML += `<span class="breadcrumb-separator">›</span><span>Reflexión ${num}</span>`;
    }

    breadcrumb.innerHTML = breadcrumbHTML;
    nav.after(breadcrumb);
  }

  // ==========================================
  // 4. TIEMPO DE LECTURA
  // ==========================================
  
  function addReadingTime() {
    const content = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!content) return;

    const text = content.textContent;
    const words = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // 200 palabras por minuto

    const timeElement = document.createElement('div');
    timeElement.className = 'reading-time';
    timeElement.textContent = `${readingTime} min de lectura`;

    const header = document.querySelector('header');
    if (header) {
      header.after(timeElement);
    }
  }

  // ==========================================
  // 5. TAGS/ETIQUETAS
  // ==========================================
  
  function addTags() {
    const reflexionContent = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!reflexionContent) return;

    const path = window.location.pathname;
    let tags = [];

    // Asignar tags según reflexión
    if (path.includes('reflexion1')) {
      tags = ['Percepción', 'Conciencia', 'Conocimiento'];
    } else if (path.includes('reflexion2')) {
      tags = ['Futuro', 'Humanidad', 'Cambio'];
    } else if (path.includes('reflexion3')) {
      tags = ['Memoria', 'Relaciones', 'Identidad'];
    } else if (path.includes('reflexion4')) {
      tags = ['Individualidad', 'Reconocimiento', 'Propósito'];
    } else if (path.includes('reflexion5')) {
      tags = ['Sueños', 'Futuro', 'Responsabilidad'];
    } else if (path.includes('reflexion6')) {
      tags = ['Soledad', 'Existencia', 'Conciencia'];
    } else if (path.includes('reflexion7')) {
      tags = ['Vida', 'Muerte', 'Decisiones'];
    }else if (path.includes('reflexion8')) {
      tags = ['Universo', 'Amor', 'Enamoramiento'];
    }else if (path.includes('reflexion9')) {
      tags = ['Salud', 'Bienestar', 'Cambio'];
    }else if (path.includes('reflexion10')) {
      tags = ['Dualidad', 'Cambio', 'Verdad'];
    }else if (path.includes('reflexion11')) { tags = ['Conciencia', 'Infinito', 'Plenitud'];
    }

    if (tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'tags';
      tagsContainer.innerHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
      
      const header = document.querySelector('header');
      if (header) {
        header.after(tagsContainer);
      }
    }
  }

  // ==========================================
  // 6. BOTONES DE COMPARTIR
  // ==========================================
  
  function addSocialShare() {
    const reflexionContent = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!reflexionContent) return;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'social-share';
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    shareContainer.innerHTML = `
      <button class="social-btn" onclick="window.features.share('twitter')" title="Compartir en Twitter">
        🐦
      </button>
      <button class="social-btn" onclick="window.features.share('whatsapp')" title="Compartir en WhatsApp">
        💬
      </button>
      <button class="social-btn" onclick="window.features.share('facebook')" title="Compartir en Facebook">
        📘
      </button>
      <button class="social-btn" onclick="window.features.share('copy')" title="Copiar enlace">
        🔗
      </button>
    `;

    const mensajeFinal = document.querySelector('.mensaje-final');
    if (mensajeFinal) {
      mensajeFinal.before(shareContainer);
    } else {
      reflexionContent.after(shareContainer);
    }
  }

  // Función de compartir
  function shareContent(platform) {
    const url = window.location.href;
    const title = document.title;
    const text = `Leyendo: ${title}`;

    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          showNotification('✅ Enlace copiado al portapapeles');
        });
        break;
    }
  }

  // ==========================================
  // 7. NAVEGACIÓN FLOTANTE
  // ==========================================
  
  function addFloatingNav() {
    const path = window.location.pathname;
    const match = path.match(/reflexion(\d+)/);
    if (!match) return;

    const currentNum = parseInt(match[1]);
    const totalReflections = 11; // Actualizar cuando agregues más

    const floatingNav = document.createElement('div');
    floatingNav.className = 'floating-nav';

    let navHTML = '';

    // Botón anterior
    if (currentNum > 1) {
      navHTML += `<button onclick="window.location.href='reflexion${currentNum - 1}.html'" title="Reflexión anterior">←</button>`;
    }

    // Botón volver arriba
    navHTML += `<button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="Volver arriba">↑</button>`;

    // Botón siguiente
    if (currentNum < totalReflections) {
      navHTML += `<button onclick="window.location.href='reflexion${currentNum + 1}.html'" title="Siguiente reflexión">→</button>`;
    }

    floatingNav.innerHTML = navHTML;
    document.body.appendChild(floatingNav);
  }

  // ==========================================
  // 8. FRASE ROTATIVA
  // ==========================================
  
  function addRotatingQuote() {
    // Solo en página principal
    if (!window.location.pathname.includes('index.html') && 
        window.location.pathname !== '/' &&
        !window.location.pathname.endsWith('/El-rincon-del-conocimiento/')) return;

    const quotes = [
      "El conocimiento es el único tesoro que nadie puede quitarte",
      "La reflexión es el puente entre la ignorancia y la sabiduría",
      "Cada pensamiento crítico es un paso hacia la verdad",
      "La percepción moldea nuestra realidad",
      "Pensar por uno mismo es el acto más revolucionario"
    ];

    const quoteElement = document.createElement('div');
    quoteElement.className = 'frase-rotativa';
    quoteElement.textContent = quotes[0];

    const intro = document.querySelector('.intro');
    if (intro) {
      intro.before(quoteElement);
    }

    // Rotar frases cada 8 segundos
    let index = 0;
    setInterval(() => {
      index = (index + 1) % quotes.length;
      quoteElement.style.opacity = '0';
      setTimeout(() => {
        quoteElement.textContent = quotes[index];
        quoteElement.style.opacity = '1';
      }, 400);
    }, 8000);
  }

  // ==========================================
  // 9. MODO LECTURA SUGERIDO
  // ==========================================
  
  function addReadingModeSuggestion() {
    const suggestion = document.createElement('div');
    suggestion.className = 'reading-mode-suggestion';
    suggestion.innerHTML = '💡 Modo lectura activado';
    suggestion.style.display = 'none';
    document.body.appendChild(suggestion);

    let hasScrolled = false;
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500 && !hasScrolled) {
        hasScrolled = true;
        document.body.classList.add('scrolled');
        setTimeout(() => {
          suggestion.style.display = 'none';
          document.body.classList.remove('scrolled');
        }, 3000);
      }
    });
  }

  // ==========================================
  // 10. ÍNDICE DE CONTENIDOS (para reflexiones largas)
  // ==========================================
  
  function addTableOfContents() {
    const content = document.querySelector('.texto-reflexion');
    if (!content || window.innerWidth < 1400) return;

    const headers = content.querySelectorAll('b, strong');
    if (headers.length < 2) return; // Solo si hay suficientes secciones

    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h3>En esta reflexión</h3><ul></ul>';

    const ul = toc.querySelector('ul');

    headers.forEach((header, index) => {
      const id = `section-${index}`;
      header.id = id;

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = header.textContent.substring(0, 30) + '...';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    document.body.appendChild(toc);

    // Resaltar sección actual
    window.addEventListener('scroll', () => {
      let current = '';
      headers.forEach(header => {
        const rect = header.getBoundingClientRect();
        if (rect.top <= 150) {
          current = header.id;
        }
      });

      toc.querySelectorAll('a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${current}`) {
          a.classList.add('active');
        }
      });
    });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  function showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(20,20,20,0.98);
      color: #d4af37;
      padding: 1rem 2rem;
      border-radius: 8px;
      border: 1px solid rgba(212,175,55,0.3);
      z-index: 10000;
      animation: slideDown 0.3s ease;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 2000);
  }

  // ==========================================
  // EXPONER FUNCIONES PÚBLICAS
  // ==========================================
  
  window.features = {
    share: shareContent
  };

  // ==========================================
  // INICIALIZAR TODO
  // ==========================================
  
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Iniciando funcionalidades extras...');
    
    initReadingProgress();
    addStatsBar();
    addBreadcrumb();
    addReadingTime();
    addTags();
    addSocialShare();
    addFloatingNav();
    addRotatingQuote();
    addReadingModeSuggestion();
    addTableOfContents();
    
    console.log('✅ Todas las funcionalidades cargadas');
  });

})();