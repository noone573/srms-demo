(function () {
  var SIZES = [10, 20, 30, 50, 70, 100];
  var DEFAULT_SIZE = 20;
  var tables = document.querySelectorAll('table[data-paginate]');
  if (!tables.length) return;

  function button(label, onClick, state) {
    var item = document.createElement('li');
    var control = document.createElement(state ? 'span' : 'button');
    control.className = 'pagination__link' + (state ? ' ' + state : '');
    control.innerHTML = label;
    if (state === 'is-current') control.setAttribute('aria-current', 'page');
    if (state === 'is-disabled') control.setAttribute('aria-disabled', 'true');
    if (!state) {
      control.type = 'button';
      control.addEventListener('click', onClick);
    }
    item.appendChild(control);
    return item;
  }

  tables.forEach(function (table, tableIndex) {
    var head = table.tHead && table.tHead.rows[0];
    var body = table.tBodies[0];
    if (!head || !body) return;
    var width = head.cells.length;

    function isDataRow(row) {
      return row.tagName === 'TR' && row.parentNode === body && row.cells.length === width;
    }

    function dataRows() {
      return Array.prototype.slice.call(body.rows).filter(isDataRow);
    }

    function companionsOf(row) {
      var found = [];
      var next = row.nextElementSibling;
      while (next && next.tagName === 'TR' && !isDataRow(next)) {
        found.push(next);
        next = next.nextElementSibling;
      }
      return found;
    }

    function setPagedOut(row, out) {
      [row].concat(companionsOf(row)).forEach(function (each) {
        if (out) each.setAttribute('data-paged-out', '');
        else each.removeAttribute('data-paged-out');
      });
    }

    if (dataRows().length <= SIZES[0]) return;

    var size = DEFAULT_SIZE;
    var current = 1;

    var nav = document.createElement('nav');
    nav.className = 'pagination';
    nav.setAttribute('aria-label', table.dataset.paginate || 'Table pages');

    var meta = document.createElement('div');
    meta.className = 'pagination__meta';
    var count = document.createElement('p');
    count.className = 'pagination__count';
    count.setAttribute('aria-live', 'polite');

    var sizer = document.createElement('label');
    sizer.className = 'pagination__size';
    var select = document.createElement('select');
    select.className = 'select-inline';
    select.id = 'table-pager-size-' + tableIndex;
    sizer.htmlFor = select.id;
    sizer.appendChild(document.createTextNode('Per page'));
    SIZES.forEach(function (value) {
      select.appendChild(new Option(String(value), String(value), false, value === size));
    });
    sizer.appendChild(select);
    meta.appendChild(count);
    meta.appendChild(sizer);

    var list = document.createElement('ul');
    list.className = 'pagination__list';
    nav.appendChild(meta);
    nav.appendChild(list);

    var wrapper = table.parentElement;
    var anchor = wrapper && wrapper.querySelectorAll('table').length === 1
                 && /\b(u-scroll-x|table-scroll)\b/.test(wrapper.className)
      ? wrapper : table;
    anchor.parentNode.insertBefore(nav, anchor.nextSibling);

    var observer;

    function render() {
      observer.disconnect();
      var visible = dataRows().filter(function (row) { return !row.hidden; });
      var pages = Math.max(1, Math.ceil(visible.length / size));
      if (current > pages) current = pages;
      var start = (current - 1) * size;

      dataRows().forEach(function (row) {
        setPagedOut(row, false);
        if (row.hidden) companionsOf(row).forEach(function (each) {
          each.setAttribute('data-paged-out', '');
        });
      });
      visible.forEach(function (row, index) {
        if (index < start || index >= start + size) setPagedOut(row, true);
      });

      count.textContent = visible.length
        ? 'Showing ' + (start + 1) + '–' + Math.min(start + size, visible.length)
          + ' of ' + visible.length
        : '';

      list.innerHTML = '';
      list.hidden = pages < 2;
      if (pages > 1) {
        list.appendChild(current > 1
          ? button('<span aria-hidden="true">&larr;</span> Previous', function () { go(current - 1); })
          : button('<span aria-hidden="true">&larr;</span> Previous', null, 'is-disabled'));
        for (var n = 1; n <= pages; n += 1) {
          if (n === current) {
            list.appendChild(button(String(n), null, 'is-current'));
          } else if (n === 1 || n === pages || Math.abs(n - current) <= 2) {
            list.appendChild(button(String(n), go.bind(null, n)));
          } else if (Math.abs(n - current) === 3) {
            var gap = document.createElement('li');
            gap.innerHTML = '<span class="pagination__gap" aria-hidden="true">&hellip;</span>';
            list.appendChild(gap);
          }
        }
        list.appendChild(current < pages
          ? button('Next <span aria-hidden="true">&rarr;</span>', function () { go(current + 1); })
          : button('Next <span aria-hidden="true">&rarr;</span>', null, 'is-disabled'));
      }
      observer.observe(body, { childList: true, subtree: true,
                               attributes: true, attributeFilter: ['hidden'] });
    }

    function go(page) {
      current = page;
      render();
      var top = table.getBoundingClientRect().top;
      if (top < 0) table.scrollIntoView({ block: 'start' });
    }

    observer = new MutationObserver(function (records) {
      var filtered = records.some(function (record) {
        return record.type === 'childList' || isDataRow(record.target);
      });
      if (filtered) current = 1;
      render();
    });

    select.addEventListener('change', function () {
      size = Number(select.value) || DEFAULT_SIZE;
      current = 1;
      render();
    });

    render();
  });
})();
