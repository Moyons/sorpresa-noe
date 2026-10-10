(() => {
  "use strict";
  const C = window.REGALO;
  const CARTELERA = window.CARTELERA;
  const $app = document.getElementById("app");
  const KEY = "regalo-musical-v1";
  const MESES_MIN = (d) => d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  // ---------- estado ----------
  const blank = { step: 0, musical: null, fecha: null, sesion: null, extras: [], codigo: null };
  let S = { ...blank };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
  if (S.codigo) S.step = 6;
  else if (S.step === 6) S.step = 5;
  let calMes = null; // primer día del mes visible
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (_) {} };

  // ---------- utilidades ----------
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const musical = () => CARTELERA.find((m) => m.id === S.musical);
  const fechaLarga = (s) => parse(s).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  // Primer día elegible: hoy + antelación
  const minFecha = () => { const d = new Date(); d.setDate(d.getDate() + C.antelacionDias); return iso(d); };
  const fechasDe = (m) => Object.keys(m.sesiones).filter((f) => f >= minFecha());
  const disponible = (d) => { const m = musical(); return !!m && m.sesiones[iso(d)] !== undefined && iso(d) >= minFecha(); };
  const sesionesDe = (s) => musical().sesiones[s] || [];
  const grad = (m) => `linear-gradient(155deg, ${m.colores[0]}, ${m.colores[1]})`;
  const extrasElegidos = () => C.extras.filter((e) => S.extras.includes(e.id));

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  // ---------- confeti ----------
  function confetti() {
    const cv = document.getElementById("confetti"), ctx = cv.getContext("2d");
    cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
    const cols = ["#f0cd75", "#c21d44", "#fff3d6", "#b8862b", "#ff7a9c"];
    const ps = Array.from({ length: 140 }, () => ({
      x: Math.random() * cv.width, y: -Math.random() * cv.height * 0.5, r: (4 + Math.random() * 7) * devicePixelRatio,
      vy: (2 + Math.random() * 4) * devicePixelRatio, vx: (Math.random() - 0.5) * 3 * devicePixelRatio,
      a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, c: cols[(Math.random() * cols.length) | 0],
    }));
    let f = 0;
    (function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
      });
      if (++f < 260) requestAnimationFrame(tick); else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }

  // ---------- vistas ----------
  const top = (n) => `
    <div class="topbar">
      <button class="back" data-a="back" aria-label="Volver">←</button>
      <div class="dots">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>
    </div>`;

  function vIntro() {
    return `
    <section class="screen env-screen" id="intro">
      <p class="eyebrow">Solo para ${C.para}</p>
      <div class="env">
        <div class="env-body"></div>
        <div class="letter"><small>Para ${C.para}</small><b>Tienes una sorpresa</b></div>
        <div class="env-front"></div>
        <div class="env-flap"></div>
        <button class="seal" data-a="open" aria-label="Abrir el sobre">${C.para[0]}</button>
      </div>
      <p class="lead env-hint">Toca el sello para abrirlo</p>
    </section>`;
  }

  function vPistas() {
    return `
    <section class="screen">
      <div class="topbar"><button class="back" data-a="back" aria-label="Volver">←</button></div>
      <p class="eyebrow">De parte de ${C.de}</p>
      <h2>Vamos con <span class="gold">unas pistas</span></h2>
      <p class="lead">Toca las tarjetas para descubrirlas.</p>
      <div class="clues">
        ${C.pistas.map((t, i) => `
          <button class="clue" data-a="pista">
            <span class="face fr">Pista ${i + 1}<em>?</em></span>
            <span class="face bk">${t}</span>
          </button>`).join("")}
      </div>
      <div id="guess" class="guess" hidden>
        <div class="sub">¿Qué crees que es?</div>
        <div class="chips">
          ${C.adivina.map((o, i) => `<button class="chip small" data-a="adivina" data-i="${i}">${o.texto}</button>`).join("")}
        </div>
        <p class="resp" id="resp"></p>
      </div>
      <div class="footer"><button class="cta" id="goRasca" data-a="next" disabled>Descúbrelo</button></div>
    </section>`;
  }

  function vRasca() {
    return `
    <section class="screen">
      <div class="topbar"><button class="back" data-a="back" aria-label="Volver">←</button></div>
      <p class="eyebrow">Última prueba</p>
      <h2>Rasca para <span class="gold">descubrirlo</span></h2>
      <div class="scratch" id="scratch">
        <div class="prize"><span class="big">🎭</span><b>Un musical</b><small>${C.mensajeIntro}</small></div>
        <canvas id="foil"></canvas>
      </div>
      <div class="footer"><button class="cta" id="goMus" data-a="next" disabled>Rasca la tarjeta</button></div>
    </section>`;
  }

  function initScratch() {
    const box = document.getElementById("scratch"), cv = document.getElementById("foil");
    if (!cv) return;
    const r = box.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const ctx = cv.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
    g.addColorStop(0, "#f7dc8a"); g.addColorStop(.5, "#d9ae52"); g.addColorStop(1, "#b8862b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "rgba(90,10,31,.55)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `700 ${26 * dpr}px Georgia, serif`; ctx.fillText("RASCA AQUÍ", cv.width / 2, cv.height / 2 - 14 * dpr);
    ctx.font = `${40 * dpr}px serif`; ctx.fillText("✨", cv.width / 2, cv.height / 2 + 30 * dpr);
    ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "#000";
    let down = false, done = false, n = 0;
    const scratch = (e) => {
      const b = cv.getBoundingClientRect(), x = (e.clientX - b.left) * dpr, y = (e.clientY - b.top) * dpr;
      ctx.beginPath(); ctx.arc(x, y, 26 * dpr, 0, 7); ctx.fill();
      if (done || ++n % 6) return;
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let clear = 0, tot = 0;
      for (let i = 3; i < d.length; i += 160) { tot++; if (d[i] === 0) clear++; }
      if (clear / tot > 0.45) {
        done = true; cv.style.opacity = 0; cv.style.pointerEvents = "none"; confetti();
        const cta = document.getElementById("goMus"); cta.disabled = false; cta.textContent = "Elegir mi musical";
      }
    };
    cv.addEventListener("pointerdown", (e) => { down = true; cv.setPointerCapture(e.pointerId); scratch(e); });
    cv.addEventListener("pointermove", (e) => { if (down) scratch(e); });
    cv.addEventListener("pointerup", () => (down = false));
  }

  function vMusicales() {
    return `
    <section class="screen">
      ${top(1)}
      <p class="eyebrow">Paso 1 de 3</p>
      <h2>¿Qué musical <span class="gold">te apetece?</span></h2>
      <p class="lead">Desliza y toca el que más ganas tengas de ver.</p>
      <div class="carousel" id="car">
        ${CARTELERA.filter((m) => fechasDe(m).length).map((m) => `
          <button class="poster ${S.musical === m.id ? "sel" : ""}" data-a="musical" data-id="${m.id}" style="background:${grad(m)}">
            <span class="check">✓</span>
            <span class="glyph">${m.glifo}</span>
            <h3>${m.titulo}</h3>
            <div class="lema">${m.lema}</div>
            <p>${m.texto}</p>
            <div class="tags"><span>📍 ${m.teatro}</span>${m.duracion ? `<span>⏱ ${m.duracion}</span>` : ""}<span>${m.ambiente}</span></div>
          </button>`).join("")}
      </div>
      <div class="footer"><button class="cta" data-a="next" ${S.musical ? "" : "disabled"}>${S.musical ? "Este es el mío" : "Elige uno"}</button></div>
    </section>`;
  }

  function vFecha() {
    const first = calMes;
    const y = first.getFullYear(), m = first.getMonth();
    const offset = (first.getDay() + 6) % 7; // semana empieza en lunes
    const dias = new Date(y, m + 1, 0).getDate();
    const fs = fechasDe(musical()), min = parse(fs[0]), max = parse(fs[fs.length - 1]);
    const prevOk = new Date(y, m, 0) >= new Date(min.getFullYear(), min.getMonth(), 1);
    const nextOk = new Date(y, m + 1, 1) <= max;
    let celdas = "";
    for (let i = 0; i < offset; i++) celdas += "<div></div>";
    for (let d = 1; d <= dias; d++) {
      const dt = new Date(y, m, d), s = iso(dt), ok = disponible(dt);
      celdas += ok
        ? `<button class="day ok ${S.fecha === s ? "sel" : ""}" data-a="fecha" data-d="${s}">${d}</button>`
        : `<div class="day">${d}</div>`;
    }
    return `
    <section class="screen">
      ${top(2)}
      <p class="eyebrow">Paso 2 de 3</p>
      <h2>¿Qué día <span class="gold">te viene bien?</span></h2>
      <p class="lead">Solo están marcados los días en que <b>${musical().titulo}</b> tiene función.</p>
      <div class="cal">
        <div class="cal-head">
          <button data-a="mes" data-n="-1" ${prevOk ? "" : "disabled"} aria-label="Mes anterior">‹</button>
          <h3>${MESES_MIN(first)}</h3>
          <button data-a="mes" data-n="1" ${nextOk ? "" : "disabled"} aria-label="Mes siguiente">›</button>
        </div>
        <div class="grid">
          ${["L", "M", "X", "J", "V", "S", "D"].map((d) => `<div class="dow">${d}</div>`).join("")}
          ${celdas}
        </div>
      </div>
      <div class="pick">${S.fecha ? fechaLarga(S.fecha) : ""}</div>
      <div class="footer"><button class="cta" data-a="next" ${S.fecha ? "" : "disabled"}>${S.fecha ? "Ese día" : "Elige un día"}</button></div>
    </section>`;
  }

  function vDetalles() {
    const ses = sesionesDe(S.fecha);
    return `
    <section class="screen">
      ${top(3)}
      <p class="eyebrow">Paso 3 de 3</p>
      <h2>Los <span class="gold">últimos detalles</span></h2>
      <div class="sub">Hora de la función · ${musical().titulo}</div>
      <div class="chips">
        ${ses.map((h) => `<button class="chip ${S.sesion === h ? "sel" : ""}" data-a="sesion" data-h="${h}">${h}</button>`).join("")}
      </div>
      <div class="sub">Para redondear la noche</div>
      ${C.extras.map((e) => `
        <button class="extra ${S.extras.includes(e.id) ? "sel" : ""}" data-a="extra" data-id="${e.id}">
          <span class="em">${e.emoji}</span>
          <span><b>${e.titulo}</b><small>${e.texto}</small></span>
          <span class="tick">✓</span>
        </button>`).join("")}
      <div class="footer"><button class="cta" data-a="confirmar" ${S.sesion ? "" : "disabled"}>${S.sesion ? "Ver mi entrada 🎟️" : "Elige la hora"}</button></div>
    </section>`;
  }

  function vEntrada() {
    const m = musical(), ex = extrasElegidos();
    return `
    <section class="screen">
      <p class="eyebrow" style="text-align:center">Tu entrada está lista</p>
      <div class="ticket-wrap">
        <div class="ticket">
          <div class="ticket-top" style="background:${grad(m)}">
            <span class="glyph">${m.glifo}</span>
            <p class="eyebrow">${m.teatro} · ${C.personas} entradas</p>
            <h2>${m.titulo}</h2>
          </div>
          <div class="perf"></div>
          <div class="ticket-bot">
            <div class="wide"><div class="k">Fecha</div><div class="v">${fechaLarga(S.fecha)}</div></div>
            <div><div class="k">Hora</div><div class="v">${S.sesion}</div></div>
            <div><div class="k">Para</div><div class="v">${C.para} +${C.personas - 1}</div></div>
            ${ex.length ? `<div class="wide"><div class="k">Plan extra</div><div class="v">${ex.map((e) => e.emoji + " " + e.titulo).join(" · ")}</div></div>` : ""}
            <div class="code">Nº ${S.codigo}</div>
          </div>
        </div>
      </div>
      <p class="final-msg">${C.mensajeFinal}</p>
      <div class="footer">
        <button class="cta" data-a="avisar">Avisar a ${C.de} 💌</button>
        <button class="ghost" data-a="ics">📅 Añadir al calendario</button>
        <button class="ghost" data-a="cambiar">Cambiar mi elección</button>
        <button class="ghost" data-a="inicio">↺ Volver al principio</button>
        <div class="install">Tip: «Añadir a pantalla de inicio» para tenerla como app.</div>
      </div>
    </section>`;
  }

  // ---------- render ----------
  function render() {
    const v = [vIntro, vPistas, vRasca, vMusicales, () => { if (!calMes) calMes = startMonth(); return vFecha(); }, vDetalles, vEntrada][S.step];
    const scroll = document.getElementById("car")?.scrollLeft || 0;
    $app.innerHTML = v();
    const car = document.getElementById("car");
    if (car && scroll) car.scrollLeft = scroll;
    else if (car && S.musical) car.querySelector(".sel")?.scrollIntoView({ inline: "center", block: "nearest" });
    if (S.step === 2) initScratch();
    if (S.step !== 0) window.scrollTo(0, 0);
  }
  function startMonth() {
    const base = parse(S.fecha || fechasDe(musical())[0]);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }
  const go = (n) => { S.step = n; save(); render(); };

  // ---------- mensajes y calendario ----------
  function resumen() {
    const m = musical(), ex = extrasElegidos();
    return `🎭 ¡Ya he elegido mi regalo!\n\nMusical: ${m.titulo}\nDía: ${fechaLarga(S.fecha)}\nHora: ${S.sesion}` +
      (ex.length ? `\nPlan extra: ${ex.map((e) => e.titulo).join(", ")}` : "") + `\n\nNº ${S.codigo}\n¡Gracias, ${C.de}! 💛`;
  }
  async function avisar() {
    const txt = resumen();
    if (C.whatsapp) { window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(txt)}`, "_blank"); return; }
    if (navigator.share) { try { await navigator.share({ text: txt }); return; } catch (e) { if (e.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(txt); toast("Copiado: pégalo en un mensaje 💌"); }
    catch (_) { window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank"); }
  }
  function ics() {
    const m = musical(), [h, mi] = S.sesion.split(":").map(Number);
    const ini = parse(S.fecha); ini.setHours(h, mi);
    const fin = new Date(ini.getTime() + 3 * 3600e3);
    const f = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//RegaloMusical//ES", "BEGIN:VEVENT",
      `UID:${S.codigo}@regalo-musical`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(ini)}`, `DTEND:${f(fin)}`,
      `SUMMARY:🎭 ${m.titulo}`, `DESCRIPTION:Regalo de ${C.de}. ${C.personas} entradas.`, `LOCATION:${m.teatro}, ${C.ciudad}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:¡Mañana, musical!", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    a.download = `${m.id}.ics`; document.body.appendChild(a); a.click(); a.remove();
  }

  // ---------- eventos ----------
  $app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    if (a === "open") {
      document.getElementById("intro").classList.add("opened");
      setTimeout(() => go(1), 2400);
    } else if (a === "back") go(S.step - 1);
    else if (a === "next") go(S.step + 1);
    else if (a === "musical") {
      S.musical = b.dataset.id;
      if (S.fecha && !(S.fecha >= minFecha() && musical().sesiones[S.fecha])) { S.fecha = null; S.sesion = null; }
      calMes = null; save();
      document.querySelectorAll(".poster").forEach((p) => p.classList.toggle("sel", p === b));
      const cta = document.querySelector(".cta"); cta.disabled = false; cta.textContent = "Este es el mío";
    } else if (a === "pista") {
      b.classList.add("flip");
      if (document.querySelectorAll(".clue.flip").length === C.pistas.length) {
        const g = document.getElementById("guess"); g.hidden = false;
        setTimeout(() => g.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
      }
    } else if (a === "adivina") {
      const o = C.adivina[b.dataset.i];
      document.querySelectorAll("[data-a=adivina]").forEach((c) => c.classList.toggle("sel", c === b));
      document.getElementById("resp").textContent = o.resp;
      const cta = document.getElementById("goRasca"); cta.disabled = false;
    } else if (a === "mes") {
      calMes = new Date(calMes.getFullYear(), calMes.getMonth() + Number(b.dataset.n), 1); render();
    } else if (a === "fecha") {
      if (S.fecha !== b.dataset.d) { S.fecha = b.dataset.d; S.sesion = null; }
      save(); render();
    } else if (a === "sesion") { S.sesion = b.dataset.h; save(); render(); }
    else if (a === "extra") {
      const i = S.extras.indexOf(b.dataset.id);
      i < 0 ? S.extras.push(b.dataset.id) : S.extras.splice(i, 1);
      save(); render();
    } else if (a === "confirmar") {
      S.codigo = "MUS-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      go(6); confetti();
    } else if (a === "avisar") avisar();
    else if (a === "ics") ics();
    else if (a === "inicio") go(0);
    else if (a === "cambiar") {
      if (confirm("¿Quieres elegir de nuevo?")) { S = { ...blank, step: 3 }; calMes = null; save(); render(); }
    }
  });

  render();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
