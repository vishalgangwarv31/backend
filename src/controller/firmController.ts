import { Request , Response } from "express";
import { sign } from "jsonwebtoken";
import prisma from "../prisma/client";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { IGetUserAuthInfoRequest } from "../config/definationFile";
import { uploadFile , getPublicUrl} from "../utils/uploadFile";

dotenv.config();
const JWT_SECRET = process.env.FIRM_AUTH_JWT as string;

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

interface UpdateMulterFiles{
    invoiceUploaded?: Express.Multer.File[];
    fileUploaded?: Express.Multer.File[];
}

export const updateOrder = async (req: Request , res : Response) =>{
    try {

        const firmId = (req as IGetUserAuthInfoRequest).user.id;
        const id = parseInt(req.body.orderId);
        console.log(firmId)
        console.log(req.body);
        const {
            orderStatus,
            newCommentStatus,
            lawyerReferenceNumber,
            nextActionLawyer,
            govtAppNumber,
            dateOfFilling,
            lawyerRefrenceNumber,
            inmNumber
        } = req.body;

        const lawyerReferenceNumber2 = parseInt(lawyerReferenceNumber);

        const existingOrder = await prisma.order.findUnique({
            where: { id: id , firmId : firmId }
        });

        if (!existingOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        const files = req.files as UpdateMulterFiles;
        const invoiceUploadedFiles = files.invoiceUploaded || [];
        const fileUploadedFiles = files.fileUploaded || [];

        const invoiceUploadedPaths = await Promise.all(
            invoiceUploadedFiles.map(file => uploadFile(file, 'invoicesUploaded'))
        );

        const fileUploadedPaths = await Promise.all(
            fileUploadedFiles.map(file => uploadFile(file, 'lawyerfiles'))
        );

        const updatedInvoiceUploaded = [
            ...existingOrder.invoiceUploaded,
            ...invoiceUploadedPaths
        ];

        const updatedFileUploaded = [
            ...existingOrder.fileUploaded,
            ...fileUploadedPaths
        ];

        const updatedCommentStatusCycle = [
            ...existingOrder.commentStatusCycle,
            ...(newCommentStatus ? [newCommentStatus] : [])
        ];

        const order = await prisma.order.update({
            where: {
                id: id,
                firmId : firmId
            },
            data: {
                orderStatus,
                commentStatusCycle: updatedCommentStatusCycle,
                invoiceUploaded: updatedInvoiceUploaded,
                fileUploaded: updatedFileUploaded,
                nextActionLawyer,
                govtAppNumber,
                dateOfFilling,
                lawyerRefrenceNumber,
                inmNumber
            }
        });

        res.status(200).json({
            message: "Order updated",
            order
        });
            
    } catch (error) {
        res.status(400).json({
            message: "cant update order"
        })
    }
    

}

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