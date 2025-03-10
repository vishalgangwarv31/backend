import { Request, response, Response } from "express"
import prisma from "../prisma/client";
import bcrypt from 'bcrypt';
import jwt , { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";
import { IGetUserAuthInfoRequest } from "../config/definationFile";
import { getPublicUrl, uploadFile } from "../utils/uploadFile";
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
  const {
    name,
    email,
    password,
    type,
    pocPhone,
    pocName,
    gstNumber,
    dpiit,
    dpiitDate
  } = req.body;

  // console.log(dpiitDate)
  const dpiit2 = (dpiit == "true") ? true : false;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const uploadFiles = async (files: Express.Multer.File[], folder: string) => {
    return await Promise.all(files.map(file => uploadFile(file, folder)));
  };

  const tdsFilePaths = files.tdsFile ? await uploadFiles(files.tdsFile, 'tdsFiles') : [];
  const gstFilePaths = files.gstFile ? await uploadFiles(files.gstFile, 'gstFiles') : [];
  const ndaFilePaths = files.ndaFile ? await uploadFiles(files.ndaFile, 'ndaFiles') : [];
  const dpiitFilePaths = files.dpiitFile ? await uploadFiles(files.dpiitFile, 'dpiitFiles') : [];
  const agreementFilePaths = files.agreementFile ? await uploadFiles(files.agreementFile, 'agreementFiles') : [];
  const qunatifoFilePaths = files.qunatifoFile ? await uploadFiles(files.qunatifoFile, 'qunatifoFiles') : [];
  const panCardPaths = files.panCard ? await uploadFiles(files.panCard, 'panCards') : [];
  const udhyanFilePaths = files.udhyanFile ? await uploadFiles(files.udhyanFile, 'udhyanFiles') : [];

  const existedUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existedUser) {
    res.status(400).json({
      message: "Customer already exists"
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type,
        pocPhone,
        pocName,
        gstNumber,
        dpiit : dpiit2,
        dpiitDate,
        tdsFile: tdsFilePaths,
        gstFile: gstFilePaths,
        ndaFile: ndaFilePaths,
        dpiitFile: dpiitFilePaths,
        agreementFile: agreementFilePaths,
        qunatifoFile: qunatifoFilePaths,
        panCard: panCardPaths,
        udhyanFile: udhyanFilePaths
      }
    });
    res.status(200).json({
      newUser,
      message: "User created"
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: "Something went wrong, can't create a user"
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id:true,
        name: true,
        email: true
      }
    });

    res.status(200).json({
      message: "All users",
      data: users
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Cannot get users at the moment"
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const {
    name,
    email,
    password,
    type,
    pocPhone,
    pocName,
    gstNumber,
    dpiit,
    dpiitDate
  } = req.body;

  const dpiit2 = (dpiit === "true") ? true : false;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const uploadFiles = async (files: Express.Multer.File[], folder: string) => {
    return await Promise.all(files.map(file => uploadFile(file, folder)));
  };

  const tdsFilePaths = files.tdsFile ? await uploadFiles(files.tdsFile, 'tdsFiles') : [];
  const gstFilePaths = files.gstFile ? await uploadFiles(files.gstFile, 'gstFiles') : [];
  const ndaFilePaths = files.ndaFile ? await uploadFiles(files.ndaFile, 'ndaFiles') : [];
  const dpiitFilePaths = files.dpiitFile ? await uploadFiles(files.dpiitFile, 'dpiitFiles') : [];
  const agreementFilePaths = files.agreementFile ? await uploadFiles(files.agreementFile, 'agreementFiles') : [];
  const qunatifoFilePaths = files.qunatifoFile ? await uploadFiles(files.qunatifoFile, 'qunatifoFiles') : [];
  const panCardPaths = files.panCard ? await uploadFiles(files.panCard, 'panCards') : [];
  const udhyanFilePaths = files.udhyanFile ? await uploadFiles(files.udhyanFile, 'udhyanFiles') : [];

  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    res.status(404).json({
      message: "User not found"
    });
    return;
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        password: hashedPassword,
        type,
        pocPhone,
        pocName,
        gstNumber,
        dpiit : dpiit2,
        dpiitDate,
        tdsFile: [...existingUser.tdsFile, ...tdsFilePaths],
        gstFile: [...existingUser.gstFile, ...gstFilePaths],
        ndaFile: [...existingUser.ndaFile, ...ndaFilePaths],
        dpiitFile: [...existingUser.dpiitFile, ...dpiitFilePaths],
        agreementFile: [...existingUser.agreementFile, ...agreementFilePaths],
        qunatifoFile: [...existingUser.qunatifoFile, ...qunatifoFilePaths],
        panCard: [...existingUser.panCard, ...panCardPaths],
        udhyanFile: [...existingUser.udhyanFile, ...udhyanFilePaths]
      }
    });
    res.status(200).json({
      updatedUser,
      message: "User updated"
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: "Something went wrong, can't update the user"
    });
  }
};


export const createContractor = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    workType,
    startup
  } = req.body;

  const startup2 = (startup == "true") ? true : false;

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const uploadFiles = async (files: Express.Multer.File[], folder: string) => {
      return await Promise.all(files.map(file => uploadFile(file, folder)));
    };

    const agreementFilePaths = files.agreementFile ? await uploadFiles(files.agreementFile, 'agreementFiles') : [];
    const ndaFilePaths = files.ndaFile ? await uploadFiles(files.ndaFile, 'ndaFiles') : [];
    const otherFilePaths = files.other ? await uploadFiles(files.other, 'otherFiles') : [];

    const existedFirm = await prisma.firm.findUnique({
      where: { email }
    });

    if (existedFirm) {
      res.status(400).json({
        message: "Firm already exists"
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFirm = await prisma.firm.create({
      data: {
        name,
        email,
        password: hashedPassword,
        workType,
        startup: startup2,
        agreementFile: agreementFilePaths.length > 0 ? agreementFilePaths[0] : undefined,
        ndaFile: ndaFilePaths.length > 0 ? ndaFilePaths[0] : undefined,
        other: otherFilePaths.length > 0 ? otherFilePaths[0] : undefined
      }
    });
    res.status(200).json({
      newFirm,
      message: "Firm created"
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: "Something went wrong, can't create a firm"
    });
  }
};

export const updateFirm = async (req: Request, res: Response): Promise<void> => {
  try {
    const firmId = parseInt(req.params.id);
    const {
      name,
      email,
      workType,
      startup,
      agreementFile,
      ndaFile,
      other
    } = req.body;

    const existingFirm = await prisma.firm.findUnique({
      where: { id: firmId }
    });

    if (!existingFirm) {
      res.status(404).json({ message: "Firm not found" });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const agreementFileFiles = files.agreementFile || [];
    const ndaFileFiles = files.ndaFile || [];
    const otherFiles = files.other || [];

    const agreementFilePaths = await Promise.all(
      agreementFileFiles.map(file => uploadFile(file, 'agreementFiles'))
    );

    const ndaFilePaths = await Promise.all(
      ndaFileFiles.map(file => uploadFile(file, 'ndaFiles'))
    );

    const otherFilePaths = await Promise.all(
      otherFiles.map(file => uploadFile(file, 'otherFiles'))
    );

    const updatedFirm = await prisma.firm.update({
      where: {
        id: firmId
      },
      data: {
        name,
        email,
        workType,
        startup,
        agreementFile: agreementFilePaths.length ? agreementFilePaths[0] : existingFirm.agreementFile,
        ndaFile: ndaFilePaths.length ? ndaFilePaths[0] : existingFirm.ndaFile,
        other: otherFilePaths.length ? otherFilePaths[0] : existingFirm.other
      }
    });

    const agreementFileUrl = updatedFirm.agreementFile ? await getPublicUrl(updatedFirm.agreementFile) : null;
    const ndaFileUrl = updatedFirm.ndaFile ? await getPublicUrl(updatedFirm.ndaFile) : null;
    const otherFileUrl = updatedFirm.other ? await getPublicUrl(updatedFirm.other) : null;

    res.status(200).json({
      message: "Firm updated successfully",
      firm: {
        ...updatedFirm,
        agreementFile: agreementFileUrl,
        ndaFile: ndaFileUrl,
        other: otherFileUrl
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Can't update your firm, something went wrong"
    });
  }
};

export const getContractorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const contractorId = parseInt(req.params.id);

    const contractor = await prisma.firm.findUnique({
      where: { id: contractorId }
    });

    if (!contractor) {
      res.status(404).json({ message: "Contractor not found" });
      return;
    }

    const agreementFileUrl = contractor.agreementFile ? await getPublicUrl(contractor.agreementFile) : null;
    const ndaFileUrl = contractor.ndaFile ? await getPublicUrl(contractor.ndaFile) : null;
    const otherFileUrl = contractor.other ? await getPublicUrl(contractor.other) : null;

    res.status(200).json({
      message: "Contractor found",
      contractor: {
        ...contractor,
        agreementFile: agreementFileUrl,
        ndaFile: ndaFileUrl,
        other: otherFileUrl
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while fetching the contractor"
    });
  }
};

export const getAllFirms = async (req: Request, res: Response) => {
  try {
    const firms = await prisma.firm.findMany({
      select: {
        id:true,
        name: true,
        email: true
      }
    });

    res.status(200).json({
      message: "All firms",
      data: firms
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Cannot get firms at the moment"
    });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const {
    userId,
    firmId,
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
    lawyerRefrenceNumber,
    inmNumber,
    orderCompleteDate
  } = req.body;

  const userId2 = parseInt(userId);
  const firmId2 = parseInt(firmId);
  const amountCharged2 = parseInt(amountCharged);
  const amountPaid2 = parseInt(amountPaid);
  const commentStatusCycleArray = Array.isArray(commentStatusCycle) ? commentStatusCycle : [commentStatusCycle];
  const govtAppNumber2 = parseInt(govtAppNumber);
  const lawyerRefrenceNumber2 = parseInt(lawyerRefrenceNumber);

  try {
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
      fileUploadedFiles.map(file => uploadFile(file, 'lawyerFiles'))
    );

    const newOrder = await prisma.order.create({
      data: {
        userId: userId2,
        firmId: firmId2,
        dateOfOrder,
        typeOfOrder,
        payementExpected,
        amountCharged: amountCharged2,
        amountPaid: amountPaid2,
        orderStatus,
        commentStatusCycle: commentStatusCycleArray,
        dateOdExpectation,
        documentProvided: documentProvidedPaths,
        invoiceUploaded: invoiceUploadedPaths,
        fileUploaded: fileUploadedPaths,
        nextActionLawyer,
        nextActionClient,
        govtAppNumber : govtAppNumber2,
        dateOfFilling,
        lawyerRefrenceNumber : lawyerRefrenceNumber2,
        inmNumber,
        orderCompleteDate
      }
    });

    res.status(200).json({
      message: "New order is created",
      newOrder
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Can't create order"
    });
  }
};


interface MulterFiles {
    documentProvided?: Express.Multer.File[];
    invoiceUploaded?: Express.Multer.File[];
    fileUploaded?: Express.Multer.File[];
}

const storage = multer.memoryStorage();
  
const upload = multer({ storage });

// updated
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id);
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

export const getOrdersByFirm = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { cursor, take } = req.query;

  const takeNumber = parseInt(take as string) || 10; 
  const cursorObject = cursor ? { id: parseInt(cursor as string) } : undefined;

  try {
    const orders = await prisma.order.findMany({
      where: { firmId: parseInt(id) },
      take: takeNumber,
      skip: cursor ? 1 : 0,
      cursor: cursorObject,
      select: {
        id: true,
        dateOfOrder: true,
        payementExpected: true,
        user: {
          select: {
            name: true,
          },
        },
        firm: {
          select: {
            name: true,
          },
        },
      },
    });

    const nextCursor = orders.length === takeNumber ? orders[orders.length - 1].id : null;

    res.status(200).json({
      orders,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};


//updated
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { cursor, limit = 15, name, email, includeInactive } = req.query;
    const pageSize = parseInt(limit as string) || 15;

    const whereClause: any = {};
    if (name) {
      whereClause.name = { contains: name as string, mode: "insensitive" };
    }
    if (email) {
      whereClause.email = { contains: email as string, mode: "insensitive" };
    }
    if (includeInactive !== 'true') {
      whereClause.isDeleted = false;
    }

    const users = await prisma.user.findMany({
      take: pageSize + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: parseInt(cursor as string) } : undefined,
      where: Object.keys(whereClause).length ? whereClause : undefined,
    });

    const hasNextPage = users.length > pageSize;
    if (hasNextPage) users.pop();

    const nextCursor = hasNextPage ? users[users.length - 1].id : null;

    res.status(200).json({
      message: "all users",
      data: users,
      nextCursor,
    });
  } catch (error) {
    res.status(404).json({
      message: "cannot get users at the moment",
    });
  }
};



// need to update
export const getContractor = async (req: Request, res: Response) => {
  try {
    const { cursor, limit, name, email } = req.query;
    const pageSize = parseInt(limit as string) || 10;

    const whereClause: any = {};
    if (name) {
      whereClause.name = { contains: name as string, mode: "insensitive" };
    }
    if (email) {
      whereClause.email = { contains: email as string, mode: "insensitive" };
    }

    const firms = await prisma.firm.findMany({
      take: pageSize + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: parseInt(cursor as string) } : undefined,
      where: Object.keys(whereClause).length ? whereClause : undefined,
    });

    const hasNextPage = firms.length > pageSize;
    if (hasNextPage) firms.pop();

    const firmsWithFileLinks = await Promise.all(firms.map(async (firm) => {
      const agreementFileUrl = firm.agreementFile ? await getPublicUrl(firm.agreementFile) : null;
      const ndaFileUrl = firm.ndaFile ? await getPublicUrl(firm.ndaFile) : null;
      const otherFileUrl = firm.other ? await getPublicUrl(firm.other) : null;

      return {
        ...firm,
        agreementFile: agreementFileUrl,
        ndaFile: ndaFileUrl,
        other: otherFileUrl
      };
    }));

    res.status(200).json({
      message: "All firms",
      firms: firmsWithFileLinks,
      nextCursor: hasNextPage ? firms[firms.length - 1].id : null
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Cannot get firms at the moment"
    });
  }
};
  
//this is to get whole order (updated)
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
      const orderId = parseInt(req.params.id);

      const order = await prisma.order.findUnique({
          where: { id: orderId }
      });

      if (!order) {
          res.status(404).json({ message: "Order not found" });
          return;
      }

      const generateFileLinks = async (files: string[], folder: string) => {
          const links = await Promise.all(files.map(async file => {
              const publicUrl = await getPublicUrl(`${folder}/${path.basename(file)}`);
              return {
                  filename: path.basename(file),
                  url: publicUrl
              };
          }));
          return links;
      };

      const documentProvidedLinks = await generateFileLinks(order.documentProvided, 'documentsProvided');
      const invoiceUploadedLinks = await generateFileLinks(order.invoiceUploaded, 'invoicesUploaded');
      const fileUploadedLinks = await generateFileLinks(order.fileUploaded, 'lawyerfiles');

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


//this is to get list of order 10(updated)
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
      const { cursor, limit = 2, userId } = req.query;
      const limitNumber = parseInt(limit as string);

      const orders = await prisma.order.findMany({
          take: limitNumber,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: parseInt(cursor as string) } : undefined,
          where: userId ? { userId: parseInt(userId as string) } : undefined,
          select: {
              id: true, 
              dateOfOrder: true,
              orderStatus: true,
              firm: {
                  select: {
                      name: true
                  }
              },
          }
      });

      if (orders.length === 0) {
        res.status(200).json({ orders: [], nextCursor: null });
          return;
      }

      const ordersWithLinks = orders.map(order => ({
          id: order.id, 
          dateOfOrder: order.dateOfOrder,
          orderStatus: order.orderStatus,
          vendor: order.firm.name,
      }));

      const nextCursor = orders.length === limitNumber ? orders[orders.length - 1].id : null;

      res.status(200).json({
          orders: ordersWithLinks,
          nextCursor
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({
          message: "Can't fetch the orders, something went wrong"
      });
  }
};


//updated
export const userById = async (req : Request,  res  : Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Cannot get user at the moment" });
  }
};

