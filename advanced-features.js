// ============================================
// ADVANCED-FEATURES.JS - Funciones avanzadas
// ============================================

(function() {
  'use strict';

  // ===========================================
  // 3. BUSCADOR DE REFLEXIONES
  // ===========================================

  const reflexionesData = [
    { id: 1, title: 'La percepción', tags: ['percepción', 'conciencia', 'conocimiento'], preview: 'Reflexión sobre la forma que vemos' },
    { id: 2, title: 'La historia', tags: ['futuro', 'humanidad', 'cambio'], preview: 'irónico' },
    { id: 3, title: 'Último mensaje', tags: ['memoria', 'relaciones', 'identidad'], preview: 'Un corto poema' },
    { id: 4, title: 'No soy nadie', tags: ['individualidad', 'reconocimiento', 'propósito'], preview: 'Nunca lo seré, pero para mí lo soy' },
    { id: 5, title: 'Un sueño despierto', tags: ['sueños', 'futuro', 'responsabilidad'], preview: 'Todos podemos soñar con lo mismo' },
    { id: 6, title: 'Un solitario', tags: ['soledad', 'existencia', 'conciencia'], preview: 'Anhelando una compañía real' },
    { id: 7, title: 'El titulo va al final', tags: ['vida', 'muerte', 'decisiones'], preview: 'Ya pude leerlo' },
    { id: 8, title: 'Otro dia', tags: ['universo', 'amor', 'enamoramiento'], preview: 'otra poesia' },
     { id: 9, title: 'Desgaste invisible', tags: ['salud', 'bienestar', 'cambio'], preview: '¿Como estoy cuidando lo importante?' },
     { id: 10, title: 'La identidad', tags: ['dualidad', 'cambio', 'verdad'], preview: 'Una mirada hacia el ser interior, donde las máscaras, los recuerdos y el tiempo difuminan lo que creemos ser.' },
     { id: 11, title: 'La conciencia que basta asi misma', tags: ['conciencia', 'plenitud', 'infinito'], preview: 'Reflexión filosófica sobre la plenitud interior y la conciencia como fuente inagotable de felicidad.' },
     { id: 12, title: 'El mundo que sueño', tags: ['consciencia', 'unidad', 'preservacion'], preview: 'Una vision posible' },
  ];

  function addSearchBar() {
    if (!window.location.pathname.includes('reflexiones.html')) return;

    const header = document.querySelector('header');
    if (!header) return;

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <div class="search-box">
        <input type="text" id="search-input" placeholder="🔍 Buscar reflexiones...">
        <button id="clear-search" style="display:none;">✕</button>
      </div>
      <div id="search-results"></div>
    `;

    header.after(searchContainer);

    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    const resultsDiv = document.getElementById('search-results');
    const reflexionesSection = document.querySelector('.reflexiones');

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      if (query.length > 0) {
        clearBtn.style.display = 'block';
        performSearch(query, resultsDiv, reflexionesSection);
      } else {
        clearBtn.style.display = 'none';
        resultsDiv.innerHTML = '';
        reflexionesSection.style.display = 'flex';
      }
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      resultsDiv.innerHTML = '';
      reflexionesSection.style.display = 'flex';
    });
  }

  function performSearch(query, resultsDiv, reflexionesSection) {
    const results = reflexionesData.filter(ref => 
      ref.title.toLowerCase().includes(query) ||
      ref.tags.some(tag => tag.includes(query)) ||
      ref.preview.toLowerCase().includes(query)
    );

    if (results.length > 0) {
      reflexionesSection.style.display = 'none';
      
      let html = `<div class="search-results-header">Encontradas ${results.length} reflexión${results.length > 1 ? 'es' : ''}</div>`;
      
      results.forEach(ref => {
        html += `
          <div class="search-result-item">
            <a href="reflexion${ref.id}.html">
              <span class="result-number">${ref.id}</span>
              <div class="result-content">
                <h3>${ref.title}</h3>
                <p>${ref.preview}</p>
                <div class="result-tags">${ref.tags.map(tag => `<span class="result-tag">#${tag}</span>`).join(' ')}</div>
              </div>
            </a>
          </div>
        `;
      });
      
      resultsDiv.innerHTML = html;
    } else {
      reflexionesSection.style.display = 'none';
      resultsDiv.innerHTML = '<div class="no-results">❌ No se encontraron reflexiones con ese término</div>';
    }
  }

  // ===========================================
  // 4. MODO OSCURO/CLARO
  // ===========================================

  function initThemeToggle() {
    // Verificar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);

    // Agregar botón al menú
    const nav = document.querySelector('nav');
    if (!nav) return;

    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle-btn';
    themeBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    themeBtn.title = savedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro';

    themeBtn.addEventListener('click', toggleTheme);
    
    nav.appendChild(themeBtn);
  }

  function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const btn = document.querySelector('.theme-toggle-btn');
    if (btn) {
      btn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
      btn.title = newTheme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }

    // Analytics
    if (window.gtag) {
      gtag('event', 'theme_change', {
        'event_category': 'UI',
        'event_label': newTheme
      });
    }
  }

  // ===========================================
  // 7. REFLEXIONES RELACIONADAS
  // ===========================================

  function addRelatedReflections() {
    const path = window.location.pathname;
    const match = path.match(/reflexion(\d+)/);
    
    if (!match) return;

    const currentId = parseInt(match[1]);
    const currentRef = reflexionesData.find(r => r.id === currentId);
    
    if (!currentRef) return;

    // Encontrar reflexiones con tags similares
    const related = reflexionesData
      .filter(ref => ref.id !== currentId)
      .map(ref => {
        const commonTags = ref.tags.filter(tag => currentRef.tags.includes(tag));
        return { ...ref, score: commonTags.length };
      })
      .filter(ref => ref.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (related.length === 0) {
      // Si no hay por tags, mostrar las más cercanas por ID
      const nearby = reflexionesData
        .filter(ref => ref.id !== currentId)
        .map(ref => ({ ...ref, distance: Math.abs(ref.id - currentId) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      
      related.push(...nearby);
    }

    const mensajeFinal = document.querySelector('.mensaje-final');
    if (!mensajeFinal) return;

    const relatedSection = document.createElement('div');
    relatedSection.className = 'related-reflections';
    
    let html = '<h3>📚 Reflexiones relacionadas</h3><div class="related-grid">';
    
    related.forEach(ref => {
      html += `
        <a href="reflexion${ref.id}.html" class="related-card">
          <span class="related-number">${ref.id}</span>
          <h4>${ref.title}</h4>
          <p>${ref.preview}</p>
        </a>
      `;
    });
    
    html += '</div>';
    relatedSection.innerHTML = html;
    
    mensajeFinal.before(relatedSection);
  }

  // ===========================================
  // 11. TEXT-TO-SPEECH (Lectura en voz alta)
  // ===========================================

  function addAudioReader() {
    const content = document.querySelector('.texto-reflexion, .contenido-reflexion');
    if (!content || !('speechSynthesis' in window)) return;

    const audioBtn = document.createElement('button');
    audioBtn.className = 'audio-reader-btn';
    audioBtn.innerHTML = '🔊 Escuchar';
    audioBtn.title = 'Escuchar reflexión';

    let isPlaying = false;
    let utterance = null;

    audioBtn.addEventListener('click', () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        audioBtn.innerHTML = '🔊 Escuchar';
        isPlaying = false;
      } else {
        const text = content.textContent;
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onend = () => {
          audioBtn.innerHTML = '🔊 Escuchar';
          isPlaying = false;
        };

        window.speechSynthesis.speak(utterance);
        audioBtn.innerHTML = '⏸️ Pausar';
        isPlaying = true;
      }
    });

    const header = document.querySelector('header');
    if (header) {
      header.after(audioBtn);
    }
  }

  // ===========================================
  // 14. CONTADOR DE DÍAS
  // ===========================================

  function addDayCounter() {
    if (!window.location.pathname.includes('index.html') && 
        window.location.pathname !== '/' &&
        !window.location.pathname.endsWith('/El-rincon-del-conocimiento/')) return;

    // Fecha de última reflexión (actualizar manualmente)
    const lastReflectionDate = new Date('2025-11-04'); 
    const today = new Date();
    const daysSince = Math.floor((today - lastReflectionDate) / (1000 * 60 * 60 * 24));

    const counter = document.createElement('div');
    counter.className = 'day-counter';
    counter.innerHTML = `
      <div class="counter-content">
        <span class="counter-number">${daysSince}</span>
        <span class="counter-label">día${daysSince !== 1 ? 's' : ''} desde la última reflexión</span>
      </div>
    `;

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
      statsBar.after(counter);
    }
  }

  // ===========================================
  // ESTILOS
  // ===========================================

  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* BUSCADOR */
      .search-container {
        max-width: 800px;
        margin: 1.5rem auto;
        padding: 0 1rem;
      }

      .search-box {
        position: relative;
        margin-bottom: 1rem;
      }

      #search-input {
        width: 100%;
        padding: 0.8rem 3rem 0.8rem 1rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(212,175,55,0.3);
        border-radius: 25px;
        color: #ddd;
        font-size: 1rem;
        transition: all 0.3s;
      }

      #search-input:focus {
        outline: none;
        border-color: #d4af37;
        box-shadow: 0 0 15px rgba(212,175,55,0.3);
      }

      #clear-search {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: #888;
        font-size: 1.2rem;
        cursor: pointer;
        transition: color 0.3s;
      }

      #clear-search:hover {
        color: #d4af37;
      }

      .search-results-header {
        color: #d4af37;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        text-align: center;
      }

      .search-result-item {
        margin-bottom: 1rem;
      }

      .search-result-item a {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255,255,255,0.03);
        border-radius: 10px;
        border: 1px solid rgba(212,175,55,0.1);
        text-decoration: none;
        transition: all 0.3s;
      }

      .search-result-item a:hover {
        background: rgba(255,255,255,0.05);
        border-color: rgba(212,175,55,0.3);
        transform: translateX(5px);
      }

      .result-number {
        background: rgba(212,175,55,0.2);
        color: #d4af37;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
      }

      .result-content h3 {
        color: #d4af37;
        font-size: 1.1rem;
        margin-bottom: 0.3rem;
      }

      .result-content p {
        color: #888;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }

      .result-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .result-tag {
        font-size: 0.75rem;
        color: #d4af37;
        background: rgba(212,175,55,0.1);
        padding: 0.2rem 0.6rem;
        border-radius: 10px;
      }

      .no-results {
        text-align: center;
        color: #888;
        padding: 2rem;
        font-size: 1.1rem;
      }

      /* MODO CLARO/OSCURO */
      .theme-toggle-btn {
        background: transparent;
        border: 1px solid rgba(212,175,55,0.3);
        color: #d4af37;
        padding: 0.5rem 0.8rem;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
        transition: all 0.3s;
      }

      .theme-toggle-btn:hover {
        background: rgba(212,175,55,0.2);
        transform: scale(1.1);
      }

/* Tema claro MEJORADO */
body[data-theme="light"] {
  background: linear-gradient(-45deg, #fafafa, #f5f5f5, #ffffff, #f8f8f8);
  color: #1a1a1a;
}

body[data-theme="light"] header,
body[data-theme="light"] nav,
body[data-theme="light"] footer {
  background: rgba(255,255,255,0.98);
  color: #1a1a1a;
  border-color: rgba(139,115,85,0.3);
}

body[data-theme="light"] h1,
body[data-theme="light"] h2,
body[data-theme="light"] h3 {
  color: #6d5a45;
}

body[data-theme="light"] p,
body[data-theme="light"] .texto-reflexion,
body[data-theme="light"] .contenido-reflexion,
body[data-theme="light"] .bio {
  color: #2a2a2a;
}

body[data-theme="light"] nav a,
body[data-theme="light"] .enlace-reflexion,
body[data-theme="light"] .favorite-title {
  color: #6d5a45 !important;
}

body[data-theme="light"] .breadcrumb,
body[data-theme="light"] .stats-bar,
body[data-theme="light"] .reflexion-item {
  background: rgba(139,115,85,0.08);
  border-color: rgba(139,115,85,0.2);
}

body[data-theme="light"] .stat-label,
body[data-theme="light"] .counter-label,
body[data-theme="light"] .subtitulo {
  color: #666;
}

body[data-theme="light"] .cita,
body[data-theme="light"] blockquote {
  color: #3a3a3a;
  background: rgba(139,115,85,0.1);
  border-left-color: #8b7355;
}

body[data-theme="light"] .tag {
  background: rgba(139,115,85,0.15);
  color: #6d5a45;
  border-color: rgba(139,115,85,0.3);
}

      /* REFLEXIONES RELACIONADAS */
      .related-reflections {
        margin: 3rem 0;
        padding: 2rem 1rem;
        background: rgba(255,255,255,0.02);
        border-radius: 12px;
        border-top: 2px solid rgba(212,175,55,0.3);
      }

      .related-reflections h3 {
        color: #d4af37;
        text-align: center;
        margin-bottom: 1.5rem;
        font-size: 1.3rem;
      }

      .related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .related-card {
        padding: 1.2rem;
        background: rgba(255,255,255,0.03);
        border-radius: 10px;
        border: 1px solid rgba(212,175,55,0.1);
        text-decoration: none;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .related-card:hover {
        border-color: rgba(212,175,55,0.4);
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(212,175,55,0.2);
      }

      .related-number {
        background: rgba(212,175,55,0.2);
        color: #d4af37;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
        margin-bottom: 0.8rem;
      }

      .related-card h4 {
        color: #d4af37;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }

      .related-card p {
        color: #888;
        font-size: 0.85rem;
      }

      /* AUDIO READER */
      .audio-reader-btn {
        display: block;
        margin: 1rem auto;
        background: rgba(212,175,55,0.1);
        color: #d4af37;
        border: 1px solid rgba(212,175,55,0.3);
        padding: 0.7rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.95rem;
        transition: all 0.3s;
        font-weight: 600;
      }

      .audio-reader-btn:hover {
        background: rgba(212,175,55,0.2);
        transform: translateY(-2px);
      }

      /* CONTADOR DE DÍAS */
      .day-counter {
        max-width: 400px;
        margin: 1.5rem auto;
        padding: 1rem;
        background: rgba(255,255,255,0.02);
        border-radius: 10px;
        border: 1px solid rgba(212,175,55,0.15);
        text-align: center;
      }

      .counter-number {
        display: block;
        font-size: 2.5rem;
        color: #d4af37;
        font-weight: bold;
        font-family: 'Cinzel', serif;
      }

      .counter-label {
        display: block;
        font-size: 0.9rem;
        color: #888;
        margin-top: 0.3rem;
      }

      @media (max-width: 768px) {
        .related-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ===========================================
  // INICIALIZAR
  // ===========================================

  document.addEventListener('DOMContentLoaded', () => {
    addStyles();
    addSearchBar();
    initThemeToggle();
    addRelatedReflections();
    addAudioReader();
    addDayCounter();
    
    console.log('🚀 Funciones avanzadas cargadas');
  });

})();