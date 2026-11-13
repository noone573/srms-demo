(function () {
  var PORTALS = [
    ['Landing page', 'index.html'],
    ['Sign in', 'login.html'],
    ['Register', 'register.html'],
    ['Student portal', 'student-dashboard.html'],
    ['SDSO office portal', 'office-dashboard.html'],
    ['BiPSU Employee portal', 'employee-dashboard.html'],
    ['Partner office portal', 'partner-dashboard.html']
  ];

  var toastTimer;
  function notice(text) {
    var el = document.getElementById('demo-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  }

  function isLogin() {
    return /(^|\/)login\.html$/.test(location.pathname);
  }

  function openPicker() {
    var p = document.getElementById('demo-picker');
    if (p) p.classList.add('is-open');
  }

  function blockSubmit(form) {
    if (isLogin() && form && form.querySelector('input[type="password"]')) {
      openPicker();
      return;
    }
    notice('Demo only — nothing is saved or sent.');
  }

  window.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    blockSubmit(e.target);
  }, true);

  HTMLFormElement.prototype.submit = function () { blockSubmit(this); };
  HTMLFormElement.prototype.requestSubmit = function () { blockSubmit(this); };

  window.fetch = function () {
    return Promise.reject(new Error('demo'));
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#' && !a.hasAttribute('data-open-modal') && !a.hasAttribute('role')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      notice('Not available in the demo.');
    } else if (a.hasAttribute('download')) {
      e.preventDefault();
      notice('Downloads are switched off in the demo.');
    }
  }, true);

  function build() {
    var wrap = document.createElement('div');
    wrap.id = 'demo-picker';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'demo-badge';
    btn.textContent = 'DEMO · switch page';
    btn.setAttribute('aria-expanded', 'false');
    var menu = document.createElement('nav');
    menu.className = 'demo-menu';
    menu.setAttribute('aria-label', 'Demo pages');
    var head = document.createElement('p');
    head.className = 'demo-menu__head';
    head.textContent = 'Static demo — no data is saved. Pick a portal:';
    menu.appendChild(head);
    PORTALS.forEach(function (p) {
      var link = document.createElement('a');
      link.href = p[1];
      link.textContent = p[0];
      menu.appendChild(link);
    });
    btn.addEventListener('click', function () {
      var open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('is-open');
    });
    wrap.appendChild(menu);
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
