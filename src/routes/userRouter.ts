import { Router } from "express";
import {
  dropUser,
  getUserDetails,
  listUsers,
  updateUserProfile,
} from "@controllers/users.js";
import { authenticateJWT } from "@middlewares/authMiddleware.js";
import { authorizeRole } from "@middlewares/roleMiddleware.js";

const router = Router();

router.get("/", authenticateJWT, authorizeRole(["ADMIN"]), listUsers);
router.get("/details", authenticateJWT, getUserDetails);
router.patch("/", authenticateJWT, updateUserProfile);
router.delete("/", authenticateJWT, dropUser);

export default router;
