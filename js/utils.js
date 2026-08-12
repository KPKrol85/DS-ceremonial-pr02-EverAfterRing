export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const setExpanded = (element, expanded) => {
  if (!element) return;
  element.setAttribute('aria-expanded', expanded ? 'true' : 'false');
};

export const trapFocus = (container) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];

  const getFocusableElements = () =>
    qsa(focusableSelectors.join(','), container).filter((element) => {
      if (element.hasAttribute('hidden')) return false;
      if (element.getAttribute('aria-hidden') === 'true') return false;
      return element.getClientRects().length > 0;
    });

  const handleKeydown = (event) => {
    if (event.key !== 'Tab') return;

    const focusables = getFocusableElements();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKeydown);
  return () => container.removeEventListener('keydown', handleKeydown);
};
