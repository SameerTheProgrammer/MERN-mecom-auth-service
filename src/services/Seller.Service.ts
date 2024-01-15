import { Repository } from "typeorm";
import { ISellerData } from "../types/index.types";
import { AppDataSource } from "../config/data-source";
import { Seller } from "../entity/Seller.entity";
import createHttpError from "http-errors";

export class SellerService {
    constructor(private sellerRepository: Repository<Seller>) {}
    async create(SellerData: ISellerData) {
        try {
            const sellerRepository = AppDataSource.getRepository(Seller);
            const data = this.sellerRepository.create(SellerData);
            return await sellerRepository.save(data);
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to store the data in the database",
            );
            throw err;
        }
    }

    async getAll() {
        try {
            return this.sellerRepository.find();
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
            return this.sellerRepository.findOne({
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
}
