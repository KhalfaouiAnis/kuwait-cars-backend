export type ApiErrorContent = {
  message: string;
  context?: { [key: string]: any };
  error_code?: string
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
