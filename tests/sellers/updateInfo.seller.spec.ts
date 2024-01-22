import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Seller } from "../../src/entity/Seller.entity";
import { Roles } from "../../src/contants/index.constant";
import createJWKSMock from "mock-jwks";
import { hashPassword } from "../../src/utils/bcrypt.utlis";

describe("Patch /api/v1/auth/seller/update-info", () => {
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
        it("should return 401 if seller is not authenticated ", async () => {
            // Arange
            const sellerData = {
                name: "  shopName",
                password: "$hopCentre123",
                phoneNumber: 1230000000,
                address: "Hzh, Jharkhand, India",
                zipCode: 825300,
                description: "hey this shop where you can buy lastest products",
            };

            // Act
            const response = await request(app)
                .patch("/api/v1/auth/seller/update-info")
                .send(sellerData);
            // Assert
            const sellerRepository = connection.getRepository(Seller);
            const sellers = await sellerRepository.find();

            expect(response.statusCode).toBe(401);
            expect(sellers).toHaveLength(0);
        });

        it("should return 403 if user is not have seller role ", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const sellerData = {
                name: "  shopName",
                password: "$hopCentre123",
                phoneNumber: 1230000000,
                address: "Hzh, Jharkhand, India",
                zipCode: 825300,
                description: "hey this shop where you can buy lastest products",
            };

            // Act
            const response = await request(app)
                .patch("/api/v1/auth/seller/update-info")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(sellerData);

            // Assert
            const sellerRepository = connection.getRepository(Seller);
            const sellers = await sellerRepository.find();

            expect(response.statusCode).toBe(403);
            expect(sellers).toHaveLength(0);
        });

        it("should return 400 if password is incorrect", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.SELLER,
            });

            const sellerData = {
                name: "  shopName",
                password: "$hopCentre123",
                phoneNumber: 1230000000,
                address: "Hzh, Jharkhand, India",
                zipCode: 825300,
                description: "hey this shop where you can buy lastest products",
            };

            // Act
            const hashedPassword = await hashPassword("$hopCentre123456");
            const sellerRespository = connection.getRepository(Seller);
            await sellerRespository.save({
                name: "shop",
                email: "shop@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            });

            const response = await request(app)
                .patch("/api/v1/auth/seller/update-info")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(sellerData);

            // Assert
            expect(response.status).toBe(400);
        });

        it("should update basic info of seller", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.SELLER,
            });
            const sellerData = {
                name: "  shopName",
                password: "$hopCentre123",
                phoneNumber: 1230000000,
                address: "Hzh, Jharkhand, India",
                zipCode: 825300,
                description: "hey this shop where you can buy lastest products",
            };

            // Act
            const hashedPassword = await hashPassword("$hopCentre123");
            const sellerRespository = connection.getRepository(Seller);
            await sellerRespository.save({
                name: "shop",
                email: "shop@gmail.com",
                password: hashedPassword,
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            });

            const response = await request(app)
                .patch("/api/v1/auth/seller/update-info")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(sellerData);

            // Assert
            const seller = await sellerRespository.find();

            expect(response.status).toBe(200);
            expect(seller).toHaveLength(1);

            expect(seller[0].name).toBe("shopName");
            expect(seller[0].phoneNumber).toBe("1230000000");
            expect(seller[0].address).toBe(sellerData.address);
            expect(seller[0].zipCode).toBe(sellerData.zipCode);
            expect(seller[0].description).toBe(
                "hey this shop where you can buy lastest products",
            );
        });
    });
});
