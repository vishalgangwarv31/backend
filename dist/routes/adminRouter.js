"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controller/adminController");
const adminAuthMiddleware_1 = require("../middleware/adminAuthMiddleware");
const multerConfig_1 = require("../config/multerConfig");
const adminRoutes = (0, express_1.Router)();
// '/api/admin/
adminRoutes.post('/login', adminController_1.login); // no need
adminRoutes.post('/signup', adminController_1.signup); // no need
adminRoutes.get('/user-visibility', adminController_1.getUserVisibilitySettings);
adminRoutes.post('/forget-password', adminController_1.forgetPassword); // no need
adminRoutes.post('/reset-password/:id/:token', adminController_1.resetPassword); //updt
//customer
adminRoutes.get('/get-user/:id', adminController_1.userById); // updt
adminRoutes.get('/get-users', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getUsers); // updted
adminRoutes.get('/get-all-user', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getAllUsers);
adminRoutes.post('/create-user', adminAuthMiddleware_1.adminAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'tdsFile', maxCount: 10 },
    { name: 'gstFile', maxCount: 10 },
    { name: 'ndaFile', maxCount: 10 },
    { name: 'dpiitFile', maxCount: 10 },
    { name: 'agreementFile', maxCount: 10 },
    { name: 'qunatifoFile', maxCount: 10 },
    { name: 'panCard', maxCount: 10 },
    { name: 'udhyanFile', maxCount: 10 }
]), adminController_1.createUser);
adminRoutes.put('/update-user/:id', adminAuthMiddleware_1.adminAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'tdsFile', maxCount: 10 },
    { name: 'gstFile', maxCount: 10 },
    { name: 'ndaFile', maxCount: 10 },
    { name: 'dpiitFile', maxCount: 10 },
    { name: 'agreementFile', maxCount: 10 },
    { name: 'qunatifoFile', maxCount: 10 },
    { name: 'panCard', maxCount: 10 },
    { name: 'udhyanFile', maxCount: 10 }
]), adminController_1.updateUser);
adminRoutes.put('/user-update-visibility', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.updateUserVisibilitySettings);
//vendor
adminRoutes.post('/create-contractor', adminAuthMiddleware_1.adminAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'agreementFile', maxCount: 10 },
    { name: 'ndaFile', maxCount: 10 },
    { name: 'other', maxCount: 10 }
]), adminController_1.createContractor);
adminRoutes.get('/get-contractor', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getContractor);
adminRoutes.put("/update-contractor/:id", multerConfig_1.upload.fields([
    { name: 'agreementFile', maxCount: 1 },
    { name: 'ndaFile', maxCount: 1 },
    { name: 'other', maxCount: 1 }
]), adminController_1.updateFirm);
adminRoutes.get("/get-contractor/:id", adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getContractorById);
adminRoutes.get('/get-all-vendor', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getAllFirms);
adminRoutes.post("/create-order", multerConfig_1.upload.fields([
    { name: 'documentProvided', maxCount: 10 },
    { name: 'invoiceUploaded', maxCount: 10 },
    { name: 'fileUploaded', maxCount: 10 }
]), adminController_1.createOrder);
adminRoutes.put('/update-order/:id', adminAuthMiddleware_1.adminAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'documentProvided', maxCount: 10 },
    { name: 'invoiceUploaded', maxCount: 10 },
    { name: 'fileUploaded', maxCount: 10 }
]), adminController_1.updateOrder);
adminRoutes.get('/get-order', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getOrders); //updted
adminRoutes.get('/get-order-vendor/:id', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getOrdersByFirm);
adminRoutes.get('/order/:id', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getOrderById); // updated
exports.default = adminRoutes;
