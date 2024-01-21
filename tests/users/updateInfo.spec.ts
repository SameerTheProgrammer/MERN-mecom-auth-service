import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/contants/index.constant";

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
        it("should return 200 status code", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const basicData = {
                firstName: "Sameer",
                lastName: "Kumar",
                password: "S@meer1234",
                phoneNumber: 9876543210,
                avatar: {
                    public_id: "",
                    public_url: "",
                },
            };
            // Act
            const response = await request(app)
                .patch("/api/v1/auth/user/update-info")
                .set("Cookie", `accessToken=${accessToken}`)
                .send(basicData);

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return 401 if non-authenticated user try to update", async () => {
            // Arange
            const basicData = {
                firstName: "Sameer",
                lastName: "Kumar",
                password: "S@meer1234",
                phoneNumber: 9876543210,
                avatar: {
                    public_id: "",
                    public_url: "",
                },
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
                avatar: {
                    public_id: "",
                    public_url: "",
                },
            };
            // Act
            const response = await request(app)
                .patch("/api/v1/auth/user/update-info")
                .set("Cookie", `accessToken=${accessToken}`)
                .send(basicData);

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });

    describe("Missing fields", () => {});
});
