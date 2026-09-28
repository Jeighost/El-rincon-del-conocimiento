/* =====================================================================
   El rincón del conocimiento — interacciones del sitio
   Cada bloque solo se activa si su elemento existe en la página.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var SITIO = window.SITIO || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var guardar = function (clave, valor) { try { localStorage.setItem(clave, valor); } catch (e) {} };
  var leer = function (clave) { try { return localStorage.getItem(clave); } catch (e) { return null; } };

  /* ---------- Aviso flotante ---------- */
  var toastEl;
  var toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2400);
  }

  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto);
    }
    return new Promise(function (ok, mal) {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? ok() : mal(); } catch (e) { mal(e); }
      document.body.removeChild(ta);
    });
  }
  window.copiarTexto = copiar;
  window.mostrarAviso = toast;

  /* ---------- Tema claro / oscuro ---------- */
  var metaTheme = $('meta[name="theme-color"]');
  function aplicarTema(claro) {
    if (claro) root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    if (metaTheme) metaTheme.setAttribute('content', claro ? '#f4eee3' : '#100e0c');
    $$('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', claro ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    });
  }
  aplicarTema(root.getAttribute('data-theme') === 'light');
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var claro = root.getAttribute('data-theme') !== 'light';
      aplicarTema(claro);
      guardar('tema', claro ? 'claro' : 'oscuro');
    });
  });

  /* ---------- Menú móvil ---------- */
  var menuBtn = $('[data-menu-toggle]');
  function cerrarMenu() {
    root.classList.remove('menu-open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Abrir menú');
    }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var abierto = root.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', String(abierto));
      menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
    $$('#menu a').forEach(function (a) { a.addEventListener('click', cerrarMenu); });
    window.addEventListener('resize', function () { if (window.innerWidth > 832) cerrarMenu(); });
  }

  /* ---------- Cabecera con borde al bajar + barra de progreso ---------- */
  var header = $('[data-header]');
  var barra = $('[data-progress]');
  var cuerpo = $('.r-body');
  var ticking = false;
  function alHacerScroll() {
    var y = window.pageYOffset || root.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (barra && cuerpo) {
      var inicio = cuerpo.offsetTop - window.innerHeight * 0.4;
      var fin = cuerpo.offsetTop + cuerpo.offsetHeight - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, (y - inicio) / Math.max(1, fin - inicio)));
      barra.style.transform = 'scaleX(' + p + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(alHacerScroll); }
  }, { passive: true });
  alHacerScroll();

  /* ---------- Aparición suave ---------- */
  var revelables = $$('.reveal');
  if (revelables.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revelables.forEach(function (el) { io.observe(el); });
  } else {
    revelables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Reflexiones leídas ---------- */
  function leidas() {
    try { return JSON.parse(leer('leidas') || '[]'); } catch (e) { return []; }
  }
  var actual = $('[data-reflexion]');
  if (actual) {
    var lista = leidas();
    var slug = actual.getAttribute('data-reflexion');
    if (lista.indexOf(slug) === -1) {
      lista.push(slug);
      guardar('leidas', JSON.stringify(lista));
    }
  }
  var yaLeidas = leidas();
  $$('.fila[data-slug]').forEach(function (fila) {
    if (yaLeidas.indexOf(fila.getAttribute('data-slug')) !== -1) fila.classList.add('is-leida');
  });

  /* ---------- Reproductor de audio ---------- */
  $$('[data-player]').forEach(function (player) {
    var audio = $('audio', player);
    var play = $('[data-play]', player);
    var seek = $('[data-seek]', player);
    var cur = $('[data-current]', player);
    var dur = $('[data-duration]', player);
    var rateBtn = $('[data-rate]', player);
    var rates = [1, 1.25, 1.5, 0.85];
    var ri = 0;
    var arrastrando = false;

    function fmt(s) {
      if (!isFinite(s)) return '--:--';
      var m = Math.floor(s / 60);
      var r = Math.floor(s % 60);
      return m + ':' + (r < 10 ? '0' : '') + r;
    }
    function pintar() {
      var p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      if (!arrastrando) seek.value = p;
      seek.style.setProperty('--p', p + '%');
      cur.textContent = fmt(audio.currentTime);
    }

    play.addEventListener('click', function () {
      if (audio.paused) {
        $$('audio').forEach(function (a) { if (a !== audio) a.pause(); });
        var intento = audio.play();
        if (intento && intento.catch) intento.catch(function () { toast('No se pudo reproducir el audio'); });
      } else {
        audio.pause();
      }
    });
    audio.addEventListener('play', function () {
      player.classList.add('is-playing');
      play.setAttribute('aria-label', 'Pausar');
    });
    audio.addEventListener('pause', function () {
      player.classList.remove('is-playing');
      play.setAttribute('aria-label', 'Escuchar la reflexión');
    });
    audio.addEventListener('ended', function () { audio.currentTime = 0; pintar(); });
    audio.addEventListener('loadedmetadata', function () { dur.textContent = fmt(audio.duration); pintar(); });
    audio.addEventListener('timeupdate', pintar);
    seek.addEventListener('input', function () {
      arrastrando = true;
      seek.style.setProperty('--p', seek.value + '%');
      if (audio.duration) cur.textContent = fmt((seek.value / 100) * audio.duration);
    });
    seek.addEventListener('change', function () {
      if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
      arrastrando = false;
    });
    rateBtn.addEventListener('click', function () {
      ri = (ri + 1) % rates.length;
      audio.playbackRate = rates[ri];
      rateBtn.textContent = String(rates[ri]).replace('.', ',') + '×';
    });
  });

  /* ---------- Video de YouTube (se carga solo al tocarlo) ---------- */
  $$('[data-youtube]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-youtube');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      iframe.title = btn.getAttribute('aria-label') || 'Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  /* ---------- Compartir y copiar ---------- */
  $$('[data-share-native]').forEach(function (btn) {
    if (!navigator.share) return;
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var caja = btn.closest('[data-share]');
      navigator.share({
        title: caja.getAttribute('data-title'),
        text: caja.getAttribute('data-title') + ' — El rincón del conocimiento',
        url: caja.getAttribute('data-url')
      }).catch(function () {});
    });
  });
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copiar(btn.getAttribute('data-copy')).then(function () {
        btn.classList.add('is-done');
        toast(btn.getAttribute('data-copy-msg') || 'Enlace copiado');
        setTimeout(function () { btn.classList.remove('is-done'); }, 1800);
      }, function () { toast('No se pudo copiar'); });
    });
  });

  /* ---------- Buscador y filtro por tema ---------- */
  var filtros = $('[data-filtros]');
  if (filtros) {
    var input = $('[data-buscar-input]', filtros);
    var chips = $$('[data-tema]', filtros);
    var filas = $$('[data-lista-reflexiones] .fila');
    var contador = $('[data-contador]', filtros);
    var vacio = $('[data-vacio]');
    var limpiar = $('[data-limpiar]');
    var temaActivo = '';

    var sinAcentos = function (s) {
      return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    };
    filas.forEach(function (f) { f._texto = sinAcentos(f.getAttribute('data-buscar')); });

    function aplicar() {
      var q = sinAcentos(input.value.trim());
      var visibles = 0;
      filas.forEach(function (f) {
        var temas = (f.getAttribute('data-temas') || '').split('|');
        var ok = (!temaActivo || temas.indexOf(temaActivo) !== -1) && (!q || f._texto.indexOf(q) !== -1);
        f.hidden = !ok;
        if (ok) visibles++;
      });
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', String(c.getAttribute('data-tema') === temaActivo));
      });
      contador.textContent = visibles === 1 ? '1 reflexión' : visibles + ' reflexiones';
      if (vacio) vacio.hidden = visibles !== 0;
      var url = new URL(window.location.href);
      if (temaActivo) url.searchParams.set('tema', temaActivo); else url.searchParams.delete('tema');
      history.replaceState(null, '', url.pathname + url.search);
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var t = c.getAttribute('data-tema');
        temaActivo = temaActivo === t ? '' : t;
        aplicar();
      });
    });
    input.addEventListener('input', aplicar);
    if (limpiar) limpiar.addEventListener('click', function () { input.value = ''; temaActivo = ''; aplicar(); input.focus(); });

    var inicial = new URLSearchParams(window.location.search).get('tema');
    if (inicial) temaActivo = inicial;
    aplicar();
  }

  /* ---------- ¿Qué es la vida para ti? ---------- */
  var pregunta = $('[data-pregunta]');
  if (pregunta) {
    var respuestas = [
      'Quizás la vida no se define, se siente.',
      'La vida es aquello que ocurre mientras intentas entenderla.',
      'No hay una sola respuesta; cada mente escribe la suya.',
      'La vida no espera: se vive, incluso cuando no la comprendes.',
      'A veces la vida es solo silencio esperando ser escuchado.',
      'La vida es arriesgar cada minuto para que parezca que todo fue único.',
      'Cada día es un fragmento del infinito que fingimos entender.',
      'La vida es la pregunta que nadie responde, pero todos sienten.',
      'Tal vez la vida eres tú, intentando no rendirte hoy.'
    ];
    var campo = $('input', pregunta);
    var salida = $('[data-respuesta]');
    var ultima = -1;
    pregunta.addEventListener('submit', function (e) {
      e.preventDefault();
      salida.classList.remove('is-visible');
      void salida.offsetWidth;
      if (!campo.value.trim()) {
        salida.textContent = 'Antes de responderle a la vida, escúchate a ti mismo.';
      } else {
        var i;
        do { i = Math.floor(Math.random() * respuestas.length); } while (i === ultima && respuestas.length > 1);
        ultima = i;
        salida.textContent = '«' + respuestas[i] + '»';
      }
      salida.classList.add('is-visible');
    });
  }

  /* ---------- Comentarios (se cargan al acercarse) ---------- */
  var comentarios = $('[data-comentarios]');
  if (comentarios) {
    var cargar = function () {
      import('/assets/js/comentarios.js?v=' + (SITIO.v || '')).then(function (m) { m.iniciar(comentarios); }).catch(function () {
        var l = $('[data-lista]', comentarios);
        if (l) l.innerHTML = '<li class="c-empty">No se pudieron cargar los comentarios. Revisa tu conexión.</li>';
      });
    };
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { obs.disconnect(); cargar(); }
      }, { rootMargin: '600px 0px' });
      obs.observe(comentarios);
    } else {
      cargar();
    }
  }

  /* ---------- Cookies + Google Analytics ---------- */
  var consent = $('[data-consent]');
  function cargarAnalytics() {
    if (!SITIO.ga || window.gtag || location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + SITIO.ga;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', SITIO.ga, { anonymize_ip: true });
  }
  var decision = leer('cookies');
  if (decision === 'si') cargarAnalytics();
  else if (!decision && consent) consent.hidden = false;
  $$('[data-consent-choice]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-consent-choice');
      guardar('cookies', v);
      consent.hidden = true;
      if (v === 'si') cargarAnalytics();
    });
  });
  $$('[data-consent-open]').forEach(function (b) {
    b.addEventListener('click', function () { if (consent) consent.hidden = false; });
  });

  /* ---------- Avisos de nuevas reflexiones (OneSignal) ---------- */
  var botonesAvisos = $$('[data-avisos]');
  var bloquesAvisos = $$('[data-avisos-bloque]');
  var soportaPush = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  if (SITIO.onesignal && soportaPush && location.protocol === 'https:') {
    var mostrarAvisos = function (suscrito) {
      botonesAvisos.forEach(function (b) {
        b.hidden = false;
        var t = $('[data-avisos-texto]', b);
        if (t) t.textContent = suscrito ? 'Avisos activados' : 'Activar avisos';
        b.disabled = !!suscrito;
      });
      bloquesAvisos.forEach(function (b) { b.hidden = !!suscrito; });
    };
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    var s = document.createElement('script');
    s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    s.defer = true;
    document.head.appendChild(s);
    window.OneSignalDeferred.push(function (OneSignal) {
      return OneSignal.init({ appId: SITIO.onesignal, notifyButton: { enable: false }, autoResubscribe: true }).then(function () {
        var suscrito = function () { return OneSignal.User.PushSubscription.optedIn === true; };
        mostrarAvisos(suscrito());
        OneSignal.User.PushSubscription.addEventListener('change', function () { mostrarAvisos(suscrito()); });
        botonesAvisos.forEach(function (b) {
          b.addEventListener('click', function () {
            if (Notification.permission === 'denied') {
              toast('Tienes las notificaciones bloqueadas en tu navegador');
              return;
            }
            OneSignal.Notifications.requestPermission().then(function () {
              if (!suscrito()) return OneSignal.User.PushSubscription.optIn();
            }).then(function () {
              if (suscrito()) toast('Listo: te avisaré cuando haya una nueva reflexión');
            }).catch(function () {});
          });
        });
      });
    });
  }
})();
