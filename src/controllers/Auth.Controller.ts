import { readFileSync } from "fs";
import path from "path";
import { NextFunction, Response } from "express";

import createHttpError from "http-errors";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import Jwt, { JwtPayload } from "jsonwebtoken";

import { RegisterUserRequest } from "../types/index.types";
import { UserService } from "../services/User.Service";
import { Config } from "../config/config";

export class AuthController {
    constructor(
        private userService: UserService,
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

            // Fetching Private key from privateKey.pem
            let PrivateKey: Buffer;
            try {
                PrivateKey = readFileSync(
                    path.join(__dirname, "../../certs/privateKey.pem"),
                );
            } catch (error) {
                const err = createHttpError(
                    500,
                    "Error while reading private key",
                );
                return next(err);
            }

            // Generate RS256 and HS256 JWT token
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = Jwt.sign(payload, PrivateKey, {
                algorithm: "RS256",
                expiresIn: Config.ACCESS_TOKEN_EXPIRY_HOUR,
                issuer: Config.TOKEN_ISSUER,
            });

            const refreshToken = Jwt.sign(
                payload,
                Config.REFRESH_JWT_SECRET_KEY!,
                {
                    algorithm: "HS256",
                    expiresIn: Config.REFRESH_TOKEN_EXPIRY_DAYS,
                    issuer: Config.TOKEN_ISSUER,
                },
            );

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
