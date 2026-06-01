(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5800);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const filters = document.querySelectorAll('[data-filter-input]');
  filters.forEach(function (input) {
    const target = document.querySelector(input.getAttribute('data-filter-target'));
    const cards = target ? Array.from(target.querySelectorAll('[data-movie-card]')) : [];
    input.addEventListener('input', function () {
      const keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.classList.toggle('is-filter-hidden', keyword && !haystack.includes(keyword));
      });
    });
  });

  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');

  if (searchInput && searchResults && Array.isArray(window.SITE_MOVIES)) {
    const render = function (items) {
      if (!items.length) {
        searchResults.innerHTML = '<div class="empty-state">输入影片名称、年份、地区或类型后查看相关内容</div>';
        return;
      }

      searchResults.innerHTML = items.slice(0, 80).map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="./' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
          '    <img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
          '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <h2><a href="./' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
          '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
          '    <p class="movie-lead">' + escapeHtml(movie.one) + '</p>',
          '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    };

    const search = function () {
      const keyword = searchInput.value.trim().toLowerCase();
      if (!keyword) {
        render([]);
        return;
      }
      const matched = window.SITE_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.one]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      });
      render(matched);
    };

    searchInput.addEventListener('input', search);
    render([]);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
