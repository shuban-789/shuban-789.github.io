const menu = document.getElementById("main-menu");
const toggle = document.getElementById("toggle-menu");
const demoWindows = document.querySelectorAll<HTMLElement>(".window-demo");

type SpotifyPlaybackUpdate = {
    data?: {
        duration?: number;
        isPaused?: boolean;
        position?: number;
        playingURI?: string;
    };
};

type SpotifyEmbedController = {
    addListener: (eventName: string, handler: (event: SpotifyPlaybackUpdate) => void) => void;
    loadUri: (spotifyUri: string, preferVideo?: boolean, startAt?: number, theme?: string) => void;
    pause: () => void;
    play: () => void;
    resume: () => void;
    seek: (seconds: number) => void;
    togglePlay: () => void;
};

type SpotifyIframeAPI = {
    createController: (
        element: HTMLElement,
        options: { uri: string; width?: string | number; height?: string | number },
        callback: (controller: SpotifyEmbedController) => void,
    ) => void;
};

interface Window {
    __spotifyIframeApi?: SpotifyIframeAPI | null;
}

if (demoWindows.length > 0) {
    const demoTimers = new WeakMap<HTMLElement, number>();
    const restoreTimers = new WeakMap<HTMLElement, number>();
    const animationFrames = new WeakMap<HTMLElement, number>();
    const minimizedHeights = new WeakMap<HTMLElement, number>();
    const minimizeCleanupTimers = new WeakMap<HTMLElement, number>();

    const clearAnimationFrame = (windowElement: HTMLElement) => {
        const frameId = animationFrames.get(windowElement);
        if (frameId !== undefined) {
            window.cancelAnimationFrame(frameId);
            animationFrames.delete(windowElement);
        }
    };

    const syncZoomBodyState = () => {
        document.body.classList.toggle(
            "window-zoom-demo",
            document.querySelector(".window-demo.window-zoomed") !== null,
        );
    };

    const clearWindowInlineStyles = (windowElement: HTMLElement) => {
        windowElement.style.removeProperty("height");
        windowElement.style.removeProperty("transform");
        windowElement.style.removeProperty("transform-origin");
        windowElement.style.removeProperty("transition");

        const controlGroups = windowElement.querySelectorAll<HTMLElement>(".window-controls");
        controlGroups.forEach((controls) => {
            controls.style.removeProperty("transform");
            controls.style.removeProperty("transform-origin");
            controls.style.removeProperty("transition");
        });
    };

    const getMinimizedHeight = (windowElement: HTMLElement) => {
        const bar = windowElement.querySelector<HTMLElement>(".mac-window-bar");
        if (bar instanceof HTMLElement) {
            return Math.ceil(bar.getBoundingClientRect().height);
        }

        const controls = windowElement.querySelector<HTMLElement>(".window-controls");
        if (controls instanceof HTMLElement) {
            const windowRect = windowElement.getBoundingClientRect();
            const controlsRect = controls.getBoundingClientRect();
            return Math.max(44, Math.ceil(controlsRect.bottom - windowRect.top + 12));
        }

        return 44;
    };

    const clearDemoState = (windowElement: HTMLElement) => {
        const demoTimer = demoTimers.get(windowElement);
        if (demoTimer !== undefined) {
            window.clearTimeout(demoTimer);
            demoTimers.delete(windowElement);
        }

        const restoreTimer = restoreTimers.get(windowElement);
        if (restoreTimer !== undefined) {
            window.clearTimeout(restoreTimer);
            restoreTimers.delete(windowElement);
        }

        const cleanupTimer = minimizeCleanupTimers.get(windowElement);
        if (cleanupTimer !== undefined) {
            window.clearTimeout(cleanupTimer);
            minimizeCleanupTimers.delete(windowElement);
        }

        clearAnimationFrame(windowElement);
        windowElement.hidden = false;
        windowElement.classList.remove(
            "window-closing",
            "window-minimized",
            "window-zoomed",
            "window-zooming",
            "window-restoring",
        );
        clearWindowInlineStyles(windowElement);
        syncZoomBodyState();
    };

    const scheduleRestorePulse = (windowElement: HTMLElement) => {
        windowElement.classList.add("window-restoring");

        const timerId = window.setTimeout(() => {
            windowElement.classList.remove("window-restoring");
            restoreTimers.delete(windowElement);
        }, 280);

        restoreTimers.set(windowElement, timerId);
    };

    const animateWindowFlip = (windowElement: HTMLElement, mutator: () => void, done?: () => void) => {
        clearAnimationFrame(windowElement);

        const startRect = windowElement.getBoundingClientRect();
        mutator();
        syncZoomBodyState();
        const endRect = windowElement.getBoundingClientRect();

        const scaleX = startRect.width / Math.max(endRect.width, 1);
        const scaleY = startRect.height / Math.max(endRect.height, 1);
        const translateX = startRect.left - endRect.left;
        const translateY = startRect.top - endRect.top;
        const controlGroups = Array.from(windowElement.querySelectorAll<HTMLElement>(".window-controls"));
        const shouldCounterScaleControls = scaleX > 1.01 || scaleY > 1.01;

        windowElement.classList.add("window-zooming");
        windowElement.style.transformOrigin = "top left";
        windowElement.style.transition = "none";
        windowElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

        if (shouldCounterScaleControls) {
            controlGroups.forEach((controls) => {
                controls.style.transformOrigin = "top left";
                controls.style.transition = "none";
                controls.style.transform = `scale(${1 / scaleX}, ${1 / scaleY})`;
            });
        }

        void windowElement.getBoundingClientRect();

        const frameId = window.requestAnimationFrame(() => {
            animationFrames.delete(windowElement);
            windowElement.style.removeProperty("transition");
            windowElement.style.removeProperty("transform");

            if (shouldCounterScaleControls) {
                controlGroups.forEach((controls) => {
                    controls.style.transition = "transform .42s cubic-bezier(.22, 1, .36, 1)";
                    controls.style.transform = "none";
                });
            }

            const onTransitionEnd = (event: TransitionEvent) => {
                if (event.propertyName !== "transform") return;
                windowElement.removeEventListener("transitionend", onTransitionEnd);
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        windowElement.classList.remove("window-zooming");
                        windowElement.style.removeProperty("transform-origin");
                        if (shouldCounterScaleControls) {
                            controlGroups.forEach((controls) => {
                                controls.style.removeProperty("transform");
                                controls.style.removeProperty("transform-origin");
                                controls.style.removeProperty("transition");
                            });
                        }
                        done?.();
                    });
                });
            };

            windowElement.addEventListener("transitionend", onTransitionEnd);
        });

        animationFrames.set(windowElement, frameId);
    };

    const startMinimizeDemo = (windowElement: HTMLElement) => {
        const expandedHeight = windowElement.getBoundingClientRect().height;
        minimizedHeights.set(windowElement, expandedHeight);

        windowElement.style.height = `${expandedHeight}px`;
        void windowElement.getBoundingClientRect();
        windowElement.classList.add("window-minimized");
        windowElement.style.height = `${getMinimizedHeight(windowElement)}px`;

        const timerId = window.setTimeout(() => {
            const restoreHeight = minimizedHeights.get(windowElement) ?? expandedHeight;
            windowElement.style.height = `${restoreHeight}px`;

            const frameId = window.requestAnimationFrame(() => {
                animationFrames.delete(windowElement);
                windowElement.classList.remove("window-minimized");

                const cleanupId = window.setTimeout(() => {
                    clearWindowInlineStyles(windowElement);
                    minimizeCleanupTimers.delete(windowElement);
                }, 460);

                minimizeCleanupTimers.set(windowElement, cleanupId);
            });

            animationFrames.set(windowElement, frameId);
        }, 3000);

        demoTimers.set(windowElement, timerId);
    };

    const startZoomDemo = (windowElement: HTMLElement) => {
        animateWindowFlip(windowElement, () => {
            windowElement.classList.add("window-zoomed");
        });

        const timerId = window.setTimeout(() => {
            animateWindowFlip(windowElement, () => {
                windowElement.classList.remove("window-zoomed");
            });
        }, 3000);

        demoTimers.set(windowElement, timerId);
    };

    demoWindows.forEach((windowElement) => {
        const controls = windowElement.querySelectorAll<HTMLButtonElement>(".window-controls .control");
        if (controls.length === 0) return;

        controls.forEach((control) => {
            control.addEventListener("click", () => {
                const action = control.dataset.windowAction;
                if (!action) return;

                clearDemoState(windowElement);

                if (action === "close") {
                    windowElement.classList.add("window-closing");

                    const hideTimer = window.setTimeout(() => {
                        windowElement.hidden = true;
                    }, 180);

                    const restoreTimer = window.setTimeout(() => {
                        windowElement.hidden = false;
                        windowElement.classList.remove("window-closing");
                        scheduleRestorePulse(windowElement);
                    }, 3000);

                    demoTimers.set(windowElement, hideTimer);
                    restoreTimers.set(windowElement, restoreTimer);
                    return;
                }

                if (action === "minimize") {
                    startMinimizeDemo(windowElement);
                    return;
                }

                if (action === "zoom") {
                    startZoomDemo(windowElement);
                }
            });
        });
    });
}

if (menu instanceof HTMLElement && toggle instanceof HTMLElement) {
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const clearAnimatedMenuStyles = () => {
        menu.classList.remove("transiting");
        [
            "height",
            "overflow",
            "margin-top",
            "margin-bottom",
            "padding-top",
            "padding-bottom",
            "transition-property",
            "transition-duration",
        ].forEach((property) => menu.style.removeProperty(property));
    };

    const syncMenuAccessibility = (open: boolean) => {
        const isMobile = mobileQuery.matches;
        toggle.classList.toggle("is-active", isMobile && open);
        toggle.setAttribute("aria-expanded", String(isMobile && open));
        menu.setAttribute("aria-hidden", String(isMobile && !open));
    };

    const setMenuOpen = (open: boolean) => {
        clearAnimatedMenuStyles();
        menu.classList.toggle("show", open);
        syncMenuAccessibility(open);
    };

    const syncMobileMenuState = () => {
        const isMenuOpen = menu.classList.contains("show") || toggle.classList.contains("is-active");
        syncMenuAccessibility(mobileQuery.matches && isMenuOpen);
    };

    // Intercept mobile toggle clicks and force a no-animation menu open/close.
    toggle.addEventListener(
        "click",
        (event) => {
            if (!mobileQuery.matches) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            setMenuOpen(!menu.classList.contains("show"));
        },
        true,
    );

    // Close menu when tapping outside the drawer on mobile.
    document.addEventListener("click", (event) => {
        if (!mobileQuery.matches || !menu.classList.contains("show")) return;
        const target = event.target;
        if (!(target instanceof Node)) return;
        if (menu.contains(target) || toggle.contains(target)) return;
        setMenuOpen(false);
    });

    // Close menu after selecting an item on mobile.
    menu.addEventListener("click", (event) => {
        if (!mobileQuery.matches) return;
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.closest("a")) return;
        setMenuOpen(false);
    });

    const menuObserver = new MutationObserver(syncMobileMenuState);
    menuObserver.observe(menu, { attributes: true, attributeFilter: ["class"] });

    const toggleObserver = new MutationObserver(syncMobileMenuState);
    toggleObserver.observe(toggle, { attributes: true, attributeFilter: ["class"] });

    mobileQuery.addEventListener("change", () => {
        if (mobileQuery.matches) {
            syncMobileMenuState();
            return;
        }

        clearAnimatedMenuStyles();
        menu.classList.remove("show");
        syncMenuAccessibility(false);
    });

    window.addEventListener("pageshow", syncMobileMenuState);

    syncMobileMenuState();
}

const spotifyPlayerRoot = document.querySelector<HTMLElement>("[data-spotify-player-root]");

if (spotifyPlayerRoot instanceof HTMLElement) {
    const embedHost = spotifyPlayerRoot.querySelector<HTMLElement>("[data-spotify-embed]");
    const titleLabel = spotifyPlayerRoot.querySelector<HTMLElement>("[data-player-title]");
    const artistLabel = spotifyPlayerRoot.querySelector<HTMLElement>("[data-player-artist]");
    const artworkHost = spotifyPlayerRoot.querySelector<HTMLElement>("[data-player-art]");
    const elapsedLabel = spotifyPlayerRoot.querySelector<HTMLElement>("[data-player-elapsed]");
    const remainingLabel = spotifyPlayerRoot.querySelector<HTMLElement>("[data-player-remaining]");
    const statusLabel = spotifyPlayerRoot.querySelector<HTMLElement>("[data-player-status]");
    const externalLink = spotifyPlayerRoot.querySelector<HTMLAnchorElement>("[data-player-link]");
    const seekBar = spotifyPlayerRoot.querySelector<HTMLInputElement>("[data-spotify-seek]");
    const playPauseButton = spotifyPlayerRoot.querySelector<HTMLButtonElement>("[data-spotify-toggle]");
    const previousButton = spotifyPlayerRoot.querySelector<HTMLButtonElement>("[data-spotify-prev]");
    const nextButton = spotifyPlayerRoot.querySelector<HTMLButtonElement>("[data-spotify-next]");

    const supportedSpotifyTypes = new Set(["album", "artist", "episode", "playlist", "show", "track"]);

    const formatTime = (rawMs: number) => {
        const totalSeconds = Math.max(0, Math.floor(rawMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    const getEmbedHeight = (spotifyUri: string | null) => {
        if (!spotifyUri) return 152;
        return spotifyUri.startsWith("spotify:track:") ? 152 : 352;
    };

    const toSpotifyUri = (value: string) => {
        const trimmed = value.trim();
        if (trimmed.length === 0) return null;
        if (trimmed.startsWith("spotify:")) return trimmed;

        try {
            const parsed = new URL(trimmed);
            const segments = parsed.pathname.split("/").filter(Boolean);
            const entityIndex = segments.findIndex((segment) => supportedSpotifyTypes.has(segment));
            if (entityIndex === -1) return null;

            const entityType = segments[entityIndex];
            const entityId = segments[entityIndex + 1];
            if (!entityType || !entityId) return null;

            return `spotify:${entityType}:${entityId}`;
        } catch {
            return null;
        }
    };

    const trackButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-spotify-track]"));
    const tracks = trackButtons
        .map((button) => {
            const rawUrl = button.dataset.spotifyUrl ?? "";
            const uri = toSpotifyUri(rawUrl);
            const index = Number(button.dataset.trackIndex ?? "-1");
            const parsedStartAt = Number(button.dataset.songStart ?? "0");

            return {
                artist: button.dataset.songArtist ?? "Unknown artist",
                artwork: button.dataset.songArtwork ?? "",
                button,
                index,
                startAt: Number.isFinite(parsedStartAt) ? Math.max(0, parsedStartAt) : 0,
                title: button.dataset.songTitle ?? `Track ${index + 1}`,
                uri,
                url: rawUrl,
            };
        })
        .filter((track) => Number.isInteger(track.index));

    let controller: SpotifyEmbedController | null = null;
    let activeIndex = tracks.findIndex((track) => track.uri !== null);
    let durationMs = 0;
    let isPaused = true;
    let isSeeking = false;
    let playbackPositionMs = 0;
    let playbackSyncedAt = 0;
    let progressFrame = 0;
    const maxBackwardPlaybackCorrectionMs = 900;
    let pendingSeekTargetMs: number | null = null;
    let pendingSeekIssuedAt = 0;
    const seekSettleWindowMs = 1200;

    const setControlsDisabled = (disabled: boolean) => {
        [seekBar, playPauseButton, previousButton, nextButton].forEach((element) => {
            if (element) element.disabled = disabled;
        });
    };

    const syncQueueState = () => {
        trackButtons.forEach((button) => {
            const isActive = Number(button.dataset.trackIndex ?? "-1") === activeIndex;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    };

    const syncSeekBar = (positionMs: number) => {
        if (!seekBar) return;

        const clampedPositionMs = durationMs > 0 ? Math.min(Math.max(positionMs, 0), durationMs) : Math.max(positionMs, 0);
        seekBar.max = String(Math.max(durationMs, 0));
        seekBar.value = String(clampedPositionMs);

        const progressPercent = durationMs > 0 ? Math.min((clampedPositionMs / durationMs) * 100, 100) : 0;
        seekBar.style.setProperty("--spotify-slider-progress", `${progressPercent}%`);
    };

    const syncMeta = () => {
        const track = tracks[activeIndex];
        if (!track) return;

        if (titleLabel) titleLabel.textContent = track.title;
        if (artistLabel) artistLabel.textContent = track.artist;
        if (artworkHost) {
            artworkHost.innerHTML = "";

            if (track.artwork.length > 0) {
                const image = document.createElement("img");
                image.src = track.artwork;
                image.alt = `${track.title} cover art`;
                image.loading = "lazy";
                artworkHost.append(image);
            } else {
                const fallback = document.createElement("div");
                fallback.className = "spotify-player__art-fallback";

                const label = document.createElement("span");
                label.textContent = track.title;
                fallback.append(label);
                artworkHost.append(fallback);
            }
        }

        if (externalLink) {
            externalLink.href = track.url || "https://open.spotify.com/";
            externalLink.toggleAttribute("aria-disabled", track.url.length === 0);
        }

        syncQueueState();
    };

    const syncPlaybackLabels = (positionMs: number) => {
        const normalizedPositionMs = Math.max(positionMs, 0);
        const clampedPositionMs = durationMs > 0 ? Math.min(normalizedPositionMs, durationMs) : normalizedPositionMs;
        const displayPositionMs = durationMs > 0 && clampedPositionMs >= durationMs - 250 ? durationMs : clampedPositionMs;

        if (elapsedLabel) elapsedLabel.textContent = formatTime(displayPositionMs);
        if (remainingLabel) remainingLabel.textContent = `-${formatTime(Math.max(durationMs - displayPositionMs, 0))}`;

        if (!isSeeking) {
            syncSeekBar(displayPositionMs);
        }
    };

    const stopProgressLoop = () => {
        if (progressFrame) {
            window.cancelAnimationFrame(progressFrame);
            progressFrame = 0;
        }
    };

    const getVisualPlaybackPosition = (now = performance.now()) => {
        const positionMs = isPaused
            ? playbackPositionMs
            : Math.min(durationMs, playbackPositionMs + Math.max(0, now - playbackSyncedAt));
        const shouldSnapToEnd = durationMs > 0 && durationMs - positionMs <= 250;
        return shouldSnapToEnd ? durationMs : positionMs;
    };

    const renderPlaybackPosition = () => {
        const resolvedPositionMs = getVisualPlaybackPosition();

        if (durationMs > 0 && resolvedPositionMs >= durationMs) {
            playbackPositionMs = durationMs;
        }

        syncPlaybackLabels(resolvedPositionMs);

        if (!isPaused && (durationMs <= 0 || resolvedPositionMs < durationMs)) {
            progressFrame = window.requestAnimationFrame(renderPlaybackPosition);
        } else {
            progressFrame = 0;
        }
    };

    const startProgressLoop = () => {
        stopProgressLoop();
        progressFrame = window.requestAnimationFrame(renderPlaybackPosition);
    };

    const selectTrack = (index: number, autoplay: boolean) => {
        const track = tracks[index];
        if (!track || !track.uri) return;

        activeIndex = index;
        durationMs = 0;
        isPaused = !autoplay;
        playbackPositionMs = track.startAt * 1000;
        playbackSyncedAt = performance.now();
        syncMeta();
        syncPlaybackLabels(playbackPositionMs);
        startProgressLoop();

        if (statusLabel) {
            statusLabel.textContent = autoplay ? "Loading from Spotify..." : "Ready in Spotify";
        }

        if (playPauseButton) {
            playPauseButton.classList.toggle("is-playing", autoplay);
        }

        if (controller) {
            if (embedHost) {
                embedHost.style.minHeight = `${getEmbedHeight(track.uri)}px`;
            }
            controller.loadUri(track.uri, false, track.startAt);
            if (autoplay) {
                window.setTimeout(() => controller?.play(), 120);
            }
        }
    };

    const stepTrack = (delta: number) => {
        if (tracks.length === 0 || activeIndex === -1) return;

        for (let attempt = 1; attempt <= tracks.length; attempt += 1) {
            const nextIndex = (activeIndex + delta * attempt + tracks.length) % tracks.length;
            if (tracks[nextIndex]?.uri) {
                selectTrack(nextIndex, true);
                return;
            }
        }
    };

    if (tracks.length === 0 || activeIndex === -1 || !(embedHost instanceof HTMLElement)) {
        if (statusLabel) statusLabel.textContent = "Add at least one valid Spotify link in data/favorites.toml";
        setControlsDisabled(true);
    } else {
        setControlsDisabled(false);
        syncMeta();
        syncPlaybackLabels(tracks[activeIndex].startAt * 1000);

        trackButtons.forEach((button) => {
            const index = Number(button.dataset.trackIndex ?? "-1");
            const track = tracks[index];
            button.disabled = !track?.uri;

            button.addEventListener("click", () => {
                selectTrack(index, true);
            });
        });

        previousButton?.addEventListener("click", () => stepTrack(-1));
        nextButton?.addEventListener("click", () => stepTrack(1));

        playPauseButton?.addEventListener("click", () => {
            if (!controller) return;
            controller.togglePlay();
            if (statusLabel) statusLabel.textContent = "Syncing with Spotify...";
        });

        seekBar?.addEventListener("input", () => {
            isSeeking = true;
            const seekMs = Number(seekBar.value);
            playbackPositionMs = seekMs;
            playbackSyncedAt = performance.now();
            syncSeekBar(seekMs);
            if (elapsedLabel) elapsedLabel.textContent = formatTime(seekMs);
            if (remainingLabel) remainingLabel.textContent = `-${formatTime(Math.max(durationMs - seekMs, 0))}`;
        });

        seekBar?.addEventListener("change", () => {
            if (!controller || !seekBar) {
                isSeeking = false;
                return;
            }
            pendingSeekTargetMs = Number(seekBar.value);
            pendingSeekIssuedAt = performance.now();
            controller.seek(pendingSeekTargetMs / 1000);
            isSeeking = false;
            playbackPositionMs = pendingSeekTargetMs;
            playbackSyncedAt = pendingSeekIssuedAt;
            syncSeekBar(playbackPositionMs);
            startProgressLoop();
        });

        const attachController = (api: SpotifyIframeAPI) => {
            const initialTrack = tracks[activeIndex];
            if (!initialTrack?.uri) return;

            api.createController(
                embedHost,
                {
                    height: getEmbedHeight(initialTrack.uri),
                    uri: initialTrack.uri,
                    width: "100%",
                },
                (embedController) => {
                    controller = embedController;
                    controller.loadUri(initialTrack.uri!, false, initialTrack.startAt);

                    controller.addListener("playback_update", (event) => {
                        const data = event.data;
                        if (!data) return;

                        const now = performance.now();
                        const visualPositionMs = getVisualPlaybackPosition(now);
                        const reportedIsPaused = data.isPaused ?? isPaused;
                        const reportedPositionMs = data.position ?? playbackPositionMs;
                        const backwardCorrectionMs = visualPositionMs - reportedPositionMs;
                        const hasPendingSeek = pendingSeekTargetMs !== null && now - pendingSeekIssuedAt <= seekSettleWindowMs;
                        const seekTargetMs = pendingSeekTargetMs ?? 0;
                        const seekTargetGapMs = hasPendingSeek ? Math.abs(reportedPositionMs - seekTargetMs) : 0;
                        const seekHasSettled = hasPendingSeek && seekTargetGapMs <= 450;

                        durationMs = data.duration ?? durationMs;
                        isPaused = reportedIsPaused;

                        if (seekHasSettled) {
                            pendingSeekTargetMs = null;
                        }

                        if (hasPendingSeek && !seekHasSettled) {
                            playbackPositionMs = seekTargetMs;
                        } else {
                            playbackPositionMs = !reportedIsPaused
                                && backwardCorrectionMs > 0
                                && backwardCorrectionMs <= maxBackwardPlaybackCorrectionMs
                                ? visualPositionMs
                                : reportedPositionMs;
                        }

                        if (pendingSeekTargetMs !== null && now - pendingSeekIssuedAt > seekSettleWindowMs) {
                            pendingSeekTargetMs = null;
                        }
                        playbackSyncedAt = now;

                        if (playPauseButton) {
                            playPauseButton.classList.toggle("is-playing", !isPaused);
                        }

                        if (statusLabel) {
                            statusLabel.textContent = isPaused ? "Paused" : "Live on Spotify";
                        }

                        startProgressLoop();

                        if (data.playingURI) {
                            const playingIndex = tracks.findIndex((track) => track.uri === data.playingURI);
                            if (playingIndex >= 0 && playingIndex !== activeIndex) {
                                activeIndex = playingIndex;
                                syncMeta();
                            }
                        }
                    });
                },
            );
        };

        if (window.__spotifyIframeApi) {
            attachController(window.__spotifyIframeApi);
        } else {
            window.addEventListener(
                "spotify-iframe-api-ready",
                () => {
                    if (window.__spotifyIframeApi) {
                        attachController(window.__spotifyIframeApi);
                    }
                },
                { once: true },
            );
        }
    }
}
