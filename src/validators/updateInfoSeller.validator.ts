import { checkSchema } from "express-validator";

export const updateInfoValidation = checkSchema({
    name: {
        errorMessage: "Name is required",
        trim: true,
        notEmpty: {
            errorMessage: "Name is required",
        },
        isLength: {
            options: {
                min: 2,
                max: 40,
            },
            errorMessage:
                "Name should be between least 2 chars and maximum 40 chars",
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
    address: {
        errorMessage: "address is required",
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 10,
                max: 255,
            },
            errorMessage:
                "address should be between least 10 chars and maximum 255 chars",
        },
    },
    description: {
        errorMessage: "description is required",
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 10,
                max: 255,
            },
            errorMessage:
                "description should be between least 10 chars and maximum 255 chars",
        },
    },
    zipCode: {
        errorMessage: "zipCode is required",
        trim: true,
        notEmpty: {
            errorMessage: "zipCode is required",
        },
    },
});
