(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attachVideo(video, source) {
    if (!video || !source) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsController) {
        video.hlsController.destroy();
      }
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsController = hls;
      return;
    }
    video.src = source;
  }

  function setPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-panel");
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-play");
      var started = false;

      function start() {
        if (!started) {
          attachVideo(video, source);
          started = true;
        }
        button.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", start);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  ready(setPlayers);
})();
