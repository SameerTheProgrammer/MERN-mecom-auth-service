import { checkSchema } from "express-validator";

export const updateInfoValidation = checkSchema({
    firstName: {
        errorMessage: "First Name is required",
        trim: true,
        notEmpty: {
            errorMessage: "First Name is required",
        },
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
        notEmpty: {
            errorMessage: "Last Name is required",
        },
        isLength: {
            options: {
                min: 2,
                max: 40,
            },
            errorMessage: "Last Name should be at least 2 chars",
        },
        // exists: true,
    },
    password: {
        trim: true,
        notEmpty: {
            errorMessage: "Password is required",
        },
    },
    phoneNumber: {
        trim: true,
    },
});
