import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /:
 *  get:
 *    description: Welcome to the Express boilerplate
 *    responses:
 *      200:
 *        description: Returns a welcome message
 */
router.get('/', (_, res) => {
  res.send('Hello, Typescript with Express!');
});

export default router;
