import exprees from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";

const router = exprees.Router();

const userRespository = AppDataSource.getRepository(User);
const userService = new UserService(userRespository);
const authController = new AuthController(userService, logger);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/register", (req, res, next) =>
    authController.register(req, res, next),
);

export default router;
