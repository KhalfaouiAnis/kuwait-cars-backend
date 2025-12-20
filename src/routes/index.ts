import { Router } from "express";
import indexRouter from "@routes/indexRouter.js";
import translationRouter from "@routes/translationRouter.js";
import authRouter from "@routes/authRouter.js";
import userRouter from "@routes/userRouter.js";
import adRouter from "@routes/adRouter.js";
import cronRouter from "@routes/cronRouter.js";
import cloudinaryRouter from "@routes/cloudinaryRouter.js";
import { NotFoundError } from "@libs/error/NotFoundError.js";
import { authenticateJWT, restrictGuest } from "@middlewares/authMiddleware.js";

const router = Router();

router.use("/", indexRouter);
router.use("/translations", translationRouter);
router.use("/auth", authRouter);
router.use("/ads", authenticateJWT, adRouter);
router.use("/cron", cronRouter);
router.use("/cloudinary", cloudinaryRouter);
router.use("/users", authenticateJWT, restrictGuest, userRouter);

router.use((req, _, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

export default router;
