import { Router } from "express";
import multer from "multer";
import translationRouter from "@routes/translationRouter.js";
import authRouter from "@routes/authRouter.js";
import userRouter from "@routes/userRouter.js";
import adRouter from "@routes/adRouter.js";
import cronRouter from "@routes/cronRouter.js";
import cloudinaryRouter from "@routes/cloudinaryRouter.js";
import { NotFoundError } from "@libs/error/NotFoundError.js";
import { authenticateJWT, restrictGuest } from "@middlewares/authMiddleware.js";
import { paymentFailure, paymentSuccess } from "@controllers/payments.js";
import { searchByImage } from "@controllers/vision-search.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use("/auth", authRouter);
router.use("/cron", cronRouter);

router.use("/ads", authenticateJWT, adRouter);
router.post("/ads/search/visual", upload.single("image"), searchByImage);

router.get("/payment/success", paymentSuccess);
router.get("/payment/failure", paymentFailure);

router.use("/cloudinary", cloudinaryRouter);
router.use("/translations", translationRouter);
router.use("/users", authenticateJWT, restrictGuest, userRouter);

router.use((req, _, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

export default router;
