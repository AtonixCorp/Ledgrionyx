const UI_ERROR_EVENT = 'ly:ui-error';

let errorSequence = 0;

export const formatErrorMessage = (data, fallback = 'Request failed.') => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    return data.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' | ');
  }

  return Object.entries(data)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join(' | ');
};

export const reportUiError = ({
  title = 'Request failed',
  message = 'Something went wrong.',
  severity = 'error',
  source = 'app',
  status,
  autoHideMs = 7000,
} = {}) => {
  if (typeof window === 'undefined') return null;

  errorSequence += 1;
  const payload = {
    id: `ui-error-${Date.now()}-${errorSequence}`,
    title,
    message,
    severity,
    source,
    status,
    autoHideMs,
    timestamp: Date.now(),
  };

  window.dispatchEvent(new CustomEvent(UI_ERROR_EVENT, { detail: payload }));
  return payload;
};

export const subscribeToUiErrors = (listener) => {
  if (typeof window === 'undefined') return () => {};

  const wrappedListener = (event) => listener(event.detail);
  window.addEventListener(UI_ERROR_EVENT, wrappedListener);
  return () => window.removeEventListener(UI_ERROR_EVENT, wrappedListener);
};
