import { JwtPayload, sign } from "jsonwebtoken";
import { readFileSync } from "fs";
import path from "path";

import createHttpError from "http-errors";
import { Config } from "../config/config";

export class TokenService {
    generateAccessToken(payload: JwtPayload): string {
        // Fetching Private key from privateKey.pem
        let PrivateKey: Buffer;
        try {
            PrivateKey = readFileSync(
                path.join(__dirname, "../../certs/privateKey.pem"),
            );
        } catch (error) {
            const err = createHttpError(500, "Error while reading private key");
            throw err;
        }
        // Generate RS256 JWT token
        const accessToken = sign(payload, PrivateKey, {
            algorithm: "RS256",
            expiresIn: Config.ACCESS_TOKEN_EXPIRY_HOUR,
            issuer: Config.TOKEN_ISSUER,
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload): string {
        const refreshToken = sign(payload, Config.REFRESH_JWT_SECRET_KEY!, {
            algorithm: "HS256",
            expiresIn: Config.REFRESH_TOKEN_EXPIRY_DAYS,
            issuer: Config.TOKEN_ISSUER,
            jwtid: String(payload.id),
        });
        return refreshToken;
    }
}
