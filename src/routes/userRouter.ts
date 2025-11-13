import { Router } from "express";
import {
  dropUser,
  getUserDetails,
  listUsers,
  updateUserProfile,
} from "@controllers/users";
import { authenticateJWT } from "@middlewares/authMiddleware";
import { authorizeRole } from "@middlewares/roleMiddleware";
import { handleUpload, uploadImage } from "@middlewares/uploadMiddleware";

const router = Router();

router.get("/", authenticateJWT, authorizeRole(["ADMIN"]), listUsers);
router.get("/details", authenticateJWT, getUserDetails);
router.patch(
  "/",
  authenticateJWT,
  handleUpload(uploadImage),
  updateUserProfile
);
router.delete("/", authenticateJWT, dropUser);

export default router;
