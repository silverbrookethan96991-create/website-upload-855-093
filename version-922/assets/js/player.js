function initMoviePlayer(url) {
  var video = document.getElementById('movie-video');
  var start = document.getElementById('playerStart');
  if (!video || !url) {
    return;
  }
  var hlsInstance = null;
  var ready = false;
  var setup = function () {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({enableWorker: true, lowLatencyMode: true});
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = url;
  };
  var play = function () {
    setup();
    if (start) {
      start.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };
  setup();
  if (start) {
    start.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
