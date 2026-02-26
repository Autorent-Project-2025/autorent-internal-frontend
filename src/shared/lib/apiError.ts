import { isAxiosError } from "axios";

export function getErrorStatus(error: unknown): number | null {
  if (!isAxiosError(error)) {
    return null;
  }

  return error.response?.status ?? null;
}

export function getApiErrorMessage(
  error: unknown,
  statusMessages: Record<number, string>,
  fallbackMessage: string,
): string {
  const statusCode = getErrorStatus(error);
  if (statusCode !== null && statusMessages[statusCode]) {
    return statusMessages[statusCode];
  }

  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;

    if (typeof data?.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error.trim().length > 0) {
      return data.error;
    }
  }

  return fallbackMessage;
}
