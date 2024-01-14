import "reflect-metadata";
import { DataSource } from "typeorm";

import { User } from "../entity/User.entity";
import { Config } from "./config";
import { RefreshToken } from "../entity/RefreshToken.entity";
import { Seller } from "../entity/Seller.entity";

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
    entities: [User, RefreshToken, Seller],
    migrations: ["src/migration/*.ts"],
    subscribers: [],
});
