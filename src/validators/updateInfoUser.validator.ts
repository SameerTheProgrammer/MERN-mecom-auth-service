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
                max: 30,
            },
            errorMessage:
                "First Name should between least 2 chars and maximum 30 chars",
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
                max: 30,
            },
            errorMessage:
                "Last Name should between least 2 chars and maximum 30 chars",
        },
    },

    password: {
        trim: true,
        notEmpty: {
            errorMessage: "Password is required",
        },
    },

    phoneNumber: {
        trim: true,
        errorMessage: "Password is required",
        custom: {
            options: (value) => {
                if (!value) {
                    throw new Error("phoneNumber is required");
                }
                return true;
            },
        },
    },
});
