import bcrypt from "bcryptjs";

export const comparePassword = async (
    hashedPassword: string,
    password: string,
) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};
