const menu = document.getElementById("main-menu");
const toggle = document.getElementById("toggle-menu");
const demoWindows = document.querySelectorAll<HTMLElement>(".window-demo");

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
