import { qs, qsa } from "../utils.js";

// The card markup declares the layout width of each portfolio image; the lightbox renders the
// same image at up to the container width, so the enlarged copy asks for that size instead and
// the existing 1200px candidates are used where the viewport needs them.
const LIGHTBOX_SIZES = "(min-width: 1200px) 1100px, 92vw";

export const initLightbox = () => {
  const lightbox = qs("[data-lightbox]");

  // A page without the lightbox markup, or a browser without the modal dialog it relies on,
  // keeps the cards exactly as they are rendered without this module.
  if (!lightbox || typeof lightbox.showModal !== "function") return;
  if (lightbox.dataset.initialized === "true") return;

  const media = qs("[data-lightbox-media]", lightbox);
  const title = qs("[data-lightbox-title]", lightbox);
  const description = qs("[data-lightbox-description]", lightbox);
  const closeButton = qs("[data-lightbox-close]", lightbox);
  const triggers = qsa("[data-lightbox-trigger]");

  if (!media || !title || !description || !closeButton || triggers.length === 0) return;

  const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
  let opener = null;
  let lastPointerType = "";
  let pressedBackdrop = false;

  // The enlarged image is the card's own `picture`, so the AVIF/WebP/JPG order and every
  // `srcset` candidate come from the markup rather than from a second asset registry.
  const showMedia = (picture) => {
    const enlarged = picture.cloneNode(true);
    const image = qs("img", enlarged);

    if (!image) return false;

    qsa("source", enlarged).forEach((source) => source.setAttribute("sizes", LIGHTBOX_SIZES));
    image.setAttribute("sizes", LIGHTBOX_SIZES);
    // The card copy is deferred until it scrolls into view; this one is being opened right now.
    image.removeAttribute("loading");
    media.replaceChildren(enlarged);

    return true;
  };

  const open = (trigger) => {
    if (lightbox.open) return;

    const card = trigger.closest(".card");
    const picture = qs("picture", trigger);

    if (!card || !picture || !showMedia(picture)) return;

    title.textContent = qs(".card__title", card)?.textContent.trim() ?? "";
    description.textContent = qs(".card__title + p", card)?.textContent.trim() ?? "";
    opener = trigger;
    document.body.classList.add("is-lightbox-open");
    // A modal dialog moves focus into itself, keeps it there and closes on Escape on its own.
    lightbox.showModal();
  };

  // Every close path — Escape, the close button and the backdrop — ends in this one event.
  const handleClose = () => {
    document.body.classList.remove("is-lightbox-open");

    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus();
    }

    opener = null;
    pressedBackdrop = false;
  };

  // A native button is activated by a mouse click, a tap, `Enter` and `Space` alike, so the
  // opening rule is decided from the activation itself: keyboard activation reports no click
  // count, a mouse waits for its `dblclick`, and every other pointer opens from the first tap.
  const isMouseActivation = (event) => {
    const pointerType = event.pointerType || lastPointerType;

    return pointerType ? pointerType === "mouse" : !coarsePointerQuery.matches;
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("pointerdown", (event) => {
      lastPointerType = event.pointerType;
    });

    trigger.addEventListener("click", (event) => {
      if (event.detail !== 0 && isMouseActivation(event)) return;

      open(trigger);
    });

    trigger.addEventListener("dblclick", (event) => {
      if (!isMouseActivation(event)) return;

      open(trigger);
    });
  });

  closeButton.addEventListener("click", () => lightbox.close());

  // The dialog fills the viewport and its content sits in the centred panel, so an event whose
  // target is the dialog itself landed outside that panel. Both halves of the click are checked
  // so a drag that starts on the image and ends on the backdrop never dismisses the lightbox.
  lightbox.addEventListener("pointerdown", (event) => {
    pressedBackdrop = event.target === lightbox;
  });

  lightbox.addEventListener("click", (event) => {
    const dismissed = pressedBackdrop && event.target === lightbox;
    pressedBackdrop = false;

    if (dismissed) {
      lightbox.close();
    }
  });

  lightbox.addEventListener("close", handleClose);

  lightbox.dataset.initialized = "true";
};
