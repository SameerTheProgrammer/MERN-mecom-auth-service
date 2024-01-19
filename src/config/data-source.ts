import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./config";

import { User } from "../entity/User.entity";
import { UserRefreshToken } from "../entity/User.RefreshToken.entity";

import { Seller } from "../entity/Seller.entity";
import { SellerRefreshToken } from "../entity/Seller.RefreshToken.entity";

import { Admin } from "../entity/Admin.entity";
import { AdminRefreshToken } from "../entity/Admin.RefreshToken.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    // Dont't use this in production. Always keep false
    synchronize: false,
    logging: false,
    entities: [
        User,
        UserRefreshToken,
        Seller,
        SellerRefreshToken,
        Admin,
        AdminRefreshToken,
    ],
    migrations: ["src/migration/*.ts"],
    subscribers: [],
});
