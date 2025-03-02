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
exports.downloadFile = exports.updateOrder = exports.updateUser = exports.orders = exports.getUser = exports.resetPassword = exports.forgetPassword = exports.login = void 0;
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
        const files = {
            panCard: user.panCard ? yield (0, uploadFile_1.getPublicUrl)(user.panCard) : null,
            tdsFile: user.tdsFile ? yield (0, uploadFile_1.getPublicUrl)(user.tdsFile) : null,
            gstFile: user.gstFile ? yield (0, uploadFile_1.getPublicUrl)(user.gstFile) : null,
            ndaFile: user.ndaFile ? yield (0, uploadFile_1.getPublicUrl)(user.ndaFile) : null,
            dpiitFile: user.dpiitFile ? yield (0, uploadFile_1.getPublicUrl)(user.dpiitFile) : null,
            agreementFile: user.agreementFile ? yield (0, uploadFile_1.getPublicUrl)(user.agreementFile) : null,
            qunatifoFile: user.qunatifoFile ? yield (0, uploadFile_1.getPublicUrl)(user.qunatifoFile) : null,
            udhyanFile: user.udhyanFile ? yield (0, uploadFile_1.getPublicUrl)(user.udhyanFile) : null
        };
        res.status(200).json({
            user,
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
        const myOrders = yield client_1.default.order.findMany({
            where: {
                userId: user.id
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
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const temp = req.user;
        const id = temp.id;
        const gstNumber = req.body.gstNumber;
        const name = req.body.name;
        const type = req.body.type;
        const pocPhone = req.body.pocPhone;
        const pocName = req.body.pocName;
        const dpiit = req.body.dpiit;
        const dpiitDate = req.body.dpiitDate;
        const files = req.files;
        const panCardFile = (_a = files.panCard) === null || _a === void 0 ? void 0 : _a[0];
        const tdsFile = (_b = files.tdsFile) === null || _b === void 0 ? void 0 : _b[0];
        const gstFile = (_c = files.gstFile) === null || _c === void 0 ? void 0 : _c[0];
        const ndaFile = (_d = files.ndaFile) === null || _d === void 0 ? void 0 : _d[0];
        const dpiitFile = (_e = files.dpiitFile) === null || _e === void 0 ? void 0 : _e[0];
        const agreementFile = (_f = files.agreementFile) === null || _f === void 0 ? void 0 : _f[0];
        const qunatifoFile = (_g = files.qunatifoFile) === null || _g === void 0 ? void 0 : _g[0];
        const udhyanFile = (_h = files.udhyanFile) === null || _h === void 0 ? void 0 : _h[0];
        let panCardPath = null;
        let tdsFilePath = null;
        let gstFilePath = null;
        let ndaFilePath = null;
        let dpiitFilePath = null;
        let agreementFilePath = null;
        let qunatifoFilePath = null;
        let udhyanFilePath = null;
        let dpiitBool;
        if (dpiit === "true") {
            dpiitBool = true;
        }
        else {
            dpiitBool = false;
        }
        if (panCardFile) {
            panCardPath = yield (0, uploadFile_1.uploadFile)(panCardFile, 'pancards');
        }
        if (tdsFile) {
            tdsFilePath = yield (0, uploadFile_1.uploadFile)(tdsFile, 'tdsfiles');
        }
        if (gstFile) {
            gstFilePath = yield (0, uploadFile_1.uploadFile)(gstFile, 'gstfiles');
        }
        if (ndaFile) {
            ndaFilePath = yield (0, uploadFile_1.uploadFile)(ndaFile, 'ndafiles');
        }
        if (dpiitFile) {
            dpiitFilePath = yield (0, uploadFile_1.uploadFile)(dpiitFile, 'dpiitfiles');
        }
        if (agreementFile) {
            agreementFilePath = yield (0, uploadFile_1.uploadFile)(agreementFile, 'agreementfiles');
        }
        if (qunatifoFile) {
            qunatifoFilePath = yield (0, uploadFile_1.uploadFile)(qunatifoFile, 'qunatifofiles');
        }
        if (udhyanFile) {
            udhyanFilePath = yield (0, uploadFile_1.uploadFile)(udhyanFile, 'udhyanfiles');
        }
        // Validate and parse dpiitDate
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
        const id = req.user.id;
        const orderId = parseInt(req.body.orderId);
        const existingOrder = yield client_1.default.order.findUnique({
            where: { id: orderId, userId: id }
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
        const nextActionClient = req.body.nextActionClient;
        const order = yield client_1.default.order.update({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't update order, something went wrong"
        });
    }
});
exports.updateOrder = updateOrder;
const downloadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user.id;
        const orderId = parseInt(req.body.orderId);
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
