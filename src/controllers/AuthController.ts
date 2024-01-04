import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService;
    }

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { firstName, lastName, email, password } = req.body;

            this.logger.debug("New resquest to register a user", {
                firstName,
                lastName,
                email,
                password: "*****",
            });

            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User has been registered", { id: user.id });
            res.status(201).json({
                id: user.id,
            });
        } catch (error) {
            return next(error);
        }
    }
}
