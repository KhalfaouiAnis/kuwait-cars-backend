import {
  BAD_REQUEST_ERROR,
  FORBIDDEN,
  GENERIC_ERROR,
  NOT_FOUND_ERROR,
  SERVER_ERROR,
  UNAUTHORIZED,
} from "./error-code.js";

export type ApiErrorContent = {
  message: string;
  context?: { [key: string]: any };
  error_code?: string;
};

export abstract class ApiError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errors: ApiErrorContent[];
  abstract readonly logging: boolean;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function getErrorCode(statusCode: number) {
  if (statusCode === 400) return BAD_REQUEST_ERROR;
  if (statusCode === 404) return NOT_FOUND_ERROR;
  if (statusCode === 401) return UNAUTHORIZED;
  if (statusCode === 403) return FORBIDDEN;
  if (statusCode === 500) return SERVER_ERROR;

  return GENERIC_ERROR;
}
