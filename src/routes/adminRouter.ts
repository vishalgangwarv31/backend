import { Router } from "express"
import { login , signup , createUser , createContractor , createOrder ,updateOrder ,getUsers , getContractor, forgetPassword, resetPassword, userById, getOrderById, getOrders, updateUser, updateFirm, getContractorById, getAllUsers, getAllFirms, getOrdersByFirm} from '../controller/adminController'
import asyncHandler from 'express-async-handler'
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware"
import { upload } from "../config/multerConfig"

const adminRoutes = Router()

// '/api/admin/

adminRoutes.post('/login', login); // no need
adminRoutes.post('/signup', signup); // no need
adminRoutes.post('/forget-password', forgetPassword); // no need
adminRoutes.post('/reset-password/:id/:token', resetPassword); //updt

//customer
adminRoutes.get('/get-user/:id', userById) // updt
adminRoutes.get('/get-users',adminAuthMiddleware, getUsers); // updted
adminRoutes.get('/get-all-user',adminAuthMiddleware, getAllUsers);
adminRoutes.post('/create-user', adminAuthMiddleware, upload.fields([
    { name: 'tdsFile', maxCount: 10 },
    { name: 'gstFile', maxCount: 10 },
    { name: 'ndaFile', maxCount: 10 },
    { name: 'dpiitFile', maxCount: 10 },
    { name: 'agreementFile', maxCount: 10 },
    { name: 'qunatifoFile', maxCount: 10 },
    { name: 'panCard', maxCount: 10 },
    { name: 'udhyanFile', maxCount: 10 }
  ]), createUser);
adminRoutes.put('/update-user/:id', adminAuthMiddleware, upload.fields([
    { name: 'tdsFile', maxCount: 10 },
    { name: 'gstFile', maxCount: 10 },
    { name: 'ndaFile', maxCount: 10 },
    { name: 'dpiitFile', maxCount: 10 },
    { name: 'agreementFile', maxCount: 10 },
    { name: 'qunatifoFile', maxCount: 10 },
    { name: 'panCard', maxCount: 10 },
    { name: 'udhyanFile', maxCount: 10 }
]), updateUser);


//vendor
adminRoutes.post('/create-contractor', adminAuthMiddleware, upload.fields([
    { name: 'agreementFile', maxCount: 10 },
    { name: 'ndaFile', maxCount: 10 },
    { name : 'other', maxCount: 10}
  ]), createContractor);
adminRoutes.get('/get-contractor', adminAuthMiddleware , getContractor);
adminRoutes.put("/update-contractor/:id", upload.fields([
    { name: 'agreementFile', maxCount: 1 },
    { name: 'ndaFile', maxCount: 1 },
    { name: 'other', maxCount: 1 }
  ]), updateFirm);
adminRoutes.get("/get-contractor/:id",adminAuthMiddleware , getContractorById);
adminRoutes.get('/get-all-vendor',adminAuthMiddleware, getAllFirms);


adminRoutes.post("/create-order", upload.fields([
    { name: 'documentProvided', maxCount: 10 },
    { name: 'invoiceUploaded', maxCount: 10 },
    { name: 'fileUploaded', maxCount: 10 }
  ]), createOrder);  
adminRoutes.put('/update-order/:id',adminAuthMiddleware, upload.fields([
    { name: 'documentProvided', maxCount: 10 },
    { name: 'invoiceUploaded', maxCount: 10 },
    { name: 'fileUploaded', maxCount: 10 }
]), updateOrder); 
adminRoutes.get('/get-order', adminAuthMiddleware , getOrders);//updted
adminRoutes.get('/get-order-vendor/:id', adminAuthMiddleware , getOrdersByFirm);
adminRoutes.get('/order/:id', adminAuthMiddleware,  getOrderById); // updated


export default adminRoutes;