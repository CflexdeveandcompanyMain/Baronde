import { SignUp, login, allUser,  getUser,  requestAdminOtp } from "../controllers/usercontroller";
import { Router } from "express";
import { authToken } from "../middleware/authtoken";
import { Admin} from "../middleware/rbac";
const router = Router()


router.post("/request-admin-otp", requestAdminOtp);
router.post("/SignUp", SignUp)
router.post("/login", login)
router.get("/getuser/:id", authToken, getUser)
router.get("/alluser", authToken,Admin, allUser)
export default router