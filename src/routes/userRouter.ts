import { Router } from "express";
import {
  dropUser,
  getUserDetails,
  listUsers,
  updateUserProfile,
} from "@controllers/users.js";
import { validate } from "@middlewares/validationMiddleware.js";
import { UpdateProfileSchema } from "types/user.js";

const router = Router();

router.get("/", listUsers);
router.get("/details", getUserDetails);
router.patch("/", validate(UpdateProfileSchema), updateUserProfile);
router.delete("/", dropUser);

export default router;
