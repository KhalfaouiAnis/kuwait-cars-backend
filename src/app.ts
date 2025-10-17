import express from "express";
import dotenv from "dotenv";

dotenv.config();

import helmet from "helmet";
import cors from "cors";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

import morganMiddleware from "@middlewares/morganMiddleware";
import indexRouter from "@routes/indexRouter";
import authRouter from "@routes/authRouter";
import userRouter from "@routes/userRouter";
import errorHandler from "@middlewares/errorHandlerMiddleware";

const expressApp = express();
const port = process.env.PORT || 5000;

expressApp.use(express.json());
expressApp.use(helmet());
expressApp.use(cors());
expressApp.use(morganMiddleware);

expressApp.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

expressApp.use("/", indexRouter);
expressApp.use("/api/auth", authRouter);
expressApp.use("/api/users", userRouter);

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Kuwait cars backend",
      version: "1.0.0",
      description: "API docs for the kuwait cars backend",
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
expressApp.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

expressApp.use(errorHandler);

export { expressApp, port };
