const STORAGE_KEY = "everafterringProjectNoticeAccepted";

export function initProjectNotice() {
  const notice = document.querySelector("[data-project-notice]");

  if (!notice) {
    return;
  }

  const dialog = notice.querySelector(".project-notice__dialog");
  const acceptButton = notice.querySelector("[data-project-notice-accept]");
  let previousFocus = null;

  if (!dialog || !acceptButton) {
    return;
  }

  if (localStorage.getItem(STORAGE_KEY) === "true") {
    return;
  }

  const openNotice = () => {
    previousFocus = document.activeElement;
    notice.hidden = false;
    document.body.classList.add("is-project-notice-open");
    dialog.focus();
  };

  const closeNotice = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    notice.hidden = true;
    document.body.classList.remove("is-project-notice-open");

    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  };

  acceptButton.addEventListener("click", closeNotice);

  openNotice();
}
