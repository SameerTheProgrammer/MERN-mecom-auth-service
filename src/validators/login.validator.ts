import { checkSchema } from "express-validator";

export const loginValidation = checkSchema({
    email: {
        errorMessage: "Invalid Email",
        trim: true,
        notEmpty: {
            errorMessage: "Email is required",
        },
        isEmail: true,
    },
    password: {
        trim: true,
        notEmpty: {
            errorMessage: "Password is required",
        },
    },
});
