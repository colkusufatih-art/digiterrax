(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const root = document.documentElement;
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const COARSE = matchMedia('(pointer: coarse)');
const reduced = () => RM.matches;

function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/* ------------------------------------------------------------------ */
/* Text splitting for the hero entrances                               */
/* ------------------------------------------------------------------ */
function split(el, seed) {
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  const r = rng(seed);
  const host = el.closest('[data-fx]');
  const fx = host ? host.dataset.fx : '';
  const spread = parseFloat((host && host.dataset.spread) || '0.5');
  el.textContent = '';
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  const vis = document.createElement('span');
  vis.setAttribute('aria-hidden', 'true');
  const words = text.split(' ');
  const total = text.replace(/ /g, '').length;
  let ci = 0;
  words.forEach((w, wi) => {
    const ws = document.createElement('span');
    ws.className = 'w';
    ws.style.setProperty('--th', (wi / words.length * 0.5 + r() * 0.04).toFixed(3));
    for (const ch of w) {
      const cs = document.createElement('span');
      cs.className = 'c';
      cs.textContent = ch;
      const th = fx === 'grid' ? ci / total * spread + r() * 0.06 : r() * 0.55;
      cs.style.setProperty('--th', th.toFixed(3));
      cs.style.setProperty('--jx', (fx === 'grid' ? 36 + r() * 54 : (r() * 2 - 1) * 64).toFixed(1) + 'px');
      cs.style.setProperty('--jy', (fx === 'weave' ? (ci % 2 ? 1 : -1) * (22 + r() * 20) : (r() * 2 - 1) * 44).toFixed(1) + 'px');
      cs.style.setProperty('--jr', ((r() * 2 - 1) * 30).toFixed(1) + 'deg');
      ws.appendChild(cs);
      ci++;
    }
    vis.appendChild(ws);
    if (wi < words.length - 1) vis.appendChild(document.createTextNode(' '));
  });
  el.append(sr, vis);
}
$$('.band .split').forEach((el, i) => split(el, 1013 + i * 97));

/* ------------------------------------------------------------------ */
/* Environment particles (CSS, whisper level)                          */
/* ------------------------------------------------------------------ */
(() => {
  const host = $('.env .dots');
  if (!host) return;
  const r = rng(77);
  const n = COARSE.matches ? 14 : 24;
  let html = '';
  for (let i = 0; i < n; i++) {
    const dur = 20 + r() * 16;
    html += `<span class="dot" style="left:${(r() * 100).toFixed(2)}%;top:${(60 + r() * 60).toFixed(2)}%;animation-duration:${dur.toFixed(1)}s;animation-delay:-${(r() * dur).toFixed(1)}s;opacity:${(0.08 + r() * 0.16).toFixed(2)}"></span>`;
  }
  host.innerHTML = html;
})();

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* ------------------------------------------------------------------ */
const nav = $('#nav');
const menuBtn = $('.menu-btn');
menuBtn.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Schliessen' : 'Menü';
});
$$('.nav-links a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.textContent = 'Menü';
}));
let navSolid = null;
function updateNav() {
  const hero = $('#top');
  const past = hero.getBoundingClientRect().bottom < 90;
  if (past !== navSolid) { navSolid = past; nav.classList.toggle('solid', past); }
}

/* ------------------------------------------------------------------ */
/* Reveal entrances + section on-screen flags                          */
/* ------------------------------------------------------------------ */
const revealIO = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target;
    el.classList.add('in');
    revealIO.unobserve(el);
    const count = $$('.r', el).length;
    setTimeout(() => el.classList.add('done'), 1100 + count * 90);
    if (el.matches('.stats')) runCounters(el);
  }
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
$$('[data-reveal]').forEach(el => revealIO.observe(el));

const secIO = new IntersectionObserver(entries => {
  for (const e of entries) e.target.classList.toggle('onscreen', e.isIntersecting);
}, { rootMargin: '10% 0px' });
$$('.onscreen-track').forEach(el => secIO.observe(el));

/* ------------------------------------------------------------------ */
/* Scroll progress driver for drawn lines, the layer stack, the phone */
/* ------------------------------------------------------------------ */
const prog = $$('[data-progress]').map(el => ({
  el,
  mode: el.dataset.progress,
  v: -1,
  vis: false,
  nodes: $$('[data-at]', el).map(n => ({ n, at: +n.dataset.at, lit: null }))
}));
const progIO = new IntersectionObserver(entries => {
  for (const e of entries) {
    const o = prog.find(p => p.el === e.target);
    if (o) o.vis = e.isIntersecting;
  }
  requestProg();
}, { rootMargin: '25% 0px' });
prog.forEach(o => progIO.observe(o.el));

function measure(o) {
  const r = o.el.getBoundingClientRect();
  const vh = innerHeight;
  if (o.mode === 'pin') return clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
  return clamp((vh * 0.92 - r.top) / (vh * 0.62 + Math.min(r.height, vh * 0.4)), 0, 1);
}
let progRaf = null;
function requestProg() { if (progRaf === null) progRaf = requestAnimationFrame(driveProg); }
function driveProg() {
  progRaf = null;
  if (reduced()) return;
  for (const o of prog) {
    if (!o.vis) continue;
    const v = measure(o);
    if (Math.abs(v - o.v) < 0.002) continue;
    o.v = v;
    o.el.style.setProperty('--pr', v.toFixed(4));
    for (const nd of o.nodes) {
      const lit = v >= nd.at;
      if (lit !== nd.lit) { nd.lit = lit; nd.n.classList.toggle('lit', lit); }
    }
  }
}
function pinProgFinal() {
  for (const o of prog) {
    o.el.style.setProperty('--pr', '1');
    o.v = 1;
    for (const nd of o.nodes) { nd.lit = true; nd.n.classList.add('lit'); }
  }
}
function unpinProg() {
  for (const o of prog) { o.v = -1; for (const nd of o.nodes) nd.lit = null; }
  requestProg();
}

/* ------------------------------------------------------------------ */
/* Lazy images: native lazy loading, with a nudge where it stalls      */
/* ------------------------------------------------------------------ */
const eager = img => { if (img.loading !== 'eager') img.loading = 'eager'; };
const lazyIO = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const img = e.target;
    eager(img);
    lazyIO.unobserve(img);
    // the sibling tab panels' images come along, so switching tabs never shows an empty frame
    if (img.closest('.panel')) $$('.panel .pic img').forEach(eager);
  }
}, { rootMargin: '900px 0px' });
$$('img[loading="lazy"]').forEach(img => lazyIO.observe(img));

/* ------------------------------------------------------------------ */
/* Counters                                                            */
/* ------------------------------------------------------------------ */
function runCounters(scope) {
  if (reduced()) return;
  $$('[data-count]', scope).forEach(el => {
    const to = +el.dataset.count;
    const suf = el.dataset.suffix || '';
    const t0 = performance.now();
    const dur = 1500;
    const step = now => {
      const t = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * e) + (t === 1 ? suf : '');
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  });
}

/* ------------------------------------------------------------------ */
/* Tabs (use cases)                                                    */
/* ------------------------------------------------------------------ */
(() => {
  const tabs = $$('.tab');
  function select(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('show', on);
    });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t, false));
    t.addEventListener('keydown', e => {
      let j = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
  });
})();

/* ------------------------------------------------------------------ */
/* The interactive moment: hold to swap the core system                */
/* ------------------------------------------------------------------ */
const Hold = (() => {
  const sec = $('#stossdaempfer');
  const stage = $('.hold-stage', sec);
  const btn = $('.hold-btn', sec);
  const again = $('.again', sec);
  const lbl = $('.lbl', btn);
  const HOLD_MS = 1700;
  let h = 0, holding = false, done = false, raf = null, last = 0, pinnedByRM = false;

  function write() {
    const v = h.toFixed(4);
    stage.style.setProperty('--h', v);
    btn.style.setProperty('--h', v);
    stage.style.setProperty('--flex', Math.sin(h * Math.PI).toFixed(4));
  }
  function loop(now) {
    raf = null;
    const dt = Math.min(64, now - (last || now));
    last = now;
    if (holding) h = Math.min(1, h + dt / HOLD_MS);
    else h = Math.max(0, h - (dt / HOLD_MS) * 1.6 * (0.35 + h));
    write();
    if (h >= 1 && !done) finish();
    else if (!done && (holding || h > 0)) raf = requestAnimationFrame(loop);
    else last = 0;
  }
  function start(e) {
    if (done) return;
    if (e && e.type === 'pointerdown') btn.setPointerCapture?.(e.pointerId);
    holding = true;
    if (raf === null) raf = requestAnimationFrame(loop);
  }
  function stop() {
    holding = false;
    if (raf === null && !done) raf = requestAnimationFrame(loop);
  }
  function finish() {
    done = true;
    holding = false;
    h = 1;
    write();
    sec.classList.add('done');
    lbl.textContent = 'Neues System aktiv';
    btn.disabled = true;
  }
  function reset() {
    done = false;
    h = 0;
    write();
    sec.classList.remove('done');
    lbl.textContent = 'Gedrückt halten zum Wechseln';
    btn.disabled = false;
  }
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', stop);
  btn.addEventListener('pointercancel', stop);
  btn.addEventListener('lostpointercapture', stop);
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); }
  });
  btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
  again.addEventListener('click', () => { reset(); btn.focus(); });

  return {
    pin() { if (!done) { pinnedByRM = true; finish(); } },
    unpin() { if (pinnedByRM) { pinnedByRM = false; reset(); } }
  };
})();

/* ------------------------------------------------------------------ */
/* Contact form: opens the visitor's email app, addressed to CREALOGIX */
/* ------------------------------------------------------------------ */
(() => {
  const form = $('#form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = form.checkValidity();
    if (!ok) { form.reportValidity(); return; }
    const d = new FormData(form);
    const subject = `Gesprächsanfrage DIGITERRA Horizon: ${d.get('topic')}`;
    const body = [
      `Name: ${d.get('name')}`,
      `Bank oder Institut: ${d.get('bank')}`,
      `E-Mail: ${d.get('email')}`,
      `Thema: ${d.get('topic')}`,
      '',
      d.get('message') || ''
    ].join('\n');
    const href = `mailto:info@crealogix.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.classList.add('sent');
    location.href = href;
  });
})();

/* ------------------------------------------------------------------ */
/* Hero: live 3D descent through the three layers (WebGL)              */
/* ------------------------------------------------------------------ */
const Hero = (() => {
  const hero = $('#top');
  const stage = $('.stage', hero);
  const canvas = $('.gl', stage);
  const poster = $('.poster', stage);
  const ring = $('.ring', stage);
  const flash = $('.flash', stage);
  const fill = $('.readout .fill', stage);
  const marks = $$('.readout li', stage).map((el, i) => ({ el, at: [0.26, 0.62, 0.985][i], lit: null }));
  const ctaLinks = $$('.b-settle a', stage);
  const bands = $$('.band', stage).map((el, i, arr) => ({
    el, a: +el.dataset.a, b: +el.dataset.b,
    ramp: el.dataset.ramp ? +el.dataset.ramp : 0,
    first: i === 0, last: i === arr.length - 1, op: -1, k: -1
  }));

  const TEXTURES = [
    { key: 'sheet', url: 'assets/tex-vega.jpg', bytes: 155393 },
    { key: 'net', url: 'assets/tex-net.jpg', bytes: 604472 },
    { key: 'stone', url: 'assets/tex-stone.jpg', bytes: 124545 }
  ];

  const DEG = Math.PI / 180;
  const LAYER = { sheet: 0, net: -14, stone: -28 };
  // p, camera height, pitch (deg down), forward drift
  const KEYS = [
    [0.00, 7.0, 5, 0.0],
    [0.07, 6.6, 8, -0.6],
    [0.26, 0.0, 38, -2.5],
    [0.34, -3.5, 42, -3.2],
    [0.47, -9.2, 40, -4.3],
    [0.62, -14.0, 40, -5.4],
    [0.70, -17.6, 38, -6.2],
    [0.86, -25.2, 18, -8.0],
    [1.00, -26.4, 3, -9.0]
  ];

  function mono(xs, ys) {
    const n = xs.length, d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
    m[0] = 0; m[n - 1] = 0;
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return x => {
      let i = 0;
      while (i < n - 2 && x > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], t = clamp((x - xs[i]) / h, 0, 1), t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  }
  const xs = KEYS.map(k => k[0]);
  const camY = mono(xs, KEYS.map(k => k[1]));
  const camPitch = mono(xs, KEYS.map(k => k[2]));
  const camZ = mono(xs, KEYS.map(k => k[3]));

  /* ---------- tiny matrix helpers (column-major) ---------- */
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  function lookAt(eye, fwd, up) {
    const z = norm([-fwd[0], -fwd[1], -fwd[2]]);
    const x = norm(cross(up, z));
    const y = cross(z, x);
    return {
      m: new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]),
      x, y, z
    };
  }
  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }
  function mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }

  /* ---------- shaders ---------- */
  const VS_PLANE = `
attribute vec2 aXZ;
uniform float uY;
uniform mat4 uVP;
varying vec3 vW;
void main(){ vW = vec3(aXZ.x, uY, aXZ.y); gl_Position = uVP * vec4(vW, 1.0); }`;

  const FOG = `
uniform vec3 uCam; uniform vec3 uDeep; uniform vec3 uHor; uniform float uFog;
vec3 fogColor(vec3 w){ vec3 dv = normalize(w - uCam); return mix(uDeep, uHor, exp(-abs(dv.y) * 9.0)); }`;

  const FS_SHEET = `
precision highp float;
varying vec3 vW;
uniform sampler2D uTex; uniform float uT; uniform float uVis; uniform float uNear;
${FOG}
void main(){
  vec2 p = vW.xz;
  float d = distance(vW, uCam);
  vec2 rc = p - uCam.xz;
  float r = length(rc);
  vec2 dir = rc / max(r, 0.001);
  float rip = sin(r * 1.3 - uT * 1.5) * exp(-r * 0.07);
  vec2 q = mat2(0.946, -0.324, 0.324, 0.946) * p;
  vec2 uv = q / 21.0 + vec2(0.23, 0.61) + dir * rip * (0.006 + 0.02 * uNear);
  vec3 c = texture2D(uTex, uv).rgb;
  vec3 c2 = texture2D(uTex, mat2(0.8, 0.6, -0.6, 0.8) * p / 47.0 + vec2(0.37, 0.11)).rgb;
  c = c * 0.62 + c2 * 0.45;
  float f = exp(-d * uFog);
  float glow = 0.9 + 0.25 * rip + uNear * 0.55;
  gl_FragColor = vec4(c * glow * f * uVis * 0.8, 1.0);
}`;

  const FS_NET = `
precision highp float;
varying vec3 vW;
uniform sampler2D uTex; uniform float uT; uniform float uVis; uniform float uNear;
${FOG}
void main(){
  vec2 p = vW.xz;
  float d = distance(vW, uCam);
  vec2 q = mat2(0.917, 0.399, -0.399, 0.917) * p;
  vec3 c = texture2D(uTex, q / 16.0 + vec2(0.41, 0.17)).rgb;
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  float w1 = pow(0.5 + 0.5 * sin(dot(p, vec2(0.21, 0.15)) * 1.6 - uT * 1.3), 6.0);
  float w2 = pow(0.5 + 0.5 * sin(dot(p, vec2(-0.13, 0.24)) * 1.2 - uT * 0.9 + 1.7), 8.0);
  float boost = 1.0 + (1.5 * w1 + 1.0 * w2) * smoothstep(0.25, 0.7, lum);
  float f = exp(-d * uFog * 1.15);
  gl_FragColor = vec4(c * boost * f * uVis * (0.72 + uNear * 1.2), 1.0);
}`;

  const FS_STONE = (deriv) => `${deriv ? '#extension GL_OES_standard_derivatives : enable\n#define HAS_DERIV 1' : ''}
precision highp float;
varying vec3 vW;
uniform sampler2D uTex; uniform float uT; uniform float uVis;
${FOG}
void main(){
  vec2 p = vW.xz;
  float d = distance(vW, uCam);
  vec2 q = mat2(0.963, 0.269, -0.269, 0.963) * p;
  vec3 s = texture2D(uTex, q / 8.0 + vec2(0.13, 0.57)).rgb * 0.95 + texture2D(uTex, p / 29.0 + 0.31).rgb * 0.2;
  float S = 3.0;
  vec2 g = abs(fract(p / S + 0.5) - 0.5) * S;
  float gm = min(g.x, g.y);
#ifdef HAS_DERIV
  float aa = max(fwidth(p.x), fwidth(p.y)) * 1.3;
#else
  float aa = 0.004 + d * 0.0016;
#endif
  float lw = 0.012;
  float line = (1.0 - smoothstep(lw, lw + aa, gm)) * (1.0 - smoothstep(16.0, 64.0, d));
  float glow = exp(-gm * 9.0) * (1.0 - smoothstep(30.0, 120.0, d));
  float pulse = pow(0.5 + 0.5 * sin((p.x * 0.9 + p.y * 0.6) * 0.45 - uT * 1.05), 10.0);
  float node = exp(-dot(g, g) * 90.0) * (1.0 - smoothstep(18.0, 60.0, d));
  vec3 teal = vec3(0.286, 0.671, 0.647);
  vec3 col = s + teal * (line * (0.26 + 1.15 * pulse) + glow * (0.05 + 0.22 * pulse)) + vec3(0.8, 0.97, 0.95) * node * (0.12 + 0.7 * pulse);
  col *= uVis;
  gl_FragColor = vec4(mix(fogColor(vW), col, exp(-d * uFog)), 1.0);
}`;

  const VS_SKY = `
attribute vec2 aXZ; varying vec2 vN;
void main(){ vN = aXZ; gl_Position = vec4(aXZ, 0.999, 1.0); }`;
  const FS_SKY = `
precision highp float;
varying vec2 vN;
uniform vec3 uF; uniform vec3 uR; uniform vec3 uU; uniform vec2 uTan;
uniform vec3 uDeep; uniform vec3 uHor; uniform vec3 uTop;
void main(){
  vec3 dir = normalize(uF + vN.x * uTan.x * uR + vN.y * uTan.y * uU);
  float h = dir.y;
  vec3 base = h > 0.0 ? mix(uTop, uDeep, smoothstep(0.0, 0.6, h) * 0.6) : uDeep;
  vec3 col = mix(base, uHor, exp(-abs(h) * 9.0));
  gl_FragColor = vec4(col, 1.0);
}`;

  const VS_PTS = `
attribute vec4 aP;
uniform mat4 uVP; uniform vec3 uCam; uniform float uT; uniform float uPx;
varying float vA;
void main(){
  vec3 p = aP.xyz;
  float H = 40.0;
  p.y = uCam.y + mod(p.y + uT * 0.35 - uCam.y + H * 0.5, H) - H * 0.5;
  p.x += sin(uT * 0.17 + aP.w * 6.28) * 0.35;
  p.z += cos(uT * 0.13 + aP.w * 6.28) * 0.35;
  gl_Position = uVP * vec4(p, 1.0);
  float d = distance(p, uCam);
  gl_PointSize = clamp(uPx * (0.5 + aP.w) / max(d, 0.5), 1.0, 20.0);
  vA = (1.0 - smoothstep(16.0, 36.0, d)) * smoothstep(0.4, 1.6, d) * (0.3 + 0.7 * aP.w);
}`;
  const FS_PTS = `
precision mediump float;
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(c));
  a *= a;
  gl_FragColor = vec4(vec3(0.72, 0.95, 0.92) * a * vA * 0.75, 1.0);
}`;

  /* ---------- state ---------- */
  let gl = null, progs = {}, bufs = {}, tex = {}, ready = false, initStarted = false, failed = false;
  let target = 0, shown = 0, rafId = null, lastTick = 0, lastRender = 0, onScreen = true, armed = false;
  let loadStart = 0, loadK = 0;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let W = 0, H = 0, fovy = 55 * DEG;
  const t0 = performance.now();
  let flashOp = -1, fillV = -1;

  function heroProgress() {
    const r = hero.getBoundingClientRect();
    const range = hero.offsetHeight - innerHeight;
    return range > 0 ? clamp(-r.top / range, 0, 1) : 0;
  }

  /* ---------- captions ---------- */
  function updateBands(p) {
    for (const b of bands) {
      const f = Math.min(0.02, (b.b - b.a) / 3);
      const inOp = b.first ? (p <= b.b ? 1 : 0) : smoothstep(p, b.a, b.a + f);
      const outOp = b.last ? 1 : 1 - smoothstep(p, b.b - f, b.b);
      const op = b.first ? outOp : inOp * outOp;
      const ramp = b.ramp || Math.min(0.025, (b.b - b.a) * 0.35);
      let k = clamp((p - b.a) / ramp, 0, 1);
      if (b.first) k = Math.max(k, loadK);
      if (Math.abs(op - b.op) > 0.004 || (op === 0) !== (b.op === 0)) {
        b.op = op;
        b.el.style.opacity = op.toFixed(3);
      }
      if (Math.abs(k - b.k) > 0.008 || (k === 1 && b.k !== 1) || (k === 0 && b.k !== 0)) {
        b.k = k;
        b.el.style.setProperty('--k', k.toFixed(3));
      }
      if (b.last) {
        const live = op > 0.6 && k > 0.85;
        if (live !== b.live) { b.live = live; b.el.classList.toggle('live', live); ctaLinks.forEach(a => { a.tabIndex = live ? 0 : -1; }); }
      }
    }
  }
  let moved = null;
  function updateReadout(p) {
    const mv = p > 0.02;
    if (mv !== moved) { moved = mv; stage.classList.toggle('moved', mv); }
    if (Math.abs(p - fillV) > 0.002) { fillV = p; fill.style.transform = `scaleY(${p.toFixed(4)})`; }
    for (const m of marks) {
      const lit = p >= m.at;
      if (lit !== m.lit) { m.lit = lit; m.el.classList.toggle('lit', lit); }
    }
  }
  function updateFlash(p) {
    const bump = c => 1 - smoothstep(Math.abs(p - c), 0, 0.028);
    const op = Math.max(bump(0.26) * 0.6, bump(0.62) * 0.55);
    if (Math.abs(op - flashOp) > 0.01 || (op === 0 && flashOp !== 0)) { flashOp = op; flash.style.opacity = op.toFixed(3); }
  }

  /* ---------- GL setup ---------- */
  function compile(vs, fs) {
    const mk = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p, u, a: gl.getAttribLocation(p, vs.includes('attribute vec4 aP;') ? 'aP' : 'aXZ') };
  }
  function setupGL() {
    gl = canvas.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('no webgl');
    const deriv = !!gl.getExtension('OES_standard_derivatives');
    progs.sheet = compile(VS_PLANE, FS_SHEET);
    progs.net = compile(VS_PLANE, FS_NET);
    progs.stone = compile(VS_PLANE, FS_STONE(deriv));
    progs.sky = compile(VS_SKY, FS_SKY);
    progs.pts = compile(VS_PTS, FS_PTS);
    const S = 170, Z0 = -330, Z1 = 70;
    bufs.plane = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.plane);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-S, Z0, S, Z0, -S, Z1, S, Z1]), gl.STATIC_DRAW);
    bufs.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const N = COARSE.matches ? 320 : 720;
    const r = rng(4242);
    const pts = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      pts[i * 4] = (r() * 2 - 1) * 18;
      pts[i * 4 + 1] = -32 + r() * 42;
      pts[i * 4 + 2] = -46 + r() * 52;
      pts[i * 4 + 3] = r();
    }
    bufs.pts = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.pts);
    gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
    bufs.ptsN = N;
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); fail(); }, false);
  }
  function makeTex(img) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    const an = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    return t;
  }
  function resize() {
    if (!gl) return;
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    let dpr = Math.min(devicePixelRatio || 1, 2);
    const budget = 2.4e6;
    if (cw * ch * dpr * dpr > budget) dpr = Math.sqrt(budget / (cw * ch));
    const w = Math.max(1, Math.round(cw * dpr)), h = Math.max(1, Math.round(ch * dpr));
    if (w !== W || h !== H) { W = w; H = h; canvas.width = w; canvas.height = h; }
    fovy = (cw / ch < 1 ? 70 : 55) * DEG;
  }

  /* ---------- drawing ---------- */
  const DEEP = [0.030, 0.058, 0.058], HOR = [0.215, 0.43, 0.42], TOP = [0.045, 0.085, 0.086];
  function layerVis(camYv, y, below) {
    const dy = camYv - y;
    if (dy >= 0) return below(dy);
    return 0.22 * (1 - smoothstep(-dy, 2, 20));
  }
  function render(p, now, fixedT) {
    if (!ready) return;
    const t = fixedT !== undefined ? fixedT : (now - t0) / 1000;
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    const y = camY(p), pitch = camPitch(p) * DEG, z = camZ(p);
    const sway = fixedT !== undefined ? 0 : Math.sin(t * 0.35) * 0.05;
    const eye = [mx * 0.6 + sway, y + my * 0.18, z];
    const yaw = mx * 0.04 + (fixedT !== undefined ? 0 : Math.sin(t * 0.21) * 0.006);
    const pit = pitch + my * 0.025;
    const fwd = [Math.sin(yaw) * Math.cos(pit), -Math.sin(pit), -Math.cos(yaw) * Math.cos(pit)];
    const view = lookAt(eye, fwd, [0, 1, 0]);
    const aspect = W / H;
    const proj = perspective(fovy, aspect, 0.05, 420);
    const vp = mul(proj, view.m);
    const tanY = Math.tan(fovy / 2), tanX = tanY * aspect;

    gl.viewport(0, 0, W, H);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    // sky
    let P = progs.sky;
    gl.useProgram(P.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.quad);
    gl.enableVertexAttribArray(P.a);
    gl.vertexAttribPointer(P.a, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(P.u.uF, fwd);
    gl.uniform3fv(P.u.uR, view.x);
    gl.uniform3fv(P.u.uU, view.y);
    gl.uniform2f(P.u.uTan, tanX, tanY);
    gl.uniform3fv(P.u.uDeep, DEEP);
    gl.uniform3fv(P.u.uHor, HOR);
    gl.uniform3fv(P.u.uTop, TOP);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const plane = (P, texture, ly, vis, near) => {
      gl.useProgram(P.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufs.plane);
      gl.enableVertexAttribArray(P.a);
      gl.vertexAttribPointer(P.a, 2, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(P.u.uVP, false, vp);
      gl.uniform1f(P.u.uY, ly);
      gl.uniform3fv(P.u.uCam, eye);
      gl.uniform3fv(P.u.uDeep, DEEP);
      gl.uniform3fv(P.u.uHor, HOR);
      gl.uniform1f(P.u.uFog, 0.019);
      gl.uniform1f(P.u.uT, t);
      gl.uniform1f(P.u.uVis, vis);
      if (P.u.uNear) gl.uniform1f(P.u.uNear, near);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(P.u.uTex, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const stoneVis = layerVis(y, LAYER.stone, dy => 1 - smoothstep(dy, 4, 16));
    plane(progs.stone, tex.stone, LAYER.stone, stoneVis, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    const netVis = layerVis(y, LAYER.net, dy => 0.45 + 0.55 * (1 - smoothstep(dy, 6, 22)));
    const netNear = 1 - smoothstep(Math.abs(y - LAYER.net), 0, 3.2);
    plane(progs.net, tex.net, LAYER.net, netVis, netNear);
    const sheetVis = layerVis(y, LAYER.sheet, () => 1);
    const sheetNear = 1 - smoothstep(Math.abs(y - LAYER.sheet), 0, 3.4);
    plane(progs.sheet, tex.sheet, LAYER.sheet, sheetVis, sheetNear);

    P = progs.pts;
    gl.useProgram(P.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.pts);
    gl.enableVertexAttribArray(P.a);
    gl.vertexAttribPointer(P.a, 4, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(P.u.uVP, false, vp);
    gl.uniform3fv(P.u.uCam, eye);
    gl.uniform1f(P.u.uT, t);
    gl.uniform1f(P.u.uPx, H * 0.035);
    gl.drawArrays(gl.POINTS, 0, bufs.ptsN);
  }

  /* ---------- loop ---------- */
  function tick(now) {
    rafId = null;
    if (!armed) return;
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    shown += (target - shown) * (1 - Math.pow(1 - 0.12, dt / 16.667));
    let converged = Math.abs(target - shown) < 0.0004;
    if (converged) shown = target;
    if (loadStart && loadK < 1) {
      const x = clamp((now - loadStart) / 1300, 0, 1);
      loadK = 1 - Math.pow(1 - x, 3);
      converged = false;
    }
    const ambient = ready && onScreen && !document.hidden;
    const pointerMoving = Math.abs(tmx - mx) > 0.001 || Math.abs(tmy - my) > 0.001;
    if (ready && (!converged || pointerMoving || now - lastRender > 33)) { render(shown, now); lastRender = now; }
    updateBands(shown);
    updateReadout(shown);
    updateFlash(shown);
    if (onScreen && !document.hidden && (!converged || ambient)) rafId = requestAnimationFrame(tick);
    else lastTick = 0;
  }
  function wake() { if (armed && rafId === null && onScreen && !document.hidden) rafId = requestAnimationFrame(tick); }
  function onScroll() { target = heroProgress(); wake(); }

  /* ---------- texture streaming with an honest ring ---------- */
  async function loadTextures() {
    const total = TEXTURES.reduce((s, t) => s + t.bytes, 0);
    const got = TEXTURES.map(() => 0);
    let lastRing = 0;
    const paint = force => {
      const now = performance.now();
      if (!force && now - lastRing < 100) return;
      lastRing = now;
      const frac = Math.min(1, got.reduce((a, b) => a + b, 0) / total);
      ring.style.setProperty('--ld', Math.round(126 * (1 - frac)));
    };
    const one = async (t, i) => {
      const ctrl = new AbortController();
      let wd = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(t.url, { signal: ctrl.signal, priority: 'low' });
      if (!res.ok || !res.body) throw new Error('texture ' + t.url);
      const reader = res.body.getReader();
      const chunks = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        clearTimeout(wd);
        wd = setTimeout(() => ctrl.abort(), 20000);
        chunks.push(value);
        got[i] += value.length;
        paint(false);
      }
      clearTimeout(wd);
      const blob = new Blob(chunks, { type: 'image/jpeg' });
      if ('createImageBitmap' in window) return createImageBitmap(blob);
      return new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(blob); });
    };
    const imgs = await Promise.all(TEXTURES.map(one));
    got.forEach((_, i) => { got[i] = TEXTURES[i].bytes; });
    paint(true);
    TEXTURES.forEach((t, i) => { tex[t.key] = makeTex(imgs[i]); });
  }

  function fail() {
    if (failed) return;
    failed = true;
    disarm();
    root.classList.remove('hero3d');
    stage.classList.remove('gl-ready');
  }

  function init() {
    if (initStarted) return;
    initStarted = true;
    poster.style.backgroundImage = "url('assets/hero-poster.jpg')";
    try { setupGL(); resize(); } catch (e) { fail(); return; }
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      loadTextures().then(() => {
        ready = true;
        resize();
        render(heroProgress(), performance.now());
        stage.classList.add('gl-ready');
        wake();
      }).catch(fail);
    };
    const im = new Image();
    im.onload = go;
    im.onerror = go;
    im.src = 'assets/hero-poster.jpg';
    setTimeout(go, 4000);
    loadStart = performance.now();
  }

  const io = new IntersectionObserver(es => { onScreen = es[0].isIntersecting; wake(); });

  function arm() {
    if (armed || failed) return;
    armed = true;
    init();
    if (failed) return;
    io.observe(hero);
    addEventListener('scroll', onScroll, { passive: true });
    bands.forEach(b => { b.op = -1; b.k = -1; });
    flashOp = -1; fillV = -1; marks.forEach(m => { m.lit = null; });
    shown = target = heroProgress();
    wake();
  }
  function disarm() {
    if (!armed) return;
    armed = false;
    removeEventListener('scroll', onScroll);
    io.unobserve(hero);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    bands.forEach(b => { b.el.style.opacity = ''; b.el.classList.remove('live'); b.live = undefined; });
  }

  addEventListener('resize', () => { resize(); if (ready) render(shown, performance.now()); });
  addEventListener('pointermove', e => {
    if (COARSE.matches || !armed) return;
    tmx = (e.clientX / innerWidth) * 2 - 1;
    tmy = (e.clientY / innerHeight) * 2 - 1;
    wake();
  }, { passive: true });

  // Stills for the page (use-case images, ending frame): render any progress on demand.
  window.__heroGrab = (p, q = 0.9) => { if (!ready) return null; mx = my = tmx = tmy = 0; render(p, 0, 12.0); return canvas.toDataURL('image/jpeg', q); };

  return { arm, disarm, get failed() { return failed; } };
})();

/* ------------------------------------------------------------------ */
/* Mode switching: 3D hero vs static hero, reduced motion live both ways */
/* ------------------------------------------------------------------ */
function applyMode() {
  const can3d = !reduced() && location.protocol !== 'file:' && !Hero.failed;
  if (can3d) {
    root.classList.add('hero3d');
    Hero.arm();
  } else {
    Hero.disarm();
    root.classList.remove('hero3d');
  }
}
function pinToFinalStates() { pinProgFinal(); Hold.pin(); }
function unpinFinalStates() { unpinProg(); Hold.unpin(); }

RM.addEventListener('change', e => {
  if (e.matches) { pinToFinalStates(); applyMode(); }
  else { unpinFinalStates(); applyMode(); }
});

document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('paused', document.hidden);
});

addEventListener('scroll', () => { requestProg(); updateNav(); }, { passive: true });
addEventListener('resize', requestProg);

if (reduced()) pinToFinalStates();
applyMode();
updateNav();
requestProg();
})();
