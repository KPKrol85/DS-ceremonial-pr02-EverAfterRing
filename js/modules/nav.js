import { qs, qsa, setExpanded, trapFocus } from "../utils.js";
import { SELECTORS } from "../config.js";

export const initNav = () => {
  const navToggle = qs(SELECTORS.navToggle);
  const navPanel = qs(SELECTORS.navPanel);
  let releaseFocusTrap = null;

  if (navToggle?.dataset.initialized === "true") return;

  const isMobileNav = () => window.innerWidth <= 1024;

  const activateFocusTrap = () => {
    if (!navPanel || releaseFocusTrap || !isMobileNav()) return;
    releaseFocusTrap = trapFocus(navPanel);
  };

  const releaseNavFocusTrap = () => {
    releaseFocusTrap?.();
    releaseFocusTrap = null;
  };

  // Initialize panel state based on screen size
  const initPanelState = () => {
    releaseNavFocusTrap();

    if (isMobileNav()) {
      navPanel?.setAttribute("hidden", "");
      navPanel?.removeAttribute("data-open");
      setExpanded(navToggle, false);
    } else {
      navPanel?.removeAttribute("hidden");
      setExpanded(navToggle, false);
    }
  };

  initPanelState();

  const closeNav = ({ restoreFocus = true } = {}) => {
    if (!navPanel || !navToggle) return;
    releaseNavFocusTrap();
    navPanel.setAttribute("hidden", "");
    navPanel.removeAttribute("data-open");
    setExpanded(navToggle, false);
    if (restoreFocus) {
      navToggle.focus();
    }
  };

  const openNav = () => {
    if (!navPanel || !navToggle) return;
    navPanel.removeAttribute("hidden");
    navPanel.setAttribute("data-open", "true");
    setExpanded(navToggle, true);
    activateFocusTrap();
    const firstLink = qs("a, button", navPanel);
    firstLink?.focus();
  };

  navToggle?.addEventListener("click", () => {
    if (!navPanel || !navToggle) return;
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close menu when clicking on a link
  const navLinks = qsa(".nav__link", navPanel);
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        closeNav();
      }
    });
  });

  // Handle escape key
  const handleEscape = (event) => {
    if (event.key !== "Escape") return;

    if (navToggle?.getAttribute("aria-expanded") === "true") {
      closeNav();
    }
  };

  document.addEventListener("keydown", handleEscape);

  // Handle window resize
  window.addEventListener("resize", () => {
    if (!isMobileNav()) {
      releaseNavFocusTrap();
      navPanel?.removeAttribute("hidden");
      navPanel?.removeAttribute("data-open");
      setExpanded(navToggle, false);
    } else if (navToggle?.getAttribute("aria-expanded") !== "true") {
      releaseNavFocusTrap();
      navPanel?.setAttribute("hidden", "");
      navPanel?.removeAttribute("data-open");
    } else {
      activateFocusTrap();
    }
  });

  navToggle && (navToggle.dataset.initialized = "true");

  return () => {
    releaseNavFocusTrap();
    document.removeEventListener("keydown", handleEscape);
  };
};
