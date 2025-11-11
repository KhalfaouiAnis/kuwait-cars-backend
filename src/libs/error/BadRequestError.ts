import { ApiError, getErrorCode } from "./ApiError";
import { GENERIC_ERROR } from "./error-code";

export default class BadRequestError extends ApiError {
  private static readonly _statusCode = 400;
  private readonly _code: number;
  private readonly _error_code: string;
  private readonly _logging: boolean;
  private readonly _context: { [key: string]: any };

  constructor(params?: {
    code?: number;
    error_code?: string;
    message?: string;
    logging?: boolean;
    context?: { [key: string]: any };
  }) {
    const {
      code = BadRequestError._statusCode,
      message,
      logging,
      error_code = getErrorCode(code),
    } = params || {};

    super(message || "Bad request");
    this.name = "BadRequestError";
    this._code = code;
    this._error_code = error_code;
    this._logging = logging !== undefined ? logging : false;
    this._context = params?.context || {};

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  get errors() {
    return [
      { message: this.message, context: this._context, code: this._error_code },
    ];
  }

  get statusCode() {
    return this._code;
  }

  get errorCode() {
    return this._error_code;
  }

  get logging() {
    return this._logging;
  }
}
