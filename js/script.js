'use strict';

/*
 * Minimal script for the redesigned site:
 *   - sidebar toggle (only fires if both elements exist)
 *   - typing-text cycler for any element with data-typing='["a","b",…]'
 *
 * The Ghiblify and FAQ carousels each ship their own inline IIFE in the
 * page that needs them. The games are self-contained modules.
 */

(function () {
  var sidebar    = document.querySelector('[data-sidebar]');
  var sidebarBtn = document.querySelector('[data-sidebar-btn]');
  if (sidebar && sidebarBtn) {
    sidebarBtn.addEventListener('click', function () {
      sidebar.classList.toggle('active');
    });
  }
})();

/* ─── emoji burst on sticker hover ───────────────────────────────────
 * Hovering a .sticker fires its leading emoji outward like confetti.
 * Throttled per-sticker so a quick re-enter doesn't spam the DOM.
 * ─────────────────────────────────────────────────────────────── */
(function () {
  var stickers = document.querySelectorAll('.sticker');
  // grapheme-aware extraction (handles compound emoji like 🏃‍♀️)
  var graphemes = (typeof Intl !== 'undefined' && Intl.Segmenter)
    ? new Intl.Segmenter() : null;

  function leadingEmoji(text) {
    if (graphemes) {
      var first = graphemes.segment(text)[Symbol.iterator]().next().value;
      if (first) return first.segment;
    }
    var m = text.match(/^\S+/);
    return m ? m[0] : null;
  }

  stickers.forEach(function (sticker) {
    // pre-resolve what this sticker bursts with: prefer a real SVG icon
    // from a nested .sticker-icon, then data-emoji, then leading emoji.
    var iconEl  = sticker.querySelector('.sticker-icon');
    var iconRaw = iconEl ? iconEl.style.getPropertyValue('--icon').trim() : '';
    var emoji   = sticker.dataset.emoji || leadingEmoji(sticker.textContent.trim());
    if (!iconRaw && !emoji) return;

    var nextOk = 0;
    sticker.addEventListener('mouseenter', function () {
      var now = Date.now();
      if (now < nextOk) return;
      nextOk = now + 350;

      var rect = sticker.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var n = 10;

      for (var i = 0; i < n; i++) {
        var el = document.createElement('span');
        if (iconRaw) {
          el.className = 'emoji-burst emoji-burst--icon';
          el.style.setProperty('--icon', iconRaw);
        } else {
          el.className = 'emoji-burst';
          el.textContent = emoji;
        }
        var angle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
        var dist  = 55 + Math.random() * 80;
        el.style.left = cx + 'px';
        el.style.top  = cy + 'px';
        el.style.setProperty('--dx',  (Math.cos(angle) * dist).toFixed(1) + 'px');
        el.style.setProperty('--dy',  (Math.sin(angle) * dist).toFixed(1) + 'px');
        el.style.setProperty('--rot', ((Math.random() - 0.5) * 110).toFixed(1) + 'deg');
        el.style.animationDelay = (Math.random() * 0.08).toFixed(3) + 's';
        document.body.appendChild(el);
        (function (node) {
          setTimeout(function () { node.remove(); }, 1300);
        })(el);
      }
    });
  });
})();


/* ─── typing cycler ───────────────────────────────────────────────────
 * Markup:
 *   <p class="typing" data-typing='["hello world!","hi I&apos;m Emily!"]'>
 *     <span class="typing-prompt">$</span>
 *     <span class="typing-text"></span>
 *     <span class="typing-caret"></span>
 *   </p>
 * Types each phrase forward, pauses, backspaces, then types the next.
 * Loops indefinitely.
 * ─────────────────────────────────────────────────────────────── */
(function () {
  var els = document.querySelectorAll('.typing[data-typing]');
  els.forEach(function (el) {
    var phrases;
    try { phrases = JSON.parse(el.dataset.typing); } catch (e) { return; }
    if (!Array.isArray(phrases) || !phrases.length) return;

    var textEl = el.querySelector('.typing-text');
    if (!textEl) return;

    var pi = 0;            // current phrase index
    var ci = 0;            // current character index
    var typing = true;

    function tick() {
      var phrase = phrases[pi];
      if (typing) {
        ci++;
        textEl.textContent = phrase.slice(0, ci);
        if (ci >= phrase.length) {
          // hold the finished line for a beat before deleting
          typing = false;
          setTimeout(tick, 8000);
          return;
        }
        setTimeout(tick, 95 + Math.random() * 55);
      } else {
        ci--;
        textEl.textContent = phrase.slice(0, ci);
        if (ci <= 0) {
          typing = true;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, 700);
          return;
        }
        setTimeout(tick, 50 + Math.random() * 30);
      }
    }
    tick();
  });
})();
