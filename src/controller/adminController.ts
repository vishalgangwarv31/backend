import { Request, response, Response } from "express"
import prisma from "../prisma/client";
import bcrypt from 'bcrypt';
import jwt , { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";
import { IGetUserAuthInfoRequest } from "../config/definationFile";
import { getPublicUrl } from "../utils/uploadFile";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer'


dotenv.config();
const APP_PASSWORD = process.env.APP_PASSWORD as string;
const JWT_SECRET = process.env.ADMIN_AUTH_JWT as string;


export const login = async (req: Request , res : Response ): Promise<void> =>{
    try {
        const email = req.body.email;
        const pass = req.body.password;

        const existingAdmin = await prisma.admin.findUnique({
            where : { email : email}
        })
        
        if (existingAdmin === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        
        const isMatch = await bcrypt.compare(pass, existingAdmin?.password as string);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = sign(
            { id: existingAdmin.id , email : existingAdmin.email},
            JWT_SECRET,
            { expiresIn: "3d" } 
        )


        res.status(200).json({
            message: "Login successful",
            token,
            admin: { id: existingAdmin?.id, email: existingAdmin?.email }
    });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
}

export const signup = async (req: Request, res: Response) : Promise<void> => {
    try {
        const email = req.body.email;
        const pass = req.body.password;



        const existingAdmin = await prisma.admin.findUnique({
            where : {email}
        })

        const hashedPassword = await bcrypt.hash(pass,10);

        if (existingAdmin !== null) {
            res.status(400).json({ error: "Admin2 already exists" });
            return;
        }


        const newAdmin = await prisma.admin.create({
            data: {
                email: email,
                password: hashedPassword
            }
        });
        res.status(201).json({
            message: "Admin created successfully",
            admin: newAdmin
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
};

export const forgetPassword = async( req : Request , res : Response): Promise<void> =>{
    try {
        const {email} = req.body;
        const oldUser = await prisma.admin.findUnique({
            where : {email : email}
        })

        if(!oldUser){
            res.sendStatus(200).json({message : "admin doesnt exist"})
            return;
        }

        const secert = JWT_SECRET + oldUser.password;
        const token = sign({email: oldUser.email, id : oldUser.id},secert, {expiresIn : "10m"});
        const link =  `http://localhost:5174/api/admin/reset-password/${oldUser.id}/${token}`;


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
            text: `click on the link below to change your admin password ${link}`
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

        const oldUser = await prisma.admin.findUnique({
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
            console.log("aaaa")

            const newUser = await prisma.admin.update({
                where: { id: id },
                data: {
                    password: hashedPassword
                }
            });
            console.log("aaaa")
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

export const createUser = async (req: Request, res: Response) => {
    const { name , email , password } = req.body;

    const existedUser = prisma.user.findUnique({
        where  : email
    });

    if(!existedUser) {
        res.json({
            message: "custumer is already exist"
        })
        return;
    }
    // // console.log(req.user);
    // const user = (req as IGetUserAuthInfoRequest).user;
    // console.log(user.id);
    // console.log(user.email);
    // console.log("Sdfs");

    const hashedPassword = await bcrypt.hash(password,10);

    try{
        const newUser = await prisma.user.create({
            data: {
                name : name,
                email,
                password: hashedPassword,
            }
        });
        res.status(200).json({
            newUser,
            message : "user created"
        })
    } catch(e){
        console.log(e);
        res.status(400).json({
            message : "something went wronng, cant create a user"
        })
    }
};

export const createContractor = async (req: Request, res: Response) => {
    const { name , email , password } = req.body;

    const existedFirm = prisma.firm.findUnique({
        where  : email
    });

    if(!existedFirm) {
        res.json({
            message: "Firm is already exist"
        })
        return;
    }

    const hashedPassword = await bcrypt.hash(password,10);

    try{
        const newUser = await prisma.firm.create({
            data: {
                name : name,
                email,
                password: hashedPassword,
            }
        });
        res.status(200).json({
            newUser,
            message : "firm created"
        })
    } catch(e){
        console.log(e);
        res.status(400).json({
            message : "something went wronng, cant create a firm"
        })
    }    
};

export const createOrder = async (req : Request , res : Response) =>{
    const { userId , firmId } = req.body;

    try {
        const newOrder = await prisma.order.create({
            data:{
                userId,
                firmId
            }
        })
    
        res.status(200).json({
            message : "new order is created",
            newOrder
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message : "cant create order"
        })
    }
}

interface MulterFiles {
    documentProvided?: Express.Multer.File[];
    invoiceUploaded?: Express.Multer.File[];
    fileUploaded?: Express.Multer.File[];
}

const storage = multer.memoryStorage();
  
const upload = multer({ storage });

  
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.body.id);
      const {
        dateOfOrder,
        typeOfOrder,
        payementExpected,
        amountCharged,
        amountPaid,
        orderStatus,
        newCommentStatus,
        dateOdExpectation,
        nextActionLawyer,
        nextActionClient,
        govtAppNumber,
        dateOfFilling,
        lawyerRefrenceNumber,
        inmNumber,
        orderCompleteDate
      } = req.body;
  
      const amountCharged2 = parseInt(amountCharged);
      const amountPaid2 = parseInt(amountPaid);
      const govtAppNumber2 = parseInt(govtAppNumber);
      const lawyerRefrenceNumber2 = parseInt(lawyerRefrenceNumber);
  
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
      });
  
      if (!existingOrder) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
  
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const documentProvidedFiles = files.documentProvided || [];
      const invoiceUploadedFiles = files.invoiceUploaded || [];
      const fileUploadedFiles = files.fileUploaded || [];
  
      const documentProvidedPaths = await Promise.all(
        documentProvidedFiles.map(file => uploadFile(file, 'documentsProvided'))
      );
  
      const invoiceUploadedPaths = await Promise.all(
        invoiceUploadedFiles.map(file => uploadFile(file, 'invoicesUploaded'))
      );
  
      const fileUploadedPaths = await Promise.all(
        fileUploadedFiles.map(file => uploadFile(file, 'lawyerfiles'))
      );
  
      const updatedCommentStatusCycle = [
        ...existingOrder.commentStatusCycle,
        ...(newCommentStatus ? [newCommentStatus] : [])
      ];
  
      const updatedDocumentProvided = [
        ...existingOrder.documentProvided,
        ...documentProvidedPaths
      ];
  
      const updatedInvoiceUploaded = [
        ...existingOrder.invoiceUploaded,
        ...invoiceUploadedPaths
      ];
  
      const updatedFileUploaded = [
        ...existingOrder.fileUploaded,
        ...fileUploadedPaths
      ];
  
      const order = await prisma.order.update({
        where: {
          id: orderId
        },
        data: {
          dateOfOrder,
          typeOfOrder,
          payementExpected,
          amountCharged: amountCharged2,
          amountPaid: amountPaid2,
          orderStatus,
          commentStatusCycle: updatedCommentStatusCycle,
          dateOdExpectation,
          documentProvided: updatedDocumentProvided,
          invoiceUploaded: updatedInvoiceUploaded,
          fileUploaded: updatedFileUploaded,
          nextActionLawyer,
          nextActionClient,
          govtAppNumber: govtAppNumber2,
          dateOfFilling,
          lawyerRefrenceNumber: lawyerRefrenceNumber2,
          inmNumber,
          orderCompleteDate
        }
      });
  
      res.status(200).json({
        message: "Order updated",
        order
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({
        message: "Can't update your order, something went wrong"
      });
    }
  };
  
  // Helper function to upload files
const uploadFile = (file: Express.Multer.File, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const uploadPath = path.join(__dirname, 'uploads', folder);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const filePath = path.join(uploadPath, `${Date.now()}-${file.originalname}`);
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    });
};
  
export const getUsers = async (req : Request , res : Response) =>{
    try {
        const user = await prisma.user.findMany();
        res.status(200).json({
            message : "all users ",
            user
        })
    } catch (error) {
        res.status(404).json({
            message : "can get user at the moment"
        })        
    }
}

export const downloadFile = async (req : Request, res: Response) =>{
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


export const getContractor = async (req : Request , res : Response)=>{
    try {
        const user = await prisma.firm.findMany();
        res.status(200).json({
            message : "all firm",
            user
        })
    } catch (error) {
        res.status(404).json({
            message : "can get user at the moment"
        })        
    }
}

export const getFile = (req: Request, res: Response): void => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', folder, filename);
  
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  };
  

export const getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id);
  
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });
  
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
  
      const generateFileLinks = (files: string[], folder: string) => {
        return files.map(file => ({
          filename: path.basename(file),
          url: `${req.protocol}://${req.get('host')}/api/admin/file/${folder}/${path.basename(file)}`
        }));
      };
  
      const documentProvidedLinks = generateFileLinks(order.documentProvided, 'documentsProvided');
      const invoiceUploadedLinks = generateFileLinks(order.invoiceUploaded, 'invoicesUploaded');
      const fileUploadedLinks = generateFileLinks(order.fileUploaded, 'lawyerfiles');
  
      res.status(200).json({
        ...order,
        documentProvidedLinks,
        invoiceUploadedLinks,
        fileUploadedLinks
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Can't fetch the order, something went wrong"
      });
    }
  };

export const order = async (req : Request , res : Response) =>{
    try {
        const data = await prisma.order.findMany();
        res.status(200).json({
            data
        })
    } catch (error) {
        res.status(400).json({
            message : "can not get orders"
        })       
    }
    

}
