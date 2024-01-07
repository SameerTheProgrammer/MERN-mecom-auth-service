import { checkSchema } from "express-validator";

export const registerValidation = checkSchema({
    firstName: {
        errorMessage: "First Name is required",
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 2,
                max: 40,
            },
            errorMessage: "First Name should be at least 2 chars",
        },
    },
    lastName: {
        errorMessage: "First Name is required",
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 2,
                max: 40,
            },
            errorMessage: "First Name should be at least 2 chars",
        },
    },
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
        isLength: {
            errorMessage: "Password should be at least 10 chars",
            options: {
                min: 10,
            },
        },
        isStrongPassword: {
            options: {
                minUppercase: 1,
                minLowercase: 1,
                minSymbols: 1,
                minNumbers: 1,
            },
            errorMessage:
                "Password should be strong which have one symbol, number, uppercase and lowercase",
        },
    },
});
