import { Router } from "express";
import {
  dropUser,
  getUserDetails,
  listUsers,
  updateUserProfile,
} from "@controllers/users.js";
import { validate } from "@middlewares/validationMiddleware.js";
import { UpdatePasswordSchema, UpdateProfileSchema } from "types/user.js";
import { updatePassword } from "@controllers/auth.js";

const router = Router();

router.get("/", listUsers);
router.get("/details", getUserDetails);
router.patch("/", validate(UpdateProfileSchema), updateUserProfile);
router.put("/update-password", validate(UpdatePasswordSchema), updatePassword);
router.delete("/", dropUser);

export default router;
