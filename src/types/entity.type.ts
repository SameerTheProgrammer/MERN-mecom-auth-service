export enum Roles {
    CUSTOMER = "customer",
    ADMIN = "admin",
    SELLER = "seller",
    DELIVERYBOY = "deliveryBoy",
}

export interface Avatar {
    public_id: string;
    url: string;
}
