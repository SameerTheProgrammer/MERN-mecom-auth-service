import request from "supertest";
import app from "../../src/app";

describe("Post /auth/register", () => {
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
    });

    // Sad Path
    describe("Fiels are missing", () => {});
});
