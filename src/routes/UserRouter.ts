import { UserController } from "../controllers/UserController";
import { Router } from "express";

const router = Router();

router
.post('/Users', UserController.createUser)
.get('/Users', UserController.findAll)
.get('/Users/specific', UserController.findOne)
.put('/Users/:id', UserController.updateOne)
.delete('/Users/:id', UserController.deleteOne);

export default router;