import { Router } from "express"
import { login , signup , createUser , createContractor , createOrder ,updateOrder ,getUsers, downloadFile , getContractor , getOrder, getFile, forgetPassword, resetPassword, order} from '../controller/adminController'
import asyncHandler from 'express-async-handler'
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware"
import { upload } from "../config/multerConfig"

const adminRoutes = Router()

// '/api/admin/

adminRoutes.post('/login', login);
adminRoutes.post('/signup', signup);
adminRoutes.post('/forget-password', forgetPassword);
adminRoutes.post('/reset-password/:id/:token', resetPassword);
adminRoutes.post('/create-user', adminAuthMiddleware, createUser);
adminRoutes.post('/create-contractor',adminAuthMiddleware, createContractor);
adminRoutes.post('/create-order',adminAuthMiddleware, createOrder);
adminRoutes.post('/update-order',adminAuthMiddleware, upload.fields([
    { name: 'documentProvided', maxCount: 10 },
    { name: 'invoiceUploaded', maxCount: 10 },
    { name: 'fileUploaded', maxCount: 10 }
]), updateOrder); 

adminRoutes.get('/get-users',adminAuthMiddleware, getUsers);
adminRoutes.get('/get-contractor', adminAuthMiddleware , getContractor);
adminRoutes.get('/download-file', adminAuthMiddleware , downloadFile);
adminRoutes.get('/get-order', adminAuthMiddleware , order);
adminRoutes.get('/order/:id', adminAuthMiddleware,  getOrder);
adminRoutes.get('/file/:folder/:filename',adminAuthMiddleware, getFile);



export default adminRoutes;