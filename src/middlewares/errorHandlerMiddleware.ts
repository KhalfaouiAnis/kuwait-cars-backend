import { ApiError } from "@libs/error/ApiError";
import { Request, Response } from "express";

export default function errorHandler(err: Error, _: Request, res: Response) {
  // Handled errors
  if (err instanceof ApiError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      console.error(
        JSON.stringify(
          {
            code: err.statusCode,
            errors: err.errors,
            stack: err.stack,
          },
          null,
          2
        )
      );
    }

    return res.status(statusCode).send({ errors });
  }

  // Unhandled errors
  console.error(JSON.stringify(err, null, 2));
  return res
    .status(500)
    .json({ errors: [{ message: "Something went wrong" }] });
}
