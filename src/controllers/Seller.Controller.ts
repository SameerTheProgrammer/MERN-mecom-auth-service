import { NextFunction, Response } from "express";
import { SellerService } from "./../services/Seller.Service";
import { ICreateSellerRequest } from "../types/index.types";
import { Logger } from "winston";
import { validationResult } from "express-validator";

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
}
