import express, { Response } from "express";
import dotenv from "dotenv";

dotenv.config();

import helmet from "helmet";
import cors from "cors";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

import morganMiddleware from "@middlewares/morganMiddleware";
import indexRouter from "@routes/indexRouter";
import translationRouter from "@routes/translationRouter";
import authRouter from "@routes/authRouter";
import userRouter from "@routes/userRouter";
import adRouter from "@routes/adRouter";
import categoryRouter from "@routes/categoryRouter";
import errorHandler from "@middlewares/errorHandlerMiddleware";
import { seedCategories } from "@utils/db";

const expressApp = express();
const port = process.env.PORT || 5000;

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());
expressApp.use(helmet());
expressApp.use(cors());
expressApp.use(morganMiddleware);

expressApp.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

expressApp.use("/", indexRouter);
expressApp.use("/api/translations", translationRouter);
expressApp.use("/api/auth", authRouter);
expressApp.use("/api/ads", adRouter);
expressApp.use("/api/categories", categoryRouter);
expressApp.use("/api/users", userRouter);

expressApp.get("/api/seed", async (req, res: Response) => {
  await seedCategories();
  res.status(200).send("ok");
});

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Kuwait cars backend",
      version: "1.0.0",
      description: "API docs for kuwait cars application backend",
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
expressApp.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

expressApp.use(errorHandler);

export { expressApp, port };
