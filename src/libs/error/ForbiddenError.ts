import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
  constructor(message = "Access denied. You do not have permission.") {
    super(message, 403);
  }
}
