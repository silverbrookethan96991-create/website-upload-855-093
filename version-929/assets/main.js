(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setMobileNavigation() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    });
  }

  function setHeroCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-slide"));
        show(next);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setCardFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".card-filter"));
    inputs.forEach(function (input) {
      var section = input.closest("section") || document;
      var scope = section.querySelector(".filter-scope") || section;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      var clear = section.querySelector(".clear-filter");

      function apply() {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          card.style.display = !value || text.indexOf(value) !== -1 ? "" : "none";
        });
      }

      input.addEventListener("input", apply);
      if (clear) {
        clear.addEventListener("click", function () {
          input.value = "";
          apply();
          input.focus();
        });
      }
    });
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createResult(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span class="tag-pill">' + escapeHTML(tag) + '</span>';
    }).join("");
    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + escapeHTML(movie.url) + '" aria-label="' + escapeHTML(movie.title) + '">',
      '<img src="' + escapeHTML(movie.image) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHTML(movie.year) + '</span>',
      '</a>',
      '<div class="movie-body">',
      '<div class="movie-meta"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.type) + '</span></div>',
      '<h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
      '<p>' + escapeHTML(movie.oneLine) + '</p>',
      '<div class="movie-tags">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function setSearchPage() {
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var summary = document.getElementById("search-summary");
    var empty = document.getElementById("search-empty");
    if (!input || !results || !summary || typeof siteMovieIndex === "undefined") {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    input.value = keyword;

    function runSearch(value) {
      var query = value.trim().toLowerCase();
      results.innerHTML = "";
      if (!query) {
        summary.textContent = "输入关键词后即可查看匹配影片。";
        if (empty) {
          empty.hidden = true;
        }
        return;
      }
      var words = query.split(/\s+/).filter(Boolean);
      var matched = siteMovieIndex.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      if (matched.length) {
        results.innerHTML = matched.map(createResult).join("");
        summary.textContent = "已为你匹配到相关影片，可直接进入详情页点播。";
        if (empty) {
          empty.hidden = true;
        }
      } else {
        summary.textContent = "";
        if (empty) {
          empty.hidden = false;
        }
      }
    }

    runSearch(keyword);
  }

  ready(function () {
    setMobileNavigation();
    setHeroCarousel();
    setCardFilters();
    setSearchPage();
  });
})();
