import { Request , Response } from "express";
import { sign, verify } from "jsonwebtoken";
import prisma from "../prisma/client";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { IGetUserAuthInfoRequest } from "../config/definationFile";
import { uploadFile , getPublicUrl} from "../utils/uploadFile";
import nodemailer from 'nodemailer'

dotenv.config();
const JWT_SECRET = process.env.FIRM_AUTH_JWT as string;
const APP_PASSWORD = process.env.APP_PASSWORD as string;

export const login = async (req: Request , res : Response ): Promise<void> =>{
    try {
        const email = req.body.email;
        const pass = req.body.password;

        const existingFirm = await prisma.firm.findUnique({
            where : { email : email}
        })
        
        if (existingFirm === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        
        const isMatch = await bcrypt.compare(pass, existingFirm?.password as string);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = sign(
            { id: existingFirm.id , email : existingFirm.email},
            JWT_SECRET,
            { expiresIn: "3d" } 
        )

        res.status(200).json({
            message: "firm Login successful",
            token,
            admin: { id: existingFirm?.id, email: existingFirm?.email }
    });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
}

export const forgetPassword = async( req : Request , res : Response): Promise<void> =>{
    try {
        const {email} = req.body;
        const oldUser = await prisma.firm.findUnique({
            where : {email : email}
        })

        if(!oldUser){
            res.sendStatus(200).json({message : "firm doesnt exist"})
            return;
        }

        const secert = JWT_SECRET + oldUser.password;
        const token = sign({email: oldUser.email, id : oldUser.id},secert, {expiresIn : "10m"});
        const link =  `http://localhost:5174/api/firm/reset-password/${oldUser.id}/${token}`;

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
            text: `click on the link below to change your firm password ${link}`
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

        const oldUser = await prisma.firm.findUnique({
            where: { id: id }
        });

        if (!oldUser) {
            res.json({
                message: "firm doesn't exist"
            });
            return;
        }

        const secret = JWT_SECRET + oldUser?.password;

        try {
            const check = verify(token, secret);
            const hashedPassword = await bcrypt.hash(password, 10);
            // console.log(hashedPassword);

            const newUser = await prisma.firm.update({
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

interface MulterFiles {
    agreementFile?: Express.Multer.File[];
    ndaFile?: Express.Multer.File[];
}

export const updateFirm = async (req: Request, res: Response) => {
    try {
        const id = (req as IGetUserAuthInfoRequest).user.id;
        const {name , workType, startup } = req.body;

        const files = req.files as MulterFiles;
        const agreementFile = files.agreementFile?.[0];
        const ndaFile = files.ndaFile?.[0];

        let agreementFilePath: string | null = null;
        let ndaFilePath: string | null = null;

        if (agreementFile) {
            agreementFilePath = await uploadFile(agreementFile, 'agreement');
        }

        if (ndaFile) {
            ndaFilePath = await uploadFile(ndaFile, 'nda');
        }

        const updateData: any = {};
        if(name !== undefined) updateData.name = name;
        if (workType !== undefined) updateData.workType = workType;
        if (startup !== undefined) updateData.startup = startup === "true";
        if (agreementFilePath !== null) updateData.agreementFile = agreementFilePath;
        if (ndaFilePath !== null) updateData.ndaFile = ndaFilePath;

        const updatedFirm = await prisma.firm.update({
            where: { id: id },
            data: updateData
        });

        res.status(200).json({
            message: "Firm updated",
            updatedFirm
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({
            message: "Can't update your firm, something went wrong"
        });
    }
};

export const getFirm = async( req :Request , res : Response) =>{
    try {
        const id = (req as IGetUserAuthInfoRequest).user.id;

        const firm = await prisma.firm.findUnique({
            where : {id: id}
        })

        if (!firm) {
            res.status(404).json({ message: "firm not found" });
            return;
        }

        const files = {
            agrement: firm.agreementFile ? await getPublicUrl(firm.agreementFile as string) : null,
            tdsFile: firm.ndaFile ? await getPublicUrl(firm.ndaFile as string) : null,
        }

        res.status(200).json({
            firm,
            files
        }) 

    } catch (error) {
        res.status(404).json({
            message : " something went wrong"
        })
    }
}

export const orders = async (req : Request , res : Response) => {
    try {
        const user = (req as IGetUserAuthInfoRequest).user;
        const myOrders = await prisma.order.findMany({
            where : {
                firmId : user.id
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

interface UpdateMulterFiles {
    invoiceUploaded?: Express.Multer.File[];
    fileUploaded?: Express.Multer.File[];
}

export const updateOrder = async (req: Request, res: Response) : Promise<void> => {
    try {
        const firmId = (req as IGetUserAuthInfoRequest).user.id;
        const id = parseInt(req.body.orderId);

        const {
            orderStatus,
            newCommentStatus,
            lawyerReferenceNumber,
            nextActionLawyer,
            govtAppNumber,
            dateOfFilling,
            inmNumber
        } = req.body;

        const lawyerReferenceNumber2 = parseInt(lawyerReferenceNumber);

        const existingOrder = await prisma.order.findUnique({
            where: { id: id, firmId: firmId }
        });

        if (!existingOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }


        let updatedData: any = { orderStatus };

        if (newCommentStatus) {
            updatedData.commentStatusCycle = [
                ...(existingOrder.commentStatusCycle || []),
                newCommentStatus
            ];
        }

        if (req.files) {
            const files = req.files as UpdateMulterFiles;
            const invoiceUploadedFiles = files.invoiceUploaded || [];
            const fileUploadedFiles = files.fileUploaded || [];

            if (invoiceUploadedFiles.length > 0) {
                const invoiceUploadedPaths = await Promise.all(
                    invoiceUploadedFiles.map(file => uploadFile(file, 'invoicesUploaded'))
                );
                updatedData.invoiceUploaded = [
                    ...(existingOrder.invoiceUploaded || []),
                    ...invoiceUploadedPaths
                ];
            }

            if (fileUploadedFiles.length > 0) {
                const fileUploadedPaths = await Promise.all(
                    fileUploadedFiles.map(file => uploadFile(file, 'lawyerfiles'))
                );
                updatedData.fileUploaded = [
                    ...(existingOrder.fileUploaded || []),
                    ...fileUploadedPaths
                ];
            }
        }
        if (nextActionLawyer) updatedData.nextActionLawyer = nextActionLawyer;
        if (govtAppNumber) updatedData.govtAppNumber = govtAppNumber;
        if (dateOfFilling) updatedData.dateOfFilling = dateOfFilling;
        if (lawyerReferenceNumber2) updatedData.lawyerReferenceNumber = lawyerReferenceNumber2;
        if (inmNumber) updatedData.inmNumber = inmNumber;

        console.log("Updated fields prepared:", updatedData);

        const order = await prisma.order.update({
            where: {
                id: id,
                firmId: firmId
            },
            data: updatedData
        });

        console.log("Order updated:", order);
        res.status(200).json({
            message: "Order updated",
            order
        });

    } catch (error) {
        console.error("Error updating order:", error);
        res.status(400).json({
            message: "Can't update order"
        });
    }
};

export const downloadFile = async (req : Request , res : Response)=>{
    try {
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