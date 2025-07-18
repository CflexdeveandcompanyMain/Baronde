import { Router } from 'express';
import { uploadImage, getImages, getImagesByName, getCategories, getImageById, getImagesByKeyword } from '../controllers/imagecontroller';
import { authToken } from '../middleware/authtoken';
import upload from '../utils/multer';

const router = Router();

router.post('/upload', authToken, upload.array('images', 4), uploadImage);
router.get('/', authToken, getImages);
router.get("/name/:name", authToken, getImagesByName);
router.get("/categories/:categories", authToken, getCategories);
router.get("/keyword/:keyword", authToken, getImagesByKeyword)
router.get("/product/:id", authToken, getImageById);

export default router;