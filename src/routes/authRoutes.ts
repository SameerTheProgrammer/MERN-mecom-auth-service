import exprees from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = exprees.Router();

const userRespository = AppDataSource.getRepository(User);
const userService = new UserService(userRespository);
const authController = new AuthController(userService);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/register", (req, res) => authController.register(req, res));

export default router;
