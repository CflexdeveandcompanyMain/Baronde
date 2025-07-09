import { signUp, login, getAllUsers,  getUser,  requestUserOTP } from "../controllers/usercontroller";
import { Router } from "express";
import { authToken } from "../middleware/authtoken";
import { Admin} from "../middleware/rbac";
const router = Router()


router.post("/request-admin-otp", requestUserOTP);
router.post("/SignUp", signUp)
router.post("/login", login)
router.get("/getuser/:id", authToken, getUser)
router.get("/alluser", authToken,Admin, getAllUsers)
export default router