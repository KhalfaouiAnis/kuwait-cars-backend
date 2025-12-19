import { Router } from "express";
import {
  dropUser,
  getUserDetails,
  listUsers,
  updateUserProfile,
} from "@controllers/users.js";
import { authenticateJWT } from "@middlewares/authMiddleware.js";
import { authorizeRole } from "@middlewares/roleMiddleware.js";
import { validate } from "@middlewares/validationMiddleware.js";
import { UpdateProfileSchema } from "types/user.js";

const router = Router();

router.get("/", authenticateJWT, authorizeRole(["ADMIN"]), listUsers);
router.get(
  "/details",
  authenticateJWT,
  validate(UpdateProfileSchema),

  getUserDetails
);
router.patch(
  "/",
  authenticateJWT,
  validate(UpdateProfileSchema),
  updateUserProfile
);
router.delete("/", authenticateJWT, dropUser);

export default router;
