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
}
