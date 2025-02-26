"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.ADMIN_AUTH_JWT;
if (!JWT_SECRET) {
    throw new Error("missing jwt secret key for admin auth middleware");
}
const adminAuthMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({
            error: "Access denied, no token provided"
        });
        return;
    }
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({
            error: "invalid or expired token"
        });
        return;
    }
};
exports.adminAuthMiddleware = adminAuthMiddleware;
