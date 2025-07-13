import { Router } from 'express';
import { uploadImage, getImages, getImagesByName, getCategories } from '../controllers/imagecontroller';
import { authToken } from '../middleware/authtoken';
import upload from '../utils/multer';

const router = Router();

router.post('/upload', upload.single('image'), uploadImage);
router.get("/name/:name", authToken, getImagesByName);
router.get("/categories/:categories",  authToken, getCategories)
router.get('/', authToken, getImages);


export default router;
