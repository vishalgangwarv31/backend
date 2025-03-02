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
exports.downloadFile = exports.updateOrder = exports.orders = exports.getFirm = exports.updateFirm = exports.resetPassword = exports.forgetPassword = exports.login = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const uploadFile_1 = require("../utils/uploadFile");
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const JWT_SECRET = process.env.FIRM_AUTH_JWT;
const APP_PASSWORD = process.env.APP_PASSWORD;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const existingFirm = yield client_1.default.firm.findUnique({
            where: { email: email }
        });
        if (existingFirm === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(pass, existingFirm === null || existingFirm === void 0 ? void 0 : existingFirm.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, jsonwebtoken_1.sign)({ id: existingFirm.id, email: existingFirm.email }, JWT_SECRET, { expiresIn: "3d" });
        res.status(200).json({
            message: "firm Login successful",
            token,
            admin: { id: existingFirm === null || existingFirm === void 0 ? void 0 : existingFirm.id, email: existingFirm === null || existingFirm === void 0 ? void 0 : existingFirm.email }
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
});
exports.login = login;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const oldUser = yield client_1.default.firm.findUnique({
            where: { email: email }
        });
        if (!oldUser) {
            res.sendStatus(200).json({ message: "firm doesnt exist" });
            return;
        }
        const secert = JWT_SECRET + oldUser.password;
        const token = (0, jsonwebtoken_1.sign)({ email: oldUser.email, id: oldUser.id }, secert, { expiresIn: "10m" });
        const link = `http://localhost:5174/api/firm/reset-password/${oldUser.id}/${token}`;
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
            text: `click on the link below to change your firm password ${link}`
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
    const oldUser = yield client_1.default.firm.findUnique({
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
        const newUser = yield client_1.default.firm.update({
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
    }
    catch (error) {
        res.json({
            message: "something went wrong"
        });
    }
});
exports.resetPassword = resetPassword;
const updateFirm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = req.user.id;
        const { name, workType, startup } = req.body;
        const files = req.files;
        const agreementFile = (_a = files.agreementFile) === null || _a === void 0 ? void 0 : _a[0];
        const ndaFile = (_b = files.ndaFile) === null || _b === void 0 ? void 0 : _b[0];
        let agreementFilePath = null;
        let ndaFilePath = null;
        if (agreementFile) {
            agreementFilePath = yield (0, uploadFile_1.uploadFile)(agreementFile, 'agreement');
        }
        if (ndaFile) {
            ndaFilePath = yield (0, uploadFile_1.uploadFile)(ndaFile, 'nda');
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (workType !== undefined)
            updateData.workType = workType;
        if (startup !== undefined)
            updateData.startup = startup === "true";
        if (agreementFilePath !== null)
            updateData.agreementFile = agreementFilePath;
        if (ndaFilePath !== null)
            updateData.ndaFile = ndaFilePath;
        const updatedFirm = yield client_1.default.firm.update({
            where: { id: id },
            data: updateData
        });
        res.status(200).json({
            message: "Firm updated",
            updatedFirm
        });
    }
    catch (error) {
        console.log(error);
        res.status(401).json({
            message: "Can't update your firm, something went wrong"
        });
    }
});
exports.updateFirm = updateFirm;
const getFirm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user.id;
        const firm = yield client_1.default.firm.findUnique({
            where: { id: id }
        });
        if (!firm) {
            res.status(404).json({ message: "firm not found" });
            return;
        }
        const files = {
            agrement: firm.agreementFile ? yield (0, uploadFile_1.getPublicUrl)(firm.agreementFile) : null,
            tdsFile: firm.ndaFile ? yield (0, uploadFile_1.getPublicUrl)(firm.ndaFile) : null,
        };
        res.status(200).json({
            firm,
            files
        });
    }
    catch (error) {
        res.status(404).json({
            message: " something went wrong"
        });
    }
});
exports.getFirm = getFirm;
const orders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const myOrders = yield client_1.default.order.findMany({
            where: {
                firmId: user.id
            }
        });
        res.status(200).json({
            myOrders,
            message: "these are ur order"
        });
    }
    catch (error) {
        res.status(400).json({
            message: "something went wrong"
        });
    }
});
exports.orders = orders;
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firmId = req.user.id;
        const id = parseInt(req.body.orderId);
        const { orderStatus, newCommentStatus, lawyerReferenceNumber, nextActionLawyer, govtAppNumber, dateOfFilling, inmNumber } = req.body;
        const lawyerReferenceNumber2 = parseInt(lawyerReferenceNumber);
        const existingOrder = yield client_1.default.order.findUnique({
            where: { id: id, firmId: firmId }
        });
        if (!existingOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        let updatedData = { orderStatus };
        if (newCommentStatus) {
            updatedData.commentStatusCycle = [
                ...(existingOrder.commentStatusCycle || []),
                newCommentStatus
            ];
        }
        if (req.files) {
            const files = req.files;
            const invoiceUploadedFiles = files.invoiceUploaded || [];
            const fileUploadedFiles = files.fileUploaded || [];
            if (invoiceUploadedFiles.length > 0) {
                const invoiceUploadedPaths = yield Promise.all(invoiceUploadedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'invoicesUploaded')));
                updatedData.invoiceUploaded = [
                    ...(existingOrder.invoiceUploaded || []),
                    ...invoiceUploadedPaths
                ];
            }
            if (fileUploadedFiles.length > 0) {
                const fileUploadedPaths = yield Promise.all(fileUploadedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'lawyerfiles')));
                updatedData.fileUploaded = [
                    ...(existingOrder.fileUploaded || []),
                    ...fileUploadedPaths
                ];
            }
        }
        if (nextActionLawyer)
            updatedData.nextActionLawyer = nextActionLawyer;
        if (govtAppNumber)
            updatedData.govtAppNumber = govtAppNumber;
        if (dateOfFilling)
            updatedData.dateOfFilling = dateOfFilling;
        if (lawyerReferenceNumber2)
            updatedData.lawyerReferenceNumber = lawyerReferenceNumber2;
        if (inmNumber)
            updatedData.inmNumber = inmNumber;
        console.log("Updated fields prepared:", updatedData);
        const order = yield client_1.default.order.update({
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
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(400).json({
            message: "Can't update order"
        });
    }
});
exports.updateOrder = updateOrder;
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
