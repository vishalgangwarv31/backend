import { Router } from "express";
import { login, orders, updateFirm , getFirm, updateOrder , downloadFile } from "../controller/firmController";
import { firmAuthMiddleware } from "../middleware/firmAuthMiddleware";
import { upload } from "../config/multerConfig";

const firmRouter = Router();

firmRouter.post('/login',login);
firmRouter.post('/update-firm',firmAuthMiddleware, upload.fields([
    { name: 'agreementFile' },
    { name: 'ndaFile' }
]), updateFirm);

firmRouter.get('/get-firm',firmAuthMiddleware, getFirm)
firmRouter.get('/order', firmAuthMiddleware , orders);
firmRouter.post('/update-order',firmAuthMiddleware, upload.fields([
    { name: 'invoiceUploaded', maxCount: 10 },
    { name: 'fileUploaded', maxCount: 10 }
]),updateOrder);
firmRouter.get('/download-link',firmAuthMiddleware, downloadFile)

export default firmRouter;