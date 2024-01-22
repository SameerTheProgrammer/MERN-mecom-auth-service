import { NextFunction, Request, Response } from "express";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";

import {
    AuthRequest,
    IUpdateInfoAdminRequest,
    LoginRequest,
} from "../types/index.types";
import { Config } from "../config/config";

import { AdminService } from "../services/Admin.Service";
import { CredentialService } from "../services/Credential.Service";
import { AdminTokenService } from "../services/Admin.Token.Service";

export class AdminController {
    constructor(
        private adminService: AdminService,
        private credentialService: CredentialService,
        private tokenService: AdminTokenService,
        private logger: Logger,
    ) {}

    async login(req: LoginRequest, res: Response, next: NextFunction) {
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

            this.logger.info("New request to login a admin", {
                email,
                password: "*****",
            });

            /* Create admin in database using admin.Service find method */
            const admin =
                await this.adminService.findByEmailWithPassword(email);

            if (!admin) {
                const error = createHttpError(
                    400,
                    "Email or Password is incorrect",
                );
                return next(error);
            }

            const isCorrectPassword =
                await this.credentialService.comparePassword(
                    admin.password,
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
                sub: String(admin.id),
                role: admin.role,
            };

            // generate jwt token
            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.AdminPersistRefreshToken(admin);

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
            this.logger.info("admin has been logged in", { id: admin.id });

            res.status(200).json({
                id: admin.id,
            });
        } catch (error) {
            return next(error);
        }
    }

    async self(req: AuthRequest, res: Response) {
        const admin = await this.adminService.findById(Number(req.auth.sub));
        res.status(200).json({ ...admin, password: undefined });
    }

    async newAccessToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Generate RS256 and HS256 JWT token
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);

            const admin = await this.adminService.findById(
                Number(req.auth.sub),
            );

            if (!admin) {
                const err = createHttpError(
                    400,
                    "Admin with this token could not find",
                );
                return next(err);
            }

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.AdminPersistRefreshToken(admin);

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
                id: admin.id,
            });
            res.json({ id: admin.id });
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
            this.logger.info("admin has been logged out", {
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

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.params.id;
            if (isNaN(Number(adminId))) {
                next(createHttpError(400, "Invalid url param."));
                return;
            }
            const admin = await this.adminService.findById(Number(adminId));

            this.logger.info("admin have been fetched");
            res.json(admin);
        } catch (error) {
            next(error);
        }
    }

    async update(
        req: IUpdateInfoAdminRequest,
        res: Response,
        next: NextFunction,
    ) {
        // express validation initization
        const result = validationResult(req);

        /* Checking that is there is any error in express
                     validation array while validating the req.body data */
        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            });
        }
        const { firstName, lastName, password, phoneNumber } = req.body;
        const adminId = req.auth.sub;

        if (isNaN(Number(adminId))) {
            next(
                createHttpError(
                    400,
                    "admin data not found or Invalid authentication",
                ),
            );
            return;
        }

        this.logger.info("Request for update admin info", {
            id: Number(adminId),
            ...req.body,
            password: "****",
        });

        try {
            const admin = await this.adminService.updateInfo(Number(adminId), {
                firstName,
                lastName,
                password,
                phoneNumber,
            });
            res.status(200).json({ id: Number(adminId), admin });
        } catch (error) {
            next(error);
        }
    }
}
