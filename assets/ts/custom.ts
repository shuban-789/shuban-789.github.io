const menu = document.getElementById("main-menu");
const toggle = document.getElementById("toggle-menu");

if (menu instanceof HTMLElement && toggle instanceof HTMLElement) {
    const bodyOpenClass = "mobile-menu-open";
    const bodyThemeOpenClass = "show-menu";
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

    const setMenuOpen = (open: boolean) => {
        clearAnimatedMenuStyles();
        menu.classList.toggle("show", open);
        toggle.classList.toggle("is-active", open);
        document.body.classList.toggle(bodyOpenClass, mobileQuery.matches && open);
        document.body.classList.toggle(bodyThemeOpenClass, mobileQuery.matches && open);
    };

    const syncMobileMenuState = () => {
        const isMenuOpen = menu.classList.contains("show") || toggle.classList.contains("is-active");
        document.body.classList.toggle(bodyOpenClass, mobileQuery.matches && isMenuOpen);
        document.body.classList.toggle(bodyThemeOpenClass, mobileQuery.matches && isMenuOpen);
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
        toggle.classList.remove("is-active");
        document.body.classList.remove(bodyOpenClass, bodyThemeOpenClass);
    });

    window.addEventListener("pageshow", syncMobileMenuState);
    window.addEventListener("pagehide", () => {
        document.body.classList.remove(bodyOpenClass, bodyThemeOpenClass);
    });

    syncMobileMenuState();
}
