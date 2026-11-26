/* Cálculos de la compraventa. Funciones puras, sin DOM ni Firebase.
 * Portadas de las fórmulas de gen_cuaderno.py (Bienes H–P, Retroventas I–M, Vehículos N–O, Resumen y Avisos).
 * "hoy" siempre entra como parámetro (YYYY-MM-DD).
 *
 * Forma del estado:
 *   { config:{cajaInicial,umbralPausa,topeTasaAnual,cajaContada},
 *     movimientos:[{id,fecha,que,codigo,valor,medio,pausa,nota,...}],
 *     bienes:{codigo:{tipo,descripcion,modalidad,fechaEntrada,...}},
 *     vehiculos:{placa:{...}}, retroventas:{codigo:{...}} }
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Calc = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const INGRESOS = ["Venta", "Me pagaron prórroga", "Me recompraron", "Abono"];
  const EGRESOS = ["Compra", "Retroventa (le di plata)", "Gasto del bien", "Gasto del negocio", "Sueldo mío"];
  const QUE = EGRESOS.slice(0, 2).concat(INGRESOS, EGRESOS.slice(2));
  const TIPOS = ["Carro", "Moto", "Oro", "Reloj", "Otro"];
  const UMBRAL_DEFECTO = 2000000;
  const RETRO = "Retroventa (le di plata)";

  // ---------- fechas (YYYY-MM-DD) ----------
  function dia(iso) {
    if (!iso || typeof iso !== "string") return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return null;
    return Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000);
  }
  function diasEntre(desdeIso, hastaIso) {
    const a = dia(desdeIso), b = dia(hastaIso);
    return a == null || b == null ? null : b - a;
  }
  function addDias(iso, n) {
    const d = new Date(dia(iso) * 86400000 + n * 86400000);
    return d.toISOString().slice(0, 10);
  }
  function mesDe(iso) { return iso ? String(iso).slice(0, 7) : ""; }
  function fmtFecha(iso) {
    if (!iso) return "";
    const s = String(iso);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
    const p = s.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  // ---------- formato ----------
  function fmtPesos(n) {
    if (n == null || n === "" || isNaN(n)) return "$0";
    const v = Math.round(Number(n));
    const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (v < 0 ? "-$" : "$") + s;
  }
  function fmtPct(x, dec) {
    if (x == null || isNaN(x)) return "";
    return (x * 100).toFixed(dec == null ? 1 : dec).replace(".", ",") + " %";
  }

  // ---------- movimientos ----------
  function esIngreso(que) { return INGRESOS.indexOf(que) >= 0; }
  function entra(m) { return esIngreso(m.que) ? num(m.valor) : 0; }
  function sale(m) {
    if (!m.que || m.valor == null || m.valor === "") return 0;
    return esIngreso(m.que) ? 0 : num(m.valor);
  }
  function num(v) { const n = Number(v); return isNaN(n) ? 0 : n; }
  // Todos los movimientos, incluidos los anulados (solo para historial y exportación).
  function listaTodos(movs) {
    if (Array.isArray(movs)) return movs;
    return Object.keys(movs || {}).map((id) => Object.assign({ id }, movs[id]));
  }
  // Movimientos vigentes: los anulados no cuentan en ningún cálculo.
  function lista(movs) { return listaTodos(movs).filter((m) => !m.anulado); }

  // ---------- bien (hoja Bienes H–P) ----------
  function bienCalc(codigo, bien, movs, hoy) {
    movs = lista(movs);
    const mios = movs.filter((m) => m.codigo === codigo);
    const suma = (qs) => mios.filter((m) => qs.indexOf(m.que) >= 0).reduce((a, m) => a + num(m.valor), 0);
    const pague = suma(["Compra", RETRO]);
    const gastos = suma(["Gasto del bien"]);
    const recibi = suma(INGRESOS);
    const cierres = mios.filter((m) => (m.que === "Venta" || m.que === "Me recompraron") && m.fecha).map((m) => m.fecha).sort();
    const fechaCierre = cierres.length ? cierres[cierres.length - 1] : null;
    const hayRecompra = mios.some((m) => m.que === "Me recompraron");
    const hayVenta = mios.some((m) => m.que === "Venta");
    const estado = hayRecompra ? "Recuperado" : hayVenta ? "Vendido" : bien.modalidad === "Retroventa" ? "En retroventa" : "En inventario";
    const utilidad = fechaCierre == null ? null : recibi - pague - gastos;
    const dias = bien.fechaEntrada ? diasEntre(bien.fechaEntrada, fechaCierre || hoy) : null;
    const corto = utilidad != null && dias != null && dias < 7;
    const rinde = utilidad == null || pague <= 0 || corto ? null : (utilidad / pague / Math.max(dias == null ? 0 : dias, 1)) * 30;
    const rindeTxt = corto ? "Vendido en " + dias + (dias === 1 ? " día" : " días") : "";
    const aviso = dias != null && estado === "En inventario" && dias > 60 ? "Quieto más de 60 días" : "";
    return {
      codigo, tipo: bien.tipo, descripcion: bien.descripcion, modalidad: bien.modalidad, fechaEntrada: bien.fechaEntrada,
      pague, gastos, recibi, fechaCierre, estado, utilidad, dias, rinde, rindeTxt, aviso,
    };
  }
  function bienesCalc(state, hoy) {
    const out = {};
    Object.keys(state.bienes || {}).forEach((k) => { out[k] = bienCalc(k, state.bienes[k], state.movimientos, hoy); });
    return out;
  }

  // ---------- retroventa (hoja Retroventas I–M) ----------
  function tasaAnual(leDi, recompra, fecha, vence) {
    const d = diasEntre(fecha, vence);
    if (!(num(leDi) > 0) || !(num(recompra) > 0) || d == null || d <= 0) return null;
    return Math.pow(recompra / leDi, 365 / d) - 1;
  }
  // Tasa mensual equivalente a una tasa anual efectiva: (1+anual)^(1/12)-1.
  function tasaMensual(tasaAnualEf) {
    if (tasaAnualEf == null || !isFinite(tasaAnualEf) || tasaAnualEf <= -1) return null;
    return Math.pow(1 + tasaAnualEf, 1 / 12) - 1;
  }
  function semaforo(tasa, tope) {
    if (tasa == null) return "";
    if (tope == null || tope === "") return "Falta tope";
    if (tasa > tope) return "ROJO";
    if (tasa >= 0.8 * tope) return "AMARILLO";
    return "VERDE";
  }
  function retroCalc(codigo, r, bienesC, tope, hoy) {
    const tasa = tasaAnual(r.leDi, r.recompra, r.fecha, r.vence);
    const b = bienesC[codigo];
    const estado = b ? b.estado : "Falta en Bienes";
    const diasVencer = r.vence && estado === "En retroventa" ? diasEntre(hoy, r.vence) : null;
    let aviso = "";
    if (diasVencer != null) aviso = diasVencer < 0 ? "VENCIDO" : diasVencer <= 5 ? "Vence en " + diasVencer + " días" : "";
    return Object.assign({}, r, { codigo, tasa, semaforo: semaforo(tasa, tope), estado, diasVencer, aviso });
  }
  function retroventasCalc(state, bienesC, hoy) {
    const tope = state.config ? state.config.topeTasaAnual : null;
    const out = {};
    Object.keys(state.retroventas || {}).forEach((k) => { out[k] = retroCalc(k, state.retroventas[k], bienesC, tope, hoy); });
    return out;
  }

  // ---------- vehículo (hoja Vehículos N–O) ----------
  function vehiculoCalc(placa, v, bienesC, hoy) {
    const b = bienesC[placa];
    const estado = b ? b.estado : "Falta en Bienes";
    let aviso = "";
    if (estado === "Vendido" || estado === "Recuperado") {
      aviso = estado === "Vendido" && !v.traspasoRadicado ? "TRASPASO PENDIENTE" : "";
    } else {
      const pr = (f) => (f ? diasEntre(hoy, f) : null);
      const partes = [];
      const s = pr(v.soatVence), t = pr(v.tecnoVence);
      if (s != null && s <= 15) partes.push("SOAT vence pronto.");
      if (t != null && t <= 15) partes.push("Tecnomecánica vence pronto.");
      if (v.impuestosAlDia === "No") partes.push("Debe impuestos.");
      if (v.runtVerificado === "No") partes.push("Dueño SIN verificar.");
      aviso = partes.join(" ");
    }
    return Object.assign({}, v, { placa, estado, aviso });
  }
  function vehiculosCalc(state, bienesC, hoy) {
    const out = {};
    Object.keys(state.vehiculos || {}).forEach((k) => { out[k] = vehiculoCalc(k, state.vehiculos[k], bienesC, hoy); });
    return out;
  }

  // ---------- avisos ----------
  function umbral(state) {
    const u = state.config && state.config.umbralPausa;
    return u == null || u === "" ? UMBRAL_DEFECTO : Number(u);
  }
  function comprasSinPausa(state) {
    const u = umbral(state);
    return lista(state.movimientos).filter((m) => (m.que === "Compra" || m.que === RETRO) && num(m.valor) >= u && m.pausa !== "Sí");
  }
  function avisos(state, hoy) {
    const bienesC = bienesCalc(state, hoy);
    const retC = retroventasCalc(state, bienesC, hoy);
    const vehC = vehiculosCalc(state, bienesC, hoy);
    const rev = (state.config && state.config.revisados) || {};
    const items = [];
    // tipo = categoría (para los conteos); clave = identificador estable de este aviso concreto.
    const add = (tipo, clave, titulo, codigo, texto, siempre) => {
      if (!siempre && rev[clave]) return;
      items.push({ tipo, clave, titulo, codigo, texto });
    };
    Object.keys(retC).forEach((k) => {
      const r = retC[k];
      if (r.estado !== "En retroventa") return;
      if (r.aviso === "VENCIDO") add("retroVencidas", "vence:" + k, "Retroventa vencida", k, "Venció el " + fmtFecha(r.vence), true);
      else if (r.aviso) add("retroPorVencer", "vence:" + k, "Retroventa por vencer", k, r.aviso + " (" + fmtFecha(r.vence) + ")", true);
      if (r.semaforo === "ROJO" && r.aprobadoAbogado !== true) add("retroRojo", "tope:" + k, "Retroventa pasa el tope", k, "Tasa " + fmtPct(r.tasa) + " al año. Hable con el abogado");
    });
    Object.keys(vehC).forEach((k) => {
      const v = vehC[k];
      if (v.aviso === "TRASPASO PENDIENTE") add("traspasoPendiente", "traspaso:" + k, "Vendido sin traspaso radicado", k, "No entregue el vehículo sin el traspaso radicado", true);
      else if (v.aviso) add("vehRevisar", "papeles:" + k, "Papeles por revisar", k, v.aviso);
    });
    Object.keys(bienesC).forEach((k) => {
      if (bienesC[k].aviso) add("quietos", "quieto:" + k, "Quieto más de 60 días", k, bienesC[k].dias + " días sin venderse");
    });
    comprasSinPausa(state).forEach((m) => add("sinPausa", "pausa:" + m.id, "Compra grande sin pausa", m.codigo || "", fmtPesos(m.valor) + " el " + fmtFecha(m.fecha)));
    const claves = ["retroVencidas", "retroPorVencer", "retroRojo", "traspasoPendiente", "vehRevisar", "quietos", "sinPausa"];
    const conteos = {};
    claves.forEach((c) => { conteos[c] = items.filter((i) => i.tipo === c).length; });
    const total = claves.reduce((a, c) => a + conteos[c], 0);
    return { conteos, items, total };
  }

  // ---------- resumen (hoja Resumen) ----------
  function cajaEsperada(state) {
    const ini = num(state.config && state.config.cajaInicial);
    return lista(state.movimientos).filter((m) => m.medio === "Efectivo").reduce((a, m) => a + entra(m) - sale(m), ini);
  }
  function resumenMes(state, mes, hoy) {
    const movs = lista(state.movimientos).filter((m) => mesDe(m.fecha) === mes);
    const bienesC = bienesCalc(state, hoy);
    const entro = movs.reduce((a, m) => a + entra(m), 0);
    const salio = movs.reduce((a, m) => a + sale(m), 0);
    const utilidadCerrados = Object.keys(bienesC).reduce((a, k) => {
      const b = bienesC[k];
      return a + (b.fechaCierre && mesDe(b.fechaCierre) === mes && b.utilidad != null ? b.utilidad : 0);
    }, 0);
    const suma = (q) => movs.filter((m) => m.que === q).reduce((a, m) => a + num(m.valor), 0);
    const gastosNegocio = suma("Gasto del negocio");
    const platQuieta = Object.keys(bienesC).reduce((a, k) => {
      const b = bienesC[k];
      return a + (b.estado === "En inventario" || b.estado === "En retroventa" ? b.pague : 0);
    }, 0);
    const esperada = cajaEsperada(state);
    const cc = state.config && state.config.cajaContada;
    return {
      mes, entro, salio, utilidadCerrados, gastosNegocio,
      utilidadAntesSueldo: utilidadCerrados - gastosNegocio,
      utilidadReal: utilidadCerrados - gastosNegocio - suma("Sueldo mío"),
      sueldo: suma("Sueldo mío"),
      prorrogas: suma("Me pagaron prórroga"),
      platQuieta,
      cajaEsperada: esperada,
      cajaContada: cc && cc.valor != null ? cc.valor : null,
      diferencia: cc && cc.valor != null ? cc.valor - esperada : null,
      rindePorTipo: rindePorTipo(bienesC),
    };
  }
  function rindePorTipo(bienesC) {
    const out = {};
    TIPOS.forEach((t) => {
      const xs = Object.keys(bienesC).map((k) => bienesC[k]).filter((b) => b.tipo === t && b.rinde != null);
      out[t] = xs.length ? xs.reduce((a, b) => a + b.rinde, 0) / xs.length : null;
    });
    return out;
  }

  function diferenciaCaja(contada, esperada) {
    const d = num(contada) - num(esperada);
    return { tipo: d === 0 ? "cuadra" : d < 0 ? "faltan" : "sobran", valor: Math.abs(d) };
  }

  // ---------- ayudas de captura ----------
  function valorOro(gramos, kilates, precioGramoPuro) {
    const v = num(gramos) * (num(kilates) / 24) * num(precioGramoPuro);
    return Math.round(v);
  }
  function limpiaPlaca(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function siguienteCodigo(tipo, bienes) {
    const pref = { Oro: "O", Reloj: "R", Otro: "X" }[tipo];
    if (!pref) return null;
    let max = 0;
    Object.keys(bienes || {}).forEach((k) => {
      const m = new RegExp("^" + pref + "-(\\d+)$").exec(k);
      if (m) max = Math.max(max, +m[1]);
    });
    return pref + "-" + String(max + 1).padStart(3, "0");
  }

  // ---------- CSV (separador ; para Excel en español) ----------
  function celda(v) {
    if (v == null) return "";
    if (typeof v === "number") return String(v).replace(".", ",");
    let s = String(v);
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(encabezados, filas) {
    return [encabezados].concat(filas).map((f) => f.map(celda).join(";")).join("\r\n");
  }
  function tablasCSV(state, hoy) {
    const bienesC = bienesCalc(state, hoy);
    const retC = retroventasCalc(state, bienesC, hoy);
    const vehC = vehiculosCalc(state, bienesC, hoy);
    const movs = listaTodos(state.movimientos).slice().sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
    return {
      Cuaderno: toCSV(["Fecha", "Qué pasó", "Código del bien", "Valor", "Efectivo o transferencia", "¿Hice la pausa?", "Nota", "Entra", "Sale", "Mes", "Registró", "Anulado"],
        movs.map((m) => [fmtFecha(m.fecha), m.que, m.codigo || "", num(m.valor), m.medio || "", m.pausa || "", m.nota || "", m.anulado ? 0 : entra(m), m.anulado ? 0 : sale(m), mesDe(m.fecha), m.autor || "", m.anulado ? "Sí" : ""])),
      Bienes: toCSV(["Código", "Tipo", "Descripción", "Compra o retroventa", "Fecha de entrada", "Quién le vendió", "Le pagué", "Gastos del bien", "Recibí", "Fecha de cierre", "Estado", "Utilidad", "Días", "Rinde al mes", "Aviso"],
        Object.keys(state.bienes || {}).map((k) => {
          const b = state.bienes[k], c = bienesC[k];
          return [k, b.tipo, b.descripcion || "", b.modalidad, fmtFecha(b.fechaEntrada), b.vendedorNombre || "",
            c.pague, c.gastos, c.recibi, fmtFecha(c.fechaCierre), c.estado, c.utilidad == null ? "" : c.utilidad, c.dias == null ? "" : c.dias, c.rinde == null ? "" : Math.round(c.rinde * 1000) / 1000, c.aviso];
        })),
      Vehiculos: toCSV(["Placa", "Marca", "Línea", "Modelo (año)", "Ciudad de matrícula", "Dueño verificado en RUNT", "SOAT vence", "Tecnomecánica vence", "Impuestos al día", "Debe de impuestos", "Multas SIMIT", "Peritaje", "Traspaso radicado (fecha)", "Estado", "Aviso"],
        Object.keys(vehC).map((k) => {
          const v = vehC[k];
          return [k, v.marca || "", v.linea || "", v.modelo || "", v.ciudad || "", v.runtVerificado || "", fmtFecha(v.soatVence), fmtFecha(v.tecnoVence), v.impuestosAlDia || "",
            v.debeImpuestos == null ? "" : v.debeImpuestos, v.multas == null ? "" : v.multas, v.peritaje || "", fmtFecha(v.traspasoRadicado), v.estado, v.aviso];
        })),
      Retroventas: toCSV(["Código del bien", "Persona", "Fecha", "Le di", "Valor de recompra", "Vence", "Tasa al año", "Semáforo", "Estado", "Días para vencer", "Aviso", "Le avisé al cliente (fecha)"],
        Object.keys(retC).map((k) => {
          const r = retC[k];
          return [k, r.persona || "", fmtFecha(r.fecha), num(r.leDi), num(r.recompra), fmtFecha(r.vence), r.tasa == null ? "" : Math.round(r.tasa * 1000) / 1000, r.semaforo, r.estado, r.diasVencer == null ? "" : r.diasVencer, r.aviso, fmtFecha(r.avisoCliente)];
        })),
    };
  }

  return {
    INGRESOS, EGRESOS, QUE, TIPOS, UMBRAL_DEFECTO, RETRO,
    dia, diasEntre, addDias, mesDe, fmtFecha, fmtPesos, fmtPct,
    esIngreso, entra, sale, lista, listaTodos, diferenciaCaja,
    bienCalc, bienesCalc, tasaAnual, tasaMensual, semaforo, retroCalc, retroventasCalc, vehiculoCalc, vehiculosCalc,
    umbral, comprasSinPausa, avisos, cajaEsperada, resumenMes, rindePorTipo,
    valorOro, limpiaPlaca, siguienteCodigo, toCSV, tablasCSV,
  };
});
