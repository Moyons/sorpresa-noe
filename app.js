(() => {
  "use strict";
  const C = window.REGALO;
  const $app = document.getElementById("app");
  const KEY = "regalo-musical-v1";
  const MESES_MIN = (d) => d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  // ---------- estado ----------
  const blank = { step: 0, musical: null, fecha: null, sesion: null, extras: [], codigo: null };
  let S = { ...blank };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
  if (S.codigo) S.step = 4;
  else if (S.step === 4) S.step = 3;
  let calMes = null; // primer día del mes visible
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (_) {} };

  // ---------- utilidades ----------
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const musical = () => C.musicales.find((m) => m.id === S.musical);
  const fechaLarga = (s) => parse(s).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const disponible = (d) => {
    const s = iso(d);
    return s >= C.desde && s <= C.hasta && C.diasSemana.includes(d.getDay()) && !C.excluir.includes(s);
  };
  const sesionesDe = (s) => C.sesiones[parse(s).getDay()] || [];
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
    <section class="screen curtain-screen" id="intro">
      <div class="stage-light"></div>
      <div class="valance"></div>
      <div class="curtain l"></div><div class="curtain r"></div>
      <div class="curtain-hint">
        <div class="gift-card">
          <p class="eyebrow">Para ${C.para}</p>
          <h1 class="gold">Tienes un regalo</h1>
          <p class="lead">De parte de ${C.de}</p>
          <button class="tap" data-a="open">Abrir el telón</button>
        </div>
      </div>
      <div class="reveal">
        <p class="eyebrow">Esta noche, función</p>
        <h1 class="gold">Hola, ${C.para}</h1>
        <p class="lead">${C.mensajeIntro}</p>
      </div>
    </section>`;
  }

  function vMusicales() {
    return `
    <section class="screen">
      ${top(1)}
      <p class="eyebrow">Paso 1 de 3</p>
      <h2>¿Qué musical <span class="gold">te apetece?</span></h2>
      <p class="lead">Desliza y toca el que más ganas tengas de ver.</p>
      <div class="carousel" id="car">
        ${C.musicales.map((m) => `
          <button class="poster ${S.musical === m.id ? "sel" : ""}" data-a="musical" data-id="${m.id}" style="background:${grad(m)}">
            <span class="check">✓</span>
            <span class="glyph">${m.glifo}</span>
            <h3>${m.titulo}</h3>
            <div class="lema">${m.lema}</div>
            <p>${m.texto}</p>
            <div class="tags"><span>⏱ ${m.duracion}</span><span>${m.ambiente}</span></div>
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
    const min = parse(C.desde), max = parse(C.hasta);
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
      <p class="lead">Solo están marcados los días con función.</p>
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
      <div class="sub">Hora de la función</div>
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
            <p class="eyebrow">${C.ciudad} · ${C.personas} entradas</p>
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
        <div class="install">Tip: «Añadir a pantalla de inicio» para tenerla como app.</div>
      </div>
    </section>`;
  }

  // ---------- render ----------
  function render() {
    const v = [vIntro, vMusicales, () => { if (!calMes) calMes = startMonth(); return vFecha(); }, vDetalles, vEntrada][S.step];
    const scroll = document.getElementById("car")?.scrollLeft || 0;
    $app.innerHTML = v();
    const car = document.getElementById("car");
    if (car && scroll) car.scrollLeft = scroll;
    else if (car && S.musical) car.querySelector(".sel")?.scrollIntoView({ inline: "center", block: "nearest" });
    if (S.step !== 0) window.scrollTo(0, 0);
  }
  function startMonth() {
    const base = S.fecha ? parse(S.fecha) : new Date(Math.max(Date.now(), parse(C.desde)));
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
      `SUMMARY:🎭 ${m.titulo}`, `DESCRIPTION:Regalo de ${C.de}. ${C.personas} entradas.`, `LOCATION:${C.ciudad}`,
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
      setTimeout(() => go(1), 3600);
    } else if (a === "back") go(S.step - 1);
    else if (a === "next") go(S.step + 1);
    else if (a === "musical") {
      S.musical = b.dataset.id; save();
      document.querySelectorAll(".poster").forEach((p) => p.classList.toggle("sel", p === b));
      const cta = document.querySelector(".cta"); cta.disabled = false; cta.textContent = "Este es el mío";
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
      go(4); confetti();
    } else if (a === "avisar") avisar();
    else if (a === "ics") ics();
    else if (a === "cambiar") {
      if (confirm("¿Quieres elegir de nuevo?")) { S = { ...blank, step: 1 }; calMes = null; save(); render(); }
    }
  });

  render();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
