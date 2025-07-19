import { Router } from 'express';
import { uploadImage, getImages, getImagesByName, getCategories, getImageById, getImagesByKeyword, deleteImage, updateImage } from '../controllers/imagecontroller';
import { authToken } from '../middleware/authtoken';
import { Admin } from "../middleware/rbac";
import upload from '../utils/multer';

const router = Router();

router.post('/upload', authToken, uploadImage);
router.get('/', authToken, getImages);
router.get("/name/:name", authToken, getImagesByName);
router.get("/categories/:categories", authToken, getCategories);
router.get("/keyword/:keyword", authToken, getImagesByKeyword)
router.get("/product/:id", authToken, getImageById);
router.delete("/product/:id", authToken, deleteImage);
router.put("/product/:id", authToken, updateImage);


export default router;