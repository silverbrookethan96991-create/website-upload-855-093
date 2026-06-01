(function () {
  const video = document.querySelector('[data-player-video]');
  const button = document.querySelector('[data-player-button]');
  const config = document.getElementById('player-config');

  if (!video || !button || !config) {
    return;
  }

  let stream = '';
  try {
    stream = JSON.parse(config.textContent).src || '';
  } catch (error) {
    stream = '';
  }

  let ready = false;
  let hlsInstance = null;

  const loadScript = function (src) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (window.Hls) {
          resolve();
        } else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const attach = async function () {
    if (ready || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      ready = true;
      return;
    }

    if (!window.Hls) {
      await loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js');
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      ready = true;
    } else {
      video.src = stream;
      ready = true;
    }
  };

  const start = async function () {
    button.disabled = true;
    try {
      await attach();
      video.controls = true;
      button.classList.add('is-hidden');
      const playing = video.play();
      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {
          button.classList.remove('is-hidden');
          button.disabled = false;
        });
      }
    } catch (error) {
      button.disabled = false;
    }
  };

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
