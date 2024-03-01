import { checkSchema } from "express-validator";

export const createSellerValidation = checkSchema({
    name: {
        errorMessage: "Name is required",
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 2,
                max: 100,
            },
            errorMessage:
                "Name should be between least 2 chars and maximum 100 chars",
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
    phoneNumber: {
        errorMessage: "Phone Number is required",
        trim: true,
        notEmpty: true,
        isMobilePhone: {
            errorMessage: "Invalid Phone Number",
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
    zipCode: {
        errorMessage: "zipCode is required",
        trim: true,
        notEmpty: {
            errorMessage: "zipCode is required",
        },
    },
});
