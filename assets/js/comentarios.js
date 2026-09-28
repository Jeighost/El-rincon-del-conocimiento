/* =====================================================================
   Comentarios de las reflexiones (Firebase Firestore)
   Usa la misma base de datos y el mismo formato que antes, así que los
   comentarios que ya existían siguen apareciendo.
   ===================================================================== */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore, collection, addDoc, query, where, getDocs, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp({
  apiKey: 'AIzaSyDKJ3TmQJgVTEzPfrP-oNyhFI6Qtcl-4m8',
  authDomain: 'jeighost-comments.firebaseapp.com',
  projectId: 'jeighost-comments',
  storageBucket: 'jeighost-comments.firebasestorage.app',
  messagingSenderId: '940192175516',
  appId: '1:940192175516:web:d22a733acfd45bb7746459'
});
const db = getFirestore(app);

const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const iniciales = (nombre) => {
  const partes = nombre.trim().split(/\s+/);
  return (partes.length > 1 ? partes[0][0] + partes[1][0] : nombre.slice(0, 2)).toUpperCase();
};

function haceCuanto(fecha) {
  if (!fecha) return '';
  const seg = Math.floor((Date.now() - fecha.getTime()) / 1000);
  const pasos = [['año', 31536000], ['mes', 2592000], ['semana', 604800], ['día', 86400], ['hora', 3600], ['minuto', 60]];
  for (const [nombre, s] of pasos) {
    const n = Math.floor(seg / s);
    if (n >= 1) {
      const plural = n > 1 ? (nombre === 'mes' ? 'es' : 's') : '';
      return `hace ${n} ${nombre}${plural}`;
    }
  }
  return 'hace un momento';
}

function itemHTML(c, nuevo) {
  const nombre = c.name || 'Anónimo';
  const fecha = c.timestamp && c.timestamp.toDate ? c.timestamp.toDate() : null;
  const titulo = fecha ? fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  return `<li class="c-item${nuevo ? ' is-new' : ''}">
    <span class="c-avatar" aria-hidden="true">${escapar(iniciales(nombre))}</span>
    <div>
      <p class="c-meta"><span class="c-author">${escapar(nombre)}</span><time class="c-date" title="${titulo}">${haceCuanto(fecha)}</time></p>
      <p class="c-text">${escapar(c.text || '')}</p>
    </div>
  </li>`;
}

export async function iniciar(seccion) {
  const id = seccion.getAttribute('data-comentarios');
  const lista = seccion.querySelector('[data-lista]');
  const contador = seccion.querySelector('[data-count]');
  const form = seccion.querySelector('[data-form]');
  const estado = seccion.querySelector('[data-status]');
  const texto = form.elements.texto;
  const nombre = form.elements.nombre;
  const cuenta = seccion.querySelector('[data-counter]');
  const boton = form.querySelector('button[type="submit"]');
  let total = 0;

  const ponerTotal = () => { contador.textContent = total ? `(${total})` : ''; };

  try { nombre.value = localStorage.getItem('nombre-comentario') || ''; } catch (e) {}

  texto.addEventListener('input', () => { cuenta.textContent = `${texto.value.length} / 1000`; });
  texto.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') form.requestSubmit();
  });

  // Cargar comentarios existentes (más recientes primero)
  try {
    const snap = await getDocs(query(collection(db, 'comments'), where('reflectionId', '==', id)));
    const comentarios = snap.docs.map((d) => d.data())
      .sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0));
    total = comentarios.length;
    ponerTotal();
    lista.innerHTML = total
      ? comentarios.map((c) => itemHTML(c)).join('')
      : '<li class="c-empty" data-sin-comentarios>Todavía no hay comentarios. Sé la primera persona en dejar uno.</li>';
  } catch (error) {
    console.error('Comentarios:', error);
    lista.innerHTML = '<li class="c-empty">No se pudieron cargar los comentarios en este momento.</li>';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = texto.value.trim();
    const n = nombre.value.trim().slice(0, 50) || 'Anónimo';
    estado.classList.remove('is-error');
    if (t.length < 3) {
      estado.textContent = 'Escribe al menos unas palabras.';
      estado.classList.add('is-error');
      texto.focus();
      return;
    }
    boton.disabled = true;
    estado.textContent = 'Publicando…';
    const nuevo = {
      reflectionId: id,
      name: n,
      text: t.slice(0, 1000),
      timestamp: Timestamp.now(),
      userAgent: navigator.userAgent.substring(0, 100)
    };
    try {
      await addDoc(collection(db, 'comments'), nuevo);
      try { localStorage.setItem('nombre-comentario', n === 'Anónimo' ? '' : n); } catch (err) {}
      const vacio = lista.querySelector('[data-sin-comentarios]');
      if (vacio) vacio.remove();
      lista.insertAdjacentHTML('afterbegin', itemHTML(nuevo, true));
      total += 1;
      ponerTotal();
      texto.value = '';
      cuenta.textContent = '0 / 1000';
      estado.textContent = 'Gracias por compartir lo que pensaste.';
      if (window.gtag) window.gtag('event', 'comentario', { reflexion: id });
    } catch (error) {
      console.error('Comentarios:', error);
      estado.textContent = 'No se pudo publicar. Inténtalo de nuevo en un momento.';
      estado.classList.add('is-error');
    } finally {
      boton.disabled = false;
    }
  });
}
