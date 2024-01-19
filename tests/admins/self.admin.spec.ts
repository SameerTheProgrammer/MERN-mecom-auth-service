import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { Admin } from "../../src/entity/Admin.entity";
import { hashPassword } from "../../src/utils/bcrypt.utlis";
import { Roles } from "../../src/contants/index.constant";

describe("Get /api/v1/admin/self", () => {
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
                role: Roles.ADMIN,
            });

            // Act
            const response = await request(app)
                .get("/api/v1/admin/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return the Seller data", async () => {
            /* steps:-
                Register admin
                Generate token
                add token to cookie
                check if Seller id matches with registered Seller
            */

            // Arange
            const adminRepository = connection.getRepository(Admin);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            const admin = await adminRepository.save({
                firstName: "Admin",
                lastName: "Kumar",
                email: "admin@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
            });

            /* Generate token */
            const accessToken = jwks.token({
                sub: String(admin.id),
                role: admin.role,
            });

            /* add token to cookie */
            const response = await request(app)
                .get("/api/v1/admin/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            /* check if Seller id matches with registered Seller */
            expect((response.body as Record<string, string>).id).toBe(admin.id);
        });

        it("should not return password of Seller", async () => {
            /* steps:-
                Register admin
                Generate token
                add token to cookie
                check if Seller id matches with registered Seller
            */

            // Arange
            const adminRepository = connection.getRepository(Admin);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            const admin = await adminRepository.save({
                firstName: "Admin",
                lastName: "Kumar",
                email: "admin@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
            });

            /* Generate token */
            const accessToken = jwks.token({
                sub: String(admin.id),
                role: admin.role,
            });

            /* add token to cookie */
            const response = await request(app)
                .get("/api/v1/admin/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            /* check if Seller id matches with registered Seller */
            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });

        it("should return 401 status code if token does not exits", async () => {
            /* steps:-
                Register admin
                Generate token
                add token to cookie
                check if Seller id matches with registered Seller
            */

            // Arange
            const adminRepository = connection.getRepository(Admin);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await adminRepository.save({
                firstName: "Admin",
                lastName: "Kumar",
                email: "admin@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
            });

            /* add token to cookie */
            const response = await request(app)
                .get("/api/v1/admin/self")
                .send();

            // Assert
            expect(response.statusCode).toBe(401);
        });
    });
});
