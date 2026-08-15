// Storage keys owned by the application: `js/theme-bootstrap.js` / `js/modules/theme.js` and
// `js/modules/project-notice.js`. The tests read and seed these instead of redefining them.
export const THEME_STORAGE_KEY = "everafterring-theme";
export const PROJECT_NOTICE_STORAGE_KEY = "everafterringProjectNoticeAccepted";

// Every test gets a fresh browser context, so `localStorage` always starts empty. Preconditions
// are written through an init script because both features read storage before first paint.
export const seedStorage = (page, entries) =>
  page.addInitScript((items) => {
    for (const [key, value] of Object.entries(items)) {
      window.localStorage.setItem(key, value);
    }
  }, entries);

// The project notice opens on every page for a visitor without stored acceptance, and its
// backdrop covers the viewport. Tests that are not about the notice seed the accepted state
// so the header stays reachable.
export const acceptProjectNotice = (page) =>
  seedStorage(page, { [PROJECT_NOTICE_STORAGE_KEY]: "true" });
