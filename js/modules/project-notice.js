import { trapFocus } from "../utils.js";

const STORAGE_KEY = "everafterringProjectNoticeAccepted";

// Storage access throws when the browser blocks site data, so both entry points are guarded the same
// way as `js/modules/theme.js`. An unreadable store means no acceptance, so the notice still renders.
const hasStoredAcceptance = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const storeAcceptance = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // The dismissal should still hold for the current page if storage is unavailable.
  }
};

export function initProjectNotice() {
  const notice = document.querySelector("[data-project-notice]");

  if (!notice) {
    return;
  }

  const dialog = notice.querySelector(".project-notice__dialog");
  const acceptButton = notice.querySelector("[data-project-notice-accept]");
  const closeTargets = notice.querySelectorAll("[data-project-notice-close]");
  let previousFocus = null;
  let releaseFocusTrap = null;
  let isOpen = false;

  if (!dialog || !acceptButton) {
    return;
  }

  if (hasStoredAcceptance()) {
    return;
  }

  // Return focus to the opener when that target is still connected, interactive and outside
  // the notice; otherwise release it, so it never stays on content about to be hidden
  const releaseFocus = () => {
    const canRestore =
      previousFocus instanceof HTMLElement &&
      previousFocus !== document.body &&
      previousFocus.isConnected &&
      !notice.contains(previousFocus);

    if (canRestore) {
      previousFocus.focus();
      return;
    }

    if (document.activeElement instanceof HTMLElement && notice.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  };

  const handleEscape = (event) => {
    if (event.key !== "Escape") return;

    closeNotice();
  };

  const openNotice = () => {
    if (isOpen) return;

    previousFocus = document.activeElement;
    notice.hidden = false;
    document.body.classList.add("is-project-notice-open");
    isOpen = true;
    releaseFocusTrap = trapFocus(dialog);
    document.addEventListener("keydown", handleEscape);
    dialog.focus();
  };

  const closeNotice = () => {
    if (!isOpen) return;

    isOpen = false;
    releaseFocusTrap?.();
    releaseFocusTrap = null;
    document.removeEventListener("keydown", handleEscape);
    releaseFocus();
    notice.hidden = true;
    document.body.classList.remove("is-project-notice-open");
    // Persisted last so the close path — focus, handlers, scroll lock — never depends on the write
    storeAcceptance();
  };

  acceptButton.addEventListener("click", closeNotice);
  // The backdrop is a sibling of the dialog, so a click inside the dialog never reaches it
  closeTargets.forEach((closeTarget) => {
    closeTarget.addEventListener("click", closeNotice);
  });

  openNotice();
}
