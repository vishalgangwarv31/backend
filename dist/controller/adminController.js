"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.order = exports.getOrder = exports.getFile = exports.getContractor = exports.downloadFile = exports.getUsers = exports.updateOrder = exports.createOrder = exports.createContractor = exports.createUser = exports.resetPassword = exports.forgetPassword = exports.signup = exports.login = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
const uploadFile_1 = require("../utils/uploadFile");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const APP_PASSWORD = process.env.APP_PASSWORD;
const JWT_SECRET = process.env.ADMIN_AUTH_JWT;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const existingAdmin = yield client_1.default.admin.findUnique({
            where: { email: email }
        });
        if (existingAdmin === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(pass, existingAdmin === null || existingAdmin === void 0 ? void 0 : existingAdmin.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, jsonwebtoken_1.sign)({ id: existingAdmin.id, email: existingAdmin.email }, JWT_SECRET, { expiresIn: "3d" });
        res.status(200).json({
            message: "Login successful",
            token,
            admin: { id: existingAdmin === null || existingAdmin === void 0 ? void 0 : existingAdmin.id, email: existingAdmin === null || existingAdmin === void 0 ? void 0 : existingAdmin.email }
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
});
exports.login = login;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const existingAdmin = yield client_1.default.admin.findUnique({
            where: { email }
        });
        const hashedPassword = yield bcrypt_1.default.hash(pass, 10);
        if (existingAdmin !== null) {
            res.status(400).json({ error: "Admin2 already exists" });
            return;
        }
        const newAdmin = yield client_1.default.admin.create({
            data: {
                email: email,
                password: hashedPassword
            }
        });
        res.status(201).json({
            message: "Admin created successfully",
            admin: newAdmin
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
});
exports.signup = signup;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const oldUser = yield client_1.default.admin.findUnique({
            where: { email: email }
        });
        if (!oldUser) {
            res.sendStatus(200).json({ message: "admin doesnt exist" });
            return;
        }
        const secert = JWT_SECRET + oldUser.password;
        const token = (0, jsonwebtoken_1.sign)({ email: oldUser.email, id: oldUser.id }, secert, { expiresIn: "10m" });
        const link = `http://localhost:5174/api/admin/reset-password/${oldUser.id}/${token}`;
        const transporter = nodemailer_1.default.createTransport({
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
            }
            else {
                console.log('Email sent');
            }
        });
        res.status(200).json({
            message: "reset link is sent to your mail"
        });
    }
    catch (error) {
        res.status(404).json({ message: "cant update password now" });
    }
});
exports.forgetPassword = forgetPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const token = req.params.token;
    const password = req.body.password;
    const oldUser = yield client_1.default.admin.findUnique({
        where: { id: id }
    });
    if (!oldUser) {
        res.json({
            message: "firm doesn't exist"
        });
        return;
    }
    const secret = JWT_SECRET + (oldUser === null || oldUser === void 0 ? void 0 : oldUser.password);
    try {
        const check = (0, jsonwebtoken_1.verify)(token, secret);
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // console.log(hashedPassword);
        console.log("aaaa");
        const newUser = yield client_1.default.admin.update({
            where: { id: id },
            data: {
                password: hashedPassword
            }
        });
        console.log("aaaa");
        console.log(newUser);
        res.json({
            message: "password changed"
        });
        return;
    }
    catch (error) {
        res.json({
            message: "something went wrong"
        });
    }
});
exports.resetPassword = resetPassword;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const existedUser = client_1.default.user.findUnique({
        where: email
    });
    if (!existedUser) {
        res.json({
            message: "custumer is already exist"
        });
        return;
    }
    // // console.log(req.user);
    // const user = (req as IGetUserAuthInfoRequest).user;
    // console.log(user.id);
    // console.log(user.email);
    // console.log("Sdfs");
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const newUser = yield client_1.default.user.create({
            data: {
                name: name,
                email,
                password: hashedPassword,
            }
        });
        res.status(200).json({
            newUser,
            message: "user created"
        });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({
            message: "something went wronng, cant create a user"
        });
    }
});
exports.createUser = createUser;
const createContractor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const existedFirm = client_1.default.firm.findUnique({
        where: email
    });
    if (!existedFirm) {
        res.json({
            message: "Firm is already exist"
        });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const newUser = yield client_1.default.firm.create({
            data: {
                name: name,
                email,
                password: hashedPassword,
            }
        });
        res.status(200).json({
            newUser,
            message: "firm created"
        });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({
            message: "something went wronng, cant create a firm"
        });
    }
});
exports.createContractor = createContractor;
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, firmId } = req.body;
    try {
        const newOrder = yield client_1.default.order.create({
            data: {
                userId,
                firmId
            }
        });
        res.status(200).json({
            message: "new order is created",
            newOrder
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: "cant create order"
        });
    }
});
exports.createOrder = createOrder;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = parseInt(req.body.id);
        const { dateOfOrder, typeOfOrder, payementExpected, amountCharged, amountPaid, orderStatus, newCommentStatus, dateOdExpectation, nextActionLawyer, nextActionClient, govtAppNumber, dateOfFilling, lawyerRefrenceNumber, inmNumber, orderCompleteDate } = req.body;
        const amountCharged2 = parseInt(amountCharged);
        const amountPaid2 = parseInt(amountPaid);
        const govtAppNumber2 = parseInt(govtAppNumber);
        const lawyerRefrenceNumber2 = parseInt(lawyerRefrenceNumber);
        const existingOrder = yield client_1.default.order.findUnique({
            where: { id: orderId }
        });
        if (!existingOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        const files = req.files;
        const documentProvidedFiles = files.documentProvided || [];
        const invoiceUploadedFiles = files.invoiceUploaded || [];
        const fileUploadedFiles = files.fileUploaded || [];
        const documentProvidedPaths = yield Promise.all(documentProvidedFiles.map(file => uploadFile(file, 'documentsProvided')));
        const invoiceUploadedPaths = yield Promise.all(invoiceUploadedFiles.map(file => uploadFile(file, 'invoicesUploaded')));
        const fileUploadedPaths = yield Promise.all(fileUploadedFiles.map(file => uploadFile(file, 'lawyerfiles')));
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
        const order = yield client_1.default.order.update({
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
    }
    catch (error) {
        console.log(error);
        res.status(401).json({
            message: "Can't update your order, something went wrong"
        });
    }
});
exports.updateOrder = updateOrder;
// Helper function to upload files
const uploadFile = (file, folder) => {
    return new Promise((resolve, reject) => {
        const uploadPath = path_1.default.join(__dirname, 'uploads', folder);
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        const filePath = path_1.default.join(uploadPath, `${Date.now()}-${file.originalname}`);
        fs_1.default.writeFile(filePath, file.buffer, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(filePath);
            }
        });
    });
};
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield client_1.default.user.findMany();
        res.status(200).json({
            message: "all users ",
            user
        });
    }
    catch (error) {
        res.status(404).json({
            message: "can get user at the moment"
        });
    }
});
exports.getUsers = getUsers;
const downloadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const path = req.body.path;
        const downloadURL = yield (0, uploadFile_1.getPublicUrl)(path);
        res.status(200).json({
            message: "this is ur download link",
            downloadURL
        });
    }
    catch (error) {
        res.json(404).json({
            message: "cant download this now"
        });
    }
});
exports.downloadFile = downloadFile;
const getContractor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield client_1.default.firm.findMany();
        res.status(200).json({
            message: "all firm",
            user
        });
    }
    catch (error) {
        res.status(404).json({
            message: "can get user at the moment"
        });
    }
});
exports.getContractor = getContractor;
const getFile = (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path_1.default.join(__dirname, 'uploads', folder, filename);
    if (fs_1.default.existsSync(filePath)) {
        res.sendFile(filePath);
    }
    else {
        res.status(404).json({ message: "File not found" });
    }
};
exports.getFile = getFile;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = parseInt(req.params.id);
        const order = yield client_1.default.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        const generateFileLinks = (files, folder) => {
            return files.map(file => ({
                filename: path_1.default.basename(file),
                url: `${req.protocol}://${req.get('host')}/api/admin/file/${folder}/${path_1.default.basename(file)}`
            }));
        };
        const documentProvidedLinks = generateFileLinks(order.documentProvided, 'documentsProvided');
        const invoiceUploadedLinks = generateFileLinks(order.invoiceUploaded, 'invoicesUploaded');
        const fileUploadedLinks = generateFileLinks(order.fileUploaded, 'lawyerfiles');
        res.status(200).json(Object.assign(Object.assign({}, order), { documentProvidedLinks,
            invoiceUploadedLinks,
            fileUploadedLinks }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't fetch the order, something went wrong"
        });
    }
});
exports.getOrder = getOrder;
const order = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield client_1.default.order.findMany();
        res.status(200).json({
            data
        });
    }
    catch (error) {
        res.status(400).json({
            message: "can not get orders"
        });
    }
});
exports.order = order;
