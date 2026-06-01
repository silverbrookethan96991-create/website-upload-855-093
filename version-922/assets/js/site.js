(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;
    var show = function (next) {
      slides[index].classList.remove('active');
      dots[index].classList.remove('active');
      index = next;
      slides[index].classList.add('active');
      dots[index].classList.add('active');
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInputs = document.querySelectorAll('[data-card-filter]');
  filterInputs.forEach(function (input) {
    var scope = input.closest('[data-filter-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var year = scope.querySelector('[data-year-filter]');
    var region = scope.querySelector('[data-region-filter]');
    var empty = scope.querySelector('[data-empty-state]');
    var apply = function () {
      var q = input.value.trim().toLowerCase();
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
        var ok = (!q || text.indexOf(q) >= 0) && (!y || card.dataset.year === y) && (!r || card.dataset.region === r);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };
    input.addEventListener('input', apply);
    if (year) {
      year.addEventListener('change', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
  });

  var heroForm = document.querySelector('[data-hero-search]');
  if (heroForm) {
    heroForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroForm.querySelector('input');
      var q = input ? input.value.trim() : '';
      if (q) {
        window.location.href = 'search.html?q=' + encodeURIComponent(q);
      }
    });
  }

  var searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && window.SEARCH_MOVIES) {
    var form = searchRoot.querySelector('form');
    var input = searchRoot.querySelector('input');
    var results = document.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }
    var render = function (query) {
      var q = query.trim().toLowerCase();
      var pool = window.SEARCH_MOVIES;
      var list = q ? pool.filter(function (item) {
        return [item.title, item.genre, item.tags, item.region, item.year].join(' ').toLowerCase().indexOf(q) >= 0;
      }) : pool.slice(0, 24);
      list = list.slice(0, 80);
      if (!results) {
        return;
      }
      if (!list.length) {
        results.innerHTML = '<div class="empty-state" style="display:block">没有找到匹配影片，请尝试其他关键词。</div>';
        return;
      }
      results.innerHTML = '<div class="result-list">' + list.map(function (item) {
        return '<a class="result-item" href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</p><p>' + escapeHtml(item.oneLine) + '</p></span></a>';
      }).join('') + '</div>';
    };
    var escapeHtml = function (value) {
      return String(value).replace(/[&<>"']/g, function (ch) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch];
      });
    };
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input ? input.value : '');
      });
    }
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(input ? input.value : '');
  }
}());
