"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firmController_1 = require("../controller/firmController");
const firmAuthMiddleware_1 = require("../middleware/firmAuthMiddleware");
const multerConfig_1 = require("../config/multerConfig");
const firmRouter = (0, express_1.Router)();
firmRouter.post('/login', firmController_1.login);
firmRouter.post('/update-firm', firmAuthMiddleware_1.firmAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'agreementFile' },
    { name: 'ndaFile' }
]), firmController_1.updateFirm);
firmRouter.get('/get-firm', firmAuthMiddleware_1.firmAuthMiddleware, firmController_1.getFirm);
firmRouter.get('/order', firmAuthMiddleware_1.firmAuthMiddleware, firmController_1.orders);
firmRouter.post('/update-order', firmAuthMiddleware_1.firmAuthMiddleware, multerConfig_1.upload.fields([
    { name: 'invoiceUploaded', maxCount: 10 },
    { name: 'fileUploaded', maxCount: 10 }
]), firmController_1.updateOrder);
firmRouter.get('/download-link', firmAuthMiddleware_1.firmAuthMiddleware, firmController_1.downloadFile);
exports.default = firmRouter;
