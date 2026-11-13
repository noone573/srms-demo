(function () {
  var root = document.documentElement;
  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  var size = read('textSize');
  if (size && ['90', '112', '125', '150'].indexOf(size) !== -1) root.setAttribute('data-text-size', size);
  if (read('eyeComfort') === '1') root.setAttribute('data-eye-comfort', '1');
  if (read('reduceMotion') === '1') root.setAttribute('data-reduce-motion', '1');
})();
