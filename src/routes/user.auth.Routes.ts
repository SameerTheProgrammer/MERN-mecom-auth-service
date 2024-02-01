import exprees, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";

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
import { AuthRequest, IUpdateInfoUserRequest } from "../types/index.types";
import validateRefreshTokenMiddleware from "../middlewares/user.validateRefreshToken.middleware";
import parseRefreshTokenMiddleware from "../middlewares/parseRefreshToken.middleware";
import { Roles } from "../contants/index.constant";
import { canAccess } from "../middlewares/canAccess.middleware";
import { updateInfoValidation } from "../validators/updateInfoUser.validator";

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
            userAuthController.register(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/login")
    .post(
        loginValidation,
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.login(
                req,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/self")
    .get(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.CUSTOMER]),
        (req: Request, res: Response) =>
            userAuthController.self(
                req as AuthRequest,
                res,
            ) as unknown as RequestHandler,
    );

router
    .route("/newAccessToken")
    .post(
        validateRefreshTokenMiddleware as RequestHandler,
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.newAccessToken(
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
        canAccess([Roles.CUSTOMER]),
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.logout(
                req as AuthRequest,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/get/:id")
    .post(
        authenticateMiddleware as RequestHandler,
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.getById(
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
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.getAll(
                req as AuthRequest,
                res,
                next,
            ) as unknown as RequestHandler,
    );

router
    .route("/update-info")
    .patch(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.CUSTOMER]),
        updateInfoValidation,
        (req: Request, res: Response, next: NextFunction) =>
            userAuthController.update(
                req as IUpdateInfoUserRequest,
                res,
                next,
            ) as unknown as RequestHandler,
    );

export default router;
