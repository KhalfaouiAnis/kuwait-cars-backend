import { AppError } from "./AppError.js";

export interface FieldError {
  path: string;
  message: string;
}

export class ValidationError extends AppError {
  public readonly errors: FieldError[];

  constructor(errors: FieldError[], message = "Validation failed") {
    super(message, 400);
    this.errors = errors;
  }
}
