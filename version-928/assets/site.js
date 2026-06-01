(function () {
  const ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let active = 0;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === active);
      });
    };

    if (slides.length) {
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(active - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(active + 1);
        });
      }

      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    const lists = Array.from(document.querySelectorAll("[data-movie-list]"));

    lists.forEach(function (list) {
      const section = list.closest("section") || document;
      const input = section.querySelector("[data-filter-input]") || document.querySelector("[data-filter-input]");
      const sortSelect = section.querySelector("[data-sort-select]");
      const empty = section.querySelector("[data-empty-message]");
      const chips = Array.from(section.querySelectorAll("[data-filter]"));
      const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
      let activeFilter = "";

      const urlParams = new URLSearchParams(window.location.search);
      const queryFromUrl = urlParams.get("q");

      if (input && queryFromUrl && !input.value) {
        input.value = queryFromUrl;
      }

      const update = function () {
        const query = input ? input.value.trim().toLowerCase() : "";
        let visibleCount = 0;

        cards.forEach(function (card) {
          const search = (card.getAttribute("data-search") || "").toLowerCase();
          const matchesQuery = !query || search.indexOf(query) !== -1;
          const matchesFilter = !activeFilter || search.indexOf(activeFilter.toLowerCase()) !== -1;
          const show = matchesQuery && matchesFilter;
          card.hidden = !show;
          if (show) {
            visibleCount += 1;
          }
        });

        if (sortSelect) {
          const sorted = cards.slice().sort(function (a, b) {
            const mode = sortSelect.value;
            if (mode === "year-desc") {
              return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            }
            if (mode === "year-asc") {
              return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
            }
            if (mode === "title") {
              return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
            }
            return 0;
          });

          sorted.forEach(function (card) {
            list.appendChild(card);
          });
        }

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      };

      if (input) {
        input.addEventListener("input", update);
      }

      if (sortSelect) {
        sortSelect.addEventListener("change", update);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter") || "";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          update();
        });
      });

      update();
    });
  });
})();
