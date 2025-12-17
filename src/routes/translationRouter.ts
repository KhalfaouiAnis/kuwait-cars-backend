import { serveTranslation } from '@controllers/translations.js';
import { Router } from 'express';

const router = Router();

router.get('/:lng/:ns', serveTranslation);

export default router;
