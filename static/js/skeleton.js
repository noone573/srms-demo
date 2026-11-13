(function () {
  'use strict';

  var MAX_WAIT    = 5000;
  var TAB_KEY     = 'srms-tab-switch';
  var TAB_WINDOW  = 15000;

  var root = document.documentElement;
  var script = document.currentScript;
  var revealed = false;

  function removeLoader() {
    var el = document.querySelector('.page-loader, .page-skeleton');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function rememberTabSwitch(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest ? event.target.closest('.sidebar-nav a.sidebar-link') : null;
    if (!link || (link.target && link.target !== '_self')) return;
    try { sessionStorage.setItem(TAB_KEY, String(Date.now())); } catch (error) {}
  }

  function cameFromTabSwitch() {
    try {
      var stamp = Number(sessionStorage.getItem(TAB_KEY));
      sessionStorage.removeItem(TAB_KEY);
      return stamp > 0 && Date.now() - stamp < TAB_WINDOW;
    } catch (error) {
      return false;
    }
  }

  document.addEventListener('click', rememberTabSwitch);

  if (script && script.hasAttribute('data-tabs-only') && !cameFromTabSwitch()) {
    document.addEventListener('DOMContentLoaded', removeLoader);
    return;
  }

  root.classList.add('is-loading');

  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.remove('is-loading');
    setTimeout(removeLoader, 600);
  }

  function whenFontsReady(next) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(next, next);
    } else {
      next();
    }
  }

  function onContentReady() { whenFontsReady(reveal); }

  if (document.readyState !== 'loading') onContentReady();
  else document.addEventListener('DOMContentLoaded', onContentReady);

  setTimeout(reveal, MAX_WAIT);
})();
