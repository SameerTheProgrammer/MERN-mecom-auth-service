import request from "supertest";
import { DataSource } from "typeorm";

import app from "../../src/app";
import { User } from "../../src/entity/User.entity";
import { AppDataSource } from "../../src/config/data-source";
import { Headers, RegisterResponse } from "../../src/types/index.types";
import { Roles } from "../../src/contants/index.constant";
import { isJwt } from "../../src/utils/index.utlis";

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
                password: "S@meer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "S@meer1234",
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
                password: "S@meer1234",
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
                password: "S@meer1234",
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
                password: "S@meer1234",
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
                password: "S@meer1234",
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
                password: "S@meer1234",
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

        it("should return the refresh token and access token inside a cookie", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "S@meer1234",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            let accessToken = null;
            let refreshToken = null;

            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(":")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(":")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
        });

        it("should return true if jwt token is valid", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "S@meer1234",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            let accessToken = null;
            let refreshToken = null;

            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(":")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(":")[0].split("=")[1];
                }
            });

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
    });

    // Sad Path
    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "",
                password: "S@meer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(0);
        });

        it("should return 400 status code if first name field is missing", async () => {
            // Arange
            const userData = {
                firstName: "",
                lastName: "Kumar",
                email: "sameer",
                password: "S@meer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(0);
        });

        it("should return 400 status code if last name field is missing", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "",
                email: "sameer",
                password: "S@meer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(0);
        });

        it("should return 400 status code if password field is missing", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer",
                password: "",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the all fields", async () => {
            // Arange
            const userData = {
                firstName: "    Sameer",
                lastName: "Kumar    ",
                email: "sameer@gmail.com   ",
                password: "   S@meer1234   ",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user[0].firstName).not.toBe(userData.firstName);
            expect(user[0].firstName).toBe("Sameer");

            expect(user[0].lastName).not.toBe(userData.lastName);
            expect(user[0].lastName).toBe("Kumar");

            expect(user[0].email).not.toBe(userData.email);
            expect(user[0].email).toBe("sameer@gmail.com");
        });

        it("should return 400 status code if email is not a valid", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameergmail.com",
                password: "S@meer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if Lastname is not a valid", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "K",
                email: "sameer@gmail.com",
                password: "S@meer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if Firstname is not a valid", async () => {
            // Arange
            const userData = {
                firstName: "S",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "S@meer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password length is less than 10", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "S@meer123",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password doesn't have 1 Symbol", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "Sameer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password doesn't have 1 Uppercase", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "s@meer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password doesn't have 1 Lowercase", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "S@MEER1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password doesn't have 1 Numric value", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: "S@meerKumar",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(0);
            expect(response.statusCode).toBe(400);
        });
    });

    describe("format of error received from express validator", () => {
        it("should return an array of errors", async () => {
            // Arange
            const userData = {
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail",
                password: "Smeer1234",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const responseBody = JSON.parse(response.text);

            // Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(response.statusCode).toBe(400);
            expect(user).toHaveLength(0);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(responseBody.errors).toBeDefined();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(responseBody.errors).toEqual([
                {
                    type: "field",
                    value: "sameer@gmail",
                    msg: "Invalid Email",
                    path: "email",
                    location: "body",
                },
                {
                    type: "field",
                    value: "Smeer1234",
                    msg: "Password should be at least 10 chars",
                    path: "password",
                    location: "body",
                },
                {
                    type: "field",
                    value: "Smeer1234",
                    msg: "Password should be strong which have one symbol, number, uppercase and lowercase",
                    path: "password",
                    location: "body",
                },
            ]);
        });
    });
});
