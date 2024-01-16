import { expressjwt } from "express-jwt";
import { Config } from "../config/config";
import { Request } from "express";
import { AuthCookie, IRefreshTokenPayload } from "../types/index.types";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { SellerRefreshToken } from "../entity/Seller.RefreshToken.entity";

export default expressjwt({
    secret: Config.REFRESH_JWT_SECRET_KEY!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(request: Request, token) {
        try {
            const refreshTokenRepo =
                AppDataSource.getRepository(SellerRefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });
            return refreshToken === null;
        } catch (err) {
            logger.error("Error while getting the refresh token", {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
        }
        return true;
    },
});
