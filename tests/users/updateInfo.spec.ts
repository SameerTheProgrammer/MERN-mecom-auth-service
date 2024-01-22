import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/contants/index.constant";
import { User } from "../../src/entity/User.entity";
import { hashPassword } from "../../src/utils/bcrypt.utlis";

describe("PATCH /api/v1/auth/user/update-info", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("All Given fields", () => {
        it("should return 401 if non-authenticated user try to update", async () => {
            // Arange
            const basicData = {
                firstName: "Sameer",
                lastName: "Kumar",
                password: "S@meer1234",
                phoneNumber: 9876543210,
            };
            // Act
            const response = await request(app)
                .patch("/api/v1/auth/user/update-info")
                .send(basicData);

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it("should return 403 if user is not have customer role", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.SELLER,
            });
            const basicData = {
                firstName: "Sameer",
                lastName: "Kumar",
                password: "S@meer1234",
                phoneNumber: 9876543210,
            };
            // Act
            const response = await request(app)
                .patch("/api/v1/auth/user/update-info")
                .set("Cookie", `accessToken=${accessToken}`)
                .send(basicData);

            // Assert
            expect(response.statusCode).toBe(403);
        });

        it("should return 400 if password is incorrect", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const basicData = {
                firstName: "Sameer",
                lastName: "Kumar",
                password: "S@meer123",
                phoneNumber: 9876543210,
            };
            // Act
            const hashedPassword = await hashPassword("S@meer1234");
            const userRespository = connection.getRepository(User);
            await userRespository.save({
                firstName: "sameer",
                lastName: "kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
            });

            const response = await request(app)
                .patch("/api/v1/auth/user/update-info")
                .set("Cookie", `accessToken=${accessToken}`)
                .send(basicData);

            // Assert
            expect(response.status).toBe(400);
        });

        it("should update basic info of user", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const basicData = {
                firstName: "   Sameer",
                lastName: "Kumar",
                password: "S@meer1234",
                phoneNumber: 9876543210,
            };
            // Act
            const hashedPassword = await hashPassword("S@meer1234");
            const userRespository = connection.getRepository(User);
            await userRespository.save({
                firstName: "sameer",
                lastName: "kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
            });

            const response = await request(app)
                .patch("/api/v1/auth/user/update-info")
                .set("Cookie", `accessToken=${accessToken}`)
                .send(basicData);

            // Assert
            const users = await userRespository.find();

            expect(response.status).toBe(200);
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe("Sameer");
            expect(users[0].lastName).toBe(basicData.lastName);
            expect(users[0].phoneNumber).toBe("9876543210");
        });
    });
});
