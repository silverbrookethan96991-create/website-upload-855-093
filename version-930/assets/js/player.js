(function () {
  function initPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-overlay');
    var source = box.getAttribute('data-src');
    var ready = false;
    var instance = null;

    function load() {
      if (ready || !video || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({ enableWorker: true });
        instance.loadSource(source);
        instance.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }

    function play() {
      load();
      box.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initPlayer);
  });
})();
