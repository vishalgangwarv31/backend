import { Request , Response } from "express";
import { sign, verify } from "jsonwebtoken";
import prisma from "../prisma/client";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { IGetUserAuthInfoRequest } from "../config/definationFile";
import { uploadFile , getPublicUrl } from "../utils/uploadFile";
import nodemailer from 'nodemailer'

dotenv.config();
const JWT_SECRET = process.env.USER_AUTH_JWT as string;
const APP_PASSWORD = process.env.APP_PASSWORD as string;

export const login = async (req: Request , res : Response ): Promise<void> =>{
    try {
        const email = req.body.email;
        const pass = req.body.password;

        const existingUser = await prisma.user.findUnique({
            where : { email : email}
        })
        
        if (existingUser === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        
        const isMatch = await bcrypt.compare(pass, existingUser?.password as string);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = sign(
            { id: existingUser.id , email : existingUser.email},
            JWT_SECRET,
            { expiresIn: "3d" } 
        )

        res.status(200).json({
            message: "user Login successful",
            token,
            admin: { id: existingUser?.id, email: existingUser?.email }
    });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
}

export const forgetPassword = async( req : Request , res : Response): Promise<void> =>{
    try {
        const {email} = req.body;
        const oldUser = await prisma.user.findUnique({
            where : {email : email}
        })

        if(!oldUser){
            res.sendStatus(200).json({message : "user doesnt exist"})
            return;
        }

        const secert = JWT_SECRET + oldUser.password;
        const token = sign({email: oldUser.email, id : oldUser.id},secert, {expiresIn : "10m"});
        const link =  `http://localhost:5174/api/user/reset-password/${oldUser.id}/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'vishalgangwar8696@gmail.com',
              pass: `${APP_PASSWORD}`
            }
          });
          
          const mailOptions = {
            from: 'youremail@gmail.com',
            to: 'g.vishal.8696@gmail.com',
            subject: 'Reset Password (valid for 10 mins)',
            text: `click on the link below to change your user password ${link}`
          };
          
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent');
            }
          });
          
        res.status(200).json({
            message : "reset link is sent to your mail"
        })
    } catch (error) {
        res.status(404).json({message : "cant update password now"})
    }
}

export const resetPassword = async (req : Request , res : Response) : Promise<void>=>{
    const id = parseInt(req.params.id);
const token = req.params.token;
const password = req.body.password;

const oldUser = await prisma.user.findUnique({
    where: { id: id }
});

if (!oldUser) {
    res.json({
        message: "user doesn't exist"
    });
    return;
}

const secret = JWT_SECRET + oldUser?.password;

try {
    const check = verify(token, secret);
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword);

    const newUser = await prisma.user.update({
        where: { id: id },
        data: {
            password: hashedPassword
        }
    });
    console.log(newUser);

    res.json({
        message: "password changed"
    });
    return;
} catch (error) {
    res.json({
        message: "something went wrong"
    });
}

}

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const temp = (req as IGetUserAuthInfoRequest).user;
      const userId = temp.id;
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
  
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      const getFileUrls = async (files: string[]) => {
        return await Promise.all(files.map(file => getPublicUrl(file)));
      };
  
      const files = {
        panCard: user.panCard ? await getFileUrls(user.panCard) : [],
        tdsFile: user.tdsFile ? await getFileUrls(user.tdsFile) : [],
        gstFile: user.gstFile ? await getFileUrls(user.gstFile) : [],
        ndaFile: user.ndaFile ? await getFileUrls(user.ndaFile) : [],
        dpiitFile: user.dpiitFile ? await getFileUrls(user.dpiitFile) : [],
        agreementFile: user.agreementFile ? await getFileUrls(user.agreementFile) : [],
        qunatifoFile: user.qunatifoFile ? await getFileUrls(user.qunatifoFile) : [],
        udhyanFile: user.udhyanFile ? await getFileUrls(user.udhyanFile) : [],
        otherFile: user.otherFile ? await getFileUrls(user.otherFile) : []
      };
  
      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          createdAt: user.createdAt,
          type: user.type,
          pocPhone: user.pocPhone,
          pocName: user.pocName,
          gstNumber: user.gstNumber,
          dpiit: user.dpiit,
          dpiitDate: user.dpiitDate,
          isDeleted: user.isDeleted,
        },
        files
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Can't retrieve user, something went wrong"
      });
    }
  };
  
export const orders = async (req: Request, res: Response) => {
    try {
        const user = (req as IGetUserAuthInfoRequest).user;
        const { cursor, limit } = req.query;
        const pageSize = parseInt(limit as string) || 10;

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            take: pageSize + 1,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: parseInt(cursor as string) } : undefined,
        });

        const hasNextPage = orders.length > pageSize;
        if (hasNextPage) orders.pop();

        const getFileUrls = async (files: string[]) => {
            return await Promise.all(files.map(file => getPublicUrl(file)));
        };

        const ordersWithFileLinks = await Promise.all(orders.map(async (order) => {
            const documentProvidedUrls = await getFileUrls(order.documentProvided);
            const invoiceUploadedUrls = await getFileUrls(order.invoiceUploaded);
            const fileUploadedUrls = await getFileUrls(order.fileUploaded);

            return {
                ...order,
                documentProvided: documentProvidedUrls,
                invoiceUploaded: invoiceUploadedUrls,
                fileUploaded: fileUploadedUrls
            };
        }));

        res.status(200).json({
            orders: ordersWithFileLinks,
            nextCursor: hasNextPage ? orders[orders.length - 1].id : null,
            hasNextPage
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong"
        });
    }
};


interface MulterFiles {
    panCard?: Express.Multer.File[];
    tdsFile?: Express.Multer.File[];
    gstFile?: Express.Multer.File[];
    ndaFile?: Express.Multer.File[];
    dpiitFile?: Express.Multer.File[];
    agreementFile?: Express.Multer.File[];
    qunatifoFile?: Express.Multer.File[];
    udhyanFile?: Express.Multer.File[];
    otherFile?: Express.Multer.File[];
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const gstNumber = req.body.gstNumber;
        const name = req.body.name;
        const type = req.body.type;
        const pocPhone = req.body.pocPhone;
        const pocName = req.body.pocName;
        const dpiit = req.body.dpiit;
        const dpiitDate = req.body.dpiitDate;

        const files = req.files as MulterFiles;
        const panCardFiles = files.panCard || [];
        const tdsFiles = files.tdsFile || [];
        const gstFiles = files.gstFile || [];
        const ndaFiles = files.ndaFile || [];
        const dpiitFiles = files.dpiitFile || [];
        const agreementFiles = files.agreementFile || [];
        const qunatifoFiles = files.qunatifoFile || [];
        const udhyanFiles = files.udhyanFile || [];
        const otherFiles = files.otherFile || [];

        const uploadPromises = [
            ...panCardFiles.map(file => uploadFile(file, 'pancards')),
            ...tdsFiles.map(file => uploadFile(file, 'tdsfiles')),
            ...gstFiles.map(file => uploadFile(file, 'gstfiles')),
            ...ndaFiles.map(file => uploadFile(file, 'ndafiles')),
            ...dpiitFiles.map(file => uploadFile(file, 'dpiitfiles')),
            ...agreementFiles.map(file => uploadFile(file, 'agreementfiles')),
            ...qunatifoFiles.map(file => uploadFile(file, 'qunatifofiles')),
            ...udhyanFiles.map(file => uploadFile(file, 'udhyanfiles')),
            ...otherFiles.map(file => uploadFile(file, 'otherfiles'))
        ];

        const filePaths = await Promise.all(uploadPromises);

        const dpiitBool = dpiit === "true";

        let parsedDpiitDate: Date | null = null;
        if (dpiitDate) {
            parsedDpiitDate = new Date(dpiitDate);
            if (isNaN(parsedDpiitDate.getTime())) {
                res.status(400).json({ message: "Invalid dpiitDate format. Expected ISO-8601 DateTime." });
                return;
            }
        }

        const order = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                name: name,
                gstNumber: gstNumber,
                type: type,
                pocPhone: pocPhone,
                pocName: pocName,
                dpiit: dpiitBool,
                dpiitDate: parsedDpiitDate,
                panCard: panCardFiles.map((_, index) => filePaths[index]),
                tdsFile: tdsFiles.map((_, index) => filePaths[panCardFiles.length + index]),
                gstFile: gstFiles.map((_, index) => filePaths[panCardFiles.length + tdsFiles.length + index]),
                ndaFile: ndaFiles.map((_, index) => filePaths[panCardFiles.length + tdsFiles.length + gstFiles.length + index]),
                dpiitFile: dpiitFiles.map((_, index) => filePaths[panCardFiles.length + tdsFiles.length + gstFiles.length + ndaFiles.length + index]),
                agreementFile: agreementFiles.map((_, index) => filePaths[panCardFiles.length + tdsFiles.length + gstFiles.length + ndaFiles.length + dpiitFiles.length + index]),
                qunatifoFile: qunatifoFiles.map((_, index) => filePaths[panCardFiles.length + tdsFiles.length + gstFiles.length + ndaFiles.length + dpiitFiles.length + agreementFiles.length + index]),
                udhyanFile: udhyanFiles.map((_, index) => filePaths[panCardFiles.length + tdsFiles.length + gstFiles.length + ndaFiles.length + dpiitFiles.length + agreementFiles.length + qunatifoFiles.length + index]),
                otherFile: otherFiles.map((_, index) => filePaths[panCardFiles.length + tdsFiles.length + gstFiles.length + ndaFiles.length + dpiitFiles.length + agreementFiles.length + qunatifoFiles.length + udhyanFiles.length + index])
            }
        });

        res.status(200).json({
            message: "User updated",
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't update user, something went wrong"
        });
    }
};


interface UploadMulterFiles{
    documentProvided?: Express.Multer.File[];
}

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as IGetUserAuthInfoRequest).user.id;
        const orderId = parseInt(req.params.id);
        // console.log(userId, orderId)     

        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId, userId: userId }
        });

        if (!existingOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        const files = req.files as UploadMulterFiles;
        const documentProvidedFiles = files.documentProvided || [];

        const documentProvidedPaths = await Promise.all(
            documentProvidedFiles.map(file => uploadFile(file, 'documentsProvided'))
        );

        const updatedDocumentProvided = [
            ...existingOrder.documentProvided,
            ...documentProvidedPaths
        ];


        const {
            dateOfOrder,
            typeOfOrder,
            payementExpected,
            amountCharged,
            amountPaid,
            orderStatus,
            commentStatusCycle,
            dateOdExpectation,
            nextActionLawyer,
            nextActionClient,
            govtAppNumber,
            dateOfFilling,
            inmNumber,
            orderCompleteDate
        } = req.body;

        const order = await prisma.order.update({
            where: {
                id: orderId,
                userId: userId
            },
            data: {
                dateOfOrder: dateOfOrder || existingOrder.dateOfOrder,
                typeOfOrder: typeOfOrder || existingOrder.typeOfOrder,
                payementExpected: payementExpected || existingOrder.payementExpected,
                amountCharged: amountCharged !== undefined ? parseFloat(amountCharged) : existingOrder.amountCharged,
                amountPaid: amountPaid !== undefined ? parseFloat(amountPaid) : existingOrder.amountPaid,
                orderStatus: orderStatus || existingOrder.orderStatus,
                commentStatusCycle: commentStatusCycle ? commentStatusCycle.split(',').map((item: string) => item.trim()) : existingOrder.commentStatusCycle,
                dateOdExpectation: dateOdExpectation || existingOrder.dateOdExpectation,
                documentProvided: updatedDocumentProvided,
                nextActionLawyer: nextActionLawyer || existingOrder.nextActionLawyer,
                nextActionClient: nextActionClient || existingOrder.nextActionClient,
                govtAppNumber: govtAppNumber !== undefined ? parseInt(govtAppNumber) : existingOrder.govtAppNumber,
                dateOfFilling: dateOfFilling || existingOrder.dateOfFilling,
                inmNumber: inmNumber || existingOrder.inmNumber,
                orderCompleteDate: orderCompleteDate || existingOrder.orderCompleteDate
            }
        });

        res.status(200).json({
            message: "Order updated",
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't update order, something went wrong"
        });
    }
};
