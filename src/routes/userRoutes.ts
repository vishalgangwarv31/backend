import { Router } from "express"
import { getUser, login, orders , updateUser , updateOrder, forgetPassword, resetPassword } from "../controller/userController";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import { upload } from "../config/multerConfig";

const userRoutes = Router();

userRoutes.post('/login',login);
userRoutes.post('/forget-password', forgetPassword);
userRoutes.post('/reset-password/:id/:token', resetPassword);

userRoutes.get('/get-user',userAuthMiddleware , getUser);
userRoutes.put('/update-user/:id', upload.fields([
    { name: 'panCard', maxCount: 5 },
    { name: 'tdsFile', maxCount: 5 },
    { name: 'gstFile', maxCount: 5 },
    { name: 'ndaFile', maxCount: 5 },
    { name: 'dpiitFile', maxCount: 5 },
    { name: 'agreementFile', maxCount: 5 },
    { name: 'qunatifoFile', maxCount: 5 },
    { name: 'udhyanFile', maxCount: 5 },
    { name: 'otherFile', maxCount: 5 }
    ]), userAuthMiddleware , updateUser);
userRoutes.get('/orders',userAuthMiddleware, orders);
userRoutes.put('/update-order/:id',userAuthMiddleware , upload.fields([
    { name: 'documentProvided', maxCount: 10 }
]), userAuthMiddleware , updateOrder);


export default userRoutes;