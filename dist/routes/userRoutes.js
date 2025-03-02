"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controller/userController");
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const multerConfig_1 = require("../config/multerConfig");
const userRoutes = (0, express_1.Router)();
userRoutes.post('/login', userController_1.login);
userRoutes.post('/forget-password', userController_1.forgetPassword);
userRoutes.post('/reset-password/:id/:token', userController_1.resetPassword);
userRoutes.post('/update-user', multerConfig_1.upload.fields([
    { name: 'panCard' },
    { name: 'tdsFile' },
    { name: 'gstFile' },
    { name: 'ndaFile' },
    { name: 'dpiitFile' },
    { name: 'agreementFile' },
    { name: 'qunatifoFile' },
    { name: 'udhyanFile' }
]), userAuthMiddleware_1.userAuthMiddleware, userController_1.updateUser);
userRoutes.get('/get-user', userAuthMiddleware_1.userAuthMiddleware, userController_1.getUser);
userRoutes.get('/orders', userAuthMiddleware_1.userAuthMiddleware, userController_1.orders);
userRoutes.post('/update-order', userAuthMiddleware_1.userAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'documentProvided', maxCount: 10 }
]), userController_1.updateOrder);
userRoutes.get('/download-link', userAuthMiddleware_1.userAuthMiddleware, userController_1.downloadFile);
exports.default = userRoutes;
