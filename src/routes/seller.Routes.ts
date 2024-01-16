import express, { NextFunction, Request, Response } from "express";
import { SellerService } from "../services/Seller.Service";
import { AppDataSource } from "../config/data-source";
import { Seller } from "../entity/Seller.entity";
import logger from "../config/logger";
import authenticateMiddleware from "../middlewares/authenticate.middleware";
import { canAccess } from "../middlewares/canAccess.middleware";
import { Roles } from "../contants/index.constant";
import { SellerController } from "../controllers/Seller.Controller";

const router = express.Router();

const sellerRepository = AppDataSource.getRepository(Seller);
const sellerService = new SellerService(sellerRepository);
const sellerController = new SellerController(sellerService, logger);

router
    .route("/")
    .get(
        authenticateMiddleware,
        canAccess([Roles.ADMIN]),
        (req: Request, res: Response, next: NextFunction) =>
            sellerController.getAll(req, res, next),
    );

router
    .route("/:id")
    .get((req: Request, res: Response, next: NextFunction) =>
        sellerController.getById(req, res, next),
    );

export default router;
