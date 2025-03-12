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
exports.updateOrder = exports.updateUser = exports.orders = exports.getUser = exports.resetPassword = exports.forgetPassword = exports.login = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const uploadFile_1 = require("../utils/uploadFile");
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const JWT_SECRET = process.env.USER_AUTH_JWT;
const APP_PASSWORD = process.env.APP_PASSWORD;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const existingUser = yield client_1.default.user.findUnique({
            where: { email: email }
        });
        if (existingUser === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(pass, existingUser === null || existingUser === void 0 ? void 0 : existingUser.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, jsonwebtoken_1.sign)({ id: existingUser.id, email: existingUser.email }, JWT_SECRET, { expiresIn: "3d" });
        res.status(200).json({
            message: "user Login successful",
            token,
            admin: { id: existingUser === null || existingUser === void 0 ? void 0 : existingUser.id, email: existingUser === null || existingUser === void 0 ? void 0 : existingUser.email }
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
        const oldUser = yield client_1.default.user.findUnique({
            where: { email: email }
        });
        if (!oldUser) {
            res.sendStatus(200).json({ message: "user doesnt exist" });
            return;
        }
        const secert = JWT_SECRET + oldUser.password;
        const token = (0, jsonwebtoken_1.sign)({ email: oldUser.email, id: oldUser.id }, secert, { expiresIn: "10m" });
        const link = `http://localhost:5174/api/user/reset-password/${oldUser.id}/${token}`;
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
            text: `click on the link below to change your user password ${link}`
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
    const oldUser = yield client_1.default.user.findUnique({
        where: { id: id }
    });
    if (!oldUser) {
        res.json({
            message: "user doesn't exist"
        });
        return;
    }
    const secret = JWT_SECRET + (oldUser === null || oldUser === void 0 ? void 0 : oldUser.password);
    try {
        const check = (0, jsonwebtoken_1.verify)(token, secret);
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // console.log(hashedPassword);
        const newUser = yield client_1.default.user.update({
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
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const temp = req.user;
        const userId = temp.id;
        const user = yield client_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const getFileUrls = (files) => __awaiter(void 0, void 0, void 0, function* () {
            return yield Promise.all(files.map(file => (0, uploadFile_1.getPublicUrl)(file)));
        });
        const files = {
            panCard: user.panCard ? yield getFileUrls(user.panCard) : [],
            tdsFile: user.tdsFile ? yield getFileUrls(user.tdsFile) : [],
            gstFile: user.gstFile ? yield getFileUrls(user.gstFile) : [],
            ndaFile: user.ndaFile ? yield getFileUrls(user.ndaFile) : [],
            dpiitFile: user.dpiitFile ? yield getFileUrls(user.dpiitFile) : [],
            agreementFile: user.agreementFile ? yield getFileUrls(user.agreementFile) : [],
            qunatifoFile: user.qunatifoFile ? yield getFileUrls(user.qunatifoFile) : [],
            udhyanFile: user.udhyanFile ? yield getFileUrls(user.udhyanFile) : [],
            otherFile: user.otherFile ? yield getFileUrls(user.otherFile) : []
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't retrieve user, something went wrong"
        });
    }
});
exports.getUser = getUser;
const orders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { cursor, limit } = req.query;
        const pageSize = parseInt(limit) || 10;
        const orders = yield client_1.default.order.findMany({
            where: { userId: user.id },
            take: pageSize + 1,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: parseInt(cursor) } : undefined,
        });
        const hasNextPage = orders.length > pageSize;
        if (hasNextPage)
            orders.pop();
        const getFileUrls = (files) => __awaiter(void 0, void 0, void 0, function* () {
            return yield Promise.all(files.map(file => (0, uploadFile_1.getPublicUrl)(file)));
        });
        const ordersWithFileLinks = yield Promise.all(orders.map((order) => __awaiter(void 0, void 0, void 0, function* () {
            const documentProvidedUrls = yield getFileUrls(order.documentProvided);
            const invoiceUploadedUrls = yield getFileUrls(order.invoiceUploaded);
            const fileUploadedUrls = yield getFileUrls(order.fileUploaded);
            return Object.assign(Object.assign({}, order), { documentProvided: documentProvidedUrls, invoiceUploaded: invoiceUploadedUrls, fileUploaded: fileUploadedUrls });
        })));
        res.status(200).json({
            orders: ordersWithFileLinks,
            nextCursor: hasNextPage ? orders[orders.length - 1].id : null,
            hasNextPage
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});
exports.orders = orders;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const gstNumber = req.body.gstNumber;
        const name = req.body.name;
        const type = req.body.type;
        const pocPhone = req.body.pocPhone;
        const pocName = req.body.pocName;
        const dpiit = req.body.dpiit;
        const dpiitDate = req.body.dpiitDate;
        const files = req.files;
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
            ...panCardFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'pancards')),
            ...tdsFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'tdsfiles')),
            ...gstFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'gstfiles')),
            ...ndaFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'ndafiles')),
            ...dpiitFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'dpiitfiles')),
            ...agreementFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'agreementfiles')),
            ...qunatifoFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'qunatifofiles')),
            ...udhyanFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'udhyanfiles')),
            ...otherFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'otherfiles'))
        ];
        const filePaths = yield Promise.all(uploadPromises);
        const dpiitBool = dpiit === "true";
        let parsedDpiitDate = null;
        if (dpiitDate) {
            parsedDpiitDate = new Date(dpiitDate);
            if (isNaN(parsedDpiitDate.getTime())) {
                res.status(400).json({ message: "Invalid dpiitDate format. Expected ISO-8601 DateTime." });
                return;
            }
        }
        const order = yield client_1.default.user.update({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't update user, something went wrong"
        });
    }
});
exports.updateUser = updateUser;
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const orderId = parseInt(req.params.id);
        // console.log(userId, orderId)     
        const existingOrder = yield client_1.default.order.findUnique({
            where: { id: orderId, userId: userId }
        });
        if (!existingOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        const files = req.files;
        const documentProvidedFiles = files.documentProvided || [];
        const documentProvidedPaths = yield Promise.all(documentProvidedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'documentsProvided')));
        const updatedDocumentProvided = [
            ...existingOrder.documentProvided,
            ...documentProvidedPaths
        ];
        const { dateOfOrder, typeOfOrder, payementExpected, amountCharged, amountPaid, orderStatus, commentStatusCycle, dateOdExpectation, nextActionLawyer, nextActionClient, govtAppNumber, dateOfFilling, inmNumber, orderCompleteDate } = req.body;
        const order = yield client_1.default.order.update({
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
                commentStatusCycle: commentStatusCycle ? commentStatusCycle.split(',').map((item) => item.trim()) : existingOrder.commentStatusCycle,
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't update order, something went wrong"
        });
    }
});
exports.updateOrder = updateOrder;
