import { Request } from "express";
import { Jwt } from "jsonwebtoken";

/* ==============  User  ======================= */
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

/* ==============  Seller ======================= */
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

// update basic seller data
export interface IBasicSellerData {
    name: string;
    password: string;
    description: string;
    phoneNumber: number;
    address: string;
    zipCode: number;
}

export interface IUpdateInfoSellerRequest extends AuthRequest {
    body: IBasicSellerData;
}

/* ==============  Admin ======================= */
// update basic seller data
export interface IBasicAdminData {
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber: number;
}

export interface IUpdateInfoAdminRequest extends AuthRequest {
    body: IBasicAdminData;
}

/* ============= Common ================== */
// login
export interface LoginData {
    email: string;
    password: string;
}

export interface LoginRequest extends Request {
    body: LoginData;
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
