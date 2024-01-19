import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { Seller } from "../../src/entity/Seller.entity";
import { hashPassword } from "../../src/utils/bcrypt.utlis";
import { Roles } from "../../src/contants/index.constant";

describe("Get /api/v1/auth/seller/self", () => {
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
                role: Roles.SELLER,
            });

            // Act
            const response = await request(app)
                .get("/api/v1/auth/seller/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return the Seller data", async () => {
            /* steps:-
                Register Seller
                Generate token
                add token to cookie
                check if Seller id matches with registered Seller
            */

            // Arange
            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "@hopCentre1234",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            };
            // Act
            /* Register Seller */

            const hashedPassword = await hashPassword(sellerData.password);
            const sellerRepository = connection.getRepository(Seller);
            const seller = await sellerRepository.save({
                ...sellerData,
                password: hashedPassword,
                role: Roles.SELLER,
            });

            /* Generate token */
            const accessToken = jwks.token({
                sub: String(seller.id),
                role: seller.role,
            });

            /* add token to cookie */
            const response = await request(app)
                .get("/api/v1/auth/seller/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            /* check if Seller id matches with registered Seller */
            expect((response.body as Record<string, string>).id).toBe(
                seller.id,
            );
        });

        it("should not return password of Seller", async () => {
            /* steps:-
                Register Seller
                Generate token
                add token to cookie
                check if Seller id matches with registered Seller
            */

            // Arange
            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "@hopCentre1234",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            };
            // Act
            /* Register Seller */

            const hashedPassword = await hashPassword(sellerData.password);
            const sellerRepository = connection.getRepository(Seller);
            const seller = await sellerRepository.save({
                ...sellerData,
                password: hashedPassword,
                role: Roles.SELLER,
            });

            /* Generate token */
            const accessToken = jwks.token({
                sub: String(seller.id),
                role: seller.role,
            });

            /* add token to cookie */
            const response = await request(app)
                .get("/api/v1/auth/seller/self")
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
                Register Seller
                Generate token
                add token to cookie
                check if Seller id matches with registered Seller
            */

            // Arange
            const sellerData = {
                name: "shopName",
                email: "shop@gmail.com",
                password: "@hopCentre1234",
                phoneNumber: 1234567890,
                address: "Jharkhand, India",
                zipCode: 825555,
            };
            // Act
            /* Register Seller */

            const hashedPassword = await hashPassword(sellerData.password);
            const sellerRepository = connection.getRepository(Seller);
            await sellerRepository.save({
                ...sellerData,
                password: hashedPassword,
                role: Roles.SELLER,
            });

            const response = await request(app)
                .get("/api/v1/auth/seller/self")
                .send();

            // Assert
            expect(response.statusCode).toBe(401);
        });
    });
});
