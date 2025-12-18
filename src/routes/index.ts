import { Router } from "express";
import indexRouter from "@routes/indexRouter.js";
import translationRouter from "@routes/translationRouter.js";
import authRouter from "@routes/authRouter.js";
import userRouter from "@routes/userRouter.js";
import adRouter from "@routes/adRouter.js";
import cronRouter from "@routes/cronRouter.js";
import cloudinaryRouter from "@routes/cloudinaryRouter.js";

const router = Router();

router.use("/", indexRouter);
router.use("/translations", translationRouter);
router.use("/auth", authRouter);
router.use("/ads", adRouter);
router.use("/cron", cronRouter);
router.use("/cloudinary", cloudinaryRouter);
router.use("/users", userRouter);

export default router;
