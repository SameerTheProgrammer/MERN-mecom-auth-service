import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Admin } from "../../src/entity/Admin.entity";
import { Roles } from "../../src/contants/index.constant";
import createJWKSMock from "mock-jwks";
import { hashPassword } from "../../src/utils/bcrypt.utlis";

describe("Patch /api/v1/admin/update-info", () => {
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

    // Happy Path
    describe("Given all field", () => {
        it("should return 401 if admin is not authenticated ", async () => {
            // Arange
            const adminData = {
                firstName: "  AdminName",
                lastName: "Kumar",
                password: "$hopCentre123",
                phoneNumber: 1230000000,
            };

            // Act
            const response = await request(app)
                .patch("/api/v1/admin/update-info")
                .send(adminData);
            // Assert
            const adminRepository = connection.getRepository(Admin);
            const admins = await adminRepository.find();

            expect(response.statusCode).toBe(401);
            expect(admins).toHaveLength(0);
        });

        it("should return 403 if user is not have admin role ", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.SELLER,
            });
            const adminData = {
                firstName: "  AdminName",
                lastName: "Kumar",
                password: "$hopCentre123",
                phoneNumber: 1230000000,
            };

            // Act
            const response = await request(app)
                .patch("/api/v1/admin/update-info")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(adminData);
            // console.log(response.error);
            // Assert
            const adminRepository = connection.getRepository(Admin);
            const admins = await adminRepository.find();

            expect(response.statusCode).toBe(403);
            expect(admins).toHaveLength(0);
        });

        it("should return 400 if password is incorrect", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const adminData = {
                firstName: "  AdminName",
                lastName: "Kumar",
                password: "$hopCentre123",
                phoneNumber: 1230000000,
            };

            // Act
            const hashedPassword = await hashPassword("$hopCentre123456");
            const adminRespository = connection.getRepository(Admin);
            await adminRespository.save({
                firstName: "  Admin",
                lastName: "kumar",
                email: "Admin@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
            });

            const response = await request(app)
                .patch("/api/v1/admin/update-info")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(adminData);

            // Assert
            expect(response.status).toBe(400);
        });

        it("should update basic info of admin", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const adminData = {
                firstName: "  AdminName",
                lastName: "Kumar",
                password: "$hopCentre123",
                phoneNumber: 1230000000,
            };

            // Act
            const hashedPassword = await hashPassword("$hopCentre123");
            const adminRespository = connection.getRepository(Admin);
            await adminRespository.save({
                firstName: "  Admin",
                lastName: "kumar",
                email: "Admin@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
            });

            const response = await request(app)
                .patch("/api/v1/admin/update-info")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(adminData);

            // Assert
            const admin = await adminRespository.find();

            expect(response.status).toBe(200);
            expect(admin).toHaveLength(1);

            expect(admin[0].firstName).toBe("AdminName");
            expect(admin[0].lastName).toBe("Kumar");
            expect(admin[0].phoneNumber).toBe("1230000000");
        });
    });
});
