import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User.entity";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { RegisterResponse } from "../../src/types/index.types";
import { Roles } from "../../src/contants/index.constant";

describe("Post /auth/register", () => {
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
                firstName: "Sameer",
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
                firstName: "Sameer",
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

        it("should return an id of created user", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "sameer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect((response.body as RegisterResponse).id).toBeDefined();
        });

        it("should user have customer role", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "sameer1234",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user[0].role).toBe(Roles.Customer);
        });

        it("should store hashed password in the database", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "sameer1234",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user[0].password).not.toBe(userData.password);
            expect(user[0].password).toHaveLength(60);
            expect(user[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return 400 status code if email is already exists", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "sameer1234",
            };
            const userRespository = connection.getRepository(User);
            await userRespository.save({ ...userData, role: Roles.Customer });
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const user = await userRespository.find();

            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(1);
        });
    });

    // Sad Path
    describe("Fiels are missing", () => {});
});
