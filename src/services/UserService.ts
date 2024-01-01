import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";

export class UserService {
    constructor(private userRespository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            return await this.userRespository.save({
                firstName,
                lastName,
                email,
                password,
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
