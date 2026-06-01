(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initMenu() {
    var button = $('.menu-button');
    var panel = $('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = $('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = $all('.hero-slide', slider);
    var dots = $all('.hero-dot', slider);
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prevButton = $('.hero-prev', slider);
    var nextButton = $('.hero-next', slider);
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var grid = $('.catalog-grid');
    if (!grid) {
      return;
    }
    var cards = $all('.movie-card', grid);
    var input = $('.js-filter-input');
    var year = $('.js-filter-year');
    var region = $('.js-filter-region');
    var sort = $('.js-filter-sort');
    var empty = $('.empty-state');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input && input.value);
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.dataset.title + ' ' + card.dataset.tags);
        var matchText = !query || text.indexOf(query) !== -1;
        var matchYear = !selectedYear || card.dataset.year === selectedYear;
        var matchRegion = !selectedRegion || card.dataset.region === selectedRegion;
        var show = matchText && matchYear && matchRegion;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    function sortCards() {
      var mode = sort ? sort.value : 'hot';
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (mode === 'score') {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        }
        if (mode === 'title') {
          return a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN');
        }
        return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    [input, year, region].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    if (sort) {
      sort.addEventListener('change', sortCards);
    }
    sortCards();
  }

  function initSearchPage() {
    var results = $('#searchResults');
    var form = $('#searchForm');
    var input = $('#searchInput');
    if (!results || !form || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function card(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '' +
        '<article class="movie-card">' +
          '<a class="poster-link" href="./' + escapeHtml(item.file) + '">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="card-badge">' + escapeHtml(item.category) + '</span>' +
          '</a>' +
          '<div class="card-body">' +
            '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
            '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<p>' + escapeHtml(item.description) + '</p>' +
            '<div class="card-bottom"><span>口碑 ' + escapeHtml(item.score) + '</span><span>热度 ' + escapeHtml(item.hotText) + '</span></div>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</article>';
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (item) {
        var text = [item.title, item.description, item.category, item.region, item.type, item.year].concat(item.tags || []).join(' ').toLowerCase();
        return !query || text.indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(card).join('');
      var empty = $('.empty-state');
      if (empty) {
        empty.classList.toggle('show', list.length === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.history.replaceState(null, '', url);
      render();
    });
    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
