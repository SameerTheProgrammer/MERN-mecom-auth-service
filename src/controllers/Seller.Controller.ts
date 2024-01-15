import { NextFunction, Request, Response } from "express";
import { SellerService } from "./../services/Seller.Service";
import { ICreateSellerRequest } from "../types/index.types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class SellerController {
    constructor(
        private sellerService: SellerService,
        private logger: Logger,
    ) {}

    async create(req: ICreateSellerRequest, res: Response, next: NextFunction) {
        try {
            // express validation initization
            const result = validationResult(req);

            /* Checking that is there is any error in express
            validation array while validating the req.body data */
            if (!result.isEmpty()) {
                return res.status(400).json({
                    errors: result.array(),
                });
            }

            const { name, email, password, phoneNumber, address, zipCode } =
                req.body;

            this.logger.info("New request to create a seller", {
                ...req.body,
                password: "*****",
            });

            const newSeller = await this.sellerService.create({
                name,
                email,
                password,
                phoneNumber,
                address,
                zipCode,
            });

            this.logger.info("Seller has been created", { id: newSeller.id });

            res.status(201).json({ id: newSeller.id });
        } catch (error) {
            return next(error);
        }
    }

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
