import { NextFunction, Request, Response } from "express";
import { SellerService } from "./../services/Seller.Service";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class SellerController {
    constructor(
        private sellerService: SellerService,
        private logger: Logger,
    ) {}

    //  for admin
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const sellers = await this.sellerService.getAll();
            this.logger.info("All seller have been fetched");
            res.json(sellers);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const sellerId = req.params.id;
            if (isNaN(Number(sellerId))) {
                next(createHttpError(400, "Invalid url param."));
                return;
            }
            const seller = await this.sellerService.getById(Number(sellerId));

            this.logger.info("Seller have been fetched");
            res.json(seller);
        } catch (error) {
            next(error);
        }
    }
}
