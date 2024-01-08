import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const privateKey = fs.readFileSync("./certs/privateKey.pem");

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const Jwk = rsaPemToJwk(privateKey, { use: "sig" }, "public");

// eslint-disable-next-line no-console, no-undef
console.log(JSON.stringify(Jwk));
