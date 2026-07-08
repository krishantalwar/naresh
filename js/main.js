/* ============================================================
   Rajat & Kamlesh — Wedding Invitation
   Interactions: petals, envelope, music, scratch card, countdown,
   scroll-reveal, hero parallax
   ============================================================ */

// ---- Wedding date (used by countdown) ----
const WEDDING_DATE = new Date("2026-07-19T11:00:00+05:30");
const PREFERS_REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Floating petals (crafted SVG, not emoji) ---------- */
(function petals() {
  const layer = document.getElementById("petalLayer");
  if (!layer) return;

  const blossom = (petal, center) => {
    let p = "";
    for (let a = 0; a < 360; a += 72) {
      p += `<ellipse cx="0" cy="-11" rx="5.5" ry="9" transform="rotate(${a})"/>`;
    }
    return `<svg viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg">` +
      `<g fill="${petal}">${p}</g><circle r="4.5" fill="${center}"/></svg>`;
  };
  const leaf = (c) => `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M20 3C31 11 31 27 20 37 9 27 9 11 20 3Z" fill="${c}"/>` +
    `<path d="M20 6V34" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.3"/></svg>`;
  const petal = (c) => `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M20 3C29 13 29 26 20 37 11 26 11 13 20 3Z" fill="${c}"/></svg>`;

  // weighted toward soft pink blossoms, with occasional gold, cream & sage
  const shapes = [
    blossom("#ef9bb3", "#e6c063"), blossom("#ef9bb3", "#e6c063"),
    blossom("#f7c9d6", "#e6c063"), blossom("#fdf3e6", "#dcaf4e"),
    petal("#f2b6c6"), blossom("#ef9bb3", "#e6c063"),
    leaf("#8fa876"), leaf("#9db884"),
  ];

  const COUNT = 18;
  for (let i = 0; i < COUNT; i++) {
    const s = document.createElement("span");
    s.className = "petal";
    s.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];
    const size = 16 + Math.random() * 20;
    s.style.width = size + "px";
    s.style.height = size + "px";
    s.style.left = (Math.random() * 100) + "%";
    s.style.animationDuration = (14 + Math.random() * 15) + "s";
    s.style.animationDelay = (Math.random() * 12) + "s";
    layer.appendChild(s);
  }
})();

/* ---------- Envelope open + music ---------- */
const landing = document.getElementById("landing");
const openBtn = document.getElementById("openBtn");
const invitation = document.getElementById("invitation");
const audio = document.getElementById("bgAudio");
const musicBtn = document.getElementById("musicBtn");
const iconOn = document.getElementById("iconOn");
const iconOff = document.getElementById("iconOff");

let opening = false;
function openInvitation() {
  if (opening) return;
  opening = true;
  // start music (best-effort — requires the user gesture we just had)
  audio.volume = 0.6;
  audio.play().catch(() => {});
  // 1) play the envelope flip-open animation
  openBtn.classList.add("opening");
  // 2) once the envelope has flipped open, reveal the invitation
  setTimeout(() => {
    landing.classList.add("hidden");
    invitation.classList.add("visible");
    musicBtn.style.display = "flex";
    window.scrollTo({ top: 0 });
    // the scratch canvas was hidden (display:none) until now, so it painted
    // at 0x0 — repaint it now that it has real dimensions.
    if (window.__initScratch) window.__initScratch();
    // kick the scroll-reveal observer now that content has layout
    if (window.__initReveal) window.__initReveal();
  }, 900);
  setTimeout(() => { landing.style.display = "none"; }, 1700);
}
openBtn.addEventListener("click", openInvitation);

let muted = false;
musicBtn.addEventListener("click", () => {
  muted = !muted;
  audio.muted = muted;
  if (muted) { audio.pause(); iconOn.style.display = "none"; iconOff.style.display = "block"; }
  else { audio.play().catch(() => {}); iconOn.style.display = "block"; iconOff.style.display = "none"; }
});

/* ---------- Scratch to reveal ---------- */
(function scratch() {
  const canvas = document.getElementById("scratchCanvas");
  if (!canvas) return;
  const countdown = document.getElementById("countdown");
  const ctx = canvas.getContext("2d");
  let painting = false;
  let revealed = false;

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintCover(rect.width, rect.height);
  }

  function paintCover(w, h) {
    // gold foil-style cover (matches original: #d4a574 → #f5d199 → #b8853f)
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#d4a574");
    grad.addColorStop(0.5, "#f5d199");
    grad.addColorStop(1, "#b8853f");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = '600 14px "Cinzel", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦  SCRATCH TO REVEAL  ✦", w / 2, h / 2);
  }

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  function scratchAt(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  function checkCleared() {
    if (revealed) return;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    for (let i = 3; i < img.length; i += 40) { if (img[i] === 0) clear++; }
    const ratio = clear / (img.length / 40);
    if (ratio > 0.5) {
      revealed = true;
      canvas.style.transition = "opacity 0.6s ease";
      canvas.style.opacity = "0";
      setTimeout(() => { canvas.style.display = "none"; }, 600);
      countdown.classList.add("show");
    }
  }

  function start(e) { painting = true; const p = pos(e); scratchAt(p.x, p.y); }
  function move(e) { if (!painting) return; e.preventDefault(); const p = pos(e); scratchAt(p.x, p.y); }
  function end() { if (!painting) return; painting = false; checkCleared(); }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  window.addEventListener("resize", () => { if (!revealed) sizeCanvas(); });
  // expose so it can be (re)painted once the invitation becomes visible
  window.__initScratch = () => { if (!revealed) sizeCanvas(); };
  sizeCanvas();
})();

/* ---------- Countdown timer ---------- */
(function countdown() {
  const d = document.getElementById("cd-days");
  const h = document.getElementById("cd-hours");
  const m = document.getElementById("cd-mins");
  const s = document.getElementById("cd-secs");
  if (!d) return;
  const pad = (n) => String(n).padStart(2, "0");

  // update text and give the tile a subtle pop when its value changes
  function setVal(el, v) {
    if (el.textContent === v) return;
    el.textContent = v;
    if (PREFERS_REDUCED) return;
    const box = el.closest(".cd-box");
    if (!box) return;
    box.classList.remove("pop");
    void box.offsetWidth; // restart the animation
    box.classList.add("pop");
  }

  function tick() {
    const now = new Date();
    let diff = Math.max(0, WEDDING_DATE - now);
    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000); diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);
    setVal(d, pad(days));
    setVal(h, pad(hours));
    setVal(m, pad(mins));
    setVal(s, pad(secs));
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Scroll-reveal (fade + rise as sections enter view) ---------- */
(function reveal() {
  const nodes = document.querySelectorAll(
    ".stack-center, .events-head, .event-card, .centered-narrow, .families-wrap, .venue-wrap, .site-footer"
  );
  if (!nodes.length) return;

  if (PREFERS_REDUCED || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("reveal", "in"));
    return;
  }

  nodes.forEach((n) => n.classList.add("reveal"));
  // gentle left/right stagger for the two-column event grid
  document.querySelectorAll(".events-grid .event-card").forEach((c, i) => {
    c.style.transitionDelay = (i % 2 === 1 ? 0.12 : 0) + "s";
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  // (re)observe — called once now and again when the invitation is revealed
  window.__initReveal = () => nodes.forEach((n) => { if (!n.classList.contains("in")) io.observe(n); });
  window.__initReveal();
})();

/* ---------- Hero background parallax ---------- */
(function heroParallax() {
  const bg = document.querySelector(".hero-bg");
  if (!bg || PREFERS_REDUCED) return;
  let ticking = false;
  function update() {
    const y = window.scrollY || window.pageYOffset || 0;
    if (y < window.innerHeight) {
      bg.style.transform = `translateY(${y * 0.25}px) scale(1.12)`;
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
