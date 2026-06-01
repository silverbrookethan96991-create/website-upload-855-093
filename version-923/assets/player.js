(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    window.initPlayer = function (source) {
        ready(function () {
            var video = document.querySelector("[data-player]");
            var cover = document.querySelector("[data-player-cover]");
            var button = document.querySelector("[data-play-button]");
            var hls = null;
            var attached = false;

            if (!video || !source) {
                return;
            }

            var attach = function () {
                if (attached) {
                    return;
                }

                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return;
                }

                video.src = source;
            };

            var start = function () {
                attach();

                if (cover) {
                    cover.classList.add("is-hidden");
                }

                video.setAttribute("controls", "controls");
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            };

            if (button) {
                button.addEventListener("click", start);
            }

            if (cover) {
                cover.addEventListener("click", start);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });

            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    };
})();
