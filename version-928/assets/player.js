(function () {
  window.initMoviePlayer = function (source) {
    const video = document.querySelector("[data-movie-video]");
    const trigger = document.querySelector("[data-play-trigger]");

    if (!video || !source) {
      return;
    }

    let loaded = false;
    let hls = null;

    const load = function () {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
      }
    };

    const play = function () {
      load();

      if (trigger) {
        trigger.classList.add("is-hidden");
      }

      video.play().catch(function () {
        video.addEventListener("canplay", function () {
          video.play().catch(function () {});
        }, { once: true });
      });
    };

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
