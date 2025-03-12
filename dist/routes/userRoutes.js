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
userRoutes.get('/get-user', userAuthMiddleware_1.userAuthMiddleware, userController_1.getUser);
userRoutes.put('/update-user/:id', multerConfig_1.upload.fields([
    { name: 'panCard', maxCount: 5 },
    { name: 'tdsFile', maxCount: 5 },
    { name: 'gstFile', maxCount: 5 },
    { name: 'ndaFile', maxCount: 5 },
    { name: 'dpiitFile', maxCount: 5 },
    { name: 'agreementFile', maxCount: 5 },
    { name: 'qunatifoFile', maxCount: 5 },
    { name: 'udhyanFile', maxCount: 5 },
    { name: 'otherFile', maxCount: 5 }
]), userAuthMiddleware_1.userAuthMiddleware, userController_1.updateUser);
userRoutes.get('/orders', userAuthMiddleware_1.userAuthMiddleware, userController_1.orders);
userRoutes.put('/update-order/:id', userAuthMiddleware_1.userAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'documentProvided', maxCount: 10 }
]), userAuthMiddleware_1.userAuthMiddleware, userController_1.updateOrder);
exports.default = userRoutes;
