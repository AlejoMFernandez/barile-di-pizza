/* Barile di Pizza · demo — intro, entradas, horno, carta, caja y álbum */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* demo: si la carta guardada en este navegador es de una versión vieja (sin precios), se vuelve a sembrar */
  try {
    var SEMILLA = 'precios-2026-10-22';
    if (localStorage.getItem('barile:semilla') !== SEMILLA) {
      localStorage.removeItem('kit:barile-di-pizza:v1');
      localStorage.removeItem('kit:barile-di-pizza:carrito');
      localStorage.setItem('barile:semilla', SEMILLA);
    }
  } catch (_) { /* sin storage: no pasa nada */ }

  /* ---------------- INTRO: la caja que se abre ---------------- */
  function listo() { html.classList.add('listo'); }
  if (!html.classList.contains('con-intro')) {
    listo();
  } else {
    var intro = $('#intro');
    var heroImg = $('.hero__foto img');
    var conTope = function (p, ms) { return Promise.race([p, new Promise(function (ok) { setTimeout(ok, ms); })]); };
    // 1) esperar las fuentes de la intro (máx. 0,9 s) para que no salte la letra
    var fuentes = document.fonts && document.fonts.load
      ? Promise.all([document.fonts.load('700 40px Caveat'), document.fonts.load('400 40px Marcellus'), document.fonts.load('500 16px "Work Sans"')]).catch(function () {})
      : Promise.resolve();
    var foto = new Promise(function (ok) {
      if (heroImg.complete) ok(); else { heroImg.addEventListener('load', ok, { once: true }); heroImg.addEventListener('error', ok, { once: true }); }
    }).then(function () { return heroImg.decode ? heroImg.decode().catch(function () {}) : null; });
    // espera también un momento libre del navegador: así la animación no compite con la carga inicial
    var libre = new Promise(function (ok) {
      var go = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 60); })(ok, { timeout: 450 }); };
      if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
    });
    conTope(Promise.all([fuentes, libre]), 1100).then(function () {
      requestAnimationFrame(function () { intro.classList.add('va'); window.__tVa = performance.now(); });
      var tVa = performance.now();
      // 2) la caja se abre cuando terminó de escribirse "Barile" y la foto del hero está lista (tope total 2,8 s)
      conTope(foto, 1400).then(function () {
        setTimeout(abrir, Math.max(0, 1550 - (performance.now() - tVa)));
      });
    });
    setTimeout(abrir, 3200);
    var abierta = false;
    function abrir() {
      if (abierta) return; abierta = true;
      requestAnimationFrame(function () {
        intro.classList.add('abre'); window.__tAbre = performance.now();
        setTimeout(listo, 280);            // el hero entra mientras la tapa todavía se abre
      });
      var fin = function () {
        if (!intro.isConnected) return;
        intro.remove(); html.classList.remove('con-intro');
      };
      intro.querySelector('.intro__mitad--abajo').addEventListener('transitionend', fin, { once: true });
      setTimeout(fin, 1300);
    }
  }

  /* ---------------- menú del celu ---------------- */
  var burger = $('#burger'), menu = $('#menu');
  function cerrarMenu() { menu.classList.remove('abierto'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); }
  burger.addEventListener('click', function () {
    var abre = !menu.classList.contains('abierto');
    menu.classList.toggle('abierto', abre); burger.setAttribute('aria-expanded', String(abre)); burger.setAttribute('aria-label', abre ? 'Cerrar menú' : 'Abrir menú');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-reservar]') && window.BARILE_KIT) window.BARILE_KIT.then(function (k) { k.reservas && k.reservas.abrir(); });
    if (e.target.closest('a, button')) cerrarMenu();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('abierto')) { cerrarMenu(); burger.focus(); } });

  /* ---------------- entradas al hacer scroll ---------------- */
  $$('.bloque').forEach(function (sec) {
    $$('.entra, .entra-polaroid', sec).forEach(function (el, i) { el.style.setProperty('--d', i); });
  });
  var animables = $$('.entra, .entra-foto, .entra-polaroid');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    animables.forEach(function (el) { io.observe(el); });
  } else {
    animables.forEach(function (el) { el.classList.add('visto'); });
  }

  /* ---------------- el horno: reloj + pizza que se cocina ---------------- */
  var marcas = $('.dial__marcas'), aguja = $('#aguja'), pizza = $('#hornoPizza'), horno = $('#horno');
  if (marcas) {
    var ns = 'http://www.w3.org/2000/svg', out = '';
    for (var v = 0; v <= 500; v += 50) {
      var a = (-125 + v / 500 * 250) * Math.PI / 180;
      var x1 = 100 + Math.sin(a) * 72, y1 = 100 - Math.cos(a) * 72, x2 = 100 + Math.sin(a) * 79, y2 = 100 - Math.cos(a) * 79;
      out += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
      if (v % 100 === 0) out += '<text x="' + (100 + Math.sin(a) * 58).toFixed(1) + '" y="' + (100 - Math.cos(a) * 58).toFixed(1) + '">' + v + '</text>';
    }
    marcas.innerHTML = out; void ns;
  }
  var pendiente = false;
  function pintarHorno() {
    pendiente = false;
    var r = horno.getBoundingClientRect(), vh = innerHeight;
    var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.6)));
    aguja.style.transform = 'rotate(' + (-125 + p * 225).toFixed(1) + 'deg)';
    pizza.style.opacity = Math.min(1, Math.max(0, (p - 0.45) / 0.3)).toFixed(3);
  }
  if (horno && !reduce) {
    addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(pintarHorno); } }, { passive: true });
    pintarHorno();
  } else if (pizza) { pizza.style.opacity = 1; aguja.style.transform = 'rotate(100deg)'; }

  /* ---------------- KIT: carta, pizarra, caja ---------------- */
  var ctx = null, productos = [], cats = [];
  var pizarra = $('#pizarraHero .pizarra__marco');

  function pintarPizarra() {
    var lineas = productos.filter(function (p) { return p.categoria === 'pizarra' && p.disponible !== false; });
    if (!lineas.length) return;
    var actual = $$('.tiza', pizarra).map(function (x) { return x.textContent; }).join('|');
    if (actual === lineas.map(function (p) { return p.nombre; }).join('|')) return;
    pizarra.innerHTML = lineas.map(function (p) { return '<p class="tiza">' + esc(p.nombre) + '</p>'; }).join('');
    $('#pizarraHero').setAttribute('aria-label', 'Pizarra: ' + lineas.map(function (p) { return p.nombre; }).join('. '));
  }

  var fotoAside = $('#cartaFoto img'), fotoTxt = $('#cartaFotoTxt'), fotoActual = '';
  function mostrarFoto(src, nombre) {
    if (!src || src === fotoActual) return;
    fotoActual = src;
    fotoAside.classList.add('cambia');
    var pre = new Image(); pre.src = src;
    var poner = function () { fotoAside.src = src; fotoTxt.textContent = nombre; requestAnimationFrame(function () { fotoAside.classList.remove('cambia'); }); };
    setTimeout(function () { if (pre.complete) poner(); else { pre.onload = poner; pre.onerror = poner; } }, 180);
  }

  function armarCarta(el) {
    var tabs = $$('.kit-tab', el), paneles = $$('.kit-carta__panel', el);
    tabs.forEach(function (tb) {
      if (tb.dataset.cat === 'pizarra') { tb.hidden = true; var pp = document.getElementById(tb.getAttribute('aria-controls')); if (pp) pp.dataset.oculto = '1'; }
    });
    var visibles = tabs.filter(function (tb) { return !tb.hidden; });
    if (visibles.length && $$('.kit-tab.is-on', el).every(function (tb) { return tb.hidden; })) visibles[0].click();
    visibles.forEach(function (tb, i) {
      var panel = document.getElementById(tb.getAttribute('aria-controls'));
      var n = $$('.kit-item', panel).length;
      if (!tb.querySelector('.n')) tb.insertAdjacentHTML('beforeend', '<span class="n">' + n + '</span>');
      panel.classList.add('entra-items');
      if (!panel.querySelector('.panel__cab')) {
        var nombre = tb.childNodes[0].textContent;
        var pedibles = $$('[data-kit-qty]', panel).length;
        panel.insertAdjacentHTML('afterbegin', '<div class="panel__cab"><h3>' + esc(nombre) + '</h3><span>' + n + (n === 1 ? ' opción' : ' opciones') +
          (pedibles ? ' · se piden para llevar' : ' · precios a confirmar') + '</span></div>');
        var ant = visibles[i - 1], sig = visibles[i + 1];
        panel.insertAdjacentHTML('beforeend', '<div class="panel__pie">' +
          (ant ? '<button type="button" data-ir="' + esc(ant.dataset.cat) + '">← ' + esc(ant.childNodes[0].textContent) + '</button>' : '') +
          (sig ? '<button type="button" data-ir="' + esc(sig.dataset.cat) + '">' + esc(sig.childNodes[0].textContent) + ' →</button>' : '') + '</div>');
      }
    });
    if (!el.dataset.armada) {
      el.dataset.armada = '1';
      el.addEventListener('click', function (e) {
        var ir = e.target.closest('[data-ir]');
        if (ir) {
          var tb = el.querySelector('.kit-tab[data-cat="' + ir.dataset.ir + '"]'); if (tb) tb.click();
          var top = $('#carta').getBoundingClientRect().top;
          if (top < -200) $('#carta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
          return;
        }
        var ver = e.target.closest('[data-ver]');
        if (ver) { abrirVisor(ver.dataset.ver, ver.dataset.nombre); return; }
        var tab = e.target.closest('.kit-tab');
        if (tab && innerWidth <= 980) { var lista = $('.carta__lista'); if (lista.getBoundingClientRect().top < 0) lista.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
      });
      // foto del plato al pasar el mouse (rAF para no trabar)
      var pend = null;
      el.addEventListener('pointerover', function (e) {
        if (e.pointerType === 'touch') return;
        var it = e.target.closest('.kit-item'); if (!it || pend === it) return;
        pend = it;
        requestAnimationFrame(function () {
          $$('.kit-item.activo', el).forEach(function (x) { x.classList.remove('activo'); });
          pend.classList.add('activo');
          if (pend.dataset.photo) mostrarFoto(pend.dataset.photo, pend.querySelector('.it__nombre').childNodes[0].textContent);
        });
      });
      el.addEventListener('focusin', function (e) {
        var it = e.target.closest('.kit-item'); if (it && it.dataset.photo) mostrarFoto(it.dataset.photo, it.querySelector('.it__nombre').childNodes[0].textContent);
      });
    }
  }

  /* visor de foto para el celu: se cierra con X, click afuera o Escape */
  var visor = null, focoPrevio = null;
  function abrirVisor(src, nombre) {
    focoPrevio = document.activeElement;
    visor = document.createElement('div');
    visor.className = 'visor'; visor.setAttribute('role', 'dialog'); visor.setAttribute('aria-modal', 'true'); visor.setAttribute('aria-label', nombre);
    visor.innerHTML = '<figure><button type="button" class="visor__x" aria-label="Cerrar">×</button><img src="' + esc(src) + '" alt="' + esc(nombre) + '"><figcaption>' + esc(nombre) + '</figcaption></figure>';
    document.body.appendChild(visor);
    requestAnimationFrame(function () { visor.classList.add('abierto'); visor.querySelector('.visor__x').focus(); });
    visor.addEventListener('click', function (e) { if (e.target === visor || e.target.closest('.visor__x')) cerrarVisor(); });
  }
  function cerrarVisor() {
    if (!visor) return; var v = visor; visor = null;
    v.classList.remove('abierto'); setTimeout(function () { v.remove(); }, 260);
    if (focoPrevio) focoPrevio.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && visor) cerrarVisor(); });

  /* la caja: el carrito como pila de cajas escritas a mano */
  var pila = $('#pila'), cantAnterior = {};
  function pintarPila() {
    if (!ctx || !ctx.carrito) return;
    var lineas = ctx.carrito.lineas, agrup = {};
    lineas.forEach(function (l) { agrup[l.id] = (agrup[l.id] || 0) + l.cant; });
    var ids = Object.keys(agrup);
    if (!ids.length) {
      pila.innerHTML = '<div class="cajita cajita--vacia"><span class="cajita__txt">Pizza: ____________</span><small>Tu caja está vacía: elegí algo de la carta.</small></div>';
      cantAnterior = {}; return;
    }
    var visibles = ids.slice(-5), extra = ids.length - visibles.length;
    pila.innerHTML = visibles.map(function (id) {
      var p = productos.find(function (x) { return x.id === id; }) || { nombre: id };
      var esPizza = p.categoria === 'clasicas' || p.categoria === 'casa';
      var nueva = (cantAnterior[id] || 0) < agrup[id] ? ' nueva' : '';
      return '<div class="cajita' + nueva + '"><img src="img/logo-cafe.png" alt="" width="939" height="365"><span class="cajita__txt">' + (esPizza ? 'Pizza: ' : '') + esc(esPizza ? p.nombre.replace(/^Pizza\s+/i, '') : p.nombre) + (agrup[id] > 1 ? ' <b>×' + agrup[id] + '</b>' : '') + '</span></div>';
    }).join('') + (extra ? '<div class="cajita cajita--mas">+ ' + extra + ' más en la caja</div>' : '');
    cantAnterior = agrup;
  }

  function pintarRapidos() {
    var box = $('#rapidos');
    var cands = ['barile', 'margherita', 'cherry-pesto'].map(function (id) { return productos.find(function (p) { return p.id === id && p.precio != null && p.disponible !== false; }); }).filter(Boolean);
    if (!cands.length) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '<span>Para arrancar:</span>' + cands.map(function (p) { return '<button type="button" data-kit-add="' + esc(p.id) + '">+ ' + esc(p.nombre) + '</button>'; }).join('');
  }

  function estadoHorno() {
    var chip = $('#estadoHorno'); if (!ctx || !chip) return;
    var e = ctx.abierto();
    chip.hidden = false;
    chip.classList.toggle('prendido', !!e.abierto);
    chip.textContent = e.abierto ? 'Horno prendido · hasta las ' + e.cierra : e.abre ? 'Prendemos el horno a las ' + e.abre : 'El horno descansa hasta mañana';
  }

  document.addEventListener('kit:carta', function (e) {
    productos = e.detail.productos || []; cats = e.detail.categorias || [];
    armarCarta(e.detail.el);
    pintarPizarra(); pintarRapidos(); pintarPila();
  });
  document.addEventListener('kit:carrito', pintarPila);
  document.addEventListener('kit:pedido', function () { setTimeout(pintarPila, 50); });
  document.addEventListener('kit:listo', function (e) {
    ctx = e.detail;
    if (ctx.carrito && ctx.carrito.listo) ctx.carrito.listo.then(pintarPila); else pintarPila();
    estadoHorno(); setInterval(estadoHorno, 60000);
  });
  pila && (pila.innerHTML = '<div class="cajita cajita--vacia"><span class="cajita__txt">Pizza: ____________</span><small>Tu caja está vacía: elegí algo de la carta.</small></div>');

  /* ---------------- MOMENTOS: el álbum que se pasa ---------------- */
  var album = $('#album');
  if (album) {
    var fotos = $$('.foto-album', album), orden = fotos.map(function (_, i) { return i; });
    var nTxt = $('#albumN');
    var rots = [-4, 3, -2, 5, -6, 2, -3, 4, -1, 3, -5];
    fotos.forEach(function (f, i) { f.style.setProperty('--rot', rots[i % rots.length] + 'deg'); });
    function acomodar() {
      orden.forEach(function (idx, pos) {
        var f = fotos[idx], paso = innerWidth < 600 ? 7 : 14;
        f.style.zIndex = String(fotos.length - pos);
        f.style.opacity = pos > 3 ? '0' : '1';
        f.style.transform = 'translate(calc(-50% + ' + (pos * paso) + 'px), calc(-50% + ' + (pos * 8) + 'px)) rotate(' + rots[idx % rots.length] + 'deg)';
        f.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
        $$('button', f).forEach(function (b) { b.tabIndex = pos === 0 ? 0 : -1; });
      });
      nTxt.textContent = (orden[0] + 1) + ' / ' + fotos.length;
    }
    function siguiente(dir) {
      var top = fotos[orden[0]];
      if (dir > 0) {
        top.style.transform = 'translate(calc(-50% + ' + (dir * 130) + '%), -60%) rotate(' + (dir * 18) + 'deg)';
        top.style.opacity = '0';
        setTimeout(function () { orden.push(orden.shift()); acomodar(); }, reduce ? 0 : 280);
      } else {
        orden.unshift(orden.pop());
        var nuevo = fotos[orden[0]];
        nuevo.style.transition = 'none'; nuevo.style.transform = 'translate(-180%, -60%) rotate(-18deg)'; nuevo.style.opacity = '0'; nuevo.style.zIndex = String(fotos.length + 1);
        void nuevo.offsetWidth; nuevo.style.transition = '';
        acomodar();
      }
    }
    $('#albumSig').addEventListener('click', function () { siguiente(1); });
    $('#albumAnt').addEventListener('click', function () { siguiente(-1); });
    album.tabIndex = 0;
    album.setAttribute('aria-label', 'Álbum de fotos. Usá las flechas para pasar.');
    album.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); siguiente(-1); } });

    var arr = null;
    album.addEventListener('pointerdown', function (e) {
      var f = e.target.closest('.foto-album'); if (!f || f !== fotos[orden[0]] || e.target.closest('button')) return;
      arr = { f: f, x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId, mov: false };
      f.setPointerCapture(e.pointerId); f.classList.add('arrastrando');
    });
    album.addEventListener('pointermove', function (e) {
      if (!arr || e.pointerId !== arr.id) return;
      arr.dx = e.clientX - arr.x;
      if (Math.abs(arr.dx) > 4) arr.mov = true;
      var rot = rots[orden[0] % rots.length] + arr.dx / 14;
      arr.f.style.transform = 'translate(calc(-50% + ' + arr.dx + 'px), calc(-50% + ' + ((e.clientY - arr.y) * 0.3) + 'px)) rotate(' + rot + 'deg)';
    });
    var soltar = function (e) {
      if (!arr || e.pointerId !== arr.id) return;
      var a = arr; arr = null; a.f.classList.remove('arrastrando');
      if (Math.abs(a.dx) > 90) siguiente(a.dx > 0 ? 1 : 1); else acomodar();
    };
    album.addEventListener('pointerup', soltar);
    album.addEventListener('pointercancel', soltar);
    acomodar();
  }
})();
