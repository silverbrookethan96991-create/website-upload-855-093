(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-slide-to"), 10) || 0;
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var year = document.querySelector("[data-filter-year]");
    var genre = document.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length || (!input && !year && !genre)) {
      return;
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var genreValue = genre ? genre.value.toLowerCase() : "";
      cards.forEach(function (card) {
        var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var visible = true;
        if (query && keywords.indexOf(query) === -1) {
          visible = false;
        }
        if (yearValue && cardYear !== yearValue) {
          visible = false;
        }
        if (genreValue && keywords.indexOf(genreValue) === -1) {
          visible = false;
        }
        card.classList.toggle("hidden-by-filter", !visible);
      });
    }
    [input, year, genre].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var playUrl = player.getAttribute("data-play");
      var hls = null;
      if (!video || !cover || !playUrl) {
        return;
      }
      function attach() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 60
          });
          hls.loadSource(playUrl);
          hls.attachMedia(video);
        } else {
          video.src = playUrl;
        }
        video.setAttribute("data-ready", "1");
      }
      function start() {
        attach();
        cover.classList.add("is-hidden");
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {
            cover.classList.remove("is-hidden");
          });
        }
      }
      cover.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        cover.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"./" + escapeHtml(item.file) + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"rating-badge\">★ " + escapeHtml(item.rating) + "</span>",
      "<span class=\"hover-play\">▶</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<h3><a href=\"./" + escapeHtml(item.file) + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<p class=\"card-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</p>",
      "<p class=\"card-desc\">" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !input || !results || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render(value) {
      var query = value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = "<div class=\"search-empty\">输入关键词后即可查看匹配影片。</div>";
        return;
      }
      var matches = window.SITE_MOVIES.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 120);
      if (!matches.length) {
        results.innerHTML = "<div class=\"search-empty\">没有找到匹配影片。</div>";
        return;
      }
      results.innerHTML = matches.map(cardHtml).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
      render(query);
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initial);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
    setupSearchPage();
  });
})();
