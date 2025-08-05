// Logger utility for error handling and messaging

const isDev = import.meta.env.MODE === 'development';

export function logError(error: unknown, context?: string) {
  if (isDev) {
    // Detailed error in dev
    // eslint-disable-next-line no-console
    console.error(`[DEV ERROR]${context ? ' [' + context + ']' : ''}`, error);
  } else {
    // User-friendly error in prod
    // eslint-disable-next-line no-console
    console.error(`[ERROR]${context ? ' [' + context + ']' : ''}`, error instanceof Error ? error.message : String(error));
  }
}

export function getUserErrorMessage(error: unknown): string {
  if (isDev && error instanceof Error) {
    return `${error.message}\n${error.stack}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

