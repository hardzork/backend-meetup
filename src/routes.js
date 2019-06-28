import { Router } from 'express';

// import UserController from './app/controllers/UserController';
// import SessionController from './app/controllers/SessionController';

// import authMiddleware from './app/middlewares/auth';

const routes = new Router();
routes.get('/', (req, res) => res.json({ message: 'Hello World' }));

// routes.post("/users", UserController.store);
// routes.put("/users", authMiddleware, UserController.update);

// routes.post("/sessions", SessionController.store);

// routes.get('/', async (req, res) => {
//   const user = await User.create({
//     name: 'Diego Fernandes',
//     email: 'diego@rocketseat.com.br',
//     password_hash: '123',
//   });
//   return res.json(user);
// });
export default routes;
