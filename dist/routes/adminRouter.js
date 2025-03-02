"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controller/adminController");
const adminAuthMiddleware_1 = require("../middleware/adminAuthMiddleware");
const multerConfig_1 = require("../config/multerConfig");
const adminRoutes = (0, express_1.Router)();
// '/api/admin/
adminRoutes.post('/login', adminController_1.login);
adminRoutes.post('/signup', adminController_1.signup);
adminRoutes.post('/forget-password', adminController_1.forgetPassword);
adminRoutes.post('/reset-password/:id/:token', adminController_1.resetPassword);
adminRoutes.post('/create-user', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.createUser);
adminRoutes.post('/create-contractor', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.createContractor);
adminRoutes.post('/create-order', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.createOrder);
adminRoutes.post('/update-order', adminAuthMiddleware_1.adminAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'documentProvided', maxCount: 10 },
    { name: 'invoiceUploaded', maxCount: 10 },
    { name: 'fileUploaded', maxCount: 10 }
]), adminController_1.updateOrder);
adminRoutes.get('/get-users', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getUsers);
adminRoutes.get('/get-contractor', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getContractor);
adminRoutes.get('/download-file', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.downloadFile);
adminRoutes.get('/order/:id', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getOrder);
adminRoutes.get('/file/:folder/:filename', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getFile);
exports.default = adminRoutes;
