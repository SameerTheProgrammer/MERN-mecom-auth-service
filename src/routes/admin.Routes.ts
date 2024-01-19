import exprees, { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";

import { loginValidation } from "../validators/login.validator";
import { CredentialService } from "../services/Credential.Service";
import authenticateMiddleware from "../middlewares/authenticate.middleware";
import { AuthRequest } from "../types/index.types";
import validateRefreshTokenMiddleware from "../middlewares/user.validateRefreshToken.middleware";
import parseRefreshTokenMiddleware from "../middlewares/parseRefreshToken.middleware";
import { AdminService } from "../services/Admin.Service";
import { Admin } from "../entity/Admin.entity";
import { AdminRefreshToken } from "../entity/Admin.RefreshToken.entity";
import { AdminTokenService } from "../services/Admin.Token.Service";
import { AdminController } from "../controllers/Admin.Controller";
import { canAccess } from "../middlewares/canAccess.middleware";
import { Roles } from "../contants/index.constant";

const router = exprees.Router();

const adminRespository = AppDataSource.getRepository(Admin);
const refreshTokenRepository = AppDataSource.getRepository(AdminRefreshToken);

const tokenService = new AdminTokenService(refreshTokenRepository);
const adminService = new AdminService(adminRespository);
const credentialService = new CredentialService();
const adminController = new AdminController(
    adminService,
    credentialService,
    tokenService,
    logger,
);

router
    .route("/login")
    .post(loginValidation, (req: Request, res: Response, next: NextFunction) =>
        adminController.login(req, res, next),
    );

router
    .route("/self")
    .get(
        authenticateMiddleware,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response) =>
            adminController.self(req as AuthRequest, res),
    );

router
    .route("/newAccessToken")
    .post(
        validateRefreshTokenMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
            adminController.newAccessToken(req as AuthRequest, res, next),
    );

router
    .route("/logout")
    .post(
        authenticateMiddleware,
        parseRefreshTokenMiddleware,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            adminController.logout(req as AuthRequest, res, next),
    );

router
    .route("/get/:id")
    .post(
        authenticateMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
            adminController.getById(req as AuthRequest, res, next),
    );
export default router;
