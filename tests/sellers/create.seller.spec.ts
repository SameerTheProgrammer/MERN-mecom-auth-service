import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";

describe.skip("Post /sellers", () => {
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
                password: "$hop123456",
                address: "jharkhand, india",
                // role:Roles.SELLER
            };

            // Act
            const response = await request(app)
                .post("/sellers")
                .send(sellerData);

            // Assert
            expect(response.statusCode).toBe(201);
        });
    });

    describe("error format received from express validator", () => {});
});
