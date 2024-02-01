import { Repository } from "typeorm";
import createHttpError from "http-errors";

import { Admin } from "../entity/Admin.entity";
import { IBasicAdminData } from "../types/index.types";
import bcrypt from "bcrypt";

export class AdminService {
    constructor(private adminRepository: Repository<Admin>) {}

    async findByEmail(email: string) {
        return await this.adminRepository.findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
    }

    async findByEmailWithPassword(email: string) {
        return await this.adminRepository.findOne({
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
            return await this.adminRepository.findOne({
                where: {
                    id: customerId,
                },
            });
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to fetch all admin infomation from database",
            );
            throw err;
        }
    }

    async updateInfo(
        adminId: number,
        { firstName, lastName, password, phoneNumber }: IBasicAdminData,
    ) {
        const admin = await this.adminRepository.findOne({
            where: { id: adminId },
            select: ["password"],
        });
        if (!admin) {
            const err = createHttpError(400, "invalid admin id");
            throw err;
        }
        const isCorrectPassword = await bcrypt.compare(
            password,
            admin.password,
        );

        if (!isCorrectPassword) {
            const err = createHttpError(400, "Password is incorrect");
            throw err;
        }

        try {
            return await this.adminRepository.update(adminId, {
                firstName,
                lastName,
                phoneNumber,
            });
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to update admin infomation in database",
            );
            throw err;
        }
    }
}
