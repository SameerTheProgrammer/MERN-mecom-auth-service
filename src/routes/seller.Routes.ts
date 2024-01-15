import express from "express";
import { SellerController } from "./../controllers/Seller.Controller";
import { SellerService } from "../services/Seller.Service";
import { AppDataSource } from "../config/data-source";
import { Seller } from "../entity/Seller.entity";
import logger from "../config/logger";
import authenticateMiddleware from "../middlewares/authenticate.middleware";
import { canAccess } from "../middlewares/canAccess.middleware";
import { Roles } from "../contants/index.constant";

const router = express.Router();

const sellerRepository = AppDataSource.getRepository(Seller);
const sellerService = new SellerService(sellerRepository);
const sellerController = new SellerController(sellerService, logger);

router
    .route("/")
    .post(authenticateMiddleware, canAccess([Roles.ADMIN]), (req, res, next) =>
        sellerController.create(req, res, next),
    );

export default router;
