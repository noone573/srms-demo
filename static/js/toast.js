(function () {
  'use strict';

  var LEAVE_MS = 220;
  var toasts = document.querySelectorAll('.toast[data-toast]');
  if (!toasts.length) return;

  var stack = document.createElement('div');
  stack.className = 'toast-stack';
  stack.setAttribute('aria-live', 'polite');
  document.body.appendChild(stack);

  function dismiss(toast) {
    if (toast.classList.contains('is-leaving')) return;
    toast.classList.add('is-leaving');
    window.setTimeout(function () {
      toast.remove();
      if (!stack.children.length) stack.remove();
    }, LEAVE_MS);
  }

  toasts.forEach(function (toast) {
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast__close';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.addEventListener('click', function () { dismiss(toast); });

    var timer = document.createElement('span');
    timer.className = 'toast__timer';
    timer.setAttribute('aria-hidden', 'true');
    timer.addEventListener('animationend', function () { dismiss(toast); });

    toast.appendChild(close);
    toast.appendChild(timer);
    stack.appendChild(toast);
  });
})();
