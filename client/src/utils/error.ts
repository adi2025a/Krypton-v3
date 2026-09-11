/**
 * Safely extracts a user-facing string message from an API error response or Error instance.
 * Handles FastAPI / Pydantic HTTP 422 validation error arrays cleanly.
 */
export const getErrorMessage = (err: any, fallback: string = 'An unexpected error occurred'): string => {
  if (!err) return fallback;

  const detail = err.response?.data?.detail;

  if (typeof detail === 'string' && detail.trim() !== '') {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    // Pydantic v2 validation error list: [{ loc: [...], msg: "...", type: "..." }]
    const messages = detail
      .map((item: any) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.msg) {
          // If location is provided (e.g. ['body', 'password']), clarify the field
          const field = Array.isArray(item.loc) && item.loc.length > 1 ? item.loc[item.loc.length - 1] : null;
          return field ? `${field}: ${item.msg}` : item.msg;
        }
        return JSON.stringify(item);
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  if (err.response?.data?.message && typeof err.response.data.message === 'string') {
    return err.response.data.message;
  }

  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return fallback;
};
