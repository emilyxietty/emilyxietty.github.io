/*
 * Sky Glider — a small three.js mini-game for the Play page.
 * Self-contained: three.js is pulled from a CDN via dynamic import so a
 * network hiccup degrades gracefully instead of breaking the page.
 */

(async () => {
  'use strict';

  const wrap = document.querySelector('[data-game]');
  if (!wrap) return;

  let THREE;
  try {
    THREE = await import('https://unpkg.com/three@0.160.0/build/three.module.min.js');
  } catch (err) {
    const start = wrap.querySelector('[data-game-start]');
    if (start) {
      start.innerHTML =
        '<h3 class="game-title">Couldn\'t load the game</h3>' +
        '<p class="game-tagline">The 3D library failed to load — ' +
        'check your connection and refresh the page.</p>';
    }
    return;
  }

  try {
    initGame(THREE, wrap);
  } catch (err) {
    console.error('Sky Glider failed to start:', err);
    const start = wrap.querySelector('[data-game-start]');
    if (start) {
      start.innerHTML =
        '<h3 class="game-title">Game unavailable</h3>' +
        '<p class="game-tagline">Your browser couldn\'t start the 3D scene ' +
        '(WebGL may be disabled).</p>';
    }
  }

  /* ------------------------------------------------------------------ */

  function initGame(THREE, wrap) {
    // --- tuning constants ---------------------------------------------
    const PLAYER_Z = 2.2;       // where the glider sits on the z axis
    const RESET_Z = 100;        // how far back recycled objects respawn
    const SPAWN_JITTER = 46;    // random extra depth on respawn
    const CULL_Z = 13;          // past this z (behind camera) → recycle
    const BASE_SPEED = 16;
    const MAX_SPEED = 39;
    const ACCEL = 0.5;          // world speed gained per second
    const IDLE_SPEED = 6;       // drift speed on the start / game-over screens

    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

    // --- DOM ----------------------------------------------------------
    const canvas = wrap.querySelector('[data-game-canvas]');
    const hud = wrap.querySelector('[data-game-hud]');
    const scoreEl = wrap.querySelector('[data-game-score]');
    const hearts = Array.from(wrap.querySelectorAll('.game-heart'));
    const startOverlay = wrap.querySelector('[data-game-start]');
    const overOverlay = wrap.querySelector('[data-game-over]');
    const finalEl = wrap.querySelector('[data-game-final]');
    const bestEl = wrap.querySelector('[data-game-best]');
    const playBtn = wrap.querySelector('[data-game-play]');
    const againBtn = wrap.querySelector('[data-game-again]');
    const flashEl = wrap.querySelector('[data-game-flash]');

    // --- renderer / scene / camera ------------------------------------
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    scene.background = makeSky();
    scene.fog = new THREE.Fog(0xe2d6ec, 26, 96);

    const camera = new THREE.PerspectiveCamera(60, 16 / 10, 0.1, 240);
    camera.position.set(0, 1, 8);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xffd2b8, 2.2));
    const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);
    sun.position.set(-7, 9, 5);
    scene.add(sun);

    // --- world objects ------------------------------------------------
    const glowTex = makeGlow();
    const puffGeo = new THREE.IcosahedronGeometry(0.18, 0);

    const glider = buildGlider();
    scene.add(glider);

    const clouds = [];
    const storms = [];
    const orbs = [];
    const puffs = [];

    for (let i = 0; i < 16; i++) {
      const c = buildCloud(false);
      scene.add(c);
      clouds.push(c);
    }
    for (let i = 0; i < 6; i++) {
      const s = buildCloud(true);
      s.userData.hitR = 1.7;
      scene.add(s);
      storms.push(s);
    }
    for (let i = 0; i < 9; i++) {
      const o = buildOrb();
      o.userData.phase = rand(0, 6.28);
      scene.add(o);
      orbs.push(o);
    }
    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(
        puffGeo,
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      p.visible = false;
      p.userData = { life: 0, max: 1, vx: 0, vy: 0, vz: 0 };
      scene.add(p);
      puffs.push(p);
    }

    // --- game state ---------------------------------------------------
    let state = 'start';                 // 'start' | 'playing' | 'over'
    let score = 0;
    let best = Number(localStorage.getItem('skyglider-best') || 0);
    let lives = 3;
    let speed = IDLE_SPEED;
    let invuln = 0;
    let elapsed = 0;
    let trailTimer = 0;
    let steerX = 0;
    let steerY = 0;
    let xBound = 5;
    let yBound = 2.8;
    const target = { x: 0, y: 0 };
    const keys = new Set();

    // --- sizing -------------------------------------------------------
    function resize() {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // playable bounds = visible frustum at the glider's depth
      const dist = camera.position.z - PLAYER_Z;
      const vH = Math.tan((camera.fov * Math.PI / 180) / 2) * dist;
      const vW = vH * camera.aspect;
      yBound = vH * 0.78;
      xBound = vW * 0.84;
    }
    new ResizeObserver(resize).observe(wrap);
    resize();

    // only react to the keyboard while the game is actually on screen, so it
    // doesn't fight the other game on the Play page for the arrow keys
    let inView = true;
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (!inView) keys.clear();
    }, { threshold: 0.5 }).observe(wrap);

    // --- placement ----------------------------------------------------
    function spawnXY(obj, type) {
      if (type === 'cloud') {
        obj.position.x = rand(-xBound * 1.7, xBound * 1.7);
        obj.position.y = rand(-yBound * 1.5, yBound * 1.5);
      } else {
        obj.position.x = rand(-xBound, xBound);
        obj.position.y = rand(-yBound * 0.9, yBound * 0.9);
      }
    }

    function recycle(obj, type) {
      spawnXY(obj, type);
      obj.position.z = -(RESET_Z + Math.random() * SPAWN_JITTER);
    }

    function resetWorld() {
      for (const c of clouds) {
        spawnXY(c, 'cloud');
        c.position.z = rand(-6, -(RESET_Z + SPAWN_JITTER));
      }
      for (const o of orbs) {
        spawnXY(o, 'orb');
        o.position.z = rand(-14, -(RESET_Z + SPAWN_JITTER));
      }
      for (const s of storms) {
        spawnXY(s, 'storm');
        // keep the opening corridor clear so the run starts fair
        s.position.z = rand(-28, -(RESET_Z + SPAWN_JITTER));
      }
    }
    resetWorld();

    // --- HUD ----------------------------------------------------------
    function updateScore() {
      scoreEl.textContent = Math.floor(score);
    }
    function updateHearts() {
      hearts.forEach((h, i) => h.classList.toggle('game-heart--lost', i >= lives));
    }

    // --- state transitions -------------------------------------------
    function startGame() {
      score = 0;
      lives = 3;
      speed = BASE_SPEED;
      invuln = 0;
      elapsed = 0;
      steerX = steerY = 0;
      target.x = target.y = 0;
      glider.position.set(0, 0, PLAYER_Z);
      glider.rotation.set(0, 0, 0);
      resetWorld();
      updateScore();
      updateHearts();
      startOverlay.classList.add('game-hide');
      overOverlay.classList.add('game-hide');
      hud.classList.remove('game-hide');
      state = 'playing';
    }

    function endGame() {
      state = 'over';
      best = Math.max(best, Math.floor(score));
      try { localStorage.setItem('skyglider-best', String(best)); } catch (e) { /* ignore */ }
      finalEl.textContent = Math.floor(score);
      bestEl.textContent = best;
      hud.classList.add('game-hide');
      overOverlay.classList.remove('game-hide');
    }

    function hitStorm(s) {
      lives -= 1;
      invuln = 1.5;
      updateHearts();
      flashEl.animate([{ opacity: 0.6 }, { opacity: 0 }],
        { duration: 420, easing: 'ease-out' });
      // shove the storm well out of range so there's no instant re-hit
      recycle(s, 'storm');
      s.position.z = -(RESET_Z + 24 + Math.random() * SPAWN_JITTER);
      if (lives <= 0) endGame();
    }

    function collectOrb(o) {
      score += 220;
      updateScore();
      scoreEl.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }],
        { duration: 280, easing: 'ease' });
      for (let i = 0; i < 9; i++) {
        emitPuff(o.position.x, o.position.y, o.position.z, 0xffd76b, 0.5, 3.2, 4);
      }
      recycle(o, 'orb');
    }

    // --- particle puffs ----------------------------------------------
    function emitPuff(x, y, z, color, life, spread, drift) {
      for (const p of puffs) {
        if (p.visible) continue;
        p.visible = true;
        p.position.set(x, y, z);
        p.material.color.setHex(color);
        p.material.opacity = 0.9;
        p.scale.setScalar(rand(0.6, 1.3));
        p.userData.life = p.userData.max = life;
        p.userData.vx = rand(-spread, spread);
        p.userData.vy = rand(-spread, spread);
        p.userData.vz = drift + rand(-spread, spread);
        return;
      }
    }

    // --- input --------------------------------------------------------
    const STEER = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ']);

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

    wrap.addEventListener('pointermove', (e) => {
      if (state !== 'playing') return;
      const r = wrap.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      target.x = clamp(nx * xBound, -xBound, xBound);
      target.y = clamp(-ny * yBound, -yBound, yBound);
    });

    playBtn.addEventListener('click', startGame);
    againBtn.addEventListener('click', startGame);

    // --- main loop ----------------------------------------------------
    let lastTime = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - lastTime) / 1000 || 0, 0.05);
      lastTime = now;
      update(dt);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);

    function update(dt) {
      elapsed += dt;
      speed = state === 'playing'
        ? Math.min(MAX_SPEED, BASE_SPEED + elapsed * ACCEL)
        : IDLE_SPEED;

      // scroll the world toward the player, recycling anything that passes
      for (const c of clouds) {
        c.position.z += speed * dt;
        if (c.position.z > CULL_Z) recycle(c, 'cloud');
      }
      for (const s of storms) {
        s.position.z += speed * dt;
        if (s.position.z > CULL_Z) recycle(s, 'storm');
      }
      for (const o of orbs) {
        o.position.z += speed * dt;
        o.rotation.y += dt * 1.6;
        o.userData.phase += dt * 2.4;
        o.userData.core.position.y = Math.sin(o.userData.phase) * 0.12;
        if (o.position.z > CULL_Z) recycle(o, 'orb');
      }

      // steering target
      if (state === 'playing') {
        let kx = 0, ky = 0;
        if (keys.has('arrowleft') || keys.has('a')) kx -= 1;
        if (keys.has('arrowright') || keys.has('d')) kx += 1;
        if (keys.has('arrowup') || keys.has('w')) ky += 1;
        if (keys.has('arrowdown') || keys.has('s')) ky -= 1;
        if (kx || ky) {
          target.x = clamp(target.x + kx * 9 * dt, -xBound, xBound);
          target.y = clamp(target.y + ky * 6.5 * dt, -yBound, yBound);
        }
      } else {
        target.x += (0 - target.x) * Math.min(1, dt * 3);
        target.y += (0 - target.y) * Math.min(1, dt * 3);
      }

      // glide toward the target, tracking velocity for the bank/pitch tilt
      const lerpA = Math.min(1, dt * 6);
      const pX = steerX, pY = steerY;
      steerX += (target.x - steerX) * lerpA;
      steerY += (target.y - steerY) * lerpA;
      const vx = steerX - pX;
      const vy = steerY - pY;

      const idleBob = state === 'playing' ? 0 : Math.sin(elapsed * 1.4) * 0.16;
      glider.position.set(steerX, steerY + idleBob, PLAYER_Z);

      const bank = clamp(-vx * 9, -0.7, 0.7);
      const pitch = clamp(-vy * 7, -0.4, 0.4) + Math.sin(elapsed * 1.6) * 0.04;
      const yaw = clamp(-vx * 3, -0.3, 0.3);
      const turnA = Math.min(1, dt * 8);
      glider.rotation.z += (bank - glider.rotation.z) * turnA;
      glider.rotation.x += (pitch - glider.rotation.x) * turnA;
      glider.rotation.y += (yaw - glider.rotation.y) * turnA;

      // camera drifts a little with the glider for parallax
      const camA = Math.min(1, dt * 3);
      camera.position.x += (glider.position.x * 0.32 - camera.position.x) * camA;
      camera.position.y += (1 + glider.position.y * 0.2 - camera.position.y) * camA;
      camera.lookAt(glider.position.x * 0.45, glider.position.y * 0.4 + 0.3, -8);

      // contrail
      if (state === 'playing') {
        trailTimer -= dt;
        if (trailTimer <= 0) {
          trailTimer = 0.045;
          emitPuff(
            glider.position.x + rand(-0.2, 0.2),
            glider.position.y + rand(-0.15, 0.15),
            glider.position.z + 0.8,
            0xffffff, 0.7, 0.5, 1.5);
        }
      }

      // advance puffs
      for (const p of puffs) {
        if (!p.visible) continue;
        p.userData.life -= dt;
        if (p.userData.life <= 0) { p.visible = false; continue; }
        p.position.x += p.userData.vx * dt;
        p.position.y += p.userData.vy * dt;
        p.position.z += (p.userData.vz + speed) * dt;
        const t = p.userData.life / p.userData.max;
        p.material.opacity = t * 0.9;
        p.scale.setScalar(t * 1.1 + 0.15);
      }

      // collisions + scoring (only while playing)
      if (state === 'playing') {
        if (invuln > 0) invuln -= dt;
        const gx = glider.position.x;
        const gy = glider.position.y;

        if (invuln <= 0) {
          for (const s of storms) {
            if (Math.abs(s.position.z - PLAYER_Z) > 2.6) continue;
            const dx = s.position.x - gx;
            const dy = s.position.y - gy;
            if (dx * dx + dy * dy < s.userData.hitR * s.userData.hitR) {
              hitStorm(s);
              break;
            }
          }
        }
        for (const o of orbs) {
          if (Math.abs(o.position.z - PLAYER_Z) > 2.2) continue;
          const dx = o.position.x - gx;
          const dy = o.position.y - gy;
          if (dx * dx + dy * dy < 1.5) collectOrb(o);
        }

        score += dt * speed * 0.85;
        updateScore();

        // blink while invulnerable, otherwise always show
        glider.visible = invuln > 0 ? Math.floor(elapsed * 14) % 2 === 0 : true;
      } else {
        glider.visible = true;
      }
    }

    /* --- builders ---------------------------------------------------- */

    function makeSky() {
      const c = document.createElement('canvas');
      c.width = 8;
      c.height = 256;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0.0, '#a9dcf0');
      g.addColorStop(0.5, '#e7d4ef');
      g.addColorStop(1.0, '#ffd6c2');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 8, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    function makeGlow() {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      g.addColorStop(0.0, 'rgba(255,243,200,0.95)');
      g.addColorStop(0.45, 'rgba(255,205,110,0.35)');
      g.addColorStop(1.0, 'rgba(255,205,110,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    function buildGlider() {
      const g = new THREE.Group();
      const cream = new THREE.MeshStandardMaterial({
        color: 0xfff3df, flatShading: true, roughness: 0.85, metalness: 0,
      });
      const pink = new THREE.MeshStandardMaterial({
        color: 0xff90ad, flatShading: true, roughness: 0.8, metalness: 0,
      });
      const peach = new THREE.MeshStandardMaterial({
        color: 0xffb37a, flatShading: true, roughness: 0.8, metalness: 0,
      });

      const bodyGeo = new THREE.CapsuleGeometry(0.17, 0.95, 4, 10);
      bodyGeo.rotateX(Math.PI / 2);
      g.add(new THREE.Mesh(bodyGeo, cream));

      const wing = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.07, 0.62), cream);
      wing.position.z = -0.05;
      g.add(wing);

      const tail = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.06, 0.34), cream);
      tail.position.z = 0.64;
      g.add(tail);

      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.32), pink);
      fin.position.set(0, 0.2, 0.64);
      g.add(fin);

      const noseGeo = new THREE.ConeGeometry(0.17, 0.4, 12);
      noseGeo.rotateX(-Math.PI / 2);
      const nose = new THREE.Mesh(noseGeo, peach);
      nose.position.z = -0.74;
      g.add(nose);

      return g;
    }

    function buildCloud(dark) {
      const grp = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({
        color: dark ? 0x726b85 : 0xffffff,
        emissive: dark ? 0x35304a : 0x000000,
        flatShading: true, roughness: 1, metalness: 0,
      });
      const n = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        const r = (dark ? 0.95 : 0.8) + Math.random() * 1.05;
        const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat);
        blob.position.set(rand(-1.7, 1.7), rand(-0.7, 0.7), rand(-1.1, 1.1));
        blob.rotation.set(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28));
        grp.add(blob);
      }
      return grp;
    }

    function buildOrb() {
      const grp = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.34, 1),
        new THREE.MeshStandardMaterial({
          color: 0xffe7a6, emissive: 0xffc24a, emissiveIntensity: 1.5,
          roughness: 0.35, metalness: 0, flatShading: true,
        })
      );
      grp.add(core);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      glow.scale.set(2.2, 2.2, 1);
      grp.add(glow);
      grp.userData.core = core;
      return grp;
    }
  }
})();
