(function () {
  var select = document.querySelector('select[data-programme-pick]');
  if (!select) return;
  var tiles = document.querySelectorAll('[data-programme]');

  function sync() {
    tiles.forEach(function (tile) {
      tile.hidden = tile.dataset.programme !== select.value;
    });
    var url = new URL(window.location.href);
    url.searchParams.set('programme', select.value);
    window.history.replaceState(null, '', url);
  }

  select.addEventListener('change', sync);
})();
