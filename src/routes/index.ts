import { Router } from "express";
import translationRouter from "@routes/translationRouter.js";
import authRouter from "@routes/authRouter.js";
import userRouter from "@routes/userRouter.js";
import adRouter from "@routes/adRouter.js";
import cronRouter from "@routes/cronRouter.js";
import cloudinaryRouter from "@routes/cloudinaryRouter.js";
import { NotFoundError } from "@libs/error/NotFoundError.js";
import { authenticateJWT, restrictGuest } from "@middlewares/authMiddleware.js";
import { paymentFailure, paymentSuccess } from "@controllers/payments.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/cron", cronRouter);

router.use("/ads", authenticateJWT, adRouter);
router.get("/payment/success", paymentSuccess);
router.get("/payment/failure", paymentFailure);

router.use("/cloudinary", cloudinaryRouter);
router.use("/translations", translationRouter);
router.use("/users", authenticateJWT, restrictGuest, userRouter);

router.use((req, _, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

export default router;
