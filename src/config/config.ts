import { config } from "dotenv";
import path from "path";

config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

const {
    PORT,
    NODE_ENV,

    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,

    REFRESH_JWT_SECRET_KEY,
    ACCESS_TOKEN_EXPIRY_HOUR,
    REFRESH_TOKEN_EXPIRY_DAYS,
    TOKEN_ISSUER,

    ACCESS_COOKIE_MAXAGE_HOUR,
    REFRESH_COOKIE_MAXAGE_DAYS,
    COOKIE_DOMAIN,

    JWKS_URI,

    PRIVATE_KEY,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,

    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,

    REFRESH_JWT_SECRET_KEY,
    ACCESS_TOKEN_EXPIRY_HOUR,
    REFRESH_TOKEN_EXPIRY_DAYS,
    TOKEN_ISSUER,

    ACCESS_COOKIE_MAXAGE_HOUR,
    REFRESH_COOKIE_MAXAGE_DAYS,
    COOKIE_DOMAIN,

    JWKS_URI,

    PRIVATE_KEY,
};
