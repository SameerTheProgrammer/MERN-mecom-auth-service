import { Repository } from "typeorm";
import createHttpError from "http-errors";

import { Admin } from "../entity/Admin.entity";

export class AdminService {
    constructor(private userRepository: Repository<Admin>) {}

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
