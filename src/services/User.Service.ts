import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";

import { User } from "../entity/User.entity";
import { IPagination, UserData, basicUserData } from "../types/index.types";
import { Roles } from "../../src/contants/index.constant";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password, avatar }: UserData) {
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
                avatar: {
                    public_id: avatar?.public_id,
                    url: avatar?.url,
                },
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

    async getAll(validationQuery: IPagination) {
        try {
            const queryBuilder = this.userRepository.createQueryBuilder();
            return await queryBuilder
                .skip(
                    (validationQuery.currentPage - 1) * validationQuery.perPage,
                )
                .take(validationQuery.perPage)
                .getManyAndCount();
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
            return await this.userRepository.findOne({
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

    async updateInfo(
        customerId: number,
        { firstName, lastName, password, phoneNumber }: basicUserData,
    ) {
        const user = await this.userRepository.findOne({
            where: { id: customerId },
            select: ["password"],
        });
        if (!user) {
            const err = createHttpError(400, "invalid user id");
            throw err;
        }
        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if (!isCorrectPassword) {
            const err = createHttpError(400, "Password is incorrect");
            throw err;
        }

        try {
            return await this.userRepository.update(customerId, {
                firstName,
                lastName,
                phoneNumber,
            });
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to update user infomation from database",
            );
            throw err;
        }
    }
}
