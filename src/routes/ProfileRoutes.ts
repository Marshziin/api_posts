import { ProfileController } from "../controllers/ProfileController";
import { Router } from 'express';

const router = Router();

router
.post('/Profiles', ProfileController.createProfile)
.get('/Profiles', ProfileController.findAll)
.get('/Profiles/:id', ProfileController.findOne)
.put('/Profiles/:id', ProfileController.updateOne)
.delete('/Profiles/:id', ProfileController.deleteOne);

export default router;