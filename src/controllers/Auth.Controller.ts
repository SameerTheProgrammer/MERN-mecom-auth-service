import { NextFunction, Response } from "express";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";

import { RegisterUserRequest } from "../types/index.types";
import { UserService } from "../services/User.Service";
import { Config } from "../config/config";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken.entity";
import { TokenService } from "../services/Token.Service";

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private logger: Logger,
    ) {
        this.userService = userService;
    }

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

            this.logger.debug("New resquest to register a user", {
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

            const accessToken = this.tokenService.generateAccessToken(payload);

            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1 Year
            const refreshTokenRespository =
                AppDataSource.getRepository(RefreshToken);

            const newRefreshToken = await refreshTokenRespository.save({
                user: user,
                expireAt: new Date(Date.now() + MS_IN_YEAR),
            });

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
}
