(function () {
  'use strict';

  if (window.__tipBound) return;
  window.__tipBound = true;

  var SELECTOR = 'button, a[href], [role="button"], [data-tip]';
  var GAP = 6;
  var EDGE = 4;
  var DELAY = 350;

  var tip = null;
  var owner = null;
  var timer = null;

  function visibleText(el) {
    var copy = el.cloneNode(true);
    copy.querySelectorAll('svg, img, .sr-only, [hidden], [aria-hidden="true"]').forEach(function (node) {
      node.remove();
    });
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }

  function iconOnly(el) {
    var text = visibleText(el);
    return text.length <= 2 && !/[A-Za-z0-9]/.test(text);
  }

  function labelFor(el) {
    if (el.getAttribute('aria-expanded') === 'true') return '';
    if (el.hasAttribute('data-tip')) return el.getAttribute('data-tip');
    if (!iconOnly(el)) return '';
    return el.getAttribute('data-tip-title') || el.getAttribute('title') || el.getAttribute('aria-label') || '';
  }

  function candidate(node) {
    if (!node || !node.closest) return null;
    var el = node.closest(SELECTOR);
    if (!el || el.closest('#srmsTip')) return null;
    return labelFor(el) ? el : null;
  }

  function build() {
    var el = document.createElement('div');
    el.id = 'srmsTip';
    el.className = 'tip';
    el.setAttribute('role', 'tooltip');
    el.hidden = true;
    document.body.appendChild(el);
    return el;
  }

  function place(el) {
    var box = el.getBoundingClientRect();
    var size = tip.getBoundingClientRect();
    var top = box.bottom + GAP;
    var above = top + size.height > window.innerHeight - EDGE;
    if (above) top = box.top - GAP - size.height;
    var left = box.left + box.width / 2 - size.width / 2;
    left = Math.max(EDGE, Math.min(left, window.innerWidth - size.width - EDGE));
    tip.style.top = Math.max(EDGE, top) + 'px';
    tip.style.left = left + 'px';
    tip.classList.toggle('tip--above', above);
  }

  function show(el, byPointer) {
    var text = labelFor(el);
    if (!text) return;
    hide();
    if (byPointer && el.hasAttribute('title')) {
      el.setAttribute('data-tip-title', el.getAttribute('title'));
      el.removeAttribute('title');
    }
    tip = tip || build();
    tip.textContent = text;
    tip.hidden = false;
    owner = el;
    place(el);
  }

  function hide() {
    window.clearTimeout(timer);
    timer = null;
    if (owner && owner.hasAttribute('data-tip-title')) {
      owner.setAttribute('title', owner.getAttribute('data-tip-title'));
      owner.removeAttribute('data-tip-title');
    }
    owner = null;
    if (tip) tip.hidden = true;
  }

  document.addEventListener('pointerover', function (event) {
    if (event.pointerType === 'touch') return;
    var el = candidate(event.target);
    if (!el || el === owner) return;
    var showing = owner !== null;
    window.clearTimeout(timer);
    if (showing) {
      show(el, true);
    } else {
      timer = window.setTimeout(function () { show(el, true); }, DELAY);
    }
  });

  document.addEventListener('pointerout', function (event) {
    var el = candidate(event.target);
    if (!el) return;
    if (event.relatedTarget && el.contains(event.relatedTarget)) return;
    if (el === owner || timer) hide();
  });

  document.addEventListener('focusin', function (event) {
    var el = candidate(event.target);
    if (!el) return;
    var keyboard = true;
    try { keyboard = el.matches(':focus-visible'); } catch (e) {}
    if (keyboard) show(el, false);
  });

  document.addEventListener('focusout', function () { hide(); });
  document.addEventListener('pointerdown', function () { hide(); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') hide();
  });
  window.addEventListener('scroll', function () { if (owner) hide(); }, { passive: true, capture: true });
  window.addEventListener('resize', function () { if (owner) hide(); });
})();
