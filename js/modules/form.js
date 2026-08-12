import { qs, qsa } from '../utils.js';
import { SELECTORS } from '../config.js';

const showError = (field, message) => {
  const errorId = field.getAttribute('aria-describedby');
  if (!errorId) return;
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
  }
};

const clearError = (field) => {
  const errorId = field.getAttribute('aria-describedby');
  if (!errorId) return;
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = '';
  }
};

export const initForm = () => {
  const form = qs(SELECTORS.contactForm);
  if (!form || form.dataset.initialized === 'true') return;

  const status = qs('[data-form-status]', form);
  const fields = qsa('[data-validate]', form);
  form.setAttribute('novalidate', '');

  const validateField = (field) => {
    if (field.validity.valid) {
      clearError(field);
      return true;
    }

    if (field.validity.valueMissing) {
      showError(field, 'To pole jest wymagane.');
    } else if (field.validity.typeMismatch) {
      showError(field, 'Wprowadź poprawny format.');
    } else {
      showError(field, 'Sprawdź poprawność pola.');
    }

    return false;
  };

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.validity.valid) {
        clearError(field);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    let firstInvalid = null;
    let allValid = true;

    fields.forEach((field) => {
      const isValid = validateField(field);
      if (!isValid && !firstInvalid) {
        firstInvalid = field;
      }
      if (!isValid) {
        allValid = false;
      }
    });

    if (!allValid) {
      event.preventDefault();
      if (status) {
        status.textContent = 'Uzupełnij zaznaczone pola, aby wysłać zapytanie.';
        status.classList.add('status');
      }
      firstInvalid?.focus();
      return;
    }

    if (status) {
      status.textContent = '';
      status.classList.remove('status');
    }
  });

  form.dataset.initialized = 'true';
};
