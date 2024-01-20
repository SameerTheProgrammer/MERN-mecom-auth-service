import exprees, { NextFunction, Request, Response } from "express";

import { UserAuthController } from "../controllers/User.Auth.Controller";

import { UserService } from "../services/User.Service";
import { TokenService } from "../services/User.Token.Service";

import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";

import { User } from "../entity/User.entity";
import { UserRefreshToken } from "../entity/User.RefreshToken.entity";

import { registerValidation } from "../validators/register.validator";
import { loginValidation } from "../validators/login.validator";
import { CredentialService } from "../services/Credential.Service";
import authenticateMiddleware from "../middlewares/authenticate.middleware";
import { AuthRequest } from "../types/index.types";
import validateRefreshTokenMiddleware from "../middlewares/user.validateRefreshToken.middleware";
import parseRefreshTokenMiddleware from "../middlewares/parseRefreshToken.middleware";
import { Roles } from "../contants/index.constant";
import { canAccess } from "../middlewares/canAccess.middleware";

const router = exprees.Router();

const userRespository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(UserRefreshToken);

const tokenService = new TokenService(refreshTokenRepository);
const userService = new UserService(userRespository);
const credentialService = new CredentialService();
const userAuthController = new UserAuthController(
    userService,
    credentialService,
    tokenService,
    logger,
);

router
    .route("/register")
    .post(
        registerValidation,
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.register(req, res, next),
    );

router
    .route("/login")
    .post(loginValidation, (req: Request, res: Response, next: NextFunction) =>
        userAuthController.login(req, res, next),
    );

router
    .route("/self")
    .get(authenticateMiddleware, (req: Request, res: Response) =>
        userAuthController.self(req as AuthRequest, res),
    );

router
    .route("/newAccessToken")
    .post(
        validateRefreshTokenMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.newAccessToken(req as AuthRequest, res, next),
    );

router
    .route("/logout")
    .post(
        authenticateMiddleware,
        parseRefreshTokenMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.logout(req as AuthRequest, res, next),
    );

router
    .route("/get/:id")
    .post(
        authenticateMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.getById(req as AuthRequest, res, next),
    );

router
    .route("/getAll")
    .post(
        authenticateMiddleware,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.getAll(req as AuthRequest, res, next),
    );

export default router;
