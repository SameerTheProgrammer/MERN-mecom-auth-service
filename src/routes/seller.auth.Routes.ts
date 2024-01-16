import exprees, { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";

import { loginValidation } from "../validators/login.validator";
import { CredentialService } from "../services/Credential.Service";
import authenticateMiddleware from "../middlewares/authenticate.middleware";
import { AuthRequest } from "../types/index.types";
import validateRefreshTokenMiddleware from "../middlewares/user.validateRefreshToken.middleware";
import parseRefreshTokenMiddleware from "../middlewares/parseRefreshToken.middleware";
import { SellerRefreshToken } from "../entity/Seller.RefreshToken.entity";
import { Seller } from "../entity/Seller.entity";
import { SellerService } from "../services/Seller.Service";
import { SellerAuthController } from "../controllers/Seller.Auth.Controller";
import { canAccess } from "../middlewares/canAccess.middleware";
import { createSellerValidation } from "../validators/createSeller.validator";
import { Roles } from "../contants/index.constant";
import { SellerTokenService } from "../services/Seller.Token.Service";

const router = exprees.Router();

const sellerRespository = AppDataSource.getRepository(Seller);
const sellerRefreshTokenRepository =
    AppDataSource.getRepository(SellerRefreshToken);

const sellerTokenService = new SellerTokenService(sellerRefreshTokenRepository);

const sellerService = new SellerService(sellerRespository);
const credentialService = new CredentialService();
const sellerAuthController = new SellerAuthController(
    sellerService,
    credentialService,
    sellerTokenService,
    logger,
);

router
    .route("/create")
    .post(
        authenticateMiddleware,
        canAccess([Roles.ADMIN]),
        createSellerValidation,
        (req: Request, res: Response, next: NextFunction) =>
            sellerAuthController.create(req, res, next),
    );

router
    .route("/login")
    .post(loginValidation, (req: Request, res: Response, next: NextFunction) =>
        sellerAuthController.login(req, res, next),
    );

router
    .route("/self")
    .get(authenticateMiddleware, (req: Request, res: Response) =>
        sellerAuthController.self(req as AuthRequest, res),
    );

router
    .route("/newAccessToken")
    .post(
        validateRefreshTokenMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
            sellerAuthController.newAccessToken(req as AuthRequest, res, next),
    );

router
    .route("/logout")
    .post(
        authenticateMiddleware,
        parseRefreshTokenMiddleware,
        (req: Request, res: Response, next: NextFunction) =>
            sellerAuthController.logout(req as AuthRequest, res, next),
    );

export default router;
