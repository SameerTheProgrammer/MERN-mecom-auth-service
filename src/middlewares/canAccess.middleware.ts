import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/index.types";
import createHttpError from "http-errors";

export const canAccess = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthRequest;
        const roleFromToken = _req.auth.role;

        if (!roles.includes(roleFromToken)) {
            const err = createHttpError(
                403,
                "You didn't have permission to create new Seller",
            );
            return next(err);
        }
        next();
    };
};
