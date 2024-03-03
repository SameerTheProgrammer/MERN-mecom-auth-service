import { Repository } from "typeorm";
import {
    IBasicSellerData,
    IPagination,
    ISellerData,
} from "../types/index.types";
import { AppDataSource } from "../config/data-source";
import { Seller } from "../entity/Seller.entity";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";

export class SellerService {
    constructor(private sellerRepository: Repository<Seller>) {}
    async create(SellerData: ISellerData) {
        const { name, email, password, phoneNumber, address, zipCode, avatar } =
            SellerData;

        const seller = await this.sellerRepository.findOne({
            where: { email },
        });
        if (seller) {
            const error = createHttpError(400, "Email already exists");
            throw error;
        }
        // converting normal password to hashed password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const sellerRepository = AppDataSource.getRepository(Seller);
            const data = this.sellerRepository.create({
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                address,
                zipCode,
                avatar: {
                    public_id: avatar?.public_id,
                    url: avatar?.url,
                },
            });
            return await sellerRepository.save(data);
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to store the data in the database",
            );
            throw err;
        }
    }

    async findByEmail(email: string) {
        return await this.sellerRepository.findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
    }

    async findByEmailWithPassword(email: string) {
        return await this.sellerRepository.findOne({
            where: {
                email: email.toLowerCase(),
            },
            select: [
                "id",
                "name",
                "email",
                "phoneNumber",
                "password",
                "role",
                "avatar",
                "address",
                "description",
                "zipCode",
                "avaiableBalance",
            ],
        });
    }

    async getAll(validateQuery: IPagination) {
        try {
            const queryBuilder = this.sellerRepository.createQueryBuilder();
            return await queryBuilder
                .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
                .take(validateQuery.perPage)
                .getManyAndCount();
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to fetch all seller infomation from database",
            );
            throw err;
        }
    }

    async getById(sellerId: number) {
        try {
            return await this.sellerRepository.findOne({
                where: {
                    id: sellerId,
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
        sellerId: number,
        {
            name,
            password,
            phoneNumber,
            description,
            address,
            zipCode,
        }: IBasicSellerData,
    ) {
        const seller = await this.sellerRepository.findOne({
            where: { id: sellerId },
            select: ["password"],
        });
        if (!seller) {
            const err = createHttpError(400, "invalid seller id");
            throw err;
        }
        const isCorrectPassword = await bcrypt.compare(
            password,
            seller.password,
        );

        if (!isCorrectPassword) {
            const err = createHttpError(400, "Password is incorrect");
            throw err;
        }

        try {
            return await this.sellerRepository.update(sellerId, {
                name,
                phoneNumber,
                description,
                address,
                zipCode,
            });
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to update seller infomation in database",
            );
            throw err;
        }
    }
}
