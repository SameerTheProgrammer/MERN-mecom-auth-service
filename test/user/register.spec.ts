import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTables } from "../../src/utils/index";

describe("Post /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    // Happy Path
    describe("Given all field", () => {
        it("should Status Code to be 201", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "sameer123",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            expect(response.status).toBe(201);
        });

        it("should return valid json response", async () => {
            // Arange
            const userData = {
                firstName: "sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "sameer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should presist the user data in the database", async () => {
            // Arange
            const userData = {
                firstName: "sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "sameer1234",
            };
            // Act
            await request(app).post("/auth/register").send(userData);
            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(1);
            expect(user[0].firstName).toBe(userData.firstName);
            expect(user[0].lastName).toBe(userData.lastName);
            expect(user[0].email).toBe(userData.email);
        });
    });

    // Sad Path
    describe("Fiels are missing", () => {});
});
