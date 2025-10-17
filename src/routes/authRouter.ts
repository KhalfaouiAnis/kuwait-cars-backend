import { loginUser, registerUser } from '@controllers/auth';
import { handleUpload, uploadImage } from '@middlewares/uploadMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/login', loginUser);
router.post('/register', handleUpload(uploadImage), registerUser);

export default router;
