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

export const getUser = async (req : Request , res : Response): Promise<void> =>{
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
        const files = {
            panCard: user.panCard ? await getPublicUrl(user.panCard as string) : null,
            tdsFile: user.tdsFile ? await getPublicUrl(user.tdsFile as string) : null,
            gstFile: user.gstFile ? await getPublicUrl(user.gstFile as string ) : null,
            ndaFile: user.ndaFile ? await getPublicUrl(user.ndaFile as string) : null,
            dpiitFile: user.dpiitFile ? await getPublicUrl(user.dpiitFile as string) : null,
            agreementFile: user.agreementFile ?await getPublicUrl(user.agreementFile as string) : null,
            qunatifoFile: user.qunatifoFile ?await getPublicUrl(user.qunatifoFile as string) : null,
            udhyanFile: user.udhyanFile ?await getPublicUrl(user.udhyanFile as string) : null
        };

        res.status(200).json({
            user,
            files
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't retrieve user, something went wrong"
        });
    }
}


export const orders = async (req : Request , res : Response) => {
    try {
        const user = (req as IGetUserAuthInfoRequest).user;
        const myOrders = await prisma.order.findMany({
            where : {
                userId : user.id
            }
        })

        res.status(200).json({
            myOrders,
            message : "these are ur order"
        })
    } catch (error) {
        res.status(400).json({
            message : "something went wrong"
        })
    }
}

interface MulterFiles {
    panCard?: Express.Multer.File[];
    tdsFile?: Express.Multer.File[];
    gstFile?: Express.Multer.File[];
    ndaFile?: Express.Multer.File[];
    dpiitFile?: Express.Multer.File[];
    agreementFile?: Express.Multer.File[];
    qunatifoFile?: Express.Multer.File[];
    udhyanFile?: Express.Multer.File[];
}

export const updateUser = async (req: Request, res: Response):Promise<void> => {
    try {
        const temp = (req as IGetUserAuthInfoRequest).user;
        const id = temp.id;
        const gstNumber = req.body.gstNumber;
        const name = req.body.name;
        const type = req.body.type;
        const pocPhone = req.body.pocPhone;
        const pocName = req.body.pocName;
        const dpiit = req.body.dpiit;
        const dpiitDate = req.body.dpiitDate;

        const files = req.files as MulterFiles;
        const panCardFile = files.panCard?.[0];
        const tdsFile = files.tdsFile?.[0];
        const gstFile = files.gstFile?.[0];
        const ndaFile = files.ndaFile?.[0];
        const dpiitFile = files.dpiitFile?.[0];
        const agreementFile = files.agreementFile?.[0];
        const qunatifoFile = files.qunatifoFile?.[0];
        const udhyanFile = files.udhyanFile?.[0];

        let panCardPath: string | null = null;
        let tdsFilePath: string | null = null;
        let gstFilePath: string | null = null;
        let ndaFilePath: string | null = null;
        let dpiitFilePath: string | null = null;
        let agreementFilePath: string | null = null;
        let qunatifoFilePath: string | null = null;
        let udhyanFilePath: string | null = null;

        let dpiitBool;
        if (dpiit === "true") {
            dpiitBool = true;
        } else {
            dpiitBool = false;
        }

        if (panCardFile) {
            panCardPath = await uploadFile(panCardFile, 'pancards');
        }

        if (tdsFile) {
            tdsFilePath = await uploadFile(tdsFile, 'tdsfiles');
        }

        if (gstFile) {
            gstFilePath = await uploadFile(gstFile, 'gstfiles');
        }

        if (ndaFile) {
            ndaFilePath = await uploadFile(ndaFile, 'ndafiles');
        }

        if (dpiitFile) {
            dpiitFilePath = await uploadFile(dpiitFile, 'dpiitfiles');
        }

        if (agreementFile) {
            agreementFilePath = await uploadFile(agreementFile, 'agreementfiles');
        }

        if (qunatifoFile) {
            qunatifoFilePath = await uploadFile(qunatifoFile, 'qunatifofiles');
        }

        if (udhyanFile) {
            udhyanFilePath = await uploadFile(udhyanFile, 'udhyanfiles');
        }

        // Validate and parse dpiitDate
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
                panCard: panCardPath,
                tdsFile: tdsFilePath,
                gstFile: gstFilePath,
                ndaFile: ndaFilePath,
                dpiitFile: dpiitFilePath,
                agreementFile: agreementFilePath,
                qunatifoFile: qunatifoFilePath,
                udhyanFile: udhyanFilePath
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
        const id = (req as IGetUserAuthInfoRequest).user.id;
        const orderId = parseInt(req.body.orderId);

        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId, userId: id }
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

        const nextActionClient = req.body.nextActionClient;

        const order = await prisma.order.update({
            where: {
                id: orderId,
                userId: id
            },
            data: {
                documentProvided: updatedDocumentProvided,
                nextActionClient: nextActionClient
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


export const downloadFile = async (req : Request, res: Response) =>{
    try {
        const id = (req as IGetUserAuthInfoRequest).user.id;
        const orderId = parseInt(req.body.orderId);

        

        const path = req.body.path;
        const downloadURL =await getPublicUrl(path);
        res.status(200).json({
            message : "this is ur download link",
            downloadURL
        })
    } catch (error) {
        res.json(404).json({
            message : "cant download this now"
        })
    }
}

