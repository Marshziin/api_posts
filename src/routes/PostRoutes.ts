import { PostController } from "../controllers/PostController";
import { Router } from 'express';

const router = Router();

router
.post('/Posts', PostController.createPost)
.get('/Posts', PostController.readPosts)
.get('/Posts/:id', PostController.readOnePost)
.put('/Posts/:id', PostController.updatePost)
.delete('/Posts/:id', PostController.deleteOne);

export default router;