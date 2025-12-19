import { ValidationError } from "@libs/error/ValidationError.js";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const validate =
  (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body || {});
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error.issues);

        const fieldErrors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        return next(new ValidationError(fieldErrors));
      }
      next(error);
    }
  };
