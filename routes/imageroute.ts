import { Router } from 'express';
import { uploadImage, getImages } from '../controllers/imagecontroller';
import upload from '../utils/multer';

const router = Router();

router.post('/upload', upload.single('image'), uploadImage);
router.get('/', getImages);

export default router;
