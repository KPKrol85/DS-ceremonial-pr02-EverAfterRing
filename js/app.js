import { onReady } from "./modules/dom.js";
import { initNav } from "./modules/nav.js";
import { initForm } from "./modules/form.js";
import { initHero } from "./modules/hero.js";
import { initTheme } from "./modules/theme.js";
import { initHeaderScroll } from "./modules/header-scroll.js";
import { initProjectNotice } from "./modules/project-notice.js";
import { initLightbox } from "./modules/lightbox.js";
onReady(() => {
  initTheme();
  initHeaderScroll();
  initNav();
  initForm();
  initHero();
  initProjectNotice();
  initLightbox();
});
