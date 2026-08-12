import { qs } from "../utils.js";

const SCROLLED_CLASS = "site-header--scrolled";
const ADD_THRESHOLD = 96;
const REMOVE_THRESHOLD = 48;

export const initHeaderScroll = () => {
  const header = qs(".site-header");
  if (!header) return;

  let isScrolled = header.classList.contains(SCROLLED_CLASS);
  let isTicking = false;

  const updateHeaderState = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    if (!isScrolled && scrollY > ADD_THRESHOLD) {
      header.classList.add(SCROLLED_CLASS);
      isScrolled = true;
    } else if (isScrolled && scrollY < REMOVE_THRESHOLD) {
      header.classList.remove(SCROLLED_CLASS);
      isScrolled = false;
    }

    isTicking = false;
  };

  const requestUpdate = () => {
    if (isTicking) return;
    isTicking = true;
    window.requestAnimationFrame(updateHeaderState);
  };

  updateHeaderState();
  window.addEventListener("scroll", requestUpdate, { passive: true });

  return () => {
    window.removeEventListener("scroll", requestUpdate);
  };
};
