(function () {
  'use strict';

  var panel = document.getElementById('displaySettings');
  if (!panel) return;

  var root = document.documentElement;
  var deviceDark = window.matchMedia('(prefers-color-scheme: dark)');
  var stepper = panel.querySelector('[data-text-sizes]');
  var sizes = stepper.getAttribute('data-text-sizes').split(' ');
  var SWITCHES = { eyeComfort: 'data-eye-comfort', reduceMotion: 'data-reduce-motion' };

  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function write(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) {}
  }

  function themeChoice() {
    var stored = read('theme');
    return stored === 'dark' || stored === 'light' ? stored : 'system';
  }

  function applyTheme(choice) {
    var dark = choice === 'dark' || (choice === 'system' && deviceDark.matches);
    root.classList.toggle('dark', dark);
    var meta = document.getElementById('themeColor');
    if (meta) meta.setAttribute('content', dark ? '#171c2e' : '#ffffff');
    panel.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-theme-choice') === choice ? 'true' : 'false');
    });
  }

  function currentSize() {
    return root.getAttribute('data-text-size') || '100';
  }

  function applySize(size) {
    if (size === '100') root.removeAttribute('data-text-size');
    else root.setAttribute('data-text-size', size);
    var at = sizes.indexOf(size);
    var label = size === '112' ? '112.5' : size;
    stepper.querySelector('[data-text-size-value]').textContent = label + '%';
    stepper.querySelector('[data-text-size-step="-1"]').disabled = at <= 0;
    stepper.querySelector('[data-text-size-step="1"]').disabled = at >= sizes.length - 1;
  }

  function applySwitch(key, on) {
    if (on) root.setAttribute(SWITCHES[key], '1');
    else root.removeAttribute(SWITCHES[key]);
    var button = panel.querySelector('[data-pref-switch="' + key + '"]');
    if (button) button.setAttribute('aria-checked', on ? 'true' : 'false');
  }

  panel.addEventListener('click', function (event) {
    var theme = event.target.closest('[data-theme-choice]');
    if (theme) {
      var choice = theme.getAttribute('data-theme-choice');
      write('theme', choice === 'system' ? null : choice);
      applyTheme(choice);
      return;
    }
    var step = event.target.closest('[data-text-size-step]');
    if (step) {
      var at = sizes.indexOf(currentSize()) + Number(step.getAttribute('data-text-size-step'));
      var size = sizes[Math.max(0, Math.min(sizes.length - 1, at))];
      write('textSize', size === '100' ? null : size);
      applySize(size);
      return;
    }
    var toggle = event.target.closest('[data-pref-switch]');
    if (toggle) {
      var key = toggle.getAttribute('data-pref-switch');
      var on = toggle.getAttribute('aria-checked') !== 'true';
      write(key, on ? '1' : null);
      applySwitch(key, on);
      return;
    }
    if (event.target.closest('[data-display-reset]')) {
      ['theme', 'textSize', 'eyeComfort', 'reduceMotion'].forEach(function (key) { write(key, null); });
      applyTheme('system');
      applySize('100');
      Object.keys(SWITCHES).forEach(function (key) { applySwitch(key, false); });
    }
  });

  deviceDark.addEventListener('change', function () {
    if (themeChoice() === 'system') applyTheme('system');
  });

  applyTheme(themeChoice());
  applySize(currentSize());
  Object.keys(SWITCHES).forEach(function (key) {
    applySwitch(key, root.hasAttribute(SWITCHES[key]));
  });
})();
