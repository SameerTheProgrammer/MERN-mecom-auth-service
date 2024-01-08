import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import cookieParser from "cookie-parser";

import logger from "./config/logger";
import authRouter from "./routes/Auth.Routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
