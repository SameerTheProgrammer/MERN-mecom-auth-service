import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Seller } from "../../src/entity/Seller.entity";
import { Roles } from "../../src/contants/index.constant";

describe("Post /sellers", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    // Happy Path
    describe("Given all field", () => {
        it("should return a 201 status code ", async () => {
            // Arange
            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
                // role:Roles.SELLER
            };

            // Act
            const response = await request(app)
                .post("/sellers")
                .send(sellerData);
            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should create a seller in the database", async () => {
            // Arange
            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "$hopCentre123",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
                // role:Roles.SELLER
            };

            // Act
            await request(app).post("/sellers").send(sellerData);

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
    });

    describe("fields are missing", () => {});
});
