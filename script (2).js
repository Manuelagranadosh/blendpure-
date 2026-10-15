/* ============================================================
   BLENDPURE · Interacciones
   ============================================================ */

/* ---------- 1. Imágenes ----------
   Rutas relativas a la raíz del repositorio. Si dejas IMG_RENDER vacío,
   la sección "Propuesta de valor" usa la fotografía principal. */
const IMG_PRODUCT = "img/hero-product.jpg";
const IMG_RENDER = "img/blendpure-render.jpg";

document.querySelectorAll(".js-product-img").forEach((img) => (img.src = IMG_PRODUCT));
document.querySelectorAll(".js-alt-img").forEach((img) => {
  img.src = IMG_RENDER || IMG_PRODUCT;
  if (!IMG_RENDER) {
    img.alt = "Estación BlendPure sobre un tocador";
    const cap = img.closest("figure")?.querySelector("figcaption");
    if (cap) cap.textContent = "Fotografía del producto · prototipo conceptual";
  }
});

/* ---------- 2. Utilidades ---------- */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const PRICE = 349900;
const fmtCOP = (n) => "COP $" + n.toLocaleString("es-CO");
const fmtNum = (n, d = 0) => n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------- 3. Header, menú y progreso ---------- */
const header = $("#header");
const nav = $("#nav");
const menuBtn = $("#menuBtn");
const progress = $("#progress");

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", open);
});
$$("a", nav).forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  })
);

window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  },
  { passive: true }
);

/* Enlace activo según la sección visible */
const navLinks = $$("a", nav);
const sectionIds = navLinks.map((a) => a.getAttribute("href").slice(1));
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sectionIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el) spy.observe(el);
});

/* ---------- 4. Animaciones de entrada y contadores ---------- */
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.decimals || "0", 10);
  const suffix = el.dataset.suffix || "";
  const dur = 1400;
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmtNum(target * eased, dec) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      $$("[data-count]", e.target).forEach(animateCount);
      if (e.target.matches("[data-count]")) animateCount(e.target);
      $$(".bar__fill", e.target).forEach((b) => (b.style.width = b.dataset.w));
      revealObs.unobserve(e.target);
    });
  },
  { threshold: 0.15 }
);
$$(".reveal").forEach((el) => revealObs.observe(el));

/* ---------- 5. Gráficos de barras (datos reales de la presentación) ---------- */
const CHARTS = {
  costs: {
    unit: "cop",
    data: [
      ["Esponja estándar (COP 15.000–45.000)", 30000],
      ["Esponja premium (COP 60.000–110.000)", 85000],
      ["BlendPure, rango objetivo (COP 250.000–450.000)", 350000, true],
    ],
  },
  p2: {
    data: [
      ["Después de cada uso (est.)", 6.1],
      ["1–2 veces por semana", 25.9],
      ["Una vez al mes", 45.6, true],
      ["Nunca", 22.4, true],
    ],
  },
  p3: {
    data: [
      ["Olvido / pereza", 47.6, true],
      ["Tiempo del proceso manual", 40.1, true],
      ["No lo considero necesario", 12.2],
    ],
  },
  p4: {
    data: [
      ["Jabón de manos o barra", 46.9, true],
      ["Limpiador líquido especializado", 37.4],
      ["Solo agua", 9.5],
      ["Dispositivo de limpieza (est.)", 6.2],
    ],
  },
  p6: {
    data: [
      ["Menos de COP 150.000", 56.5],
      ["COP 250.000–450.000 (rango objetivo)", 25.2, true],
      ["No pagaría", 10.9],
      ["Más de COP 450.000 (est.)", 7.4],
    ],
  },
  p7: {
    data: [
      ["Reseñas de creadoras", 42.9, true],
      ["Demos en video", 38.1, true],
      ["Descuentos / garantía", 19.0],
    ],
  },
};

$$("[data-chart]").forEach((box) => {
  const cfg = CHARTS[box.dataset.chart];
  if (!cfg) return;
  const max = Math.max(...cfg.data.map((d) => d[1]));
  box.innerHTML = cfg.data
    .map(([label, val, key]) => {
      const w = (val / max) * 100;
      const txt = cfg.unit === "cop" ? fmtCOP(val) : fmtNum(val, 1) + " %";
      return `<div class="bar__row${key ? " is-key" : ""}">
        <span class="bar__label">${label}</span>
        <div class="bar__track" role="img" aria-label="${label}: ${txt}">
          <div class="bar__fill" data-w="${w}%"></div><span class="bar__value">${txt}</span>
        </div></div>`;
    })
    .join("");
});

/* Las barras dentro de pestañas ocultas se animan al mostrarse */
const fillBars = (ctx) => $$(".bar__fill", ctx).forEach((b) => (b.style.width = b.dataset.w));
const resetBars = (ctx) => $$(".bar__fill", ctx).forEach((b) => (b.style.width = "0"));

/* ---------- 6. Pestañas de la encuesta ---------- */
$$(".tabs__list button").forEach((btn) =>
  btn.addEventListener("click", () => {
    const tabs = btn.closest(".tabs");
    $$(".tabs__list button", tabs).forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn);
    });
    $$(".tabs__panel", tabs).forEach((p) => {
      const on = p.dataset.panel === btn.dataset.tab;
      p.classList.toggle("is-active", on);
      if (on) {
        resetBars(p);
        requestAnimationFrame(() => requestAnimationFrame(() => fillBars(p)));
      }
    });
  })
);

/* ---------- 7. Casos de éxito / fracaso ---------- */
$$("[data-cases]").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$("[data-cases]").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn);
    });
    $$(".cases__group").forEach((g) => g.classList.toggle("is-active", g.dataset.group === btn.dataset.cases));
  })
);

/* ---------- 8. Carrusel de citas ---------- */
(() => {
  const quotes = $$(".quote");
  const dotsBox = $(".quotes__dots");
  let i = 0;
  let timer;
  quotes.forEach((_, k) => {
    const d = document.createElement("button");
    d.setAttribute("aria-label", `Cita ${k + 1}`);
    d.addEventListener("click", () => { go(k); restart(); });
    dotsBox.appendChild(d);
  });
  const dots = $$("button", dotsBox);
  const go = (k) => {
    i = (k + quotes.length) % quotes.length;
    quotes.forEach((q, n) => q.classList.toggle("is-active", n === i));
    dots.forEach((d, n) => d.classList.toggle("is-active", n === i));
  };
  const restart = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 6500); };
  go(0);
  restart();
})();

/* ---------- 9. Marco teórico: tarjetas que se voltean ---------- */
const THEORY = [
  { n: 1, cat: "consumidor", t: "Difusión de innovaciones", a: "Everett M. Rogers · 1962", d: "Explica cómo se adopta una categoría nueva, comenzando por adoptantes tempranos.", b: "Empezar con beauty creators como adoptantes tempranos." },
  { n: 2, cat: "consumidor", t: "Acción planificada", a: "Icek Ajzen · 1991", d: "Explica la brecha entre la intención y el comportamiento real.", b: "Explica por qué saber que hay que limpiar no implica hacerlo: hay que reducir la fricción." },
  { n: 3, cat: "estrategia", t: "STP (segmentación)", a: "Philip Kotler y Gary Armstrong · 2018", d: "Segmentar, elegir un público objetivo y posicionar la oferta.", b: "Define el segmento prioritario (mujeres de 18–35 en Bogotá) y el posicionamiento “todo en uno”." },
  { n: 4, cat: "estrategia", t: "Value Proposition Canvas", a: "Osterwalder, Pigneur, Bernarda y Smith · 2014", d: "Conecta las características del producto con el dolor del consumidor.", b: "Vender ahorro de tiempo y esfuerzo, no solo limpieza." },
  { n: 5, cat: "relacion", t: "CRM", a: "Adrian Payne y Pennie Frow · 2005", d: "Gestión estratégica de la relación con el cliente a lo largo del tiempo.", b: "Centralizar datos de clientas y leads para un seguimiento personalizado." },
  { n: 6, cat: "relacion", t: "Omnicanalidad", a: "Verhoef, Kannan e Inman · 2015", d: "Integrar canales para una experiencia continua, no fragmentada.", b: "Conectar Instagram, TikTok, WhatsApp, correo y tienda online." },
  { n: 7, cat: "relacion", t: "Customer Journey", a: "Katherine Lemon y Peter Verhoef · 2016", d: "La experiencia completa antes, durante y después de la compra.", b: "Acompañar a la clienta en cada etapa de su recorrido." },
  { n: 8, cat: "relacion", t: "Customer Lifetime Value", a: "Sunil Gupta y Donald Lehmann · 2003", d: "El valor total que un cliente genera durante su relación con la marca.", b: "Justifica el BlendPure Refill Club y la recompra de cápsulas." },
];

const theoryBox = $("#theory");
theoryBox.innerHTML = THEORY.map(
  (c) => `<button class="concept reveal" data-cat="${c.cat}" aria-pressed="false" aria-label="${c.t}. Ver aplicación en BlendPure">
    <div class="concept__inner">
      <div class="concept__face concept__front">
        <span class="concept__num">${String(c.n).padStart(2, "0")}</span>
        <h4>${c.t}</h4><span class="concept__author">${c.a}</span>
        <p>${c.d}</p><span class="concept__hint">Ver aplicación →</span>
      </div>
      <div class="concept__face concept__back">
        <span class="eyebrow">Para BlendPure</span><p>${c.b}</p>
      </div>
    </div></button>`
).join("");
$$(".concept", theoryBox).forEach((c) => {
  revealObs.observe(c);
  c.addEventListener("click", () => {
    const f = c.classList.toggle("is-flipped");
    c.setAttribute("aria-pressed", f);
  });
});
$$(".filters button").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".filters button").forEach((b) => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    $$(".concept", theoryBox).forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
  })
);

/* ---------- 10. Customer journey ---------- */
const JOURNEY = [
  {
    goal: "Generar reconocimiento de un problema que la usuaria ya vive: la esponja que no se limpia por falta de tiempo.",
    channels: ["Reels y TikTok con antes/después", "Microcreadoras de maquillaje como adoptantes tempranas (Rogers)"],
    evidence: "El 81 % decide por reseñas de creadoras y demos en video (P7).",
  },
  {
    goal: "Reducir el escepticismo frente a un “gadget” nuevo mostrando el ciclo completo y su duración real.",
    channels: ["Landing con video demostrativo", "Preguntas frecuentes sin promesas sanitarias", "WhatsApp para dudas"],
    evidence: "El video en la landing es “100 % indispensable” para generar confianza (M. Saldarriaga, e-commerce).",
  },
  {
    goal: "Facilitar la primera compra a una marca nueva y disminuir el riesgo percibido.",
    channels: ["Tienda web con pago contra entrega", "TikTok Shop como objetivo para 2027"],
    evidence: "La confianza en una marca nueva es el principal reto del e-commerce según las entrevistas.",
  },
  {
    goal: "Convertir la primera compra en una relación: acompañamiento, recompra de cápsulas y recomendación.",
    channels: ["CRM y seguimiento personalizado", "BlendPure Refill Club", "Contenido de rutina en redes"],
    evidence: "Hipótesis aún sin evidencia: la recompra no se midió (Customer Lifetime Value).",
  },
];
const journeyPanel = $("#journeyPanel");
const renderJourney = (k) => {
  const s = JOURNEY[k];
  journeyPanel.style.animation = "none";
  void journeyPanel.offsetWidth;
  journeyPanel.style.animation = "";
  journeyPanel.innerHTML = `
    <div><h4>Objetivo</h4><p>${s.goal}</p></div>
    <div><h4>Canales y acciones</h4><ul>${s.channels.map((c) => `<li>${c}</li>`).join("")}</ul></div>
    <div><h4>Respaldo</h4><p>${s.evidence}</p></div>`;
};
$$(".journey__tabs button").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".journey__tabs button").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn);
    });
    renderJourney(+btn.dataset.stage);
  })
);
renderJourney(0);

/* ---------- 11. Bolsa de compra (simulación) ---------- */
const STORE_KEY = "blendpure-bag";
const load = () => {
  try { return Math.max(0, parseInt(localStorage.getItem(STORE_KEY) || "0", 10) || 0); } catch { return 0; }
};
const save = (q) => { try { localStorage.setItem(STORE_KEY, String(q)); } catch {} };

let bagQty = load();
let pickQty = 1;

const qtyValue = $("#qtyValue");
$$("[data-qty]").forEach((b) =>
  b.addEventListener("click", () => {
    pickQty = Math.min(5, Math.max(1, pickQty + parseInt(b.dataset.qty, 10)));
    qtyValue.textContent = pickQty;
  })
);

const toast = $("#toast");
let toastTimer;
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
};

const lineHTML = () => `
  <div class="line">
    <img src="${IMG_PRODUCT}" alt="BlendPure">
    <div>
      <h4>BlendPure</h4>
      <small>Prototipo conceptual · precio de referencia</small>
      <div class="line__controls">
        <div class="qty"><button type="button" data-line="-1" aria-label="Restar">−</button><output>${bagQty}</output><button type="button" data-line="1" aria-label="Sumar">+</button></div>
        <button type="button" class="line__remove" data-remove>Eliminar</button>
      </div>
    </div>
    <span class="line__price">${fmtCOP(PRICE * bagQty)}</span>
  </div>`;

const emptyHTML = `<div class="empty"><p>Tu bolsa está vacía.</p><a href="#producto" class="btn btn--ghost">Ver BlendPure</a></div>`;

const renderBag = () => {
  const html = bagQty > 0 ? lineHTML() : emptyHTML;
  $("#bagItems").innerHTML = html;
  $("#drawerItems").innerHTML = html;
  const total = fmtCOP(PRICE * bagQty);
  $("#bagSubtotal").textContent = total;
  $("#bagTotal").textContent = total;
  $("#drawerTotal").textContent = total;
  const count = $("#cartCount");
  count.textContent = bagQty;
  count.classList.toggle("is-visible", bagQty > 0);
  $("#checkout").disabled = bagQty === 0;
  save(bagQty);
};

/* Delegación para los controles dentro de la bolsa */
document.addEventListener("click", (e) => {
  const step = e.target.closest("[data-line]");
  if (step) { bagQty = Math.min(5, Math.max(0, bagQty + parseInt(step.dataset.line, 10))); renderBag(); }
  if (e.target.closest("[data-remove]")) { bagQty = 0; renderBag(); showToast("BlendPure se eliminó de tu bolsa."); }
});

$("#addToBag").addEventListener("click", () => {
  bagQty = Math.min(5, bagQty + pickQty);
  renderBag();
  const btn = $("#cartOpen");
  btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  showToast(`Agregaste ${pickQty} BlendPure a tu bolsa (simulación).`);
  openDrawer();
});

$("#checkout").addEventListener("click", () =>
  showToast("Demostración académica: BlendPure aún no está a la venta y no se procesan pagos.")
);

/* Drawer */
const drawer = $("#drawer");
const overlay = $("#overlay");
const openDrawer = () => {
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  $("#cartClose").focus();
};
const closeDrawer = () => {
  overlay.classList.remove("is-open");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  setTimeout(() => (overlay.hidden = true), 300);
};
$("#cartOpen").addEventListener("click", openDrawer);
$("#cartClose").addEventListener("click", closeDrawer);
overlay.addEventListener("click", closeDrawer);
$("#goBag").addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

renderBag();

/* ---------- 12. Desplazamiento suave con compensación del header ---------- */
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + scrollY - header.offsetHeight + 1;
    window.scrollTo({ top: id === "#inicio" ? 0 : y, behavior: "smooth" });
  })
);
