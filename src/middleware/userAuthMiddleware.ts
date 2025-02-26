import { Request , Response , NextFunction } from "express";
import { verify } from "jsonwebtoken";
import dotenv from "dotenv"
import { IGetUserAuthInfoRequest } from "../config/definationFile";

dotenv.config();

const JWT_SECRET = process.env.USER_AUTH_JWT as string;

if(!JWT_SECRET) {
    throw new Error("missing jwt secret key for admin auth middleware")
}

interface DecodedToken {
    id : number,
    email : string;
}

export const userAuthMiddleware = ( req: Request , res : Response , next : NextFunction ) : void =>{
    const token = req.header("Authorization")?.split(" ")[1];

    if(!token) {
        res.status(401).json({
            error : "Access denied, no token provided"
        })
        return;
    }

    try {
        const decoded = verify(token,JWT_SECRET) as DecodedToken;
        (req as IGetUserAuthInfoRequest).user = decoded;
        next();

    } catch (error) {
        res.status(403).json({
            error : "invalid or expired token"
        })
        return;
    }
}

