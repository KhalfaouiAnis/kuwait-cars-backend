import { NextFunction, Request, Response } from "express";
import { Prisma } from "generated/prisma/client.js";
import { config } from "@config/environment.js";
import { AppError } from "@libs/error/AppError.js";
import { ValidationError } from "@libs/error/ValidationError.js";
import Logger from "@libs/logger.js";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = err.statusCode || 500;
  let message = "Internal Server Error";
  let errors = null;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = `Duplicate value`;
        break;
      case "P2025":
        statusCode = 404;
        message = "The requested record does not exist";
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid reference: Related record not found";
        break;
      default:
        statusCode = 400;
        Logger.error(err.message);
        message = `Database Error: ${err.code}`;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid database request data";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    if (err instanceof ValidationError) {
      errors = err.errors;
    }
  } else {
    Logger.error(" [CRITICAL BUG]:", err);
    if (config.env === "production") {
      message = "Something went wrong. Please try again later.";
    }
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(errors && { errors }),
    ...(config.env === "development" && { stack: err.stack }),
  });
}
