import { Request } from "express";
import { Jwt } from "jsonwebtoken";

// register user
export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface RegisterResponse {
    id: string;
}

// login user
export interface LoginUserData {
    email: string;
    password: string;
}

export interface LoginUserRequest extends Request {
    body: LoginUserData;
}

// cookies
export interface Headers {
    ["set-cookie"]: string[];
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload extends Jwt {
    id: string;
}

// authentication middleware
export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}

// seller create
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

export interface IUpdateSellerRequest extends Request {
    body: ISellerData;
}

// seller login
export interface LoginSellerData {
    email: string;
    password: string;
}

export interface LoginSellerRequest extends Request {
    body: LoginSellerData;
}
