import request from "supertest";
import { calcualteDiscount } from "./src/utils";
import app from "./src/app";

describe.skip("App", () => {
    it("should calculate the discount", () => {
        const result = calcualteDiscount(100, 10);
        expect(result).toBe(10);
    });

    it("should return 200 status code", async () => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    });
});
