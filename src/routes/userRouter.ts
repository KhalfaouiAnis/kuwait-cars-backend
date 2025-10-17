import { Router } from 'express';
import {
  dropUser,
  getUserDetails,
  listUsers,
  updateUserAvatar,
} from '@controllers/users';
import { authenticateJWT } from '@middlewares/authMiddleware';
import { authorizeRole } from '@middlewares/roleMiddleware';
import { handleUpload, uploadImage } from '@middlewares/uploadMiddleware';

const router = Router();

router.get('/', authenticateJWT, authorizeRole(['ADMIN']), listUsers);
router.get('/details', authenticateJWT, getUserDetails);
router.patch(
  '/avatar',
  authenticateJWT,
  handleUpload(uploadImage),
  updateUserAvatar,
);
router.delete('/', authenticateJWT, dropUser);

export default router;
