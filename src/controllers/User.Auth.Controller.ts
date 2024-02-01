import { NextFunction, Request, Response } from "express";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";

import {
    AuthRequest,
    IUpdateInfoUserRequest,
    LoginRequest,
    RegisterUserRequest,
} from "../types/index.types";
import { Config } from "../config/config";

import { UserService } from "../services/User.Service";
import { TokenService } from "../services/User.Token.Service";
import { CredentialService } from "../services/Credential.Service";

export class UserAuthController {
    constructor(
        private userService: UserService,
        private credentialService: CredentialService,
        private tokenService: TokenService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
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

            const { firstName, lastName, email, password } = req.body;

            this.logger.info("New request to register a user", {
                firstName,
                lastName,
                email,
                password: "*****",
            });

            /* Create user in database using User.Service create method */
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User has been registered", { id: user.id });

            // Generate RS256 and HS256 JWT token
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // generate jwt token
            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken =
                await this.tokenService.UserPersistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            // console.log(refreshToken)
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

            res.status(201).json({
                id: user.id,
            });
        } catch (error) {
            return next(error);
        }
    }

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

            this.logger.info("New request to login a user", {
                email,
                password: "*****",
            });

            /* Create user in database using User.Service find method */
            const user = await this.userService.findByEmailWithPassword(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "Email or Password is incorrect",
                );
                return next(error);
            }

            const isCorrectPassword =
                await this.credentialService.comparePassword(
                    user.password,
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
                sub: String(user.id),
                role: user.role,
            };

            // generate jwt token
            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.UserPersistRefreshToken(user);

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

            this.logger.info("User has been logged in", { id: user.id });

            res.status(200).json({
                id: user.id,
            });
        } catch (error) {
            return next(error);
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));
        res.status(200).json({ ...user, password: undefined });
    }

    async newAccessToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Generate RS256 and HS256 JWT token
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);

            const user = await this.userService.findById(Number(req.auth.sub));

            if (!user) {
                const err = createHttpError(
                    400,
                    "User with the token could not find",
                );
                return next(err);
            }

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.UserPersistRefreshToken(user);

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
                id: user.id,
            });
            res.json({ id: user.id });
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
            this.logger.info("User has been logged out", { id: req.auth.sub });

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.json({});
        } catch (err) {
            next(err);
            return;
        }
    }

    //  for admin
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const sellers = await this.userService.getAll();
            this.logger.info("All seller have been fetched");
            res.json(sellers);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const customerId = req.params.id;
            if (isNaN(Number(customerId))) {
                next(createHttpError(400, "Invalid url param."));
                return;
            }
            const seller = await this.userService.findById(Number(customerId));

            this.logger.info("Seller have been fetched");
            res.json(seller);
        } catch (error) {
            next(error);
        }
    }

    async update(
        req: IUpdateInfoUserRequest,
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
        const userId = req.auth.sub;

        if (isNaN(Number(userId))) {
            next(
                createHttpError(
                    400,
                    "User data not found or Invalid authentication",
                ),
            );
            return;
        }

        this.logger.info("Request for update user info", {
            id: Number(userId),
            ...req.body,
            password: "****",
        });

        try {
            const uUser = await this.userService.updateInfo(Number(userId), {
                firstName,
                lastName,
                password,
                phoneNumber,
            });
            res.status(200).json({ id: Number(userId), uUser });
        } catch (error) {
            next(error);
        }
    }
}
