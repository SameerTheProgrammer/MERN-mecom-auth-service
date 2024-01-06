import { DataSource } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;

    for (const entity of entities) {
        const respository = connection.getRepository(entity.name);
        await respository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    if (token === null) return false;

    /* Every jwt token has 3 part --> methods ,data and secret */
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    /* Each part of jwt token is encoded with base64 so, here we check 
    that token is valid base64 or not by converting it to normal utf-8 string */
    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
    } catch (error) {
        return false;
    }

    return true;
};
