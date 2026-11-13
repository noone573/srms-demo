(function () {
  'use strict';

  var SELECTORS = {
    click: '[data-call]:not([data-call-on]), [data-call-on~="click"], [data-show], [data-hide]',
    input: '[data-call-on~="input"]',
    change: '[data-call-on~="change"]'
  };

  function argument(token, el) {
    if (token === '$this') return el;
    if (token === '$value') return el.value;
    if (token === '$row') return el.closest('tr');
    return token;
  }

  function call(el) {
    var fn = window[el.getAttribute('data-call')];
    if (typeof fn !== 'function') return;
    var args = [];
    var raw = el.getAttribute('data-args');
    if (raw) {
      try { args = JSON.parse(raw); } catch (e) { return; }
    }
    fn.apply(el, args.map(function (token) { return argument(token, el); }));
  }

  function display(el, attr, value) {
    var target = document.getElementById(el.getAttribute(attr));
    if (target) target.style.display = value;
  }

  function handle(event, kind) {
    var el = event.target.closest && event.target.closest(SELECTORS[kind]);
    if (!el) return;
    if (kind === 'click' && el.hasAttribute('data-show')) display(el, 'data-show', 'flex');
    if (kind === 'click' && el.hasAttribute('data-hide')) display(el, 'data-hide', 'none');
    if (!el.hasAttribute('data-call')) return;
    if (el.hasAttribute('data-self-only') && event.target !== el) return;
    call(el);
  }

  Object.keys(SELECTORS).forEach(function (kind) {
    document.addEventListener(kind, function (event) { handle(event, kind); });
  });
})();
