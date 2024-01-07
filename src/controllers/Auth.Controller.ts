import { NextFunction, Response } from "express";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";

import { RegisterUserRequest } from "../types/index.types";
import { Config } from "../config/config";

import { UserService } from "../services/User.Service";
import { TokenService } from "../services/Token.Service";
import { CredentialService } from "../services/Credential.Service";

export class AuthController {
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

            this.logger.debug("New request to register a user", {
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
                await this.tokenService.persistsRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken,
            });

            // Saving access token in cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                domain: Config.COOKIE_DOMAIN,
                sameSite: "strict",
                maxAge:
                    1000 * 60 * 60 * Number(Config.ACCESS_COOKIE_MAXAGE_HOUR),
            });

            // Saving refresh token in cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
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

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
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

            this.logger.debug("New request to login a user", {
                email,
                password: "*****",
            });

            /* Create user in database using User.Service find method */
            const user = await this.userService.findByEmail(email);
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
                await this.tokenService.persistsRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken,
            });

            // Saving access token in cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                domain: Config.COOKIE_DOMAIN,
                sameSite: "strict",
                maxAge:
                    1000 * 60 * 60 * Number(Config.ACCESS_COOKIE_MAXAGE_HOUR),
            });

            // Saving refresh token in cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                domain: Config.COOKIE_DOMAIN,
                sameSite: "strict",
                maxAge:
                    1000 *
                    60 *
                    60 *
                    24 *
                    Number(Config.REFRESH_COOKIE_MAXAGE_DAYS),
            });

            res.status(200).json({
                id: user.id,
            });
        } catch (error) {
            return next(error);
        }
    }
}
