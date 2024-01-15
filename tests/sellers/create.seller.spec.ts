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
            const sellers = await sellerRepository.find();

            expect(sellers).toHaveLength(1);
            expect(sellers[0].name).toBe(sellerData.name);
            expect(sellers[0].email).toBe(sellerData.email);
            expect(sellers[0].phoneNumber).toBe(sellerData.phoneNumber);
            expect(sellers[0].address).toBe(sellerData.address);
            expect(sellers[0].zipCode).toBe(sellerData.zipCode);
            expect(sellers[0].role).toBe(Roles.SELLER);
        });

        it("should return 401 if seller is not authenticated ", async () => {
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
            const sellers = await sellerRepository.find();

            expect(response.statusCode).toBe(401);
            expect(sellers).toHaveLength(0);
        });

        it("should return 403 if seller is not admin ", async () => {
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
            const sellers = await sellerRepository.find();

            expect(response.statusCode).toBe(403);
            expect(sellers).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim all fields ", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const sellerData = {
                name: "  shopName  ",
                email: "  shop@gmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "  Jharkhand, India       ",
                zipCode: 825555,
            };

            // Act
            await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(sellerData);
            // Assert
            const sellerRepository = connection.getRepository(Seller);
            const sellers = await sellerRepository.find();

            expect(sellers[0].name).not.toBe(sellerData.name);
            expect(sellers[0].name).toBe("shopName");

            expect(sellers[0].email).not.toBe(sellerData.email);
            expect(sellers[0].email).toBe("shop@gmail.com");

            expect(sellers[0].address).not.toBe(sellerData.address);
            expect(sellers[0].address).toBe("Jharkhand, India");

            expect(sellers[0].phoneNumber).toBe(1234567890);

            expect(sellers[0].zipCode).toBe(825555);
        });

        it("should return 400 status code if email is not a valid", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const sellerData = {
                name: "shopName",
                email: "  shopgmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "  Jharkhand, India       ",
                zipCode: 825555,
            };

            // Act
            const response = await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send(sellerData);

            // Assert
            const sellerRespository = connection.getRepository(Seller);
            const sellers = await sellerRespository.find();

            expect(sellers).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password is not a valid", async () => {
            // Arange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const sellerData = {
                name: "  shopName  ",
                email: "  shop@gmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "  Jharkhand, India       ",
                zipCode: 825555,
            };

            // Act
            const response = await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send({ ...sellerData, password: "" });

            const response1 = await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send({ ...sellerData, password: "$hopC1" });

            const response2 = await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send({ ...sellerData, password: "$hopCentre" });

            const response3 = await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send({ ...sellerData, password: "hopCentre123" });

            const response4 = await request(app)
                .post("/sellers")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send({ ...sellerData, password: "$hopentre123" });

            // Assert
            const sellerRespository = connection.getRepository(Seller);
            const sellers = await sellerRespository.find();

            expect(sellers).toHaveLength(0);
            expect(response.statusCode).toBe(400);
            expect(response1.statusCode).toBe(400);
            expect(response2.statusCode).toBe(400);
            expect(response3.statusCode).toBe(400);
            expect(response4.statusCode).toBe(400);
        });
    });

    describe("fields are missing", () => {});
});
