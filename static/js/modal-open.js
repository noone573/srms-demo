(function () {
  var openers = document.querySelectorAll('[data-preview-open]');
  if (!openers.length) return;

  var FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var returnTo = null;

  function open(overlay, opener) {
    returnTo = opener || document.activeElement;
    overlay.classList.add('open');
    var target = overlay.querySelector('[data-preview-close]') || overlay.querySelector(FOCUSABLE);
    if (target) target.focus();
  }

  function close(overlay) {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    if (returnTo && document.contains(returnTo)) returnTo.focus();
    returnTo = null;
  }

  function closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(close);
  }

  function blocked() {
    var doc = document.getElementById('docViewer');
    return (doc && !doc.hidden) || Boolean(document.querySelector('.confirm-dialog:not([hidden])'));
  }

  openers.forEach(function (button) {
    button.addEventListener('click', function () {
      var overlay = document.getElementById(button.getAttribute('data-preview-open'));
      if (overlay) open(overlay, button);
    });
  });

  document.querySelectorAll('[data-preview-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      var overlay = button.closest('.modal-overlay');
      if (overlay) close(overlay);
    });
  });

  document.querySelectorAll('.modal-overlay[data-preview]').forEach(function (overlay) {
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close(overlay);
    });
  });

  document.addEventListener('keydown', function (event) {
    var overlay = document.querySelector('.modal-overlay.open');
    if (!overlay || blocked()) return;
    if (event.key === 'Escape') {
      closeAll();
      return;
    }
    if (event.key !== 'Tab') return;
    var items = Array.prototype.filter.call(
      overlay.querySelectorAll(FOCUSABLE),
      function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!overlay.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    }
  });

  if (location.hash.length > 1) {
    var fromHash = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (fromHash && fromHash.matches('.modal-overlay[data-preview]')) {
      var opener = document.querySelector('[data-preview-open="' + fromHash.id + '"]');
      open(fromHash, opener);
    }
  }
})();
