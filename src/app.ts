import express from "express";
import dotenv from "dotenv";

dotenv.config();

import helmet from "helmet";
import cors from "cors";

import { config } from "@config/environment.js";
import morganMiddleware from "@middlewares/morganMiddleware.js";
import errorHandler from "@middlewares/errorHandlerMiddleware.js";
import indexRouter from "@routes/indexRouter.js";
import appRoutes from "@routes/index.js";

const expressApp = express();
const port = config.port || 5000;

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());
expressApp.use(helmet());
expressApp.use(cors());
expressApp.use(morganMiddleware);

expressApp.use("/", indexRouter);
expressApp.use("/api/v1", appRoutes);

expressApp.use(errorHandler);

export { expressApp, port };
