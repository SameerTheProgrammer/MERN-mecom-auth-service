import { GetVerificationKey, expressjwt } from "express-jwt";
import jwksClient from "jwks-rsa";
import { Config } from "../config/config";
import { Request } from "express";

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ["RS256"],
    getToken(req: Request) {
        const authToken = req.headers.authorization;
        if (authToken && authToken.split(" ")[1] !== "undefined") {
            const token = authToken.split(" ")[1];
            if (token) return token;
        }

        type AuthCookie = {
            accessToken: string;
        };

        const { accessToken } = req.cookies as AuthCookie;
        return accessToken;
    },
});
