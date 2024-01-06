import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";

import { User } from "../entity/User.entity";
import { UserData } from "../types/index.types";
import { Roles } from "../contants/index.constant";

export class UserService {
    constructor(private userRespository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        // check is email is already registered or not
        const user = await this.userRespository.findOne({ where: { email } });
        if (user) {
            const error = createHttpError(400, "Email already exists");
            throw error;
        }

        // converting normal password to hashed password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            return await this.userRespository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.Customer,
            });
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to store the data in the database",
            );
            throw err;
        }
    }
}
