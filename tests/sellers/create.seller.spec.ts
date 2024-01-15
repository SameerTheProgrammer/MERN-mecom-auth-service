import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Seller } from "../../src/entity/Seller.entity";
import { Roles } from "../../src/contants/index.constant";
import createJWKSMock from "mock-jwks";

describe("Post /sellers", () => {
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
        it("should return a 201 status code ", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            };

            // Act
            const response = await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(sellerData);
            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should create a seller in the database", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            };

            // Act
            await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(sellerData);

            // Assert
            const sellerRepository = connection.getRepository(Seller);
            const seller = await sellerRepository.find();

            expect(seller).toHaveLength(1);
            expect(seller[0].name).toBe(sellerData.name);
            expect(seller[0].email).toBe(sellerData.email);
            expect(seller[0].phoneNumber).toBe(sellerData.phoneNumber);
            expect(seller[0].address).toBe(sellerData.address);
            expect(seller[0].zipCode).toBe(sellerData.zipCode);
            expect(seller[0].role).toBe(Roles.SELLER);
        });

        it("should return 401 if user is not authenticated ", async () => {
            // Arange
            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            };

            // Act
            const response = await request(app)
                .post("/sellers")
                .send(sellerData);
            // Assert
            const sellerRepository = connection.getRepository(Seller);
            const seller = await sellerRepository.find();

            expect(response.statusCode).toBe(401);
            expect(seller).toHaveLength(0);
        });

        it("should return 403 if user is not admin ", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.SELLER,
            });
            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            };

            // Act
            const response = await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(sellerData);

            // Assert
            const sellerRepository = connection.getRepository(Seller);
            const seller = await sellerRepository.find();

            expect(response.statusCode).toBe(403);
            expect(seller).toHaveLength(0);
        });
    });

    describe("fields are missing", () => {});
});
