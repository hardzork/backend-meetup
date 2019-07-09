import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';

const routes = new Router();
const upload = multer(multerConfig);

/**
 * Users
 */
routes.post('/users', UserController.store);
routes.put('/users', authMiddleware, UserController.update);
/**
 * Session
 */
routes.post('/sessions', SessionController.store);
/**
 * Files
 */
routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.store
);

export default routes;
