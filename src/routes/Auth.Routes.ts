import exprees, { NextFunction, Request, Response } from "express";

import { AuthController } from "../controllers/Auth.Controller";
import { UserService } from "../services/User.Service";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User.entity";
import logger from "../config/logger";
import { registerValidation } from "../validators/auth.validator";

const router = exprees.Router();

const userRespository = AppDataSource.getRepository(User);
const userService = new UserService(userRespository);
const authController = new AuthController(userService, logger);

router
    .route("/register")
    .post(
        registerValidation,
        (req: Request, res: Response, next: NextFunction) =>
            authController.register(req, res, next),
    );

export default router;
