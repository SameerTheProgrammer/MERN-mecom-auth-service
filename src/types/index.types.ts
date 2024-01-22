import { Request } from "express";
import { Jwt } from "jsonwebtoken";

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

// update basic info of user
export interface basicUserData {
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber: number;
}

export interface IUpdateInfoUserRequest extends AuthRequest {
    body: basicUserData;
}

// login
export interface LoginData {
    email: string;
    password: string;
}

export interface LoginRequest extends Request {
    body: LoginData;
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
