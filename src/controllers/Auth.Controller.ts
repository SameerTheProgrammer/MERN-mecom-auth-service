import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types/index.types";
import { UserService } from "../services/User.Service";
import { Logger } from "winston";
import { validationResult } from "express-validator";

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
            // express validation
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({
                    errors: result.array(),
                });
            }
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
