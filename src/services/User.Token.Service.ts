import { JwtPayload, sign } from "jsonwebtoken";
import { readFileSync } from "fs";
import path from "path";
import { Repository } from "typeorm";
import createHttpError from "http-errors";

import { Config } from "../config/config";
import { UserRefreshToken } from "../entity/User.RefreshToken.entity";
import { User } from "../entity/User.entity";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<UserRefreshToken>) {}

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

    async UserPersistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1 Year

        const newRefreshToken = await this.refreshTokenRepository.save({
            user: { ...user, password: undefined },
            expireAt: new Date(Date.now() + MS_IN_YEAR),
        });

        return newRefreshToken;
    }

    async deleteRefreshToken(id: number) {
        return await this.refreshTokenRepository.delete({ id });
    }
}
