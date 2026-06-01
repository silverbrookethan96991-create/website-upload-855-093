(() => {
    const normalize = (value) => String(value || "").toLowerCase().trim();

    function setupMobileNavigation() {
        const toggle = document.querySelector(".nav-toggle");
        const mobileNav = document.querySelector(".mobile-nav");
        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", () => {
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isOpen));
            mobileNav.hidden = isOpen;
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll("img").forEach((image) => {
            image.addEventListener("error", () => {
                image.classList.add("is-missing");
                image.setAttribute("aria-hidden", "true");
            }, { once: true });
        });
    }

    function setupHeroCarousel() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prevButton = hero.querySelector("[data-hero-prev]");
        const nextButton = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => showSlide(current + 1), 5200);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                showSlide(index);
                start();
            });
        });

        prevButton?.addEventListener("click", () => {
            showSlide(current - 1);
            start();
        });

        nextButton?.addEventListener("click", () => {
            showSlide(current + 1);
            start();
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        showSlide(0);
        start();
    }

    function setupFiltering() {
        document.querySelectorAll("[data-filter-root]").forEach((root) => {
            const input = root.querySelector("[data-search-input]");
            const selects = Array.from(root.querySelectorAll("[data-filter-field]"));
            const cards = Array.from(root.querySelectorAll("[data-movie-card]"));
            const counter = root.querySelector("[data-filter-count]");

            if (!cards.length) {
                return;
            }

            const update = () => {
                const keyword = normalize(input?.value);
                const filters = selects.map((select) => ({
                    field: select.getAttribute("data-filter-field"),
                    value: normalize(select.value),
                }));
                let visible = 0;

                cards.forEach((card) => {
                    const haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.category,
                    ].join(" "));
                    const keywordMatch = !keyword || haystack.includes(keyword);
                    const filterMatch = filters.every(({ field, value }) => {
                        if (!value) {
                            return true;
                        }
                        return normalize(card.dataset[field]).includes(value);
                    });
                    const shouldShow = keywordMatch && filterMatch;
                    card.classList.toggle("is-filtered-out", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (counter) {
                    counter.textContent = `显示 ${visible} / ${cards.length} 部影片`;
                }
            };

            input?.addEventListener("input", update);
            selects.forEach((select) => select.addEventListener("change", update));

            const params = new URLSearchParams(window.location.search);
            const query = params.get("q");
            if (query && input) {
                input.value = query;
            }
            update();
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupMobileNavigation();
        setupImageFallbacks();
        setupHeroCarousel();
        setupFiltering();
    });
})();
