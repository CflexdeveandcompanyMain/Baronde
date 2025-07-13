import { Router } from 'express';
import { uploadImage, getImages, getImagesByName, getCategories } from '../controllers/imagecontroller';
import upload from '../utils/multer';

const router = Router();

router.post('/upload', upload.single('image'), uploadImage);
router.get("name/:name", getImagesByName);
router.get("categories/:categories", getCategories)
router.get('/', getImages);


export default router;
