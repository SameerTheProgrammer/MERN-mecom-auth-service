import { Request } from "express";
import { Jwt } from "jsonwebtoken";

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginUserData {
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface LoginUserRequest extends Request {
    body: LoginUserData;
}

export interface RegisterResponse {
    id: string;
}

export interface Headers {
    ["set-cookie"]: string[];
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload extends Jwt {
    id: string;
}

export interface ISellerData {
    name: string;
    email: string;
    password: string;
    phoneNumber: number;
    address: string;
    zipCode: number;
}

export interface ICreateSellerRequest extends Request {
    body: ISellerData;
}
