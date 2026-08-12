import { qs, qsa } from "../utils.js";

const getCurrentPage = () => {
  const currentPath = window.location.pathname.split("/").filter(Boolean).pop();
  return currentPath || "index.html";
};

const applyHeaderState = (header) => {
  const currentPage = getCurrentPage();

  qsa('[aria-current="page"]', header).forEach((link) => {
    link.removeAttribute("aria-current");
  });

  const currentPrimaryLink = qs(`.nav__link[href="${currentPage}"]`, header);
  currentPrimaryLink?.setAttribute("aria-current", "page");
};

const decoratePartial = (host) => {
  if (host.dataset.partial === "header") {
    applyHeaderState(host);
  }
};

const loadPartial = async (host) => {
  const src = host.dataset.partialSrc;
  if (!src) return;

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to load partial: ${src} (${response.status})`);
    }

    host.innerHTML = await response.text();
    decoratePartial(host);
    host.dataset.partialLoaded = "true";
  } catch (error) {
    console.error(error);
  }
};

export const initPartials = async () => {
  const partialHosts = qsa("[data-partial]");

  if (!partialHosts.length) return;

  await Promise.all(partialHosts.map((host) => loadPartial(host)));
};
