import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required. Please log in.") {
    super(message, 401);
  }
}
