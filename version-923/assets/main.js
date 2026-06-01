(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                var opened = nav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var active = 0;
            var show = function (next) {
                active = (next + slides.length) % slides.length;
                slides.forEach(function (slide, index) {
                    slide.classList.toggle("active", index === active);
                });
                dots.forEach(function (dot, index) {
                    dot.classList.toggle("active", index === active);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });
            setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        var toolbars = Array.prototype.slice.call(document.querySelectorAll(".catalog-toolbar"));
        toolbars.forEach(function (toolbar) {
            var section = toolbar.closest(".section") || document;
            var input = toolbar.querySelector("[data-filter-input]");
            var yearSelect = toolbar.querySelector("[data-filter-year]");
            var regionSelect = toolbar.querySelector("[data-filter-region]");
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            var empty = section.querySelector(".empty-state");

            var apply = function () {
                var q = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var region = regionSelect ? regionSelect.value : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-text") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var ok = true;

                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }

                    if (year && cardYear !== year) {
                        ok = false;
                    }

                    if (region && cardRegion !== region) {
                        ok = false;
                    }

                    card.hidden = !ok;
                    if (ok) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            };

            [input, yearSelect, regionSelect].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", apply);
                    item.addEventListener("change", apply);
                }
            });
        });
    });
})();
