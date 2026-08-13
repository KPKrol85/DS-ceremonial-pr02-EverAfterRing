const STORAGE_KEY = "everafterring-theme";
const THEMES = ["light", "dark"];
const THEME_COLORS = {
  light: "#faf7f2",
  dark: "#171311",
};

const isValidTheme = (theme) => THEMES.includes(theme);

const getStoredTheme = () => {
  try {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    return isValidTheme(savedTheme) ? savedTheme : null;
  } catch {
    return null;
  }
};

const setStoredTheme = (theme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Theme switching should still work for the current page if storage is unavailable.
  }
};

const getDocumentTheme = () => {
  const documentTheme = document.documentElement.dataset.theme;
  return isValidTheme(documentTheme) ? documentTheme : null;
};

// `js/theme-bootstrap.js` already resolved stored preference -> prefers-color-scheme -> light before
// first paint, so the theme on <html> carries that result. Recomputing it here would drop system dark.
const resolveTheme = () => getStoredTheme() || getDocumentTheme() || "light";

const updateToggle = (toggle, theme) => {
  if (!toggle) return;

  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute("aria-label", isDark ? "Włącz tryb jasny" : "Włącz tryb ciemny");
};

const updateThemeColor = (theme) => {
  const themeColor = document.querySelector('meta[name="theme-color"][data-theme-color]');
  themeColor?.setAttribute("content", THEME_COLORS[theme]);
};

const applyTheme = (theme, toggle) => {
  const nextTheme = isValidTheme(theme) ? theme : "light";
  document.documentElement.dataset.theme = nextTheme;
  updateThemeColor(nextTheme);
  updateToggle(toggle, nextTheme);
};

export const initTheme = () => {
  const toggle = document.querySelector("[data-theme-toggle]");
  const initialTheme = resolveTheme();

  applyTheme(initialTheme, toggle);

  if (!toggle || toggle.dataset.initialized === "true") return;

  toggle.addEventListener("click", () => {
    const currentTheme = isValidTheme(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : resolveTheme();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    setStoredTheme(nextTheme);
    applyTheme(nextTheme, toggle);
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    applyTheme(isValidTheme(event.newValue) ? event.newValue : resolveTheme(), toggle);
  });

  toggle.dataset.initialized = "true";
};
