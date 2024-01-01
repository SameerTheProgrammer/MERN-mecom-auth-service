import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import createHttpError, { HttpError } from "http-errors";
import authRouter from "./routes/AuthRoutes";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

app.get("/", (req, res) => {
    res.send(`Welcome to mecom's index page of path
    ${req.protocol}://${req.get("host")}${req.originalUrl}`);
});

app.get("/httperror", (req, res, next) => {
    const err = createHttpError(
        401,
        "Hey, you don't have premission to access this page",
    );
    return next(err);
});

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
