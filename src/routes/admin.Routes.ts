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
import { AuthRequest, IUpdateInfoAdminRequest } from "../types/index.types";
import validateRefreshTokenMiddleware from "../middlewares/user.validateRefreshToken.middleware";
import parseRefreshTokenMiddleware from "../middlewares/parseRefreshToken.middleware";
import { AdminService } from "../services/Admin.Service";
import { Admin } from "../entity/Admin.entity";
import { AdminRefreshToken } from "../entity/Admin.RefreshToken.entity";
import { AdminTokenService } from "../services/Admin.Token.Service";
import { AdminController } from "../controllers/Admin.Controller";
import { canAccess } from "../middlewares/canAccess.middleware";
import { Roles } from "../contants/index.constant";
import { updateInfoValidation } from "../validators/updateInfoAdmin.validator";

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

router.route("/login").post(loginValidation, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await adminController.newAccessToken(req as AuthRequest, res, next);
}) as RequestHandler);

router
    .route("/self")
    .get(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        (async (req: Request, res: Response) => {
            await adminController.self(req as AuthRequest, res);
        }) as RequestHandler,
    );

router.route("/newAccessToken").post(
    validateRefreshTokenMiddleware as RequestHandler,
    (async (req: Request, res: Response, next: NextFunction) => {
        await adminController.newAccessToken(req as AuthRequest, res, next);
    }) as RequestHandler,
);

router
    .route("/logout")
    .post(
        authenticateMiddleware as RequestHandler,
        parseRefreshTokenMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        (async (req: Request, res: Response, next: NextFunction) => {
            await adminController.logout(req as AuthRequest, res, next);
        }) as RequestHandler,
    );

router.route("/get/:id").post(
    authenticateMiddleware as RequestHandler,
    (async (req: Request, res: Response, next: NextFunction) => {
        await adminController.getById(req as AuthRequest, res, next);
    }) as RequestHandler,
);

router
    .route("/update-info")
    .patch(
        authenticateMiddleware as RequestHandler,
        canAccess([Roles.ADMIN]),
        updateInfoValidation,
        (async (req: Request, res: Response, next: NextFunction) => {
            await adminController.update(
                req as IUpdateInfoAdminRequest,
                res,
                next,
            );
        }) as RequestHandler,
    );

// run this code to create admin
// import { hashPassword } from "../utils/bcrypt.utlis";
// router.post("/create", async (req, res) => {
//     const hashedPassword = await hashPassword("@dminKum@r1234");
//     const admin = await adminRespository.save({
//         firstName: "Admin",
//         lastName: "Kumar",
//         email: "admin@gmail.com",
//         password: hashedPassword,
//         phoneNumber: 1234567890,
//     });
//      res.status(201).json({
//          id: admin.id,
//     });
// });

export default router;
