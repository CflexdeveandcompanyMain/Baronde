import { Router } from 'express';
import { uploadImage, getImages, getImagesByName, getCategories, getImageById, getImagesByKeyword, deleteImage, updateImage } from '../controllers/imagecontroller';
import { authToken } from '../middleware/authtoken';
import { Admin } from "../middleware/rbac";
import upload from '../utils/multer';

const router = Router();

router.post('/upload', authToken, uploadImage);
router.get('/',  getImages);
router.get("/name/:name", getImagesByName);
router.get("/categories/:categories", getCategories);
router.get("/keyword/:keyword", getImagesByKeyword)
router.get("/product/:id",  getImageById);
router.delete("/product/:id", authToken, deleteImage);
router.put("/product/:id", authToken, updateImage);


export default router;