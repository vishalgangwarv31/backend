import { Router } from "express"
import { getUser, login, orders , updateUser , updateOrder, downloadFile, forgetPassword, resetPassword } from "../controller/userController";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import { upload } from "../config/multerConfig";

const userRoutes = Router();

userRoutes.post('/login',login);
userRoutes.post('/forget-password', forgetPassword);
userRoutes.post('/reset-password/:id/:token', resetPassword);
userRoutes.post('/update-user', upload.fields([
    { name: 'panCard' },
    { name: 'tdsFile' },
    { name: 'gstFile' },
    { name: 'ndaFile' },
    { name: 'dpiitFile' },
    { name: 'agreementFile' },
    { name: 'qunatifoFile' },
    { name: 'udhyanFile' }
]), userAuthMiddleware,updateUser);
userRoutes.get('/get-user',userAuthMiddleware , getUser);
userRoutes.get('/orders',userAuthMiddleware, orders);
userRoutes.post('/update-order',userAuthMiddleware , upload.fields([
    { name: 'documentProvided', maxCount: 10 }
]), updateOrder);
userRoutes.get('/download-link',userAuthMiddleware, downloadFile)


export default userRoutes;