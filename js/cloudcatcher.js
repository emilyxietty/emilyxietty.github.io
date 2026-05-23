/*
 * Cloud Catcher — a small 2D-canvas mini-game for the Play page.
 * No dependencies: a soot sprite scurries below a Ghibli sky, catching
 * falling sugar-star candy (konpeito) and Chihiro's stray yellow shoe,
 * while dodging tumbling lumps of coal.
 */

(() => {
  'use strict';

  const wrap = document.querySelector('[data-catch]');
  if (!wrap) return;

  const canvas = wrap.querySelector('[data-catch-canvas]');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;

  try {
    initCatcher();
  } catch (err) {
    console.error('Cloud Catcher failed to start:', err);
    const start = wrap.querySelector('[data-catch-start]');
    if (start) {
      start.innerHTML =
        '<h3 class="game-title">Game unavailable</h3>' +
        '<p class="game-tagline">Your browser couldn\'t start this mini-game.</p>';
    }
  }

  /* ------------------------------------------------------------------ */

  function initCatcher() {
    const TAU = Math.PI * 2;
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const withAlpha = (hex, a) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    };

    // konpeito (sugar-star candy) come in soft pastel colours
    const CANDY = [
      { fill: '#ff9fc0', lit: '#ffd2e2', rim: '#e76f9b' },  // pink
      { fill: '#9fdcb8', lit: '#d6f3e2', rim: '#5fb588' },  // mint
      { fill: '#ffd877', lit: '#fff0c2', rim: '#e7af3c' },  // butter
      { fill: '#c3a9ef', lit: '#e7dcfa', rim: '#9676d0' },  // lavender
      { fill: '#ffb38a', lit: '#ffdcc4', rim: '#e88a55' },  // peach
      { fill: '#9bd2ef', lit: '#d4ecf9', rim: '#5fa8d6' },  // sky
    ];
    const SOOT = '#2c2733';

    // --- DOM ----------------------------------------------------------
    const hud = wrap.querySelector('[data-catch-hud]');
    const scoreEl = wrap.querySelector('[data-catch-score]');
    const hearts = Array.from(wrap.querySelectorAll('.game-heart'));
    const startOverlay = wrap.querySelector('[data-catch-start]');
    const overOverlay = wrap.querySelector('[data-catch-over]');
    const finalEl = wrap.querySelector('[data-catch-final]');
    const bestEl = wrap.querySelector('[data-catch-best]');
    const playBtn = wrap.querySelector('[data-catch-play]');
    const againBtn = wrap.querySelector('[data-catch-again]');
    const flashEl = wrap.querySelector('[data-catch-flash]');

    // --- game state ---------------------------------------------------
    let state = 'start';                 // 'start' | 'playing' | 'over'
    let score = 0;
    let best = Number(localStorage.getItem('cloudcatcher-best') || 0);
    let lives = 3;
    let elapsed = 0;
    let invuln = 0;                      // brief grace period after a hit
    let spawnTimer = 0;
    let blink = 0;
    let bounce = 0;                      // sprite squash-and-stretch on a catch
    let inView = true;

    const sprite = { x: 0, w: 0, h: 0, target: 0, vx: 0 };
    const items = [];
    const sparks = [];
    const clouds = [];
    const motes = [];
    const forest = [];
    const keys = new Set();

    for (let i = 0; i < 5; i++) {
      clouds.push({ x: Math.random(), y: rand(0.05, 0.5), s: rand(0.5, 1.3), v: rand(0.012, 0.032) });
    }
    for (let i = 0; i < 16; i++) {
      motes.push({ x: Math.random(), y: Math.random(), r: rand(1.2, 3),
        ph: rand(0, TAU), vy: rand(0.012, 0.034), vx: rand(-0.012, 0.012) });
    }
    // a soft forest canopy along the horizon — two layers for depth
    for (let i = 0; i <= 14; i++) {
      forest.push({ fx: i / 14 + rand(-0.03, 0.03), layer: 0, size: rand(0.7, 1.2) });
    }
    for (let i = 0; i <= 16; i++) {
      forest.push({ fx: i / 16 + rand(-0.03, 0.03), layer: 1, size: rand(0.75, 1.3) });
    }

    // --- sizing -------------------------------------------------------
    let W = 0, H = 0, skyGrad = null;
    function resize() {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = w; H = h;
      sprite.w = clamp(W * 0.19, 72, 128);
      sprite.h = sprite.w * 0.92;
      if (!sprite.x) sprite.x = sprite.target = W / 2;
      sprite.x = clamp(sprite.x, sprite.w / 2, W - sprite.w / 2);
      sprite.target = clamp(sprite.target, sprite.w / 2, W - sprite.w / 2);
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0.0, '#9fd4ec');
      skyGrad.addColorStop(0.5, '#e7d4ef');
      skyGrad.addColorStop(1.0, '#ffd9bf');
    }
    new ResizeObserver(resize).observe(wrap);
    resize();

    // only respond to the keyboard while the game is actually on screen, so
    // it doesn't fight the other game on the Play page for the arrow keys
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (!inView) keys.clear();
    }, { threshold: 0.5 }).observe(wrap);

    const spriteTopY = () => H - sprite.h - H * 0.05;

    // --- HUD ----------------------------------------------------------
    function updateScore() { scoreEl.textContent = score; }
    function updateHearts() {
      hearts.forEach((h, i) => h.classList.toggle('game-heart--lost', i >= lives));
    }

    // --- state transitions -------------------------------------------
    function startGame() {
      state = 'playing';
      score = 0;
      lives = 3;
      elapsed = 0;
      invuln = 0;
      spawnTimer = 0.4;
      items.length = 0;
      sparks.length = 0;
      sprite.x = sprite.target = W / 2;
      updateScore();
      updateHearts();
      startOverlay.classList.add('game-hide');
      overOverlay.classList.add('game-hide');
      hud.classList.remove('game-hide');
    }

    function endGame() {
      state = 'over';
      best = Math.max(best, score);
      try { localStorage.setItem('cloudcatcher-best', String(best)); } catch (e) { /* ignore */ }
      finalEl.textContent = score;
      bestEl.textContent = best;
      hud.classList.add('game-hide');
      overOverlay.classList.remove('game-hide');
    }

    function catchTreat(it) {
      score += it.type === 'shoe' ? 50 : 10;
      bounce = 1;
      updateScore();
      scoreEl.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }],
        { duration: 260, easing: 'ease' });
      const color = it.type === 'shoe' ? '#ffcf4d' : it.candy.fill;
      burst(it.x, it.y, color, it.type === 'shoe' ? 18 : 11);
    }

    function hitHazard(it) {
      lives -= 1;
      invuln = 1.1;
      blink = 0;
      updateHearts();
      flashEl.animate([{ opacity: 0.5 }, { opacity: 0 }],
        { duration: 440, easing: 'ease-out' });
      burst(it.x, it.y, '#6b6776', 14);
      if (lives <= 0) endGame();
    }

    function burst(x, y, color, n) {
      for (let i = 0; i < n; i++) {
        const a = rand(0, TAU);
        const sp = rand(45, 220);
        sparks.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 70,
          life: rand(0.4, 0.85), max: 0.85,
          r: rand(1.6, 4.2),
          color,
        });
      }
    }

    // --- spawning -----------------------------------------------------
    function spawn() {
      const prog = clamp(elapsed / 70, 0, 1);
      const coalP = 0.2 + prog * 0.22;
      const r = Math.random();
      const type = r < coalP ? 'coal' : r < coalP + 0.08 ? 'shoe' : 'candy';
      const base = clamp(H * 0.05, 14, 30);
      const item = {
        type,
        x: rand(W * 0.1, W * 0.9),
        y: -base * 2,
        r: type === 'shoe' ? base * 1.15 : type === 'coal' ? base * 0.86 : base,
        vy: H * (0.42 + prog * 0.6) * rand(0.86, 1.16),
        rot: rand(0, TAU),
        spin: type === 'shoe' ? rand(-1.2, 1.2) : rand(-2.6, 2.6),
        sway: rand(0, TAU),
        drift: type === 'coal' ? rand(8, 22) : rand(18, 54),
        candy: type === 'candy' ? CANDY[Math.floor(rand(0, CANDY.length))] : null,
        poly: null,
      };
      if (type === 'coal') {
        // a stable irregular silhouette so the lump doesn't morph mid-fall
        item.poly = [];
        const verts = 7;
        for (let i = 0; i < verts; i++) {
          item.poly.push({
            a: (i / verts) * TAU + rand(-0.22, 0.22),
            r: rand(0.78, 1.18),
          });
        }
      }
      items.push(item);
    }

    // --- input --------------------------------------------------------
    const STEER = new Set(['arrowleft', 'arrowright', 'a', 'd', ' ']);

    window.addEventListener('keydown', (e) => {
      if (!inView) return;
      const k = e.key.toLowerCase();
      if (state === 'playing' && STEER.has(k)) e.preventDefault();
      if ((k === ' ' || k === 'enter') && state !== 'playing') {
        e.preventDefault();
        startGame();
        return;
      }
      keys.add(k);
    });
    window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

    function aim(e) {
      if (state !== 'playing') return;
      const r = wrap.getBoundingClientRect();
      sprite.target = clamp(((e.clientX - r.left) / r.width) * W,
        sprite.w / 2, W - sprite.w / 2);
    }
    wrap.addEventListener('pointermove', aim);
    wrap.addEventListener('pointerdown', aim);

    playBtn.addEventListener('click', startGame);
    againBtn.addEventListener('click', startGame);

    // --- main loop ----------------------------------------------------
    let last = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000 || 0, 0.05);
      last = now;
      update(dt);
      render();
    }
    requestAnimationFrame(frame);

    function update(dt) {
      elapsed += dt;
      blink += dt;
      bounce += (0 - bounce) * Math.min(1, dt * 9);

      // drifting background clouds
      for (const c of clouds) {
        c.x -= c.v * dt;
        if (c.x < -0.3) { c.x = 1.3; c.y = rand(0.05, 0.5); c.s = rand(0.5, 1.3); }
      }
      // drifting dust motes
      for (const m of motes) {
        m.y -= m.vy * dt;
        m.x += m.vx * dt + Math.sin(elapsed * 0.6 + m.ph) * 0.00035;
        if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
        if (m.x < -0.06) m.x = 1.06;
        else if (m.x > 1.06) m.x = -0.06;
      }

      if (state === 'playing') {
        // keyboard steering
        let kx = 0;
        if (keys.has('arrowleft') || keys.has('a')) kx -= 1;
        if (keys.has('arrowright') || keys.has('d')) kx += 1;
        if (kx) {
          sprite.target = clamp(sprite.target + kx * W * 1.7 * dt,
            sprite.w / 2, W - sprite.w / 2);
        }
        // spawn on a timer that tightens as the run goes on
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const prog = clamp(elapsed / 70, 0, 1);
          spawnTimer = Math.max(0.24, rand(0.55, 0.92) - prog * 0.42);
          spawn();
        }
        if (invuln > 0) invuln -= dt;
      }

      // sprite glides toward its target
      const prevX = sprite.x;
      sprite.x += (sprite.target - sprite.x) * Math.min(1, dt * 15);
      sprite.vx = sprite.x - prevX;

      // falling items
      const topY = spriteTopY();
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.vy * dt;
        it.rot += it.spin * dt;
        if (it.drift) {
          it.sway += dt * 2.3;
          it.x = clamp(it.x + Math.cos(it.sway) * it.drift * dt, it.r, W - it.r);
        }

        // does it land on the soot sprite?
        if (state === 'playing' && it.y + it.r >= topY && it.y <= topY + sprite.h) {
          const dx = Math.abs(it.x - sprite.x);
          if (it.type === 'coal') {
            if (invuln <= 0 && dx < sprite.w / 2 - it.r * 0.2) {
              hitHazard(it);
              items.splice(i, 1);
              continue;
            }
          } else if (dx < sprite.w / 2 + it.r * 0.4) {
            catchTreat(it);
            items.splice(i, 1);
            continue;
          }
        }

        if (it.y - it.r > H + 24) items.splice(i, 1);
      }

      // spark particles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += H * 0.95 * dt;
      }
    }

    /* --- rendering --------------------------------------------------- */

    function render() {
      if (!W || !H) return;
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      for (const c of clouds) drawCloud(c.x * W, c.y * H, c.s);
      drawForest(0);
      drawForest(1);
      for (const m of motes) drawMote(m);
      for (const it of items) drawItem(it);
      drawSoot();
      for (const s of sparks) drawSpark(s);
    }

    function drawCloud(cx, cy, s) {
      const u = 15 * s;
      const puffs = [[-1.7, 0.3, 1.0], [-0.7, -0.4, 1.4], [0.5, -0.25, 1.2],
        [1.6, 0.32, 0.95], [0.25, 0.5, 1.05]];
      ctx.fillStyle = 'rgba(255,255,255,0.66)';
      ctx.beginPath();
      for (const [px, py, pr] of puffs) {
        const r = pr * u;
        ctx.moveTo(cx + px * u + r, cy + py * u);
        ctx.arc(cx + px * u, cy + py * u, r, 0, TAU);
      }
      ctx.fill();
    }

    function drawForest(layer) {
      const baseY = H * (layer === 0 ? 0.86 : 0.92);
      const color = layer === 0 ? '#9bb188' : '#5f7c54';
      const bump = H * (layer === 0 ? 0.07 : 0.1);
      ctx.fillStyle = color;
      ctx.fillRect(0, baseY, W, H - baseY);
      ctx.beginPath();
      for (const tr of forest) {
        if (tr.layer !== layer) continue;
        const x = tr.fx * W;
        const r = bump * tr.size;
        ctx.moveTo(x + r, baseY);
        ctx.arc(x, baseY, r, 0, Math.PI, true);   // rounded canopy top
      }
      ctx.fill();
    }

    function drawMote(m) {
      const a = 0.2 + 0.22 * Math.sin(elapsed * 2 + m.ph);
      if (a <= 0.02) return;
      const x = m.x * W, y = m.y * H, r = m.r * 3;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,245,205,${a})`);
      g.addColorStop(1, 'rgba(255,245,205,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }

    function drawItem(it) {
      if (it.type === 'coal') drawCoal(it);
      else if (it.type === 'shoe') drawShoe(it);
      else drawKonpeito(it);
    }

    function konpeitoPath(cx, cy, base, rot, bumps, amp) {
      const steps = bumps * 6;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = rot + t * TAU;
        const r = base * (1 + amp * Math.cos(t * TAU * bumps));
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function drawKonpeito(it) {
      const c = it.candy;
      // soft glow halo
      const halo = ctx.createRadialGradient(it.x, it.y, it.r * 0.3, it.x, it.y, it.r * 2.0);
      halo.addColorStop(0, withAlpha(c.lit, 0.55));
      halo.addColorStop(1, withAlpha(c.lit, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(it.x, it.y, it.r * 2.0, 0, TAU);
      ctx.fill();

      // knobbly sugar-candy body
      konpeitoPath(it.x, it.y, it.r, it.rot, 7, 0.24);
      const body = ctx.createRadialGradient(
        it.x - it.r * 0.3, it.y - it.r * 0.3, it.r * 0.15,
        it.x, it.y, it.r * 1.15);
      body.addColorStop(0, c.lit);
      body.addColorStop(1, c.fill);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.lineWidth = Math.max(1, it.r * 0.1);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = c.rim;
      ctx.stroke();

      // sugar sparkle
      ctx.beginPath();
      ctx.arc(it.x - it.r * 0.32, it.y - it.r * 0.34, it.r * 0.2, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();
    }

    function drawShoe(it) {
      const r = it.r;
      // warm glow halo so the shoe pops against the sky
      const halo = ctx.createRadialGradient(it.x, it.y, r * 0.3, it.x, it.y, r * 2.2);
      halo.addColorStop(0, 'rgba(255,225,130,0.55)');
      halo.addColorStop(1, 'rgba(255,225,130,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(it.x, it.y, r * 2.2, 0, TAU);
      ctx.fill();

      ctx.save();
      ctx.translate(it.x, it.y);
      // sneakers don't tumble — gentle drift instead
      ctx.rotate(Math.sin(it.sway) * 0.22 - 0.1);

      // sneaker is wider than tall: half-width sx, half-height sy
      const sx = r * 1.45;
      const sy = r * 0.7;

      // --- white rubber sole ---
      ctx.beginPath();
      ctx.moveTo(-sx * 0.92, sy * 0.18);
      ctx.quadraticCurveTo(-sx * 1.08, sy * 0.92, -sx * 0.5, sy * 0.92);
      ctx.lineTo(sx * 0.78, sy * 0.92);
      ctx.quadraticCurveTo(sx * 1.06, sy * 0.7, sx * 0.96, sy * 0.32);
      ctx.lineTo(-sx * 0.92, sy * 0.18);
      ctx.closePath();
      ctx.fillStyle = '#f6efde';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(120,100,70,0.45)';
      ctx.stroke();

      // sole stitch line
      ctx.beginPath();
      ctx.moveTo(-sx * 0.85, sy * 0.42);
      ctx.lineTo(sx * 0.85, sy * 0.42);
      ctx.strokeStyle = 'rgba(150,120,80,0.35)';
      ctx.stroke();

      // --- yellow upper ---
      ctx.beginPath();
      ctx.moveTo(-sx * 0.85, sy * 0.18);                                  // heel base
      ctx.quadraticCurveTo(-sx * 1.0, -sy * 0.85, -sx * 0.55, -sy * 0.9); // up the heel back
      ctx.lineTo(-sx * 0.1, -sy * 0.95);                                  // ankle collar top
      ctx.quadraticCurveTo(sx * 0.25, -sy * 0.55, sx * 0.55, -sy * 0.3);  // arch over the foot
      ctx.quadraticCurveTo(sx * 0.92, -sy * 0.05, sx * 0.86, sy * 0.28);  // down to the toe
      ctx.lineTo(-sx * 0.85, sy * 0.18);
      ctx.closePath();
      const upper = ctx.createLinearGradient(0, -sy, 0, sy);
      upper.addColorStop(0, '#ffe486');
      upper.addColorStop(1, '#f2bc34');
      ctx.fillStyle = upper;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(150,100,30,0.5)';
      ctx.stroke();

      // tongue peeking up at the collar
      ctx.beginPath();
      ctx.moveTo(-sx * 0.12, -sy * 0.9);
      ctx.quadraticCurveTo(sx * 0.12, -sy * 0.78, sx * 0.32, -sy * 0.5);
      ctx.quadraticCurveTo(sx * 0.05, -sy * 0.6, -sx * 0.12, -sy * 0.9);
      ctx.closePath();
      ctx.fillStyle = '#e6a920';
      ctx.fill();

      // laces — three short stitches across the instep
      ctx.strokeStyle = '#6e4f1a';
      ctx.lineWidth = Math.max(1.2, r * 0.07);
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const t = i / 2;
        const cx = sx * (-0.05 + t * 0.32);
        const cy = -sy * (0.6 - t * 0.18);
        ctx.beginPath();
        ctx.moveTo(cx - sx * 0.08, cy);
        ctx.lineTo(cx + sx * 0.08, cy - sy * 0.04);
        ctx.stroke();
      }
      ctx.lineCap = 'butt';

      // heel seam
      ctx.beginPath();
      ctx.moveTo(-sx * 0.78, -sy * 0.15);
      ctx.lineTo(-sx * 0.5, -sy * 0.55);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // soft top highlight
      ctx.beginPath();
      ctx.ellipse(-sx * 0.2, -sy * 0.25, sx * 0.28, sy * 0.18, -0.25, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();

      ctx.restore();
    }

    function drawCoal(it) {
      const r = it.r;
      ctx.save();
      ctx.translate(it.x, it.y);

      // soft shadow halo so a dark lump still reads against the pale sky
      ctx.beginPath();
      ctx.arc(0, r * 0.18, r * 1.28, 0, TAU);
      ctx.fillStyle = 'rgba(40,38,48,0.18)';
      ctx.fill();

      ctx.rotate(it.rot);

      // irregular coal silhouette
      ctx.beginPath();
      for (let i = 0; i < it.poly.length; i++) {
        const v = it.poly[i];
        const x = Math.cos(v.a) * r * v.r;
        const y = Math.sin(v.a) * r * v.r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0.0, '#54505b');
      g.addColorStop(0.55, '#3a3641');
      g.addColorStop(1.0, '#222028');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(18,16,22,0.55)';
      ctx.stroke();

      // a softer facet highlight up top to give it form
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, -r * 0.55);
      ctx.lineTo(r * 0.10, -r * 0.72);
      ctx.lineTo(r * 0.38, -r * 0.22);
      ctx.lineTo(-r * 0.10, -r * 0.05);
      ctx.closePath();
      ctx.fillStyle = 'rgba(150,144,162,0.28)';
      ctx.fill();

      // mineral speckles
      ctx.fillStyle = 'rgba(220,210,235,0.55)';
      const dots = [[-0.25, -0.35, 0.05], [0.20, 0.06, 0.045],
        [0.06, -0.5, 0.04], [-0.3, 0.22, 0.045], [0.30, -0.42, 0.035]];
      for (const [px, py, pr] of dots) {
        ctx.beginPath();
        ctx.arc(px * r, py * r, pr * r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawSoot() {
      const sx = 1 + bounce * 0.1;            // squash-and-stretch on a catch
      const sy = 1 - bounce * 0.14;
      const rx = (sprite.w / 2) * sx;
      const ry = (sprite.h / 2) * sy;
      const bot = spriteTopY() + sprite.h;
      const bob = Math.sin(elapsed * 1.7) * ry * (state === 'playing' ? 0.04 : 0.07);
      const cx = sprite.x;
      const cy = bot - ry - bob;

      ctx.save();
      if (state === 'playing' && invuln > 0 && Math.floor(blink * 15) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // ground shadow
      ctx.beginPath();
      ctx.ellipse(cx, bot + 6, rx * 0.92, 6, 0, 0, TAU);
      ctx.fillStyle = 'rgba(60,52,70,0.22)';
      ctx.fill();

      // little feet — they scurry when the sprite is moving
      const moving = Math.abs(sprite.vx) > 0.4;
      const step = moving ? Math.sin(elapsed * 16) : 0;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + side * rx * 0.42, bot - bob - side * step * 2,
          rx * 0.2, ry * 0.14, 0, 0, TAU);
        ctx.fillStyle = SOOT;
        ctx.fill();
      }

      // fuzzy fringe
      ctx.fillStyle = SOOT;
      ctx.beginPath();
      const tufts = 30;
      for (let i = 0; i < tufts; i++) {
        const a = (i / tufts) * TAU;
        const wob = 1 + 0.15 * Math.sin(elapsed * 7 + i * 1.7);
        const er = (i % 2 === 0 ? 1.17 : 1.06) * wob;
        const x = cx + Math.cos(a) * rx * er;
        const y = cy + Math.sin(a) * ry * er;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // body
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
      ctx.fill();

      // soft highlight for form
      ctx.beginPath();
      ctx.ellipse(cx, cy - ry * 0.36, rx * 0.6, ry * 0.4, 0, 0, TAU);
      ctx.fillStyle = 'rgba(150,140,165,0.22)';
      ctx.fill();

      // eyes — pupils glance the way the sprite is moving
      const eyeR = Math.min(rx, ry) * 0.3;
      const look = clamp(sprite.vx * 0.6, -1, 1);
      for (const side of [-1, 1]) {
        const ex = cx + side * rx * 0.34;
        const ey = cy - ry * 0.12;
        ctx.beginPath();
        ctx.ellipse(ex, ey, eyeR, eyeR * 1.12, 0, 0, TAU);
        ctx.fillStyle = '#f4f1e8';
        ctx.fill();
        const px = ex + look * eyeR * 0.4;
        const py = ey + eyeR * 0.16;
        ctx.beginPath();
        ctx.arc(px, py, eyeR * 0.5, 0, TAU);
        ctx.fillStyle = SOOT;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px - eyeR * 0.18, py - eyeR * 0.2, eyeR * 0.16, 0, TAU);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
      }

      ctx.restore();
    }

    function drawSpark(s) {
      const t = clamp(s.life / s.max, 0, 1);
      ctx.globalAlpha = t;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.35 + t * 0.65), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
})();
