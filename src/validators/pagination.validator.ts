import { checkSchema } from "express-validator";

export default checkSchema(
    {
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    const parseValue = Number(value);
                    return Number.isNaN(parseValue) ? 1 : parseValue;
                },
            },
        },
        perPage: {
            customSanitizer: {
                options: (value) => {
                    const parseValue = Number(value);
                    return Number.isNaN(parseValue) ? 10 : parseValue;
                },
            },
        },
    },
    ["query"],
);
