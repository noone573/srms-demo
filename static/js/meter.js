(function () {
  'use strict';

  function paint() {
    var bars = document.querySelectorAll('[data-meter]');
    Array.prototype.forEach.call(bars, function (bar) {
      var value = parseFloat(bar.getAttribute('data-meter'));
      if (!isFinite(value)) { value = 0; }
      bar.style.width = Math.max(0, Math.min(100, value)) + '%';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
}());
