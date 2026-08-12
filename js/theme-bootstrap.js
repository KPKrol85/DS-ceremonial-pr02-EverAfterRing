(() => {
  const storageKey = "everafterring-theme";
  const themeColors = {
    light: "#faf7f2",
    dark: "#171311"
  };
  const root = document.documentElement;
  let theme = null;

  try {
    const savedTheme = window.localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      theme = savedTheme;
    }
  } catch {
    theme = null;
  }

  const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

  if (!theme && mediaQuery?.matches) {
    theme = "dark";
  }

  const activeTheme = theme || "light";
  const themeColor = document.querySelector('meta[name="theme-color"][data-theme-color]');

  root.dataset.theme = activeTheme;
  if (themeColor) {
    themeColor.setAttribute("content", themeColors[activeTheme]);
  }
})();
