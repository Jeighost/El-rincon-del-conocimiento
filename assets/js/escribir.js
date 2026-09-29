/* =====================================================================
   Editor de reflexiones (/escribir/)
   Genera el archivo .md de la reflexión y lo abre en GitHub listo para
   guardar. No necesita contraseñas: GitHub pide iniciar sesión.
   ===================================================================== */
const editor = document.querySelector('[data-editor]');
const form = document.querySelector('[data-editor-form]');

if (editor && form) {
  const REPO = editor.dataset.repo;
  const RAMA = editor.dataset.rama || 'main';
  const SITIO = (editor.dataset.sitio || '').replace(/\/$/, '');
  const CLAVE = 'borrador-reflexion';
  const LIMITE_URL = 7000;

  const $ = (s) => document.querySelector(s);
  const campos = form.elements;
  const estado = $('[data-editor-estado]');
  const aviso = (msg) => (window.mostrarAviso ? window.mostrarAviso(msg) : alert(msg));

  // Fecha de hoy por defecto (hora local)
  const hoy = () => {
    const d = new Date();
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };
  campos.fecha.value = hoy();

  /* ---------- Temas ---------- */
  const cajaTemas = $('[data-temas]');
  const temasElegidos = () => [...cajaTemas.querySelectorAll('[aria-pressed="true"]')].map((b) => b.dataset.temaOpcion);
  function crearChip(nombre, activo) {
    const existente = [...cajaTemas.querySelectorAll('[data-tema-opcion]')]
      .find((b) => b.dataset.temaOpcion.toLowerCase() === nombre.toLowerCase());
    if (existente) {
      existente.setAttribute('aria-pressed', String(activo));
      return;
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.temaOpcion = nombre;
    b.setAttribute('aria-pressed', String(activo));
    b.textContent = nombre;
    cajaTemas.appendChild(b);
  }
  cajaTemas.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tema-opcion]');
    if (!b) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    actualizar();
  });
  const temaNuevo = $('[data-tema-nuevo]');
  const agregarTema = () => {
    const v = temaNuevo.value.trim().replace(/\s+/g, ' ');
    if (!v) return;
    crearChip(v.charAt(0).toUpperCase() + v.slice(1), true);
    temaNuevo.value = '';
    actualizar();
  };
  $('[data-tema-agregar]').addEventListener('click', agregarTema);
  temaNuevo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); agregarTema(); }
  });

  /* ---------- Barra de formato ---------- */
  const texto = campos.texto;
  function envolver(antes, despues, relleno) {
    const { selectionStart: a, selectionEnd: b, value } = texto;
    const sel = value.slice(a, b) || relleno;
    texto.setRangeText(antes + sel + despues, a, b, 'end');
    if (a === b) {
      texto.selectionStart = a + antes.length;
      texto.selectionEnd = a + antes.length + sel.length;
    }
    texto.focus();
    actualizar();
  }
  function bloque(prefijo, relleno) {
    const { selectionStart: a, selectionEnd: b, value } = texto;
    const sel = value.slice(a, b) || relleno;
    const antes = value.slice(0, a);
    const sep = antes === '' || antes.endsWith('\n\n') ? '' : antes.endsWith('\n') ? '\n' : '\n\n';
    const lineas = sel.split('\n').map((l) => prefijo + l).join('\n');
    texto.setRangeText(sep + lineas + '\n\n', a, b, 'end');
    // Sin texto seleccionado: deja marcado el ejemplo para que al escribir se reemplace
    if (a === b && prefijo) {
      texto.selectionStart = a + sep.length + prefijo.length;
      texto.selectionEnd = texto.selectionStart + relleno.length;
    }
    texto.focus();
    actualizar();
  }
  const EJEMPLOS = ['texto en negrita', 'texto en cursiva', 'Escribe aquí el subtítulo', 'Escribe aquí la frase para destacar'];
  document.querySelectorAll('[data-formato]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.formato;
      if (f === 'negrita') envolver('**', '**', EJEMPLOS[0]);
      if (f === 'cursiva') envolver('*', '*', EJEMPLOS[1]);
      if (f === 'subtitulo') bloque('## ', EJEMPLOS[2]);
      if (f === 'cita') bloque('> ', EJEMPLOS[3]);
      if (f === 'separador') bloque('', '---');
    });
  });

  /* ---------- Markdown ---------- */
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const enLinea = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');

  // Vista previa: imita cómo el sitio convierte el texto
  function aHTML(md) {
    const bloques = md.replace(/\r/g, '').split(/\n\s*\n/).map((b) => b.replace(/^\n+|\n+$/g, '')).filter(Boolean);
    return bloques.map((b) => {
      if (/^---+$/.test(b.trim())) return '<hr>';
      if (/^##\s/.test(b)) return `<h2>${enLinea(b.replace(/^##\s+/, '').replace(/\n/g, ' '))}</h2>`;
      if (/^>\s?/.test(b)) {
        const q = b.split('\n').map((l) => l.replace(/^>\s?/, '')).join('\n');
        return `<blockquote><p>${enLinea(q).replace(/\n/g, '<br>')}</p></blockquote>`;
      }
      return `<p>${enLinea(b).replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
  }

  // Evita que una línea se convierta sin querer en lista o título
  function limpiarCuerpo(md) {
    let cuerpo = md.replace(/\r/g, '').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
    cuerpo = cuerpo.split('\n').map((l) => l
      .replace(/^(\d+)\.(\s)/, '$1\\.$2')
      .replace(/^([-+])(\s)/, '\\$1$2')
      .replace(/^\*(\s)/, '\\*$1')
      .replace(/^#(?!#\s)/, '\\#')).join('\n');
    if (/\{\{|\{%/.test(cuerpo)) cuerpo = `{% raw %}\n${cuerpo}\n{% endraw %}`;
    return cuerpo + '\n';
  }

  const yaml = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

  function numero() {
    const n = parseInt(campos.numero.value, 10);
    return n > 0 ? n : parseInt(editor.dataset.siguiente, 10);
  }

  function archivo() {
    const titulo = campos.titulo.value.trim();
    const desc = campos.descripcion.value.trim();
    const temas = temasElegidos();
    const lineas = ['---', `title: ${yaml(titulo)}`];
    if (desc) lineas.push(`description: ${yaml(desc)}`);
    lineas.push(`date: ${campos.fecha.value || hoy()}`);
    lineas.push(`temas: [${temas.map(yaml).join(', ')}]`);
    if (campos.video.value.trim()) lineas.push(`video: ${campos.video.value.trim()}`);
    lineas.push('---', '', limpiarCuerpo(texto.value));
    return lineas.join('\n');
  }

  /* ---------- Vista previa + borrador ---------- */
  const prev = {
    numero: $('[data-prev-numero]'),
    titulo: $('[data-prev-titulo]'),
    desc: $('[data-prev-descripcion]'),
    temas: $('[data-prev-temas]'),
    texto: $('[data-prev-texto]')
  };
  let guardadoTimer;

  function actualizar() {
    const n = numero();
    $('[data-numero-texto]').textContent = n;
    $('[data-url-texto]').textContent = `${SITIO.replace(/^https?:\/\//, '')}/reflexion${n}/`;
    $('[data-audio-nombre]').textContent = `reflexion${n}.mp3`;
    prev.numero.textContent = n;
    prev.titulo.textContent = campos.titulo.value.trim() || 'Tu título';
    prev.desc.textContent = campos.descripcion.value.trim();
    prev.desc.hidden = !campos.descripcion.value.trim();
    prev.temas.innerHTML = temasElegidos().map((t) => `<li><span class="chip">${esc(t)}</span></li>`).join('');
    prev.texto.innerHTML = texto.value.trim()
      ? aHTML(texto.value)
      : '<p>Aquí verás tu reflexión tal como se leerá en el sitio.</p>';
    const palabras = (texto.value.match(/\S+/g) || []).length;
    const min = Math.max(1, Math.ceil(palabras / 200));
    $('[data-palabras]').textContent = `${palabras} ${palabras === 1 ? 'palabra' : 'palabras'} · ${min} min de lectura`;

    clearTimeout(guardadoTimer);
    guardadoTimer = setTimeout(guardarBorrador, 400);
  }

  function guardarBorrador() {
    const datos = {
      titulo: campos.titulo.value,
      descripcion: campos.descripcion.value,
      texto: texto.value,
      fecha: campos.fecha.value,
      video: campos.video.value,
      numero: campos.numero.value,
      temas: temasElegidos()
    };
    const vacio = !datos.titulo && !datos.texto && !datos.descripcion;
    try {
      if (vacio) localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, JSON.stringify(datos));
      const hora = new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
      $('[data-guardado]').textContent = vacio ? 'Borrador vacío' : `Borrador guardado a las ${hora}`;
    } catch (e) {
      $('[data-guardado]').textContent = 'No se pudo guardar el borrador en este navegador';
    }
  }

  function cargarBorrador() {
    let datos;
    try { datos = JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { datos = null; }
    if (!datos) return;
    campos.titulo.value = datos.titulo || '';
    campos.descripcion.value = datos.descripcion || '';
    texto.value = datos.texto || '';
    campos.video.value = datos.video || '';
    if (datos.fecha) campos.fecha.value = datos.fecha;
    if (datos.numero) campos.numero.value = datos.numero;
    (datos.temas || []).forEach((t) => crearChip(t, true));
  }

  form.addEventListener('input', actualizar);
  cargarBorrador();
  actualizar();

  /* ---------- Acciones ---------- */
  function validar() {
    estado.classList.remove('is-error');
    estado.textContent = '';
    if (!campos.titulo.value.trim()) {
      estado.textContent = 'Falta el título.';
      estado.classList.add('is-error');
      campos.titulo.focus();
      return false;
    }
    if (texto.value.trim().length < 10) {
      estado.textContent = 'Falta el texto de la reflexión.';
      estado.classList.add('is-error');
      texto.focus();
      return false;
    }
    const ejemplo = EJEMPLOS.find((e) => texto.value.includes(e));
    if (ejemplo) {
      estado.textContent = `Todavía está el texto de ejemplo «${ejemplo}». Cámbialo por el tuyo o bórralo.`;
      estado.classList.add('is-error');
      const i = texto.value.indexOf(ejemplo);
      texto.focus();
      texto.setSelectionRange(i, i + ejemplo.length);
      return false;
    }
    return true;
  }

  const copiar = (t) => (window.copiarTexto ? window.copiarTexto(t) : navigator.clipboard.writeText(t));

  $('[data-publicar]').addEventListener('click', async () => {
    if (!validar()) return;
    const contenido = archivo();
    const nombre = `reflexion${numero()}.md`;
    const base = `https://github.com/${REPO}/new/${RAMA}/_reflexiones?filename=${encodeURIComponent(nombre)}`;
    const conTexto = `${base}&value=${encodeURIComponent(contenido)}`;
    let copiado = false;
    try { await copiar(contenido); copiado = true; } catch (e) {}
    if (conTexto.length <= LIMITE_URL) {
      window.open(conTexto, '_blank', 'noopener');
      estado.textContent = 'Se abrió GitHub con tu reflexión lista. Baja y pulsa el botón verde «Commit changes». ' +
        'Cuando esté publicada, pulsa «Empezar de nuevo» para escribir otra.';
    } else {
      window.open(base, '_blank', 'noopener');
      estado.textContent = copiado
        ? 'Tu reflexión es larga, así que la copié: en GitHub mantén presionado el cuadro de texto, pega, y pulsa «Commit changes».'
        : 'Tu reflexión es larga: usa «Copiar archivo», pégala en GitHub y pulsa «Commit changes».';
    }
  });

  $('[data-copiar-md]').addEventListener('click', () => {
    if (!validar()) return;
    copiar(archivo()).then(() => aviso('Archivo copiado'), () => aviso('No se pudo copiar'));
  });

  $('[data-descargar]').addEventListener('click', () => {
    if (!validar()) return;
    const blob = new Blob([archivo()], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reflexion${numero()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $('[data-borrar]').addEventListener('click', () => {
    if ((campos.titulo.value || texto.value) && !confirm('¿Borrar el borrador y empezar una reflexión nueva?')) return;
    form.reset();
    campos.fecha.value = hoy();
    campos.numero.value = editor.dataset.siguiente;
    cajaTemas.querySelectorAll('[aria-pressed="true"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    try { localStorage.removeItem(CLAVE); } catch (e) {}
    estado.textContent = '';
    actualizar();
  });
}
