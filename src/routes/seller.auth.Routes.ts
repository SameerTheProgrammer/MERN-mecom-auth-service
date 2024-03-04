import exprees, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";

import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";

import { loginValidation } from "../validators/login.validator";
import { CredentialService } from "../services/Credential.Service";
import authenticateMiddleware from "../middlewares/authenticate.middleware";
import {
    AuthRequest,
    ICreateSellerRequest,
    IUpdateInfoSellerRequest,
} from "../types/index.types";
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
import { updateInfoValidation } from "../validators/updateInfoSeller.validator";
import { multerUpload } from "../utils/multer";
import paginationValidator from "../validators/query.validator";

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

router.route("/create").post(
    authenticateMiddleware as RequestHandler,
    canAccess([Roles.ADMIN]),
    multerUpload([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    createSellerValidation,
    (req: Request, res: Response, next: NextFunction) =>
        sellerAuthController.create(
            req as ICreateSellerRequest,
            res,
            next,
        ) as unknown as RequestHandler,
);

router
    .route("/login")
    .post(
        loginValidation,
        (req: Request, res: Response, next: NextFunction) =>
            sellerAuthController.login(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/self")
    .get(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.SELLER]),
        (req: Request, res: Response) =>
            sellerAuthController.self(
                req as AuthRequest,
                res,
            ) as unknown as RequestHandler,
    );

router
    .route("/newAccessToken")
    .post(
        validateRefreshTokenMiddleware as RequestHandler,
        (req: Request, res: Response, next: NextFunction) =>
            sellerAuthController.newAccessToken(
                req as AuthRequest,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/logout")
    .post(
        authenticateMiddleware as RequestHandler,
        parseRefreshTokenMiddleware as RequestHandler,
        (req: Request, res: Response, next: NextFunction) =>
            sellerAuthController.logout(
                req as AuthRequest,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/getAll")
    .post(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        paginationValidator,
        (req: Request, res: Response, next: NextFunction) =>
            sellerAuthController.getAll(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/get/:id")
    .post(
        (req: Request, res: Response, next: NextFunction) =>
            sellerAuthController.getById(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/update-info")
    .patch(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.SELLER]),
        updateInfoValidation,
        (async (req: Request, res: Response, next: NextFunction) => {
            await sellerAuthController.update(
                req as IUpdateInfoSellerRequest,
                res,
                next,
            );
        }) as RequestHandler,
    );

export default router;
