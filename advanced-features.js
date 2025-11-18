// ============================================
// ADVANCED-FEATURES.JS - Funciones avanzadas (refactor)
// ============================================
(function () {
  'use strict';

  if (window.__advFeaturesInit) return;
  window.__advFeaturesInit = true;

  const reflexionesData = [
    { id: 1, title: 'La percepción', tags: ['percepción','conciencia','conocimiento'], preview: 'Reflexión sobre la forma que vemos' },
    { id: 2, title: 'La historia', tags: ['futuro','humanidad','cambio'], preview: 'irónico' },
    { id: 3, title: 'Último mensaje', tags: ['memoria','relaciones','identidad'], preview: 'Un corto poema' },
    { id: 4, title: 'No soy nadie', tags: ['individualidad','reconocimiento','propósito'], preview: 'Nunca lo seré, pero para mí lo soy' },
    { id: 5, title: 'Un sueño despierto', tags: ['sueños','futuro','responsabilidad'], preview: 'Todos podemos soñar con lo mismo' },
    { id: 6, title: 'Un solitario', tags: ['soledad','existencia','conciencia'], preview: 'Anhelando una compañía real' },
    { id: 7, title: 'El titulo va al final', tags: ['vida','muerte','decisiones'], preview: 'Ya pude leerlo' },
    { id: 8, title: 'Otro dia', tags: ['universo','amor','enamoramiento'], preview: 'otra poesia' },
    { id: 9, title: 'Desgaste invisible', tags: ['salud','bienestar','cambio'], preview: '¿Como estoy cuidando lo importante?' },
    { id: 10, title: 'La identidad', tags: ['dualidad','cambio','verdad'], preview: 'Una mirada hacia el ser interior.' },
    { id: 11, title: 'La conciencia que basta asi misma', tags: ['conciencia','plenitud','infinito'], preview: 'Plenitud interior.' },
    { id: 12, title: 'El mundo que sueño', tags: ['consciencia','unidad','preservacion'], preview: 'Una visión posible.' },
    { id: 13, title: '6:50', tags: ['individualidad','melancolia','existencialidad'], preview: 'Este mar, como te adoro y odio' },
    { id: 14, title: 'El espejo y la sombra', tags: ['engaño'], preview: 'Relato filosófico sobre la infidelidad.' },
    { id: 15, title: 'vacío', tags: ['individualidad','melancolia'], preview: 'No logro mirar el final.' },
    { id: 16, title: '¿Desea reiniciar?', tags: ['individualidad','melancolia'], preview: '' }
  ];

  // ===========================================
  // BUSCADOR
  // ===========================================
  function performSearch(query, resultsDiv, reflexionesSection) {
    const results = reflexionesData.filter(ref => {
      const inTitle = ref.title.toLowerCase().includes(query);
      const inTags = ref.tags.some(tag => tag.toLowerCase().includes(query));
      const inPrev = (ref.preview || '').toLowerCase().includes(query);
      return inTitle || inTags || inPrev;
    });

    if (reflexionesSection) reflexionesSection.style.display = 'none';

    if (results.length > 0) {
      let html = `<div class="search-results-header">Encontradas ${results.length}</div>`;
      results.forEach(ref => {
        html += `
          <div class="search-result-item">
            <a href="../reflexion${ref.id}/">
              <span class="result-number">${ref.id}</span>
              <div class="result-content">
                <h3>${ref.title}</h3>
                <p>${ref.preview}</p>
                <div class="result-tags">${ref.tags.map(tag => `<span class="result-tag">#${tag}</span>`).join(' ')}</div>
              </div>
            </a>
          </div>`;
      });
      resultsDiv.innerHTML = html;
    } else {
      resultsDiv.innerHTML = '<div class="no-results">❌ No se encontraron resultados</div>';
    }
  }

  // ===========================================
  // RELACIONADAS (rutas corregidas)
  // ===========================================
  function addRelatedReflections() {
    const match = location.pathname.match(/reflexion(\d+)/);
    if (!match) return;

    const currentId = parseInt(match[1]);
    const currentRef = reflexionesData.find(r => r.id === currentId);

    let related = reflexionesData
      .filter(r => r.id !== currentId)
      .map(r => ({
        ...r,
        score: r.tags.filter(t => currentRef.tags.includes(t)).length
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (related.length === 0) {
      related = reflexionesData
        .filter(r => r.id !== currentId)
        .map(r => ({ ...r, distance: Math.abs(r.id - currentId) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
    }

    const container = document.createElement('div');
    container.className = "related-reflections";

    container.innerHTML = `
      <h3>📚 Reflexiones relacionadas</h3>
      <div class="related-grid">
        ${related.map(r => `
          <a href="../reflexion${r.id}/" class="related-card">
            <span class="related-number">${r.id}</span>
            <h4>${r.title}</h4>
            <p>${r.preview}</p>
          </a>
        `).join('')}
      </div>
    `;

    const anchor = document.querySelector(".mensaje-final") || document.querySelector("main");
    anchor.appendChild(container);
  }

  // ===========================================
  // AUDIO (ruta corregida)
  // ===========================================
  function addAudioReader() {
    const match = location.pathname.match(/reflexion(\d+)/);
    if (!match) return;

    const id = parseInt(match[1]);
    const audioPath = `../audios/reflexion${id}.mp3`;  // ← CORREGIDO

    checkAudioExists(audioPath).then(exists => {
      if (exists) {
        createMiniPlayer(audioPath, "elevenlabs");
      }
    });
  }

  async function checkAudioExists(url) {
    try {
      const r = await fetch(url, { method: "HEAD" });
      return r.ok;
    } catch (e) { return false; }
  }

  // (… resto del código idéntico …)

  document.addEventListener("DOMContentLoaded", () => {
    addRelatedReflections();
    addAudioReader();
  });

})();