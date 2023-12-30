import exprees from "express";
import { AuthController } from "../controller/AuthController";

const router = exprees.Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));

export default router;
