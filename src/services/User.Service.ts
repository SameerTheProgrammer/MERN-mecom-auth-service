import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";

import { User } from "../entity/User.entity";
import { UserData } from "../types/index.types";
import { Roles } from "../../src/contants/index.constant";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        // check is email is already registered or not
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            const error = createHttpError(400, "Email already exists");
            throw error;
        }

        // converting normal password to hashed password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const data = this.userRepository.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            return await this.userRepository.save(data);
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to store the data in the database",
            );
            throw err;
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: {
                email: email.toLowerCase(),
            },
            select: [
                "id",
                "firstName",
                "lastName",
                "email",
                "password",
                "role",
            ],
        });
    }

    async getAll() {
        try {
            return this.userRepository.find();
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to fetch all seller infomation from database",
            );
            throw err;
        }
    }

    async findById(customerId: number) {
        try {
            return this.userRepository.findOne({
                where: {
                    id: customerId,
                },
            });
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to fetch all seller infomation from database",
            );
            throw err;
        }
    }
}
