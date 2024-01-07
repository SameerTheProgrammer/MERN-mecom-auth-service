import bcrypt from "bcrypt";

export class CredentialService {
    async comparePassword(hashedPassword: string, password: string) {
        return await bcrypt.compare(password, hashedPassword);
    }
    async hashPassword(password: string) {
        const saltRounds = 10;
        // converting normal password to hashed password
        return await bcrypt.hash(password, saltRounds);
    }
}
