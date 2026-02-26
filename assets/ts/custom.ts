const menu = document.getElementById("main-menu");
const toggle = document.getElementById("toggle-menu");

if (menu && toggle) {
    const bodyOpenClass = "mobile-menu-open";
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const syncMobileMenuState = () => {
        const isMenuOpen = menu.classList.contains("show") || toggle.classList.contains("is-active");
        document.body.classList.toggle(bodyOpenClass, mobileQuery.matches && isMenuOpen);
    };

    const menuObserver = new MutationObserver(syncMobileMenuState);
    menuObserver.observe(menu, { attributes: true, attributeFilter: ["class"] });

    const toggleObserver = new MutationObserver(syncMobileMenuState);
    toggleObserver.observe(toggle, { attributes: true, attributeFilter: ["class"] });

    mobileQuery.addEventListener("change", syncMobileMenuState);
    window.addEventListener("pageshow", syncMobileMenuState);
    window.addEventListener("pagehide", () => {
        document.body.classList.remove(bodyOpenClass);
    });

    syncMobileMenuState();
}
