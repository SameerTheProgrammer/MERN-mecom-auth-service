import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User.entity";
import { hashPassword } from "../../src/utils/bcrypt.utlis";
import { Roles } from "../../src/contants/index.constant";

describe("Get /auth/self", () => {
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

    describe("Given all fields", () => {
        it("should return 200 status code", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return the user data", async () => {
            /* steps:-
                Register user
                Generate token
                add token to cookie
                check if user id matches with registered user
            */

            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };
            // Act
            /* Register user */

            const hashedPassword = await hashPassword(userData.password);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            /* Generate token */
            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            /* add token to cookie */
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            /* check if user id matches with registered user */
            expect((response.body as Record<string, string>).id).toBe(user.id);
        });

        it("should not return password of user", async () => {
            /* steps:-
                Register user
                Generate token
                add token to cookie
                check if user id matches with registered user
            */

            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };
            // Act
            /* Register user */

            const hashedPassword = await hashPassword(userData.password);
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            /* Generate token */
            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            /* add token to cookie */
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            /* check if user id matches with registered user */
            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });

        it("should return 401 status code if token does not exits", async () => {
            /* steps:-
                Register user
                Generate token
                add token to cookie
                check if user id matches with registered user
            */

            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };
            // Act
            /* Register user */

            const hashedPassword = await hashPassword(userData.password);
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const response = await request(app).get("/auth/self").send();

            // Assert
            expect(response.statusCode).toBe(401);
        });
    });
});
