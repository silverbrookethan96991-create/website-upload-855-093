import { H as Hls } from "./hls.js";

function setStatus(player, message) {
    const status = player.querySelector("[data-player-status]");
    if (status) {
        status.textContent = message;
    }
}

function hideOverlay(player) {
    const overlay = player.querySelector("[data-player-button]");
    if (overlay) {
        overlay.classList.add("is-hidden");
    }
}

function setupPlayer(player) {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-player-button]");
    const primarySource = player.dataset.video;
    const fallbackSource = player.dataset.fallbackVideo;
    let hlsInstance = null;
    let triedFallback = false;

    if (!video || !button || !primarySource) {
        return;
    }

    const destroyHls = () => {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    };

    const playVideo = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                setStatus(player, "浏览器阻止了自动播放，请再次点击播放按钮");
                button.classList.remove("is-hidden");
            });
        }
    };

    const loadSource = (source, isFallback = false) => {
        destroyHls();
        hideOverlay(player);
        setStatus(player, isFallback ? "正在切换备用播放源" : "正在初始化高清播放源");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", () => {
                setStatus(player, "播放源已就绪");
                playVideo();
            }, { once: true });
            video.addEventListener("error", () => {
                if (!triedFallback && fallbackSource) {
                    triedFallback = true;
                    loadSource(fallbackSource, true);
                } else {
                    setStatus(player, "播放源加载失败，请刷新后重试");
                    button.classList.remove("is-hidden");
                }
            }, { once: true });
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                setStatus(player, "播放源已就绪");
                playVideo();
            });
            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    if (!triedFallback && fallbackSource) {
                        triedFallback = true;
                        loadSource(fallbackSource, true);
                        return;
                    }
                    hlsInstance.startLoad();
                    return;
                }

                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    return;
                }

                if (!triedFallback && fallbackSource) {
                    triedFallback = true;
                    loadSource(fallbackSource, true);
                    return;
                }

                destroyHls();
                setStatus(player, "播放源加载失败，请刷新后重试");
                button.classList.remove("is-hidden");
            });
            return;
        }

        setStatus(player, "当前浏览器暂不支持 HLS 播放");
        button.classList.remove("is-hidden");
    };

    button.addEventListener("click", () => loadSource(primarySource));
    video.addEventListener("play", () => hideOverlay(player));
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
});
