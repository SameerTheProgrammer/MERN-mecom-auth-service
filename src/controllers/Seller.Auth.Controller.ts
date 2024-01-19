import { NextFunction, Response } from "express";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";

import {
    AuthRequest,
    ICreateSellerRequest,
    LoginSellerRequest,
} from "../types/index.types";
import { Config } from "../config/config";

import { SellerService } from "../services/Seller.Service";
import { CredentialService } from "../services/Credential.Service";
import { SellerTokenService } from "../services/Seller.Token.Service";

export class SellerAuthController {
    constructor(
        private sellerService: SellerService,
        private credentialService: CredentialService,
        private tokenService: SellerTokenService,
        private logger: Logger,
    ) {}

    //  for admin
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

    async login(req: LoginSellerRequest, res: Response, next: NextFunction) {
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

            const { email, password } = req.body;

            this.logger.info("New request to login a seller", {
                email,
                password: "*****",
            });

            /* Create seller in database using seller.Service find method */
            const seller =
                await this.sellerService.findByEmailWithPassword(email);

            if (!seller) {
                const error = createHttpError(
                    400,
                    "Email or Password is incorrect",
                );
                return next(error);
            }

            const isCorrectPassword =
                await this.credentialService.comparePassword(
                    seller.password,
                    password,
                );

            if (!isCorrectPassword) {
                const error = createHttpError(
                    400,
                    "Email or Password is incorrect",
                );
                return next(error);
            }

            // Generate RS256 and HS256 JWT token
            const payload: JwtPayload = {
                sub: String(seller.id),
                role: seller.role,
            };

            // generate jwt token
            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.SellerPersistRefreshToken(seller);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            // Saving access token in cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                domain: Config.COOKIE_DOMAIN,
                sameSite: "strict",
                maxAge:
                    1000 * 60 * 60 * Number(Config.ACCESS_COOKIE_MAXAGE_HOUR),
            });

            // Saving refresh token in cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                domain: Config.COOKIE_DOMAIN,
                sameSite: "strict",
                maxAge:
                    1000 *
                    60 *
                    60 *
                    24 *
                    Number(Config.REFRESH_COOKIE_MAXAGE_DAYS),
            });
            // console.log("contoller ", req.cookies);
            this.logger.info("seller has been logged in", { id: seller.id });

            res.status(200).json({
                id: seller.id,
            });
        } catch (error) {
            return next(error);
        }
    }

    async self(req: AuthRequest, res: Response) {
        const seller = await this.sellerService.getById(Number(req.auth.sub));
        res.status(200).json({ ...seller, password: undefined });
    }

    async newAccessToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Generate RS256 and HS256 JWT token
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);

            const seller = await this.sellerService.getById(
                Number(req.auth.sub),
            );

            if (!seller) {
                const err = createHttpError(
                    400,
                    "seller with the token could not find",
                );
                return next(err);
            }

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.SellerPersistRefreshToken(seller);

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            // Saving access token in cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                domain: Config.COOKIE_DOMAIN,
                sameSite: "strict",
                maxAge:
                    1000 * 60 * 60 * Number(Config.ACCESS_COOKIE_MAXAGE_HOUR),
            });

            // Saving refresh token in cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                domain: Config.COOKIE_DOMAIN,
                sameSite: "strict",
                maxAge:
                    1000 *
                    60 *
                    60 *
                    24 *
                    Number(Config.REFRESH_COOKIE_MAXAGE_DAYS),
            });

            this.logger.info("New access token has been created", {
                id: seller.id,
            });
            res.json({ id: seller.id });
        } catch (error) {
            return next(error);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });
            this.logger.info("seller has been logged out", {
                id: req.auth.sub,
            });

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.json({});
        } catch (err) {
            next(err);
            return;
        }
    }
}
