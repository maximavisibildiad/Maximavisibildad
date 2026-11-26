/* Mi Compraventa: app de una sola página. Usa calc.js (window.Calc). */
(function () {
  "use strict";
  const C = window.Calc;
  const params = new URLSearchParams(location.search);
  const LOCAL = location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const DEMO = LOCAL && params.get("demo") === "1";
  const FECHA_OK = /^\d{4}-\d{2}-\d{2}$/;
  const paramFecha = (k) => { const x = params.get(k); return x && FECHA_OK.test(x) ? x : null; };
  const pad = (n) => String(n).padStart(2, "0");
  const hoyLocal = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const HOY = DEMO ? (paramFecha("hoy") || "2026-11-25") : hoyLocal();
  const FB_CONFIG = {
    apiKey: "AIzaSyC3u2YQK4Wvn7Ub94PFvI_tmdL8AFx9cqc",
    authDomain: "growth-partner-37a25.firebaseapp.com",
    databaseURL: "https://growth-partner-37a25-default-rtdb.firebaseio.com",
    projectId: "growth-partner-37a25",
    appId: "1:513071811214:web:fb8e9acc5fac2a368e97df",
  };
  const FB_VER = "10.12.0";

  // ---------- textos literales ----------
  const T = {
    pausaTitulo: "Sin afán. Dios tiene el control.",
    pausaVers: "«El alma sin ciencia no es buena, y aquel que se apresura con los pies, peca.» (Proverbios 19:2)",
    pausaAntes: "Antes de pagar:",
    pausaPreg: [
      "¿Oré y estoy en paz, o me están presionando?",
      "¿Vi los papeles? (cédula, placa o serial, RUNT, multas, peritaje)",
      "¿El precio está bien frente a lo que vale de verdad?",
      "¿Tengo la plata sin endeudarme ni tocar la de la casa?",
    ],
    pausaFin: "Si alguna respuesta es no, se espera. El negocio que es, espera.",
    lucas: "«Porque ¿quién de vosotros, queriendo edificar una torre, no se sienta primero y calcula los gastos, a ver si tiene lo que necesita para acabarla?» (Lucas 14:28)",
    salmo: "«Estad quietos, y conoced que yo soy Dios.» (Salmo 46:10)",
    usura: "«El que aumenta sus riquezas con usura y crecido interés, para aquel que se compadece de los pobres las aumenta.» (Proverbios 28:8)",
    ovejas: "«Sé diligente en conocer el estado de tus ovejas, y mira con cuidado por tus rebaños.» (Proverbios 27:23)",
    peso: "«El peso falso es abominación a Jehová; mas la pesa cabal le agrada.» (Proverbios 11:1)",
    semana: "«Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.» (Proverbios 16:3)",
    topeRojo: "Esta tasa pasa el tope. Hable con el abogado antes de firmar",
    sinTraspaso: "No entregue el carro sin el traspaso radicado",
  };
  const esVeh = (t) => t === "Carro" || t === "Moto";

  // Iconos propios (trazo de 2 px, heredan el color del botón).
  const P = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  const SVG = {
    "🛒": P('<path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M12 11v6M9.5 14.5 12 17l2.5-2.5"/>'),
    "💰": P('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>'),
    "🧾": P('<path d="M6 3h12v18l-2.5-1.6L13 21l-2-1.6L9 21l-2.5-1.6L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    "🔁": P('<path d="M4 11a8 8 0 0 1 13.7-5.3L20 8"/><path d="M20 3v5h-5"/><path d="M20 13a8 8 0 0 1-13.7 5.3L4 16"/><path d="M4 21v-5h5"/>'),
    "📊": P('<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="7" rx=".6"/><rect x="10.5" y="7" width="3" height="11" rx=".6"/><rect x="15.5" y="4" width="3" height="14" rx=".6"/>'),
    "📦": P('<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>'),
    "⚙": P('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
    "⬅": P('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    "🏠": P('<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'),
    "🔑": P('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>'),
    "🚗": P('<path d="M3 16v-3l2.2-5.2A2 2 0 0 1 7 6.5h10a2 2 0 0 1 1.8 1.3L21 13v3"/><path d="M3 13h18"/><rect x="3" y="13" width="18" height="4" rx="1"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    "🏍": P('<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 10h5l4.5 6.5M14 10l-1.5-3H10M9 10l3 6.5h3"/>'),
    "🪙": P('<path d="M3 18h18l-3-8H6z"/><path d="M8 10l1.5-4h5L16 10"/>'),
    "⌚": P('<rect x="6" y="7" width="12" height="10" rx="3"/><path d="M8.5 7 9.5 3h5l1 4M8.5 17l1 4h5l1-4M12 10v2.5l1.5 1"/>'),
    "🏪": P('<path d="M4 9.5V20h16V9.5"/><path d="M3 9.5 5 4h14l2 5.5a2.5 2.5 0 0 1-4.5 1.3 2.5 2.5 0 0 1-4.5 0 2.5 2.5 0 0 1-4.5 0A2.5 2.5 0 0 1 3 9.5z"/><path d="M10 20v-5h4v5"/>'),
    "🆕": P('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'),
    "📆": P('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4"/>'),
    "✅": P('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>'),
    "💵": P('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>'),
    "📲": P('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10 18.5h4M9.5 10.5h5M12.5 8l2 2.5-2 2.5"/>'),
    "📷": P('<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>'),
    "⬇": P('<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>'),
    "❓": P('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1.9-1.1 1.7M12 17v.1"/>'),
    "✏": P('<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>'),
    "➕": P('<path d="M12 5v14M5 12h14"/>'),
    "🔍": P('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>'),
    "✔": P('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    "◀": P('<path d="M15 5l-7 7 7 7"/>'),
    "▶": P('<path d="M9 5l7 7-7 7"/>'),
    "⚠": P('<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>'),
  };
  SVG["🏍️"] = SVG["🏍"];
  function pintarIconos(root) {
    root.querySelectorAll(".ic").forEach((e) => { const k = e.textContent.trim(); if (SVG[k]) e.innerHTML = SVG[k]; });
  }
  const ICONO = { Carro: "🚗", Moto: "🏍️", Oro: "🪙", Reloj: "⌚", Otro: "📦" };

  // ---------- utilidades ----------
  const $app = document.getElementById("app");
  const $barra = document.getElementById("barra");
  const h = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (s) => document.querySelector(s);
  // Los negativos se dicen con palabras: «menos $X».
  const money = (n) => C.fmtPesos(n).replace(/^-\$/, "menos $");
  const miles = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const fmtDigits = (v) => (v == null || v === "" ? "" : "$ " + miles(v));
  const FOTO_PREFIJO = "data:image/jpeg;base64,";
  const fotoOk = (d) => typeof d === "string" && d.indexOf(FOTO_PREFIJO) === 0;
  const pct = (x) => C.fmtPct(x).replace(" %", "\u00A0%");
  const limpia = (o) => { const r = {}; Object.keys(o).forEach((k) => { if (o[k] !== undefined) r[k] = o[k]; }); return r; };

  // ---------- estado ----------
  let state = { config: {}, movimientos: [], bienes: {}, vehiculos: {}, retroventas: {} };
  let user = null;
  let Store = null;
  let authMsg = "";
  let reintento = false; // muestra «Intentar de nuevo» en el login tras un fallo de red
  let cur = "login";
  let stack = [];
  let ctx = {};
  let draft = nuevoDraft("Compra");
  let curForm = null;
  let datosListos = DEMO; // false hasta el primer evento "value" de la base
  let undoFn = null; // deshace lo último que se guardó, mientras siga en la pantalla «Guardado»
  let depth = 0;     // cuántas pantallas empujamos al historial del navegador
  let fantasmas = {};
  let fantasmaRet = {}; // fantasmas que tenían retroventa viva (no se puede limpiar: las reglas exigen sus campos) // bienes cuyos movimientos están todos anulados: no se muestran ni cuentan

  function nuevoDraft(modalidad) { return { modalidad, fotos: {}, pausa: null }; }

  // ---------- datos: demo en memoria ----------
  function demoStore() {
    let n = 100;
    const fotos = {};
    const D = {
      config: { cajaInicial: 10000000, umbralPausa: 2000000, topeTasaAnual: 0.2834 },
      movimientos: [
        { id: "m1", fecha: "2026-11-01", que: "Compra", codigo: "ABC12", valor: 4000000, medio: "Efectivo", pausa: "Sí", nota: "" },
        { id: "m2", fecha: "2026-11-03", que: "Gasto del bien", codigo: "ABC12", valor: 300000, medio: "Efectivo", nota: "Arreglo" },
        { id: "m3", fecha: "2026-11-16", que: "Venta", codigo: "ABC12", valor: 5000000, medio: "Transferencia", nota: "" },
        { id: "m4", fecha: "2026-11-05", que: "Retroventa (le di plata)", codigo: "O-001", valor: 1000000, medio: "Efectivo", nota: "" },
        { id: "m5", fecha: "2026-11-20", que: "Me recompraron", codigo: "O-001", valor: 1100000, medio: "Efectivo", nota: "" },
        { id: "m6", fecha: "2026-11-10", que: "Gasto del negocio", codigo: "", valor: 200000, medio: "Efectivo", nota: "Arriendo del local" },
        { id: "m7", fecha: "2026-11-10", que: "Compra", codigo: "XYZ99", valor: 2500000, medio: "Efectivo", pausa: "No", nota: "" },
      ],
      bienes: {
        ABC12: { tipo: "Moto", descripcion: "Pulsar 200 2019", modalidad: "Compra", fechaEntrada: "2026-11-01", vendedorNombre: "Pedro Gómez", vendedorCedula: "79123456", vendedorTelefono: "3001234567" },
        "O-001": { tipo: "Oro", descripcion: "12 g – 18k – cadena – 400.000", modalidad: "Retroventa", fechaEntrada: "2026-11-05", vendedorNombre: "Ana Pérez", vendedorCedula: "52111222", vendedorTelefono: "3109876543" },
        XYZ99: { tipo: "Carro", descripcion: "Mazda 3 2016", modalidad: "Compra", fechaEntrada: "2026-08-01", vendedorNombre: "Luis Torres", vendedorCedula: "80333444", vendedorTelefono: "3205550000" },
      },
      vehiculos: {
        ABC12: { marca: "Bajaj", linea: "Pulsar 200", modelo: "2019", ciudad: "Cali", runtVerificado: "Sí" },
        XYZ99: { marca: "Mazda", linea: "3", modelo: "2016", ciudad: "Cali", runtVerificado: "Sí" },
      },
      retroventas: { "O-001": { persona: "Ana Pérez", cedula: "52111222", telefono: "3109876543", fecha: "2026-11-05", leDi: 1000000, recompra: 1100000, vence: "2026-12-05" } },
    };
    // Solo demo: ?retroabierta=AAAA-MM-DD deja O-001 abierto con ese vencimiento (para probar plazos vencidos).
    if (paramFecha("retroabierta")) { D.movimientos = D.movimientos.filter((m) => m.id !== "m5"); D.retroventas["O-001"].vence = paramFecha("retroabierta"); }
    let cb = () => {};
    // state es una copia de D (así se pueden ocultar los bienes anulados sin perderlos).
    const sync = () => { state = { config: D.config, movimientos: D.movimientos.slice(), bienes: Object.assign({}, D.bienes), vehiculos: Object.assign({}, D.vehiculos), retroventas: Object.assign({}, D.retroventas) }; cb(); };
    const fusiona = (o, p) => { Object.keys(p).forEach((k) => { if (p[k] === null) delete o[k]; else o[k] = p[k]; }); return o; };
    sync();
    return {
      start(f) { cb = f; sync(); },
      async addMov(m) { const id = "d" + ++n; D.movimientos.push(Object.assign({ id }, m)); sync(); return id; },
      async updMov(id, p) { Object.assign(D.movimientos.find((m) => m.id === id), p); sync(); },
      async crearBien(c, o) { if (D.bienes[c]) return false; D.bienes[c] = limpia(o); sync(); return true; },
      async setBien(c, o) { D.bienes[c] = fusiona(D.bienes[c] || {}, o); sync(); },
      async setVeh(c, o) { D.vehiculos[c] = fusiona(D.vehiculos[c] || {}, o); sync(); },
      async setRet(c, o) { D.retroventas[c] = fusiona(D.retroventas[c] || {}, o); sync(); },
      async setConfig(p) {
        Object.keys(p).forEach((k) => {
          const ruta = k.split("/"); let o = D.config;
          for (let i = 0; i < ruta.length - 1; i++) o = o[ruta[i]] = o[ruta[i]] || {};
          const ult = ruta[ruta.length - 1];
          if (p[k] === null) delete o[ult]; else o[ult] = p[k];
        });
        sync();
      },
      async addFoto(c, f) { if (!fotoOk(f.data)) throw new Error("foto"); (fotos[c] = fotos[c] || []).push(Object.assign({ id: "f" + ++n }, f)); },
      async fotos(c) { return fotos[c] || []; },
    };
  }

  // ---------- datos: Firebase ----------
  function fbStore() {
    let db;
    const R = (p) => db.ref("compraventa/" + p);
    return {
      start(f) {
        db = firebase.database();
        R("").on("value", (s) => {
          const v = s.val() || {};
          state = {
            config: v.config || {},
            movimientos: Object.keys(v.movimientos || {}).map((id) => Object.assign({ id }, v.movimientos[id])),
            bienes: v.bienes || {}, vehiculos: v.vehiculos || {}, retroventas: v.retroventas || {},
          };
          datosListos = true;
          f();
        }, (e) => {
          console.warn("Lectura:", e);
          if (e && (e.code === "PERMISSION_DENIED" || /permission_denied/i.test(String(e.message || e)))) {
            authMsg = "Esta cuenta no tiene permiso. Pídale a Juan Pablo que la autorice."; user = null; stack = []; cur = "login";
            try { firebase.auth().signOut(); } catch (x) { console.warn(x); }
          } else { authMsg = "No hay conexión. Revise el internet e intente de nuevo."; reintento = true; cur = "login"; }
          render();
        });
      },
      async addMov(m) { const r = R("movimientos").push(); await r.set(limpia(m)); return r.key; },
      updMov(id, p) { return R("movimientos/" + id).update(limpia(p)); },
      async crearBien(c, o) {
        const r = await R("bienes/" + c).transaction((cur) => (cur === null ? limpia(o) : undefined));
        return r.committed;
      },
      setBien(c, o) { return R("bienes/" + c).update(limpia(o)); },
      setVeh(c, o) { return R("vehiculos/" + c).update(limpia(o)); },
      setRet(c, o) { return R("retroventas/" + c).update(limpia(o)); },
      setConfig(p) { return R("config").update(p); },
      addFoto(c, f) { if (!fotoOk(f.data)) return Promise.reject(new Error("foto")); return db.ref("compraventa_fotos/" + c).push().set(f); },
      async fotos(c) {
        const s = await db.ref("compraventa_fotos/" + c).once("value");
        const v = s.val() || {};
        return Object.keys(v).map((id) => Object.assign({ id }, v[id]));
      },
    };
  }

  // ---------- navegación ----------
  const LIVE = new Set(["inicio", "comovoy", "miscosas", "ficha", "avisos"]);
  function go(name, opts) {
    opts = opts || {};
    if (opts.reset) { stack = []; ctx = {}; if (opts.nuevoDraft !== false) draft = nuevoDraft("Compra"); }
    else if (cur && cur !== "login" && !opts.noPush) {
      stack.push(cur);
      try { history.pushState(null, "", "#" + name); depth++; } catch (e) { /* ok */ }
    }
    cur = name;
    render();
  }
  function atras() {
    readCur(); // lo que escribió no se pierde al devolverse
    cur = stack.length ? stack.pop() : "inicio";
    if (/confirmar$/.test(cur)) ctx.desdeConf = false;
    render();
  }
  let limpiando = false;
  function inicio() {
    cur = "inicio"; stack = []; ctx = {}; draft = nuevoDraft("Compra");
    // Vuelve al principio del historial para que el atrás del teléfono no reviva pantallas viejas.
    if (depth > 0) { const d = depth; depth = 0; limpiando = true; try { history.go(-d); } catch (e) { limpiando = false; } }
    try { history.replaceState(null, "", "#inicio"); } catch (e) { /* ok */ }
    render();
  }
  // Vuelve a la pantalla «¿Está bien así?» que quedó debajo en la pila. Si no hay, sigue al destino normal.
  function aConfirmar(destino) {
    ctx.desdeConf = false;
    let i = stack.length - 1;
    while (i >= 0 && !/confirmar$/.test(stack[i])) i--;
    if (i < 0) { go(destino); return; }
    cur = stack[i]; stack = stack.slice(0, i); render();
  }
  const siguiente = (destino) => (ctx.desdeConf ? aConfirmar(destino) : go(destino));
  window.addEventListener("popstate", () => {
    if (limpiando) { limpiando = false; try { history.replaceState(null, "", "#inicio"); } catch (e) { /* ok */ } return; }
    depth = Math.max(0, depth - 1);
    cierraModal();
    if (cur === "login" || cur === "cargando") return;
    atras();
  });

  // ---------- ventana propia (nunca alert ni confirm) ----------
  function cierraModal() { const m = document.getElementById("modal"); if (m) m.remove(); }
  function modal(titulo, texto, botones) {
    cierraModal();
    const d = document.createElement("div");
    d.id = "modal"; d.className = "modal"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
    d.innerHTML = '<div class="modal-hoja"><h2>' + h(titulo) + "</h2>" + (texto ? "<p>" + h(texto) + "</p>" : "") +
      botones.map((x) => '<button class="' + x.cls + '" data-act="' + x.act + '"' + (x.arg != null ? ' data-arg="' + h(x.arg) + '"' : "") + ">" + h(x.txt) + "</button>").join("") + "</div>";
    document.body.appendChild(d);
    const p = d.querySelector("button"); if (p) p.focus();
  }
  // ¿Hay algo escrito que se perdería al salir?
  function hayBorrador() {
    if (/^(c-|r-|pausa)/.test(cur)) return !!(draft.tipo || draft.valor || Object.keys(draft.fotos).length);
    if (/^v-/.test(cur)) return /^v-(medio|traspaso|confirmar)$/.test(cur) || !!(ctx.v && ctx.v.valor);
    if (/^g-/.test(cur)) return !!(ctx.g && (ctx.g.valor || ctx.g.nota));
    if (/^rv-/.test(cur)) return /^rv-(medio|fecha|confirmar|abogado)$/.test(cur) || !!(ctx.v && ctx.v.valor && ctx.rvTipo === "prorroga");
    if (cur === "ajustes") return !!ctx.aj && ajCambios().cambios.length > 0;
    return cur === "aj-confirmar";
  }

  // Color de acento según lo que está haciendo: cada flujo usa el color de su tecla del inicio.
  function flujoDe() {
    if (/^(rv-|r-)/.test(cur)) return "retro";
    if (/^(c-|pausa|espero)/.test(cur)) return draft.modalidad === "Retroventa" ? "retro" : "compre";
    if (/^v-/.test(cur)) return "vendi";
    if (/^g-/.test(cur)) return "gaste";
    return "";
  }
  const repinta = (id) => { const e = document.getElementById(id); if (e) pintarIconos(e); };
  function render(keep) {
    const f = SCREENS[cur] || SCREENS.inicio;
    curForm = null;
    const out = f();
    $app.innerHTML = typeof out === "string" ? out : out.html;
    if (cur !== "listo") undoFn = null;
    const conAtras = cur !== "inicio" && cur !== "login" && cur !== "cargando" && cur !== "listo";
    $app.dataset.flujo = flujoDe();
    $barra.hidden = !conAtras;
    $barra.innerHTML = conAtras
      ? '<div class="fila"><button class="atras" data-act="atras"><span class="ic">⬅</span> Atrás</button><button class="casa" data-act="inicio"><span class="ic">🏠</span> Inicio</button></div>' : "";
    pintarIconos($app); pintarIconos($barra);
    if (out.after) out.after();
    try { history.replaceState(null, "", "#" + cur); } catch (e) { /* ok */ }
    if (!keep) window.scrollTo(0, 0);
  }

  // ---------- formularios genéricos ----------
  function campoHTML(f, vals) {
    const v = vals[f.k];
    if (f.t === "opc") {
      return '<div class="f"><div class="lbl">' + h(f.label) + '</div><div class="seg' + (f.cols ? " c" + f.cols : "") + '">' +
        f.opts.map((o) => '<button type="button" class="' + (String(v) === String(o) ? "on" : "") + '" data-act="opc" data-k="' + f.k + '" data-v="' + h(o) + '">' + h(o) + "</button>").join("") + "</div></div>";
    }
    let tipo = "text", extra = "", val = v == null ? "" : v;
    if (f.t === "num") { extra = ' inputmode="numeric" data-num="1" class="dinero"'; val = fmtDigits(v); }
    else if (f.t === "dec") { extra = ' inputmode="decimal"'; val = v == null ? "" : String(v).replace(".", ","); }
    else if (f.t === "pct") { extra = ' inputmode="decimal"'; val = v == null || v === "" ? "" : (v * 100).toFixed(2).replace(".", ","); }
    else if (f.t === "date") { tipo = "date"; if (f.max) extra = ' max="' + h(f.max) + '"'; }
    else if (f.t === "tel") { extra = ' inputmode="tel"'; }
    else if (f.t === "ident") { extra = ' inputmode="numeric"'; }
    else if (f.upper) { extra = ' autocapitalize="characters" style="text-transform:uppercase"'; }
    if (f.t === "area") {
      return '<label class="f"><span class="lbl">' + h(f.label) + "</span>" + pistaHTML(f) + '<textarea name="' + f.k + '" rows="3" maxlength="500">' + h(val) + "</textarea></label>";
    }
    return '<label class="f"><span class="lbl">' + h(f.label) + "</span>" + pistaHTML(f) +
      '<input type="' + tipo + '" name="' + f.k + '" value="' + h(val) + '" autocomplete="off" maxlength="200"' + extra + "></label>";
  }
  // El ejemplo va como pista gris arriba del campo; el campo queda vacío.
  function pistaHTML(f) {
    const t = f.hint || (f.ph ? (/^Ejemplo/.test(f.ph) ? f.ph : "Ejemplo: " + f.ph) : "");
    return t ? '<span class="pista-campo">' + h(t) + "</span>" : "";
  }
  // Los campos con «g» se agrupan en tarjetas blancas con el título del grupo.
  function camposHTML(fields, vals) {
    curForm = { fields, vals };
    let x = "", abierto = null;
    fields.forEach((f) => {
      if ((f.g || null) !== abierto) { if (abierto) x += "</section>"; abierto = f.g || null; if (abierto) x += '<section class="grupo"><h2 class="gt">' + h(abierto) + "</h2>"; }
      x += campoHTML(f, vals);
    });
    return x + (abierto ? "</section>" : "");
  }
  function readCur() {
    if (!curForm) return;
    curForm.fields.forEach((f) => {
      if (f.t === "opc") return;
      const el = $app.querySelector('[name="' + f.k + '"]');
      if (!el) return;
      let v = el.value;
      if (f.t === "num") { v = v.replace(/\D/g, ""); v = v === "" ? null : Number(v); }
      else if (f.t === "dec") { v = v.replace(",", ".").trim(); v = v === "" || isNaN(v) ? null : Number(v); }
      else if (f.t === "pct") { v = v.replace(",", ".").trim(); v = v === "" || isNaN(v) ? null : Math.round(Number(v) * 100) / 10000; }
      else if (f.upper) v = C.limpiaPlaca(v);
      else if (f.t === "date") v = v || null;
      curForm.vals[f.k] = v;
    });
  }
  function err(msg) { const e = $("#err"); if (e) { e.textContent = msg || ""; if (msg) e.scrollIntoView({ block: "center" }); } }
  const sig = (act, txt, cls) => '<button class="' + (cls || "verde") + '" data-act="' + act + '">' + txt + "</button>";
  const GUARDAR = '<span class="ic">✔</span> Guardar';
  const verso = (t) => '<div class="versiculo">' + h(t) + "</div>";
  const pagina = (titulo, cuerpo, sub) => "<h1>" + h(titulo) + "</h1>" + (sub ? '<p class="sub">' + h(sub) + "</p>" : "") + cuerpo + '<div class="err" id="err"></div>';

  // ---------- pantallas ----------
  const SCREENS = {};
  const ONINPUT = {};

  SCREENS.login = () => pagina("Mi Compraventa", '<p class="sub">Para entrar, use su cuenta de Google.</p>' +
    (authMsg ? '<div class="caja rojo">' + h(authMsg) + "</div>" : "") +
    (reintento ? '<button data-act="reintentar"><span class="ic">↻</span> Intentar de nuevo</button>' : '<button data-act="entrar"><span class="ic">🔑</span> Entrar con Google</button>'));

  SCREENS.cargando = () => '<div class="cargando">Cargando…</div>';

  SCREENS.inicio = () => {
    const a = C.avisos(state, HOY);
    const hora = new Date().getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
    const lunes = new Date(HOY + "T12:00:00").getDay() === 1;
    const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const d = new Date(HOY + "T12:00:00");
    const fechaTxt = DIAS[d.getDay()].replace(/^./, (c) => c.toUpperCase()) + " " + d.getDate() + " de " + MESES[d.getMonth()];
    let x = "";
    if (DEMO) x += '<span class="demo">Modo demo: datos de prueba</span>';
    x += '<div class="franja"><button class="ajustes" data-go="ajustes" aria-label="Ajustes"><span class="ic">⚙</span></button>' +
      '<div class="fecha">' + fechaTxt + '</div><div class="hola">' + saludo + "</div>" +
      (state.config.cajaInicial == null ? '<div class="cajalbl">Anote en Ajustes la plata que tenía al empezar para ver su caja.</div>'
        : '<div class="cajalbl">Plata en efectivo que debe haber en el cajón</div><div class="cajanum' + (C.cajaEsperada(state) < 0 ? " neg" : "") + '">' + money(C.cajaEsperada(state)) + "</div>" +
          '<div class="cajalbl" style="opacity:.75;margin-top:4px">Según lo que usted ha anotado. El viernes cuéntela en ¿Cómo voy?</div>' +
          (C.cajaEsperada(state) < 0 ? '<div class="cajalbl">Según lo anotado, la caja quedó en menos. Revise en Ajustes cuánta plata tenía al empezar.</div>' : "")) + "</div>";
    const hoyN = C.lista(state.movimientos).filter((m) => m.fecha === HOY).length;
    if (hoyN > 0) x += '<button class="hoyl" data-go="hoy">Hoy anotó ' + hoyN + (hoyN === 1 ? " cosa" : " cosas") + ' · <u>Ver</u></button>';
    if (state.config.cajaInicial == null && !DEMO)
      x += '<button class="aviso oro" data-go="ajustes"><span class="ic">⚠</span> Falta anotar cuánta plata en efectivo tenía al empezar. Toque aquí.</button>';
    if (a.total > 0)
      x += '<button class="aviso ' + (a.items.some(urgente) ? "" : "oro") + '" data-go="avisos"><span class="ic">⚠</span> Hoy tiene ' + a.total + (a.total === 1 ? " aviso" : " avisos") + ". Toque para verlos.</button>";
    if (lunes) x += verso(T.semana);
    const tecla = (cls, attr, ic, t, pista, espera) => '<button class="gigante ' + cls + '" ' + (espera && !datosListos ? "disabled " : "") + attr + '><span class="ic">' + ic + '</span><span class="txt">' + t + '<span class="pista">' + (espera && !datosListos ? "Cargando sus datos…" : pista) + "</span></span></button>";
    x += tecla("c-compre", 'data-act="nuevaCompra"', "🛒", "Compré", "Carro, moto, oro, reloj u otra cosa", true);
    x += tecla("c-vendi", 'data-go="v-lista"', "💰", "Vendí", "Algo que tenía guardado");
    x += tecla("c-gaste", 'data-go="g-donde"', "🧾", "Gasté", "Arreglos, el local o la casa");
    x += tecla("c-retro", 'data-go="rv-menu"', "🔁", "Retroventa", "Nueva, prórroga o recompra", true);
    x += '<div class="fila"><button class="claro cuadro" data-go="comovoy"><span class="ic">📊</span> ¿Cómo voy?</button><button class="claro cuadro" data-go="miscosas"><span class="ic">📦</span> Mis cosas</button></div>';
    x += '<button class="claro" data-go="ayuda"><span class="ic">❓</span> ¿Cómo se usa?</button>';
    return x;
  };

  // --- lo anotado hoy ---
  SCREENS.hoy = () => {
    const ms = C.lista(state.movimientos).filter((m) => m.fecha === HOY);
    return "<h1>Lo que anotó hoy</h1>" + (ms.length ? ms.map((m) => {
      const abre = m.codigo && state.bienes[m.codigo];
      return '<button class="tarjeta btn" ' + (abre ? 'data-act="ficha" data-arg="' + h(m.codigo) + '"' : "") + '><div class="t">' + h(m.que) + (m.codigo ? " · " + h(m.codigo) : "") + '</div><div class="s">' + h(money(m.valor)) + " · " + h(m.medio || "") + (m.nota ? " · " + h(m.nota) : "") + "</div></button>";
    }).join("") : '<div class="caja gris">Hoy todavía no ha anotado nada.</div>');
  };

  // --- avisos ---
  const urgente = (i) => /^(vence|traspaso|tope):/.test(i.clave); // lo que pide actuar ya va en rojo
  const revisable = (i) => !/^(vence|traspaso):/.test(i.clave); // traspaso y vencimiento no se pueden descartar
  const avisoHTML = (i) => {
    const abre = i.codigo && state.bienes[i.codigo];
    return '<div class="aviso-bloque"><button class="tarjeta btn av ' + (urgente(i) ? "av-rojo" : "av-oro") + '" ' + (abre ? 'data-act="ficha" data-arg="' + h(i.codigo) + '"' : "") + '><div class="t"><span class="ic">⚠</span>' + h(i.titulo) + (i.codigo ? " · " + h(i.codigo) : "") + '</div><div class="s">' + h(i.texto) + "</div></button>" +
      (revisable(i) ? '<button class="claro" data-act="revisado" data-arg="' + h(i.clave) + '">Ya lo revisé</button>' : "") + "</div>";
  };
  SCREENS.avisos = () => {
    const a = C.avisos(state, HOY);
    let x = "<h1>Avisos de hoy</h1>";
    if (!a.items.length) x += '<div class="caja verde"><span class="gr"><span class="ic">✔</span> Todo en orden</span>No hay avisos hoy.</div>';
    x += a.items.map(avisoHTML).join("");
    return x + '<div class="err" id="err"></div>';
  };

  // --- COMPRÉ ---
  SCREENS["c-tipo"] = () => {
    const retro = draft.modalidad === "Retroventa";
    return pagina(retro ? "Retroventa: ¿qué le dejan?" : "¿Qué compró?", C.TIPOS.map((t) =>
      '<button class="gigante ' + (retro ? "c-retro" : "c-compre") + ' alto" data-act="tipo" data-arg="' + t + '"><span class="ic">' + ICONO[t] + "</span> " + t + "</button>").join(""));
  };
  function camposDesc(t) {
    if (esVeh(t)) return [
      { k: "placa", label: "Placa", t: "text", upper: true, ph: "ABC123" },
      { k: "marca", label: "Marca", t: "text", ph: "Ejemplo: Bajaj" },
      { k: "linea", label: "Línea", t: "text", ph: "Ejemplo: Pulsar 200" },
      { k: "modelo", label: "Modelo (año)", t: "ident", ph: "2019" }];
    if (t === "Oro") return [
      { k: "gramos", label: "¿Cuántos gramos pesa?", t: "dec", ph: "12" },
      { k: "kilates", label: "¿De cuántos kilates?", t: "opc", opts: ["10", "14", "18", "24"], cols: 4 },
      { k: "forma", label: "¿Es joya o chatarra?", t: "opc", opts: ["Joya", "Chatarra"] },
      { k: "precioGramo", label: "Precio del gramo de oro puro hoy", t: "num" }];
    if (t === "Reloj") return [
      { k: "marca", label: "Marca", t: "text" }, { k: "referencia", label: "Referencia", t: "text" },
      { k: "serie", label: "Serie", t: "text" }, { k: "cajaPapeles", label: "¿Trae caja y papeles?", t: "opc", opts: ["Sí", "No"] }];
    return [{ k: "descripcion", label: "Describa qué es y su serial si tiene", t: "area" }];
  }
  function refOro(d) { return C.valorOro(d.gramos, d.kilates, d.precioGramo); }
  SCREENS["c-desc"] = () => {
    const t = draft.tipo;
    let x = camposHTML(camposDesc(t), draft);
    if (t === "Oro") x += '<div class="caja gris" id="oroRef">' + oroRefTxt() + "</div>" + verso(T.peso);
    return pagina(esVeh(t) ? "¿Cuál es la placa?" : t === "Oro" ? "Cuénteme del oro" : t === "Reloj" ? "Cuénteme del reloj" : "¿Qué es?", x + sig("cDescNext", "Siguiente →"));
  };
  function oroRefTxt() {
    const v = refOro(draft);
    return v > 0 ? '<span class="gr">' + money(v) + "</span>Valor de referencia (gramos × kilates ÷ 24 × precio del gramo puro)" : "Cuando escriba los datos, aquí sale el valor de referencia.";
  }
  ONINPUT["c-desc"] = () => {
    if (draft.tipo !== "Oro") return;
    readCur();
    const e = $("#oroRef"); if (e) e.innerHTML = oroRefTxt();
  };
  function descText(d) {
    if (d.tipo === "Oro") return String(d.gramos).replace(".", ",") + " g – " + d.kilates + "k – " + String(d.forma || "").toLowerCase() + " – " + miles(d.precioGramo);
    if (esVeh(d.tipo)) return [d.marca, d.linea, d.modelo].filter(Boolean).join(" ") || d.placa;
    if (d.tipo === "Reloj") return [d.marca, d.referencia, d.serie, "caja y papeles " + (d.cajaPapeles === "Sí" ? "sí" : "no")].filter(Boolean).join(" – ");
    return d.descripcion || "";
  }
  SCREENS["c-valor"] = () => {
    const retro = draft.modalidad === "Retroventa";
    let x = camposHTML([{ k: "valor", label: "Valor", t: "num" }], draft);
    if (draft.tipo === "Oro" && refOro(draft) > 0)
      x += '<button class="claro" data-act="usarRef">Usar el valor de referencia: ' + money(refOro(draft)) + "</button>";
    return pagina(retro ? "¿Cuánto le da?" : "¿Cuánto pagó?", x + sig("cValorNext", "Siguiente →"));
  };
  SCREENS.pausa = () => pagina("Antes de pagar", '<div class="pausa"><div class="grande">' + h(T.pausaTitulo) + "</div><div>" + h(T.pausaVers) + "</div>" +
    '<p><b>' + h(T.pausaAntes) + "</b></p><ol>" + T.pausaPreg.map((q) => "<li>" + h(q) + "</li>").join("") + "</ol><p><b>" + h(T.pausaFin) + "</b></p></div>" +
    sig("pausaSi", "Sí, estoy en paz") + sig("pausaNo", "Mejor espero", "gris") +
    avisoCaja(draft.valor, "Esta compra") + '<p class="muted">Compra de ' + h(money(draft.valor)) + ". " + h(T.lucas) + "</p>");
  SCREENS.espero = () => "<h1>Muy bien. Se espera.</h1>" + verso(T.salmo) + '<p class="sub">No se guardó nada. El negocio que es, espera.</p>' + sig("inicio", "Volver al inicio", "marron");
  SCREENS["c-vendedor"] = () => pagina("¿Quién se lo vendió?", camposHTML([
    { k: "vendedorNombre", label: "Nombre completo", t: "text" },
    { k: "vendedorCedula", label: "Cédula", t: "ident" },
    { k: "vendedorTelefono", label: "Teléfono", t: "tel" }], draft) + sig("cVendNext", "Siguiente →"));
  SCREENS["c-fotos"] = () => {
    const sl = (tipo, txt) => '<div class="f"><div class="lbl">' + txt + "</div>" +
      (fotoOk(draft.fotos[tipo]) ? '<div class="fotos"><img src="' + h(draft.fotos[tipo]) + '" alt=""></div>' : "") +
      '<div class="foto-btn"><button class="claro" type="button"><span class="ic">📷</span> ' + (draft.fotos[tipo] ? "Tomar otra" : "Tomar foto") + '</button><input type="file" accept="image/*" capture="environment" data-foto="' + tipo + '"></div></div>';
    const completo = draft.fotos.bien && draft.fotos.cedula;
    return pagina("Fotos", sl("bien", "Foto de lo que compró") + sl("cedula", "Foto de la cédula de quien vende") +
      '<div id="fotoMsg" class="muted"></div>' + sig("cFotosNext", completo ? "Siguiente →" : "Saltar por ahora (queda un aviso)", completo ? "verde" : "gris"));
  };
  SCREENS["c-medio"] = () => pagina("¿Cómo pagó?", medioBtns("cMedio"), draft.modalidad === "Retroventa" ? "El dinero que le da a la persona." : "");
  const COLOR_MEDIO = { cMedio: "c-compre", vMedio: "c-vendi", gMedio: "c-gaste", rvMedio: "c-retro" };
  const medioBtns = (act) => ["Efectivo", "Transferencia"].map((m) => '<button class="gigante ' + (COLOR_MEDIO[act] || "") + ' alto" data-act="' + act + '" data-arg="' + m + '"><span class="ic">' + (m === "Efectivo" ? "💵" : "📲") + "</span> " + m + "</button>").join("");
  const camposPapeles = [
    { g: "Documentos", k: "ciudad", label: "Ciudad de matrícula", t: "text" },
    { g: "Documentos", k: "runtVerificado", label: "¿Verificó en el RUNT que el vendedor es el dueño?", t: "opc", opts: ["Sí", "No"] },
    { g: "Documentos", k: "soatVence", label: "¿Cuándo vence el SOAT?", t: "date" },
    { g: "Documentos", k: "tecnoVence", label: "¿Cuándo vence la tecnomecánica?", t: "date" },
    { g: "Impuestos y multas", k: "impuestosAlDia", label: "¿Los impuestos están al día?", t: "opc", opts: ["Sí", "No"] },
    { g: "Impuestos y multas", k: "debeImpuestos", label: "¿Cuánto debe de impuestos?", t: "num" },
    { g: "Impuestos y multas", k: "multas", label: "¿Cuánto debe en multas?", t: "num" },
    { g: "Peritaje", k: "peritaje", label: "Quién lo hizo y qué dijo", t: "area" }];
  SCREENS["c-papeles"] = () => pagina("Papeles del vehículo",
    camposHTML(camposPapeles, draft.veh = draft.veh || {}) + sig("cPapelesNext", "Siguiente →") + sig("cPapelesNext", "Lo lleno después", "gris"));
  SCREENS["r-recompra"] = () => pagina("¿Cuánto le devuelven por recuperarlo?", camposHTML([{ k: "recompra", label: "Valor de recompra", t: "num" }], draft) + sig("rRecNext", "Siguiente →"));
  const chipsFecha = (base) => '<div class="seg">' + [30, 60, 90].map((n) => '<button type="button" data-act="chipFecha" data-arg="' + h(base) + "|" + n + '">+' + n + " días</button>").join("") + "</div>";
  SCREENS["r-vence"] = () => pagina("¿Hasta qué fecha puede recomprar?", camposHTML([{ k: "vence", label: "Fecha en que vence", t: "date" }], draft) +
    chipsFecha(HOY) + '<div id="tasaBox">' + tasaBox(draft.valor, draft.recompra, HOY, draft.vence) + "</div>" + sig("rVenceNext", "Siguiente →"));
  ONINPUT["r-vence"] = () => { readCur(); const e = $("#tasaBox"); if (e) e.innerHTML = tasaBox(draft.valor, draft.recompra, HOY, draft.vence); };
  function tasaBox(leDi, recompra, fecha, vence) {
    const t = C.tasaAnual(leDi, recompra, fecha, vence);
    if (t == null) return "";
    const s = C.semaforo(t, state.config.topeTasaAnual);
    const cls = { ROJO: "rojo", AMARILLO: "amar", VERDE: "verde" }[s] || "gris";
    let x = '<div class="caja ' + cls + '"><span class="gr">Tasa al año: ' + pct(t) + '</span><span class="gr" style="display:block">≈ ' + pct(C.tasaMensual(t)) + " al mes</span>Semáforo: " + (s === "Falta tope" ? "Falta el tope (pregunte al abogado)" : s);
    if (s === "ROJO") x += '<div style="font-size:1.3rem;margin-top:8px">' + h(T.topeRojo) + '</div><div style="font-weight:400;font-style:italic;margin-top:8px">' + h(T.usura) + "</div>";
    return x + "</div>";
  }
  // --- confirmación común («¿Está bien así?»): cada fila lleva a su pantalla ---
  const filaConf = (lbl, val, scr) => '<button class="claro filaconf" data-act="irA" data-arg="' + scr + '"><span class="k">' + h(lbl) + '</span><span class="v' + (val === "(falta)" ? " falta" : "") + '">' + (val === "(falta)" ? "Falta" : h(val)) + "</span></button>";
  function fechaMov() { return ctx.fechaSel === "ayer" ? C.addDias(HOY, -1) : ctx.fechaSel === "otro" ? ctx.fechaOtro : HOY; }
  function validaFecha() {
    const f = fechaMov();
    if (!f) return "Escoja el día en que fue.";
    if (C.diasEntre(HOY, f) > 0) return "El día no puede ser después de hoy.";
    return "";
  }
  function fechaHTML() {
    const sel = ctx.fechaSel || "hoy";
    const b = (id, t) => '<button type="button" class="' + (sel === id ? "on" : "") + '" data-act="fechaSel" data-arg="' + id + '">' + t + "</button>";
    return '<div class="f"><div class="lbl">Fecha</div><div class="seg">' + b("hoy", "Hoy") + b("ayer", "Ayer") + b("otro", "Otro día") + "</div></div>" +
      (sel === "otro" ? camposHTML([{ k: "fechaOtro", label: "¿Qué día fue?", t: "date", max: HOY }], ctx) : "");
  }
  function avisoCaja(valor, quien) {
    const esp = C.cajaEsperada(state);
    if (state.config.cajaInicial == null || !(Number(valor) > esp)) return "";
    return '<div class="caja amar">Según lo anotado, en caja hay ' + h(money(esp)) + ". " + quien + " es de " + h(money(valor)) + ".</div>";
  }
  const confirmaPagina = (filas, extra, botones) => "<h1>¿Está bien así?</h1>" + filas.map((f) => filaConf(f[0], f[1], f[2])).join("") + fechaHTML() + extra + '<div id="err" class="err"></div>' + botones;

  SCREENS["c-confirmar"] = () => {
    const d = draft, retro = d.modalidad === "Retroventa", v = d.veh || {};
    const falta = [];
    if (!d.vendedorNombre) falta.push("nombre de quien vende");
    if (!d.vendedorCedula) falta.push("cédula");
    if (!d.fotos.bien) falta.push("foto del bien");
    if (!d.fotos.cedula) falta.push("foto de la cédula");
    const fl = (x) => x || "(falta)";
    const filas = [["Qué es", d.tipo + (esVeh(d.tipo) ? " " + d.placa : ""), "c-desc"], ["Detalle", descText(d), "c-desc"], [retro ? "Le da" : "Pagó", money(d.valor), "c-valor"]];
    if (retro) filas.push(["Le devuelven", money(d.recompra), "r-recompra"], ["Vence", C.fmtFecha(d.vence), "r-vence"]);
    filas.push(["Pagó con", d.medio, "c-medio"], ["Vendedor", fl(d.vendedorNombre), "c-vendedor"], ["Cédula", fl(d.vendedorCedula), "c-vendedor"],
      ["Fotos", d.fotos.bien && d.fotos.cedula ? "Las 2 fotos" : "Faltan fotos", "c-fotos"]);
    if (esVeh(d.tipo)) filas.push(["Dueño en RUNT", fl(v.runtVerificado), "c-papeles"], ["SOAT vence", fl(C.fmtFecha(v.soatVence)), "c-papeles"], ["Tecnomecánica vence", fl(C.fmtFecha(v.tecnoVence)), "c-papeles"], ["Multas", v.multas == null ? "(falta)" : money(v.multas), "c-papeles"]);
    if (d.pausa) filas.push(["Pausa", "Sí, en paz", "pausa"]);
    let extra = "";
    let rojo = false;
    if (retro) {
      const f = fechaMov() || HOY;
      extra += tasaBox(d.valor, d.recompra, f, d.vence);
      rojo = C.semaforo(C.tasaAnual(d.valor, d.recompra, f, d.vence), state.config.topeTasaAnual) === "ROJO";
    }
    if (d.medio === "Efectivo") extra += avisoCaja(d.valor, "Esta compra");
    if (falta.length) extra += '<div class="caja amar">Falta: ' + h(falta.join(", ")) + ".<br>Quedará anotado como pendiente.</div>";
    return confirmaPagina(filas, extra, rojo ? sig("noFirmar", "No firmar todavía", "marron") + sig("abogadoPantalla", "El abogado ya lo aprobó", "claro") : sig("guardarCompra", GUARDAR));
  };
  SCREENS["r-abogado"] = () => pagina("¿El abogado ya lo aprobó?", tasaBox(draft.valor, draft.recompra, fechaMov() || HOY, draft.vence) + verso(T.usura) +
    '<p class="sub">Solo toque el botón si el abogado vio esta tasa y dijo que se puede firmar.</p>' + sig("abogadoSi", "Sí, lo aprobó el abogado", "verde"));

  // --- VENDÍ ---
  // modo: "venta" (solo lo que está en inventario), "tengo" (lo que tiene) o "todo"
  function listaBienes(modo, q) {
    const bc = C.bienesCalc(state, HOY);
    q = (q || "").toLowerCase();
    const vencida = (b) => b.estado === "En retroventa" && !!(state.retroventas[b.codigo] && state.retroventas[b.codigo].vence && state.retroventas[b.codigo].vence < HOY);
    const ok = (b) => modo === "venta" ? (b.estado === "En inventario" || vencida(b)) : modo === "tengo" ? (b.estado === "En inventario" || b.estado === "En retroventa") : true;
    return Object.keys(bc).map((k) => bc[k]).filter((b) => ok(b) && (!q || (b.codigo + " " + b.descripcion + " " + b.tipo).toLowerCase().includes(q)))
      .sort((a, b) => (b.dias || 0) - (a.dias || 0));
  }
  const buscador = () => '<div class="buscar"><span class="ic">🔍</span><input name="q" placeholder="Buscar por placa o nombre" value="' + h(ctx.q || "") + '" autocomplete="off" aria-label="Buscar por placa o nombre"></div>';
  function tarjetasBienes(lista, act) {
    if (!lista.length) return '<div class="caja gris">No hay nada que mostrar.</div>';
    const hace = (d) => (d == null ? "" : d === 0 ? " · hoy" : " · hace " + d + (d === 1 ? " día" : " días"));
    return lista.map((b) => '<button class="tarjeta btn bien" data-act="' + act + '" data-arg="' + h(b.codigo) + '"><span class="ic tipo">' + (ICONO[b.tipo] || "") + '</span><span class="cuerpo"><span class="t">' + h(b.codigo) + " · " + h(b.tipo) +
      '</span><span class="nom">' + h(b.descripcion) + '</span><span class="s">Pagó ' + h(money(b.pague)) + h(hace(b.dias)) + " · " + h(b.estado) + '</span></span><span class="ic ir">▶</span></button>').join("");
  }
  SCREENS["v-lista"] = () => "<h1>¿Qué vendió?</h1>" + '' + buscador() + '<div id="lista">' +
    tarjetasBienes(listaBienes("venta", ctx.q), "vPick") + "</div>";
  ONINPUT["v-lista"] = () => { ctx.q = $("[name=q]").value; $("#lista").innerHTML = tarjetasBienes(listaBienes("venta", ctx.q), "vPick"); repinta("lista"); };
  const retroVencida = (k) => { const r = state.retroventas[k], b = state.bienes[k]; return b && r && r.vence && r.vence < HOY && C.bienCalc(k, b, state.movimientos, HOY).estado === "En retroventa" ? r : null; };
  SCREENS["v-plazo"] = () => { const r = retroVencida(ctx.codigo) || {}; return pagina("Antes de vender", '<div class="caja amar">El plazo de recompra de ' + h(r.persona || "la persona") + " venció el " + h(C.fmtFecha(r.vence)) + ". Confirme con el abogado antes de vender.</div>" +
    sig("vPlazoSi", "Seguir con la venta", "verde") + sig("atras", "Volver", "gris"), ctx.codigo + " · " + (state.bienes[ctx.codigo] || {}).descripcion); };
  SCREENS["v-valor"] = () => pagina("¿Cuánto le pagaron?", camposHTML([{ k: "valor", label: "Valor de la venta", t: "num" }], ctx.v = ctx.v || {}) + sig("vValorNext", "Siguiente →"), ctx.codigo + " · " + (state.bienes[ctx.codigo] || {}).descripcion);
  SCREENS["v-medio"] = () => pagina("¿Cómo le pagaron?", medioBtns("vMedio"));
  SCREENS["v-traspaso"] = () => pagina("¿Ya quedó radicado el traspaso?", '<p class="sub">Antes de entregar un vehículo, el traspaso debe estar firmado y radicado.</p>' +
    sig("vTras", "Sí, ya está radicado", "verde") + '<button class="claro" data-act="vTrasNo">No todavía</button>');
  SCREENS["v-confirmar"] = () => {
    const b = state.bienes[ctx.codigo] || {};
    const filas = [["Qué vendió", ctx.codigo + " · " + (b.descripcion || ""), "v-lista"], ["Le pagaron", money(ctx.v.valor), "v-valor"], ["Pagó con", ctx.medio, "v-medio"]];
    if (esVeh(b.tipo)) filas.push(["Traspaso radicado", ctx.traspaso === true ? "Sí" : ctx.traspaso === false ? "No todavía" : "(falta)", "v-traspaso"]);
    let extra = "";
    if (esVeh(b.tipo) && ctx.traspaso === false) extra += '<div class="caja rojo">' + h(T.sinTraspaso) + "</div>";
    return confirmaPagina(filas, extra, sig("vGuardar", GUARDAR));
  };
  SCREENS["v-listo"] = () => ctx.listoHtml;

  // --- GASTÉ ---
  SCREENS["g-donde"] = () => pagina("¿En qué gastó?",
    '<button class="gigante c-gaste alto" data-act="gDonde" data-arg="bien"><span class="ic">🚗</span> En un bien</button>' +
    '<button class="gigante c-gaste alto" data-act="gDonde" data-arg="negocio"><span class="ic">🏪</span> En el negocio</button>' +
    '<button class="gigante c-gaste alto" data-act="gDonde" data-arg="casa"><span class="ic">🏠</span> Para la casa (mi sueldo)</button>');
  SCREENS["g-bien"] = () => "<h1>¿En cuál bien?</h1>" + '' + buscador() + '<div id="lista">' + tarjetasBienes(listaBienes("todo", ctx.q), "gBien") + "</div>";
  ONINPUT["g-bien"] = () => { ctx.q = $("[name=q]").value; $("#lista").innerHTML = tarjetasBienes(listaBienes("todo", ctx.q), "gBien"); repinta("lista"); };
  SCREENS["g-valor"] = () => pagina("¿Cuánto gastó?", camposHTML([{ k: "valor", label: "Valor", t: "num" }], ctx.g) + sig("gValorNext", "Siguiente →"));
  SCREENS["g-que"] = () => pagina("¿En qué?", camposHTML([{ k: "nota", label: "Cuente en pocas palabras", t: "text", ph: "Ejemplo: arreglo del motor" }], ctx.g) +
    '<div class="seg">' + ["Arreglo", "Papeles", "Gasolina", "Lavada", "Arriendo", "Servicios"].map((c) => '<button type="button" class="' + (ctx.g.nota === c ? "on" : "") + '" data-act="gChip" data-arg="' + c + '">' + c + "</button>").join("") + "</div>" + sig("gQueNext", "Siguiente →"));
  SCREENS["g-medio"] = () => pagina("¿Cómo pagó?", medioBtns("gMedio"));
  SCREENS["g-confirmar"] = () => {
    const g = ctx.g;
    const filas = [["En qué gastó", g.que + (g.codigo ? " · " + g.codigo : ""), "g-donde"], ["Cuánto", money(g.valor), "g-valor"]];
    if (g.que !== "Sueldo mío") filas.push(["Detalle", g.nota || "(sin detalle)", "g-que"]);
    filas.push(["Pagó con", g.medio, "g-medio"]);
    return confirmaPagina(filas, g.medio === "Efectivo" ? avisoCaja(g.valor, "Este gasto") : "", sig("gGuardar", GUARDAR));
  };

  // --- RETROVENTA ---
  const rvSub = () => { const r = state.retroventas[ctx.codigo] || {}; return ctx.codigo + " · " + (r.persona || "") + " · le dio " + money(r.leDi) + " · recompra " + money(r.recompra); };
  SCREENS["rv-menu"] = () => pagina("Retroventa",
    '<button class="gigante c-retro alto" data-act="rvNueva"><span class="ic">🆕</span> Nueva retroventa</button>' +
    '<button class="gigante c-retro alto" data-act="rvTipo" data-arg="prorroga"><span class="ic">📆</span> Me pagaron prórroga</button>' +
    '<button class="gigante c-retro alto" data-act="rvTipo" data-arg="recompra"><span class="ic">✅</span> Me la recompraron</button>');
  SCREENS["rv-lista"] = () => {
    const bc = C.bienesCalc(state, HOY), rc = C.retroventasCalc(state, bc, HOY);
    const ks = Object.keys(rc).filter((k) => rc[k].estado === "En retroventa");
    return "<h1>¿Cuál contrato?</h1>" + (ks.length ? ks.map((k) => {
      const r = rc[k];
      return '<button class="tarjeta btn" data-act="rvPick" data-arg="' + h(k) + '"><div class="t">' + h(k) + " · " + h(r.persona || "") + '</div><div class="s">Le dio ' + h(money(r.leDi)) + " · recompra " + h(money(r.recompra)) + "<br>Vence " + h(C.fmtFecha(r.vence)) + (r.aviso ? " · " + h(r.aviso) : "") + "</div></button>";
    }).join("") : '<div class="caja gris">No hay retroventas abiertas.</div>');
  };
  SCREENS["rv-valor"] = () => pagina(ctx.rvTipo === "prorroga" ? "¿Cuánto pagaron por la prórroga?" : "¿Cuánto pagaron por recomprarla?", camposHTML([{ k: "valor", label: "Valor", t: "num" }], ctx.v) + sig("rvValorNext", "Siguiente →"), rvSub());
  SCREENS["rv-medio"] = () => pagina("¿Cómo le pagaron?", medioBtns("rvMedio"), rvSub());
  SCREENS["rv-fecha"] = () => pagina("¿Hasta qué fecha quedó?", camposHTML([{ k: "vence", label: "Nueva fecha de vencimiento", t: "date" }], ctx.v) +
    chipsFecha((state.retroventas[ctx.codigo] || {}).vence || HOY) + sig("rvFechaNext", "Siguiente →"), rvSub());
  SCREENS["rv-confirmar"] = () => {
    const pror = ctx.rvTipo === "prorroga";
    const filas = [["Contrato", ctx.codigo + " · " + ((state.retroventas[ctx.codigo] || {}).persona || ""), "rv-lista"], [pror ? "Pagaron por la prórroga" : "Pagaron por recomprarla", money(ctx.v.valor), "rv-valor"], ["Le pagaron con", ctx.medio, "rv-medio"]];
    if (pror) filas.push(["Nueva fecha", C.fmtFecha(ctx.v.vence), "rv-fecha"]);
    return confirmaPagina(filas, "", sig("rvGuardar", GUARDAR));
  };
  SCREENS.listo = () => ctx.listoHtml;

  // --- ¿CÓMO VOY? ---
  SCREENS.comovoy = () => {
    const mes = ctx.mes || C.mesDe(HOY);
    const r = C.resumenMes(state, mes, HOY);
    const a = C.avisos(state, HOY);
    const [yy, mm] = mes.split("-");
    const NM = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const mx = Math.max.apply(null, C.TIPOS.map((t) => r.rindePorTipo[t] || 0).concat([0.0001]));
    let x = '<div class="top"><button class="chico claro" data-act="mes" data-arg="-1" aria-label="Mes anterior"><span class="ic">◀</span></button><h1 style="margin:0;font-size:1.2rem;text-align:center;white-space:nowrap">' + NM[+mm - 1].replace(/^./, (c) => c.toUpperCase()) + " " + yy + '</h1><button class="chico claro" data-act="mes" data-arg="1" aria-label="Mes siguiente"><span class="ic">▶</span></button></div>';
    x += '<div class="tarjeta utilidad"><div class="muted">Utilidad real (después de su sueldo)</div><div class="numgrande ' + (r.utilidadReal < 0 ? "neg" : "") + '">' + money(r.utilidadReal) + '</div><div class="muted" style="margin-top:6px">Antes de su sueldo: ' + h(money(r.utilidadAntesSueldo)) + "</div></div>";
    x += '<table class="resumen"><tr><td>Entró</td><td>' + money(r.entro) + "</td></tr><tr><td>Salió</td><td>" + money(r.salio) + "</td></tr>" +
      "<tr><td>Ganancia de lo que cerró</td><td>" + money(r.utilidadCerrados) + "</td></tr><tr><td>Gastos del negocio</td><td>" + money(r.gastosNegocio) + "</td></tr>" +
      "<tr><td>Sacó para la casa</td><td>" + money(r.sueldo) + "</td></tr><tr><td>Plata quieta (lo que no se ha vendido)</td><td>" + money(r.platQuieta) + "</td></tr></table>";
    x += "<h2>¿Qué rinde más?</h2><p class='muted'>Rendimiento por mes de lo que ya cerró</p>";
    x += C.TIPOS.map((t) => {
      const v = r.rindePorTipo[t];
      return '<div class="rinde"><div class="top"><span><span class="ic">' + ICONO[t] + "</span>" + t + "</span><b>" + (v == null ? "—" : pct(v)) + '</b></div><div class="bar"><i style="width:' + (v == null ? 0 : Math.max(2, Math.round(v / mx * 100))) + '%"></i></div></div>';
    }).join("");
    x += "<h2>Avisos</h2>";
    x += a.items.length ? a.items.map(avisoHTML).join("") : '<div class="caja verde">Sin avisos.</div>';
    x += '<div class="err" id="err"></div>';
    x += '<button class="claro" data-go="caja"><span class="ic">💵</span> Contar la caja</button>';
    x += '<button class="claro" data-act="descargar"><span class="ic">⬇</span> Descargar para el contador</button><div class="muted" id="dlMsg"></div>';
    return x + verso(T.ovejas);
  };
  SCREENS.caja = () => {
    const esp = C.cajaEsperada(state);
    let x = '<p class="sub">Cuente la plata en efectivo que tiene y escríbala aquí.</p>' + camposHTML([{ k: "contada", label: "Plata en efectivo que contó", t: "num" }], ctx.caja = ctx.caja || {}) + sig("cajaGuardar", "Ver la diferencia");
    if (ctx.cajaRes) {
      const d = ctx.cajaRes;
      x += d.tipo === "cuadra" ? '<div class="caja verde"><span class="gr"><span class="ic">✔</span> Cuadra</span>La caja esperada era ' + h(money(esp)) + ". Todo está anotado.</div>"
        : d.tipo === "faltan" ? '<div class="caja amar"><span class="gr">Le faltan ' + h(money(d.valor)) + "</span>La caja esperada es " + h(money(esp)) + ". Algo no se anotó. Búsquelo esta semana.</div>"
        : '<div class="caja amar"><span class="gr">Le sobran ' + h(money(d.valor)) + "</span>La caja esperada es " + h(money(esp)) + ". Puede faltar anotar una entrada de plata. Búsquela esta semana.</div>";
    }
    return pagina("Contar la caja", x) + verso(T.ovejas);
  };

  // --- MIS COSAS ---
  SCREENS.miscosas = () => {
    const f = ctx.filtro || "tengo";
    return '<h1>Mis cosas</h1><div class="seg"><button class="' + (f === "tengo" ? "on" : "") + '" data-act="filtro" data-arg="tengo">Lo que tengo</button><button class="' + (f === "todo" ? "on" : "") + '" data-act="filtro" data-arg="todo">Todo</button></div>' +
      '' + buscador() + '<div id="lista">' + tarjetasBienes(listaBienes(f === "tengo" ? "tengo" : "todo", ctx.q), "ficha") + "</div>";
  };
  ONINPUT.miscosas = () => { ctx.q = $("[name=q]").value; $("#lista").innerHTML = tarjetasBienes(listaBienes((ctx.filtro || "tengo") === "tengo" ? "tengo" : "todo", ctx.q), "ficha"); repinta("lista"); };

  SCREENS.ficha = () => {
    const k = ctx.codigo, b = state.bienes[k];
    if (!b) return '<div class="caja gris">No se encontró.</div>';
    const c = C.bienCalc(k, b, state.movimientos, HOY);
    const v = state.vehiculos[k], rt = state.retroventas[k];
    const f = (a, x, vacio) => { const t = x == null ? "" : String(x); return "<tr><td>" + a + "</td><td" + (t.length > 16 ? ' class="largo"' : "") + ">" + (t === "" ? '<span class="falta">' + (vacio || "Falta") + "</span>" : h(t)) + "</td></tr>"; };
    let x = '<div class="franja fichah"><span class="ic grande">' + (ICONO[b.tipo] || "") + '</span><h1>' + h(k) + '</h1><div class="fdesc">' + h(b.descripcion) + '</div><div class="tags"><span class="tag">' + h(c.estado) + "</span>" + (c.aviso ? ' <span class="tag oro">' + h(c.aviso) + "</span>" : "") + "</div></div>";
    x += '<div class="tarjeta"><table class="resumen">' + f("Entró el", C.fmtFecha(b.fechaEntrada)) + f("Días desde que entró", c.dias == null ? "" : c.dias) + f("Pagó", money(c.pague)) + f("Gastos en el bien", money(c.gastos)) +
      f("Recibió por la venta", c.fechaCierre == null && !(c.recibi > 0) ? "Aún no" : money(c.recibi)) + (c.utilidad != null ? f("Ganancia", money(c.utilidad)) + f("Rindió al mes", c.rinde == null ? (c.rindeTxt || "—") : pct(c.rinde)) : "") +
      f("Se lo vendió", b.vendedorNombre) + f("Cédula", b.vendedorCedula) + f("Teléfono", b.vendedorTelefono) + "</table></div>";
    x += '<button class="claro" data-act="edBien"><span class="ic">✏</span> Corregir datos</button>';
    if (v) {
      const vc = C.vehiculoCalc(k, v, C.bienesCalc(state, HOY), HOY);
      x += "<h2>Papeles del vehículo</h2>" + (vc.aviso ? '<div class="caja ' + (vc.aviso === "TRASPASO PENDIENTE" ? "rojo" : "amar") + '">' + h(vc.aviso) + (vc.aviso === "TRASPASO PENDIENTE" ? "<br>" + h(T.sinTraspaso) : "") + "</div>" : "") +
        '<div class="tarjeta"><table class="resumen">' + f("Ciudad", v.ciudad) + f("Dueño en RUNT", v.runtVerificado) + f("SOAT vence", C.fmtFecha(v.soatVence)) + f("Tecnomecánica vence", C.fmtFecha(v.tecnoVence)) +
        f("Impuestos al día", v.impuestosAlDia) + f("Debe de impuestos", v.debeImpuestos != null ? money(v.debeImpuestos) : "") + f("Multas", v.multas != null ? money(v.multas) : "") + f("Peritaje", v.peritaje) + f("Traspaso radicado", C.fmtFecha(v.traspasoRadicado), "Aún no") + "</table></div>" +
        '<button class="claro" data-act="edVeh"><span class="ic">✏</span> Corregir papeles</button>';
    } else if (esVeh(b.tipo)) x += '<button class="claro" data-act="edVeh"><span class="ic">➕</span> Llenar papeles</button>';
    if (rt) {
      const rc = C.retroCalc(k, rt, C.bienesCalc(state, HOY), state.config.topeTasaAnual, HOY);
      x += "<h2>Retroventa</h2>" + tasaBox(rt.leDi, rt.recompra, rt.fecha, rt.vence) + '<div class="tarjeta"><table class="resumen">' + f("Persona", rt.persona) + f("Le dio", money(rt.leDi)) + f("Recompra", money(rt.recompra)) + f("Vence", C.fmtFecha(rt.vence)) + f("Aviso", rc.aviso || "Sin aviso") + f("Le avisó al cliente", C.fmtFecha(rt.avisoCliente), "Aún no") + "</table></div>" +
        '<button class="claro" data-act="edRet"><span class="ic">✏</span> Corregir retroventa</button>';
    }
    x += '<h2>Fotos</h2><div id="fotos" class="muted">Cargando fotos…</div>' +
      '<div class="foto-btn"><button class="claro" type="button"><span class="ic">📷</span> Agregar foto (soporte)</button><input type="file" accept="image/*" capture="environment" data-fotoficha="soporte"></div><div id="fotoMsg" class="muted"></div>';
    x += "<h2>Movimientos</h2>" + C.listaTodos(state.movimientos).filter((m) => m.codigo === k).sort((a, b2) => a.fecha.localeCompare(b2.fecha)).map((m) =>
      '<div class="tarjeta' + (m.anulado ? " anulado" : "") + '"><div class="t"' + (m.anulado ? ' style="text-decoration:line-through"' : "") + ">" + h(m.que) + " · " + h(money(m.valor)) + (m.anulado ? ' <span class="tag">Anulado</span>' : "") + '</div><div class="s"' + (m.anulado ? ' style="text-decoration:line-through"' : "") + ">" + h(C.fmtFecha(m.fecha)) + " · " + h(m.medio || "") + (m.nota ? " · " + h(m.nota) : "") + (m.editado ? " · corregido" : "") + "</div>" +
        (m.anulado ? "" : '<div class="fila"><button class="claro" data-act="edMov" data-arg="' + h(m.id) + '">Corregir</button><button class="claro" data-act="anular" data-arg="' + h(m.id) + '">Anular</button></div>') + "</div>").join("") + '<div class="err" id="err"></div>';
    return { html: x, after: () => cargarFotos(k) };
  };
  async function cargarFotos(k) {
    try {
      const fs = await Store.fotos(k);
      const e = $("#fotos"); if (!e || ctx.codigo !== k) return;
      e.className = "";
      const ok = fs.filter((f) => fotoOk(f.data));
      e.innerHTML = ok.length ? '<div class="fotos">' + ok.map((f) => '<img src="' + h(f.data) + '" alt="' + h(f.tipo) + '" data-act="zoom">').join("") + "</div>" : '<div class="muted">Todavía no hay fotos.</div>';
    } catch (e2) { const e = $("#fotos"); if (e) e.textContent = "No se pudieron cargar las fotos."; }
  }

  // --- formulario genérico para correcciones ---
  SCREENS.form = () => {
    const F = ctx.form;
    return pagina(F.titulo, camposHTML(F.fields, F.vals) + sig("formGuardar", '<span class="ic">✔</span> Guardar los cambios'));
  };

  // --- ajustes y ayuda ---
  SCREENS.ajustes = () => pagina("Ajustes", camposHTML([
    { g: "Su caja", k: "cajaInicial", label: "Plata en efectivo el día que empezó", t: "num" },
    { g: "Compras grandes", k: "umbralPausa", label: "Desde cuánto se hace la pausa", t: "num" },
    { g: "Retroventas", k: "topeTasaAnual", label: "Tope de tasa al año (%)", t: "pct", hint: "Lo define el abogado. Ejemplo: 28,34" }], ctx.aj = ctx.aj || {
      cajaInicial: state.config.cajaInicial, umbralPausa: state.config.umbralPausa == null ? C.UMBRAL_DEFECTO : state.config.umbralPausa, topeTasaAnual: state.config.topeTasaAnual }) +
    sig("ajGuardar", GUARDAR) +
    (DEMO ? "" : '<p class="muted">Sesión: ' + h(user && user.email) + '</p><button class="gris" data-go="cerrar">Cerrar sesión en este celular</button>'));
  SCREENS["aj-confirmar"] = () => {
    const c = ctx.ajCambios;
    return "<h1>¿Está bien así?</h1>" + c.map((x) => '<div class="tarjeta"><div class="t">' + h(x.lbl) + '</div><div class="s">Antes: ' + h(x.antes) + '</div><div class="t">Ahora: ' + h(x.ahora) + "</div></div>").join("") +
      '<div id="err" class="err"></div>' + sig("ajConfirmado", GUARDAR) + sig("atras", "No, volver", "gris");
  };
  SCREENS.cerrar = () => "<h1>¿Cerrar sesión en este celular?</h1>" +
    '<p class="sub">Sus datos no se borran. Para volver a entrar tendrá que usar su cuenta de Google.</p>' +
    sig("salir", "Sí, cerrar sesión", "rojo") + sig("atras", "No, quedarme aquí", "gris");
  const secAyuda = (ic, t, cuerpo) => '<section class="tarjeta ayuda"><h2><span class="ic">' + ic + "</span> " + t + "</h2>" + cuerpo + "</section>";
  SCREENS.ayuda = () => "<h1>¿Cómo se usa?</h1>" +
    '<div class="pausa"><div class="grande">' + h(T.pausaTitulo) + "</div><div>" + h(T.pausaVers) + "</div><p><b>Antes de pagar una compra grande (de " + money(C.umbral(state)) + " o más):</b></p><ol>" + T.pausaPreg.map((q) => "<li>" + h(q) + "</li>").join("") + "</ol><p><b>" + h(T.pausaFin) + "</b></p></div>" +
    secAyuda("🧾", "Cada vez que entra o sale plata", "<p>Toque Compré, Vendí, Gasté o Retroventa y responda una pregunta por pantalla. Lo que usted saca para la casa va como «Sueldo mío», así no se mezcla la plata de la casa con la del negocio.</p>") +
    secAyuda("📦", "Código del bien", "<p>Placa en carros y motos; en oro O-001, O-002…; en relojes R-001…; en lo demás X-001… (la app los pone sola).</p>" +
      "<p>Oro, en la descripción: gramos – kilates – joya o chatarra – precio del gramo puro del día. Ej.: 12 g – 18k – cadena – 400.000</p><p>Reloj, en la descripción: marca – referencia – serie – ¿caja y papeles?</p><p>Siempre: nombre y cédula de quien le vendió, y foto de la cédula y del bien.</p>") +
    secAyuda("🚗", "Carro o moto", "<p>Antes de pagar: consultar en el RUNT con la placa y la cédula del vendedor que él sí es el dueño.</p><p>Antes de entregar uno vendido: traspaso firmado y radicado. Se anota la fecha.</p>") +
    secAyuda("🔁", "Retroventa", "<p>«Retroventa (le di plata)» al hacerla; «Me pagaron prórroga» cada vez que pagan para alargar; «Me recompraron» cuando se lo llevan.</p><p>Si prorrogan, se cambia la fecha «Vence».</p>" + verso(T.usura)) +
    secAyuda("💵", "Cada viernes", "<p>Contar la plata en efectivo en ¿Cómo voy? → Contar la caja. Si la diferencia no es cero, algo no se anotó. Se busca esa misma semana.</p>" + verso(T.ovejas)) +
    secAyuda("⚠", "Cada mañana", "<p>Mirar los avisos: qué vence, qué traspaso falta y qué lleva mucho tiempo quieto.</p>") + verso(T.peso) + verso(T.semana) + verso(T.salmo);

  // ---------- acciones ----------
  async function guardando(fn) {
    err("");
    const btns = $app.querySelectorAll("button"); btns.forEach((b) => (b.disabled = true));
    try { await fn(); }
    catch (e) { console.warn(e); btns.forEach((b) => (b.disabled = false)); err(e && e.usuario ? e.usuario : "No se pudo guardar. " + (e && e.code === "PERMISSION_DENIED" ? "Esta cuenta no tiene permiso." : "Revise la conexión e intente de nuevo.")); }
  }
  const caja = (cls, gr, txt) => '<div class="caja ' + cls + '"><span class="gr">' + gr + "</span>" + txt + "</div>";
  const meta = () => ({ creado: Date.now(), autor: (user && user.email) || "demo" });
  function pausaOSiguiente() {
    if (Number(draft.valor) >= C.umbral(state)) go("pausa"); else { draft.pausa = null; go("c-vendedor"); }
  }
  function resultadoBien(codigo, movNuevo) {
    const movs = C.lista(state.movimientos).concat([movNuevo]);
    return C.bienCalc(codigo, state.bienes[codigo], movs, HOY);
  }
  function cajaResultado(c) {
    if (c.utilidad == null) return "";
    const linea = c.rinde == null ? h(c.rindeTxt || "En " + c.dias + " días") : "Rindió " + h(pct(c.rinde)) + " al mes en " + h(c.dias) + " días";
    return c.utilidad >= 0 ? caja("verde", "Ganó " + money(c.utilidad), linea) : caja("gris", "Perdió " + money(-c.utilidad), linea);
  }
  function abrirForm(titulo, fields, vals, guardar) { ctx.form = { titulo, fields, vals, guardar }; go("form"); }
  const errDatos = (t) => Object.assign(new Error("datos"), { usuario: t });
  // Pantalla final de un guardado. Con ids de movimientos aparece «Deshacer» mientras no se cambie de pantalla.
  // o: { label, numero, frase, donde, lineas, extra, ids, extraUndo, codigo }.
  // Bloque oscuro con el número en oro, una frase de dónde quedó, «Así cambiaron sus números» y los botones.
  const NOMBRE_TIPO = { Carro: ["el carro", "Ver el carro"], Moto: ["la moto", "Ver la moto"], Oro: ["el oro", "Ver el oro"], Reloj: ["el reloj", "Ver el reloj"] };
  function numerosHTML(lineas) {
    const esp = C.cajaEsperada(state), q = C.resumenMes(state, C.mesDe(HOY), HOY).platQuieta;
    let l = lineas.slice();
    if (state.config.cajaInicial != null && esp >= 0) l.push("En el cajón ahora debe haber " + money(esp) + " en efectivo.");
    l.push("Plata quieta en lo que no ha vendido: " + money(q) + ".");
    return '<div class="tarjeta numeros"><h2>Así cambiaron sus números</h2><ul>' + l.map((x) => "<li>" + h(x) + "</li>").join("") + "</ul></div>" +
      (state.config.cajaInicial != null && esp < 0 ? '<div class="caja amar">Según lo anotado, la caja quedó en ' + h(money(esp)) + ". Revise en Ajustes cuánta plata tenía al empezar.</div>" : "");
  }
  function terminar(o) {
    const ids = o.ids;
    undoFn = ids && ids.length ? async () => {
      const a = { fecha: HOY, autor: (user && user.email) || "demo" };
      for (const id of ids) await Store.updMov(id, { anulado: a });
      if (o.extraUndo) await o.extraUndo();
    } : null;
    const bloque = '<div class="resultado"><div class="rcheck"><span class="ic">✔</span></div><div class="rlbl">' + h(o.label) + '</div><div class="rnum">' + h(money(o.numero)) + '</div><div class="rfrase">' + h(o.frase) + "</div></div>";
    const t = o.codigo && state.bienes[o.codigo] ? NOMBRE_TIPO[state.bienes[o.codigo].tipo] : null;
    ctx = { listoHtml: bloque + '<p class="donde">' + h(o.donde) + "</p>" + numerosHTML(o.lineas || []) + (o.extra || "") + '<div id="err" class="err"></div>' +
      (o.codigo ? '<button class="verde" data-act="verFicha" data-arg="' + h(o.codigo) + '">' + (t ? t[1] : "Ver la ficha") + "</button>" : "") + sig("inicio", "Volver al inicio", "claro") +
      (undoFn ? sig("deshacer", "Deshacer", "suave") : "") };
    stack = []; draft = nuevoDraft("Compra"); cur = "listo"; render();
  }
  function aMedias(codigo, falto) {
    ctx = { listoHtml: "<h1>Quedó guardado a medias</h1>" + caja("amar", h(codigo), "Lo principal quedó guardado, pero faltan " + h(falto.join(", ")) + ". Ábralo en Mis cosas para completarlo.") +
      '<button class="claro" data-act="verFicha" data-arg="' + h(codigo) + '">Ver la ficha</button>' + sig("inicio", "Volver al inicio", "marron") };
    undoFn = null; stack = []; draft = nuevoDraft("Compra"); cur = "listo"; render();
  }
  const esFantasma = (c) => !!fantasmas[c];

  function ajCambios() {
    const a = ctx.aj || {};
    const ant = { cajaInicial: state.config.cajaInicial == null ? null : state.config.cajaInicial, umbralPausa: state.config.umbralPausa == null ? C.UMBRAL_DEFECTO : state.config.umbralPausa, topeTasaAnual: state.config.topeTasaAnual == null ? null : state.config.topeTasaAnual };
    const nue = { cajaInicial: a.cajaInicial == null ? null : a.cajaInicial, umbralPausa: a.umbralPausa || C.UMBRAL_DEFECTO, topeTasaAnual: a.topeTasaAnual == null ? null : a.topeTasaAnual };
    const fm = { cajaInicial: (v) => v == null ? "Sin anotar" : money(v), umbralPausa: (v) => money(v), topeTasaAnual: (v) => v == null ? "Falta tope" : pct(v) };
    const nombres = { cajaInicial: "Plata en efectivo el día que empezó", umbralPausa: "Compra grande (desde aquí se hace la pausa)", topeTasaAnual: "Tope de tasa al año" };
    return { nue, cambios: Object.keys(nue).filter((k) => nue[k] !== ant[k]).map((k) => ({ lbl: nombres[k], antes: fm[k](ant[k]), ahora: fm[k](nue[k]) })) };
  }

  const ACT = {
    atras() { if (depth > 0) history.back(); else atras(); },
    inicio() {
      readCur();
      if (hayBorrador()) {
        modal("¿Salir sin guardar?", "Lo que escribió se va a perder.", [
          { txt: "Seguir anotando", cls: "verde", act: "modalSeguir" }, { txt: "Salir sin guardar", cls: "claro", act: "modalSalir" }]);
      } else inicio();
    },
    modalSeguir() { cierraModal(); },
    modalSalir() { cierraModal(); inicio(); },
    reintentar() { location.reload(); },
    entrar() { firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch((e) => { authMsg = e && e.code === "auth/popup-blocked" ? "Chrome bloqueó la ventana. Permita las ventanas emergentes e intente de nuevo." : e && e.code === "auth/popup-closed-by-user" ? "" : "No se pudo entrar."; render(); }); },
    salir() { firebase.auth().signOut(); },
    opc(arg, el) { readCur(); curForm.vals[el.dataset.k] = el.dataset.v; if (cur === "c-desc") ONINPUT["c-desc"](); const y = window.scrollY; render(true); window.scrollTo(0, y); },
    // desde «¿Está bien así?»: tocar una fila lleva a su pantalla y al terminar vuelve a la confirmación
    irA(scr) { readCur(); ctx.desdeConf = true; go(scr); },
    fechaSel(arg) { readCur(); ctx.fechaSel = arg; const y = window.scrollY; render(true); window.scrollTo(0, y); },
    nuevaCompra() { if (!datosListos) return; draft = nuevoDraft("Compra"); ctx = {}; go("c-tipo"); },
    tipo(t) { draft.tipo = t; go("c-desc"); },
    cDescNext() {
      readCur(); const d = draft, t = d.tipo;
      if (esVeh(t)) { if (!d.placa) return err("Escriba la placa."); d.codigo = C.limpiaPlaca(d.placa); if (d.codigo.length > 12) return err("La placa es muy larga. Revísela."); }
      else {
        if (t === "Oro" && !(d.gramos > 0 && d.kilates && d.forma && d.precioGramo > 0)) return err("Falta: gramos, kilates, si es joya o chatarra y el precio del gramo.");
        if (t === "Reloj" && !d.marca) return err("Escriba la marca del reloj.");
        if (t === "Otro" && !d.descripcion) return err("Cuénteme qué es.");
        if (!ctx.desdeConf || !d.codigo) d.codigo = C.siguienteCodigo(t, state.bienes);
      }
      if (state.bienes[d.codigo]) return err("Ya existe un bien con el código " + d.codigo + ". Búsquelo en Mis cosas.");
      siguiente("c-valor");
    },
    usarRef() { readCur(); draft.valor = refOro(draft); render(true); },
    cValorNext() {
      readCur(); if (!(draft.valor > 0)) return err("Escriba el valor.");
      draft.aprobadoAbogado = false;
      if (ctx.desdeConf) {
        // Editando desde la confirmación: si el valor ahora pide pausa, se hace y se vuelve a la confirmación.
        if (draft.valor >= C.umbral(state) && draft.pausa !== "Sí") return go("pausa");
        if (draft.valor < C.umbral(state)) draft.pausa = null;
        return aConfirmar("c-confirmar");
      }
      if (draft.modalidad === "Retroventa") go("r-recompra"); else pausaOSiguiente();
    },
    rRecNext() { readCur(); if (!(draft.recompra > 0)) return err("Escriba cuánto le devuelven."); draft.aprobadoAbogado = false; siguiente("r-vence"); },
    chipFecha(arg, el) { const [b, n] = arg.split("|"); const f = C.addDias(b, +n); readCur(); if (cur === "r-vence") draft.vence = f; else ctx.v.vence = f; render(true); },
    rVenceNext() {
      readCur();
      if (!draft.vence || C.diasEntre(HOY, draft.vence) <= 0) return err("Escoja una fecha después de hoy.");
      draft.aprobadoAbogado = false;
      if (ctx.desdeConf) return aConfirmar("c-confirmar");
      pausaOSiguiente();
    },
    pausaSi() { draft.pausa = "Sí"; siguiente("c-vendedor"); },
    pausaNo() { draft = nuevoDraft("Compra"); go("espero", { reset: true }); },
    cVendNext() { readCur(); siguiente("c-fotos"); },
    cFotosNext() { siguiente("c-medio"); },
    cMedio(m) { draft.medio = m; siguiente(esVeh(draft.tipo) && !draft.papelesVisto ? "c-papeles" : "c-confirmar"); },
    cPapelesNext() { readCur(); draft.papelesVisto = true; siguiente("c-confirmar"); },
    noFirmar() { inicio(); },
    abogadoPantalla() { go("r-abogado"); },
    abogadoSi() { draft.aprobadoAbogado = true; return ACT.guardarCompra(); },
    guardarCompra() {
      const d = draft, retro = d.modalidad === "Retroventa";
      readCur();
      const ef = validaFecha(); if (ef) return err(ef);
      const fecha = fechaMov();
      if (retro && C.diasEntre(fecha, d.vence) <= 0) return err("La fecha de vencimiento debe ser después del día de la retroventa.");
      return guardando(async () => {
        let code = d.codigo;
        const desc = descText(d);
        const bien = { tipo: d.tipo, descripcion: desc, modalidad: d.modalidad, fechaEntrada: fecha, vendedorNombre: d.vendedorNombre || "", vendedorCedula: d.vendedorCedula || "", vendedorTelefono: d.vendedorTelefono || "" };
        // Se crea el bien sin pisar uno existente; los movimientos van solo después de que quede creado.
        // Si el bien anterior quedó anulado por completo (se deshizo), se reutiliza el código.
        // Un fantasma con retroventa vieja solo se reutiliza si la compra nueva también es retroventa (se sobrescribe completa).
        // Los papeles del vehículo viejos se limpian campo por campo más abajo.
        const reusable = (c) => esFantasma(c) && (retro || !fantasmaRet[c]);
        let reuso = false;
        let creado = await Store.crearBien(code, bien);
        if (!creado && reusable(code)) { await Store.setBien(code, bien); creado = true; reuso = true; }
        if (!creado && !esVeh(d.tipo)) {
          const ocupados = Object.assign({}, state.bienes, fantasmas); ocupados[code] = true;
          code = C.siguienteCodigo(d.tipo, ocupados); d.codigo = code;
          creado = await Store.crearBien(code, bien);
        }
        if (!creado) throw Object.assign(new Error("existe"), { usuario: esVeh(d.tipo) ? (esFantasma(code) ? "Esa placa tuvo una retroventa que se deshizo y no se puede volver a usar como compra normal. Avise a quien administra la app." : "Ya existe un bien con esa placa. Búsquelo en Mis cosas.") : "Ese código ya existe. Toque Guardar otra vez." });
        const id = await Store.addMov(Object.assign({ fecha, que: retro ? C.RETRO : "Compra", codigo: code, valor: Number(d.valor), medio: d.medio, pausa: d.pausa || null, nota: desc }, meta()));
        // Orden: movimiento, retroventa, fotos y al final el vehículo. Si algo falla, se dice qué quedó guardado y qué no.
        const falto = [];
        const intenta = async (nombre, fn) => { try { await fn(); } catch (e) { console.warn(nombre, e); falto.push(nombre); } };
        if (retro) await intenta("los datos de la retroventa", () => Store.setRet(code, limpia({ persona: d.vendedorNombre || "", cedula: d.vendedorCedula || "", telefono: d.vendedorTelefono || "", fecha, leDi: Number(d.valor), recompra: Number(d.recompra), vence: d.vence, avisoCliente: reuso ? null : undefined, aprobadoAbogado: d.aprobadoAbogado ? true : (reuso ? false : undefined) })));
        let fotosMal = false;
        for (const t of Object.keys(d.fotos)) { try { await Store.addFoto(code, { tipo: t === "bien" ? "bien" : "cedula", data: d.fotos[t] }); } catch (e) { console.warn("foto", e); fotosMal = true; } }
        if (fotosMal) falto.push("las fotos");
        if (esVeh(d.tipo)) {
          const v = d.veh || {};
          await intenta("los papeles del vehículo", () => Store.setVeh(code, limpia({ marca: d.marca || "", linea: d.linea || "", modelo: d.modelo || "", ciudad: v.ciudad || "", runtVerificado: v.runtVerificado || null, soatVence: v.soatVence || null, tecnoVence: v.tecnoVence || null, impuestosAlDia: v.impuestosAlDia || null, debeImpuestos: v.debeImpuestos == null ? null : v.debeImpuestos, multas: v.multas == null ? null : v.multas, peritaje: v.peritaje || "", traspasoRadicado: reuso ? null : undefined })));
        }
        if (falto.length) return aMedias(code, falto);
        const nt = NOMBRE_TIPO[d.tipo] ? NOMBRE_TIPO[d.tipo][0] : "lo que compró";
        terminar({ label: retro ? "Retroventa guardada" : "Compra guardada", numero: d.valor, frase: code + " · " + desc, donde: (nt.charAt(0).toUpperCase() + nt.slice(1)) + " " + code + " quedó guardado en Mis cosas, en «Lo que tengo».", lineas: [(retro ? "Le dio " : "Pagó ") + money(d.valor) + " " + (d.medio === "Efectivo" ? "en efectivo" : "por transferencia") + "."], extra: retro ? tasaBox(d.valor, d.recompra, fecha, d.vence) : "", ids: [id], codigo: code });
      });
    },
    // vender
    vPick(k) {
      if (ctx.desdeConf && !retroVencida(k)) { ctx.codigo = k; return aConfirmar("v-confirmar"); }
      ctx.desdeConf = false;
      ctx.codigo = k; ctx.v = {}; ctx.medio = undefined; ctx.traspaso = undefined; go(retroVencida(k) ? "v-plazo" : "v-valor");
    },
    vPlazoSi() { go("v-valor"); },
    vValorNext() { readCur(); if (!(ctx.v.valor > 0)) return err("Escriba el valor."); siguiente("v-medio"); },
    vMedio(m) { ctx.medio = m; siguiente(esVeh((state.bienes[ctx.codigo] || {}).tipo) && ctx.traspaso === undefined ? "v-traspaso" : "v-confirmar"); },
    vTras() { ctx.traspaso = true; siguiente("v-confirmar"); },
    vTrasNo() { ctx.traspaso = false; const k = ctx.codigo; if (k && state.vehiculos[k]) Store.setVeh(k, { traspasoRadicado: null }).catch((e) => console.warn(e)); siguiente("v-confirmar"); },
    vGuardar() {
      readCur();
      const ef = validaFecha(); if (ef) return err(ef);
      const k = ctx.codigo, valor = Number(ctx.v.valor), fecha = fechaMov(), traspaso = ctx.traspaso;
      const b = state.bienes[k];
      if (b.fechaEntrada && C.diasEntre(b.fechaEntrada, fecha) < 0) return err("La venta no puede ser antes del día en que entró (" + C.fmtFecha(b.fechaEntrada) + ").");
      return guardando(async () => {
        const m = Object.assign({ fecha, que: "Venta", codigo: k, valor, medio: ctx.medio, pausa: null, nota: "" }, meta());
        const c = resultadoBien(k, m);
        const id = await Store.addMov(m);
        if (traspaso === true) {
          try { await Store.setVeh(k, { traspasoRadicado: fecha }); } catch (e) { console.warn(e); return aMedias(k, ["la fecha del traspaso"]); }
        }
        terminar({ label: "Venta guardada", numero: valor, frase: k + " · " + b.descripcion, donde: "La venta quedó anotada en la ficha de " + k + ". La encuentra en Mis cosas, en «Todo».", lineas: ["Le pagaron " + money(valor) + " " + (ctx.medio === "Efectivo" ? "en efectivo" : "por transferencia") + "."], extra: cajaResultado(c) +
          (traspaso === false ? caja("rojo", "Traspaso pendiente", h(T.sinTraspaso)) : ""), ids: [id], extraUndo: traspaso === true ? () => Store.setVeh(k, { traspasoRadicado: null }) : null, codigo: k });
      });
    },
    // gastar
    gDonde(arg) {
      const que = arg === "bien" ? "Gasto del bien" : arg === "negocio" ? "Gasto del negocio" : "Sueldo mío";
      if (ctx.desdeConf) {
        ctx.g.que = que; ctx.g.codigo = ""; if (arg === "casa") ctx.g.nota = "";
        if (arg === "bien") { ctx.q = ""; return go("g-bien"); }
        return aConfirmar("g-confirmar");
      }
      ctx.g = { que, codigo: "" };
      ctx.q = ""; go(arg === "bien" ? "g-bien" : "g-valor");
    },
    gBien(k) { ctx.g.codigo = k; siguiente("g-valor"); },
    gValorNext() { readCur(); if (!(ctx.g.valor > 0)) return err("Escriba el valor."); siguiente(ctx.g.que === "Sueldo mío" ? "g-medio" : "g-que"); },
    gChip(c) { readCur(); ctx.g.nota = c; render(true); },
    gQueNext() { readCur(); siguiente("g-medio"); },
    gMedio(m) { ctx.g.medio = m; siguiente("g-confirmar"); },
    gGuardar() {
      const g = ctx.g;
      readCur();
      const ef = validaFecha(); if (ef) return err(ef);
      const fecha = fechaMov();
      return guardando(async () => {
        const id = await Store.addMov(Object.assign({ fecha, que: g.que, codigo: g.codigo || "", valor: Number(g.valor), medio: g.medio, pausa: null, nota: g.nota || "" }, meta()));
        terminar({ label: "Gasto guardado", numero: g.valor, donde: g.codigo ? "El gasto quedó anotado en la ficha de " + g.codigo + ", en Mis cosas." : "El gasto quedó anotado en su cuaderno. Lo ve en ¿Cómo voy?", lineas: ["Gastó " + money(g.valor) + " " + (g.medio === "Efectivo" ? "en efectivo" : "por transferencia") + "."], frase: g.que + (g.codigo ? " · " + g.codigo : "") + (g.nota ? " · " + g.nota : ""), ids: [id], codigo: g.codigo || "" });
      });
    },
    // retroventa
    rvNueva() { if (!datosListos) return; draft = nuevoDraft("Retroventa"); ctx = {}; go("c-tipo"); },
    rvTipo(t) { ctx.rvTipo = t; go("rv-lista"); },
    rvPick(k) {
      ctx.codigo = k; const r = state.retroventas[k]; ctx.desdeConf = false; ctx.medio = undefined;
      ctx.v = { valor: ctx.rvTipo === "recompra" ? r.recompra : null, vence: r.vence };
      go("rv-valor");
    },
    rvValorNext() { readCur(); if (!(ctx.v.valor > 0)) return err("Escriba el valor."); siguiente("rv-medio"); },
    rvMedio(m) { ctx.medio = m; siguiente(ctx.rvTipo === "prorroga" && !ctx.v.venceNuevo ? "rv-fecha" : "rv-confirmar"); },
    rvFechaNext() {
      readCur();
      const r = state.retroventas[ctx.codigo];
      if (!ctx.v.vence || C.diasEntre(r.vence, ctx.v.vence) <= 0) return err("La nueva fecha debe ser después de " + C.fmtFecha(r.vence) + ".");
      ctx.v.venceNuevo = true; siguiente("rv-confirmar");
    },
    rvGuardar() {
      readCur();
      const ef = validaFecha(); if (ef) return err(ef);
      const k = ctx.codigo, valor = Number(ctx.v.valor), fecha = fechaMov(), pror = ctx.rvTipo === "prorroga", r = state.retroventas[k];
      return guardando(async () => {
        if (pror) {
          const id = await Store.addMov(Object.assign({ fecha, que: "Me pagaron prórroga", codigo: k, valor, medio: ctx.medio, pausa: null, nota: "Nueva fecha " + C.fmtFecha(ctx.v.vence) }, meta()));
          const vencia = r.vence, nueva = ctx.v.vence;
          try { await Store.setRet(k, { vence: nueva }); } catch (e) { console.warn(e); return aMedias(k, ["la nueva fecha de vencimiento"]); }
          terminar({ label: "Prórroga guardada", numero: valor, donde: "La prórroga quedó anotada en la ficha de " + k + ", en Mis cosas.", lineas: ["Le pagaron " + money(valor) + " de prórroga " + (ctx.medio === "Efectivo" ? "en efectivo" : "por transferencia") + "."], frase: k + " · ahora vence el " + C.fmtFecha(nueva), ids: [id], extraUndo: () => Store.setRet(k, { vence: vencia }), codigo: k });
        } else {
          const m = Object.assign({ fecha, que: "Me recompraron", codigo: k, valor, medio: ctx.medio, pausa: null, nota: "" }, meta());
          const c = resultadoBien(k, m);
          const id = await Store.addMov(m);
          terminar({ label: "Recompra guardada", numero: valor, donde: "La recompra quedó anotada en la ficha de " + k + ", en Mis cosas, en «Todo».", lineas: ["Le pagaron " + money(valor) + " por recomprarla " + (ctx.medio === "Efectivo" ? "en efectivo" : "por transferencia") + "."], frase: k + " · lo recuperó el cliente", extra: cajaResultado(c), ids: [id], codigo: k });
        }
      });
    },
    // deshacer / anular
    deshacer() {
      const f = undoFn; if (!f) return;
      return guardando(async () => {
        await f(); undoFn = null;
        ctx = { listoHtml: "<h1>Se deshizo</h1>" + caja("gris", "Anulado", "Quedó anotado como anulado y ya no cuenta en sus cuentas.") + sig("inicio", "Volver al inicio", "marron") };
        cur = "listo"; render();
      });
    },
    anular(id) {
      const m = state.movimientos.find((x) => x.id === id); if (!m) return;
      modal("¿Anular este movimiento?", m.que + " · " + money(m.valor) + " del " + C.fmtFecha(m.fecha) + ". Dejará de contar en sus cuentas, pero queda anotado como anulado.", [
        { txt: "Sí, anular", cls: "marron", act: "anularSi", arg: id }, { txt: "No, dejarlo", cls: "claro", act: "modalSeguir" }]);
    },
    anularSi(id) {
      cierraModal();
      return guardando(async () => {
        const m = state.movimientos.find((x) => x.id === id);
        await Store.updMov(id, { anulado: { fecha: HOY, autor: (user && user.email) || "demo" } });
        if (m && m.que === "Venta" && m.codigo && state.vehiculos[m.codigo]) await Store.setVeh(m.codigo, { traspasoRadicado: null });
      });
    },
    revisado(clave) { return guardando(async () => { await Store.setConfig({ ["revisados/" + clave]: HOY }); }); },
    // cómo voy
    mes(d) {
      const [y, m] = (ctx.mes || C.mesDe(HOY)).split("-").map(Number);
      const t = new Date(Date.UTC(y, m - 1 + Number(d), 1));
      ctx.mes = t.getUTCFullYear() + "-" + pad(t.getUTCMonth() + 1); render(true);
    },
    cajaGuardar() {
      readCur(); if (ctx.caja.contada == null) return err("Escriba cuánto contó.");
      return guardando(async () => {
        await Store.setConfig({ cajaContada: { fecha: HOY, valor: Number(ctx.caja.contada) } });
        ctx.cajaRes = C.diferenciaCaja(ctx.caja.contada, C.cajaEsperada(state)); render(true);
      });
    },
    descargar() {
      const t = C.tablasCSV(state, HOY); let i = 0;
      Object.keys(t).forEach((nombre) => setTimeout(() => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob(["﻿" + t[nombre]], { type: "text/csv;charset=utf-8" }));
        a.download = "compraventa_" + nombre + "_" + HOY + ".csv";
        document.body.appendChild(a); a.click(); a.remove();
      }, 500 * i++));
      const e = $("#dlMsg"); if (e) e.textContent = "Descargando 4 archivos (Cuaderno, Bienes, Vehículos, Retroventas)…";
    },
    // mis cosas
    filtro(f) { ctx.filtro = f; render(true); },
    ficha(k) { ctx.codigo = k; go("ficha"); },
    // desde la pantalla de resultado: la ficha queda como primera pantalla (atrás lleva al inicio)
    verFicha(k) { ctx = { codigo: k }; stack = []; go("ficha", { noPush: true }); },
    zoom(a, el) { el.classList.toggle("full"); },
    edBien() {
      const k = ctx.codigo, b = state.bienes[k];
      abrirForm("Corregir datos de " + k, [
        { g: "El bien", k: "descripcion", label: "Descripción", t: "area" }, { g: "El bien", k: "fechaEntrada", label: "Fecha de entrada", t: "date" },
        { g: "Quién se lo vendió", k: "vendedorNombre", label: "Nombre", t: "text" }, { g: "Quién se lo vendió", k: "vendedorCedula", label: "Cédula", t: "ident" }, { g: "Quién se lo vendió", k: "vendedorTelefono", label: "Teléfono", t: "tel" }],
        Object.assign({}, b), (v) => { if (!String(v.descripcion || "").trim()) throw Object.assign(new Error("datos"), { usuario: "Escriba la descripción." }); if (!v.fechaEntrada) throw Object.assign(new Error("datos"), { usuario: "Escriba la fecha de entrada." }); return Store.setBien(k, v); });
    },
    edVeh() {
      const k = ctx.codigo;
      abrirForm("Papeles de " + k, [{ g: "El vehículo", k: "marca", label: "Marca", t: "text" }, { g: "El vehículo", k: "linea", label: "Línea", t: "text" }, { g: "El vehículo", k: "modelo", label: "Modelo (año)", t: "ident" }].concat(camposPapeles, [{ g: "Traspaso", k: "traspasoRadicado", label: "Traspaso radicado (fecha)", t: "date" }]),
        Object.assign({}, state.vehiculos[k] || {}), (v) => Store.setVeh(k, limpia(Object.assign({}, v, { runtVerificado: v.runtVerificado || null, impuestosAlDia: v.impuestosAlDia || null, soatVence: v.soatVence || null, tecnoVence: v.tecnoVence || null, traspasoRadicado: v.traspasoRadicado || null, debeImpuestos: v.debeImpuestos == null ? null : v.debeImpuestos, multas: v.multas == null ? null : v.multas }))));
    },
    edRet() {
      const k = ctx.codigo;
      abrirForm("Corregir retroventa " + k, [{ g: "La persona", k: "persona", label: "Nombre", t: "text" }, { g: "La persona", k: "cedula", label: "Cédula", t: "ident" }, { g: "La persona", k: "telefono", label: "Teléfono", t: "tel" },
        { g: "La plata", k: "leDi", label: "Le dio", t: "num" }, { g: "La plata", k: "recompra", label: "Valor de recompra", t: "num" }, { g: "Las fechas", k: "vence", label: "Vence", t: "date" }, { g: "Las fechas", k: "avisoCliente", label: "Le avisé al cliente (fecha)", t: "date" }],
        Object.assign({}, state.retroventas[k]), (v) => { if (!(v.leDi > 0) || !(v.recompra > 0)) throw Object.assign(new Error("datos"), { usuario: "Escriba cuánto le dio y el valor de recompra." }); if (!v.vence) throw Object.assign(new Error("datos"), { usuario: "Escriba la fecha en que vence." }); return Store.setRet(k, limpia(Object.assign({}, v, { avisoCliente: v.avisoCliente || null }))); });
    },
    edMov(id) {
      const m = state.movimientos.find((x) => x.id === id);
      const fields = [{ g: "Cuándo y cuánto", k: "fecha", label: "Fecha", t: "date", max: HOY }, { g: "Cuándo y cuánto", k: "valor", label: "Valor", t: "num" }, { g: "Cómo fue", k: "medio", label: "Pagó con", t: "opc", opts: ["Efectivo", "Transferencia"] }, { g: "Cómo fue", k: "nota", label: "Nota", t: "text" }];
      if (m.que === "Compra" || m.que === C.RETRO) fields.push({ g: "Cómo fue", k: "pausa", label: "¿Hizo la pausa?", t: "opc", opts: ["Sí", "No"] });
      abrirForm("Corregir: " + m.que, fields, { fecha: m.fecha, valor: m.valor, medio: m.medio, nota: m.nota || "", pausa: m.pausa || null },
        (v) => { if (!(v.valor > 0) || !v.fecha) throw errDatos("Escriba el valor y la fecha."); if (v.fecha > HOY) throw errDatos("La fecha no puede ser después de hoy."); return Store.updMov(id, limpia(Object.assign({}, v, { editado: { fecha: HOY, autor: (user && user.email) || "demo" } }))); });
    },
    formGuardar() {
      readCur(); const F = ctx.form;
      return guardando(async () => { await F.guardar(F.vals); ctx.form = null; atras(); });
    },
    ajGuardar() {
      readCur();
      const { cambios, nue } = ajCambios();
      if (!cambios.length) { ctx.aj = null; return inicio(); }
      ctx.ajCambios = cambios; ctx.ajNuevo = nue;
      go("aj-confirmar");
    },
    ajConfirmado() {
      const n = ctx.ajNuevo;
      return guardando(async () => {
        await Store.setConfig({ cajaInicial: n.cajaInicial, umbralPausa: n.umbralPausa, topeTasaAnual: n.topeTasaAnual });
        ctx.aj = null; inicio();
      });
    },
  };

  // ---------- eventos ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act],[data-go]");
    if (!el) return;
    if (el.dataset.go) { go(el.dataset.go); return; }
    const f = ACT[el.dataset.act];
    if (f) f(el.dataset.arg, el);
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.num) { const d = el.value.replace(/\D/g, ""); el.value = d ? "$ " + miles(d) : ""; }
    if (ONINPUT[cur]) ONINPUT[cur](e);
  });
  document.addEventListener("change", async (e) => {
    const el = e.target;
    const tipo = el.dataset && (el.dataset.foto || el.dataset.fotoficha);
    if (!tipo || !el.files || !el.files[0]) return;
    try {
      const data = await comprimir(el.files[0]);
      if (el.dataset.foto) { readCur(); draft.fotos[tipo] = data; render(true); }
      else {
        const k = ctx.codigo;
        await Store.addFoto(k, { tipo, data }); cargarFotos(k);
      }
    } catch (x) { console.warn(x); const m = $("#fotoMsg"); if (m) m.textContent = x && x.usuario ? x.usuario : "No se pudo usar esa foto."; }
  });

  function comprimir(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        let w = img.width, hh = img.height; const m = Math.max(w, hh);
        if (m > 1280) { w = Math.round(w * 1280 / m); hh = Math.round(hh * 1280 / m); }
        const cv = document.createElement("canvas"); cv.width = w; cv.height = hh;
        cv.getContext("2d").drawImage(img, 0, 0, w, hh);
        let q = 0.7, d = cv.toDataURL("image/jpeg", q);
        while (d.length * 0.75 > 250000 && q > 0.35) { q -= 0.1; d = cv.toDataURL("image/jpeg", q); }
        URL.revokeObjectURL(url);
        if (d.length >= 400000) { const e = new Error("pesada"); e.usuario = "La foto quedó muy pesada. Tómela otra vez un poco más lejos."; rej(e); return; }
        res(d);
      };
      img.onerror = rej; img.src = url;
    });
  }

  // ---------- instalación en pantalla de inicio ----------
  function iconos() {
    try {
      const cv = document.createElement("canvas"); cv.width = cv.height = 192;
      const x = cv.getContext("2d");
      x.fillStyle = "#7A3E12"; x.fillRect(0, 0, 192, 192);
      x.fillStyle = "#F2C14E"; x.beginPath(); x.arc(96, 96, 62, 0, 7); x.fill();
      x.fillStyle = "#7A3E12"; x.font = "bold 84px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("$", 96, 100);
      const png = cv.toDataURL("image/png");
      $("#touchIcon").href = png;
      const man = { name: "Mi Compraventa", short_name: "Compraventa", start_url: location.pathname + (DEMO ? "?demo=1" : ""), display: "standalone", background_color: "#FBF5E9", theme_color: "#7A3E12", lang: "es-CO", icons: [{ src: png, sizes: "192x192", type: "image/png" }] };
      $("#manifestLink").href = "data:application/manifest+json," + encodeURIComponent(JSON.stringify(man));
    } catch (e) { /* sin icono dinámico */ }
  }

  // ---------- arranque ----------
  function cargaScript(src) { return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  // Un bien cuyos movimientos están todos anulados (se deshizo la compra) no se muestra ni cuenta.
  function normaliza() {
    fantasmas = {}; fantasmaRet = {};
    const por = {};
    state.movimientos.forEach((m) => { if (m.codigo) (por[m.codigo] = por[m.codigo] || []).push(m); });
    Object.keys(state.bienes).forEach((k) => {
      const ms = por[k];
      if (ms && ms.every((m) => m.anulado)) { fantasmas[k] = state.bienes[k]; if (state.retroventas[k]) fantasmaRet[k] = true; delete state.bienes[k]; delete state.vehiculos[k]; delete state.retroventas[k]; }
    });
  }
  function alCambiarDatos() { normaliza(); if (LIVE.has(cur)) render(true); }

  async function boot() {
    iconos();
    if (DEMO) {
      Store = demoStore(); user = { email: "demo@demo" };
      Store.start(alCambiarDatos);
      const hs = location.hash.replace("#", "");
      cur = SCREENS[hs] && hs !== "login" ? hs : "inicio";
      preparaDemo(cur);
      render(); return;
    }
    cur = "cargando"; render();
    try {
      const b = "https://www.gstatic.com/firebasejs/" + FB_VER + "/firebase-";
      await cargaScript(b + "app-compat.js"); await Promise.all([cargaScript(b + "database-compat.js"), cargaScript(b + "auth-compat.js")]);
      if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
    } catch (e) { authMsg = "No hay conexión. Intente de nuevo."; cur = "login"; render(); return; }
    firebase.auth().onAuthStateChanged((u) => {
      if (!u) { user = null; cur = "login"; stack = []; render(); return; }
      if (!u.emailVerified) { authMsg = "Esta cuenta no tiene permiso. Pídale a Juan Pablo que la autorice."; firebase.auth().signOut(); return; }
      authMsg = ""; reintento = false; user = u; Store = fbStore();
      Store.start(alCambiarDatos);
      cur = "inicio"; render();
    });
  }
  // En demo, permite entrar directo a cualquier pantalla con #nombre
  function preparaDemo(s) {
    if (s === "pausa") { draft = Object.assign(nuevoDraft("Compra"), { tipo: "Carro", placa: "NEW123", codigo: "NEW123", valor: 4500000 }); }
    if (/^c-/.test(s) || s === "r-vence" || s === "r-recompra") draft = Object.assign(nuevoDraft(/^r-/.test(s) ? "Retroventa" : "Compra"), { tipo: "Carro", placa: "NEW123", codigo: "NEW123", marca: "Mazda", valor: 4500000, recompra: 5000000, medio: "Efectivo", vendedorNombre: "Pedro Gómez", vendedorCedula: "79123456", veh: {} });
    if (s === "ficha") ctx.codigo = "ABC12";
    if (s === "v-valor") { ctx.codigo = "XYZ99"; ctx.v = {}; }
    if (s === "g-valor") ctx.g = { que: "Gasto del negocio", codigo: "" };
    if (s === "g-que") ctx.g = { que: "Gasto del negocio", codigo: "", valor: 150000 };
    if (s === "rv-valor" || s === "rv-fecha") { ctx.rvTipo = "prorroga"; ctx.codigo = "O-001"; ctx.v = { valor: 100000, vence: "2026-12-05" }; }
    if (s === "form") cur = "inicio";
  }
  boot();
})();
