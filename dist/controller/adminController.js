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
exports.userById = exports.getOrders = exports.getOrderById = exports.getContractor = exports.getUsers = exports.getOrdersByFirm = exports.updateOrder = exports.createOrder = exports.getAllFirms = exports.getContractorById = exports.updateFirm = exports.createContractor = exports.updateUser = exports.getAllUsers = exports.createUser = exports.resetPassword = exports.forgetPassword = exports.signup = exports.login = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
const uploadFile_1 = require("../utils/uploadFile");
const multer_1 = __importDefault(require("multer"));
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
    const { name, email, password, type, pocPhone, pocName, gstNumber, dpiit, dpiitDate } = req.body;
    // console.log(dpiitDate)
    const dpiit2 = (dpiit == "true") ? true : false;
    const files = req.files;
    const uploadFiles = (files, folder) => __awaiter(void 0, void 0, void 0, function* () {
        return yield Promise.all(files.map(file => (0, uploadFile_1.uploadFile)(file, folder)));
    });
    const tdsFilePaths = files.tdsFile ? yield uploadFiles(files.tdsFile, 'tdsFiles') : [];
    const gstFilePaths = files.gstFile ? yield uploadFiles(files.gstFile, 'gstFiles') : [];
    const ndaFilePaths = files.ndaFile ? yield uploadFiles(files.ndaFile, 'ndaFiles') : [];
    const dpiitFilePaths = files.dpiitFile ? yield uploadFiles(files.dpiitFile, 'dpiitFiles') : [];
    const agreementFilePaths = files.agreementFile ? yield uploadFiles(files.agreementFile, 'agreementFiles') : [];
    const qunatifoFilePaths = files.qunatifoFile ? yield uploadFiles(files.qunatifoFile, 'qunatifoFiles') : [];
    const panCardPaths = files.panCard ? yield uploadFiles(files.panCard, 'panCards') : [];
    const udhyanFilePaths = files.udhyanFile ? yield uploadFiles(files.udhyanFile, 'udhyanFiles') : [];
    const existedUser = yield client_1.default.user.findUnique({
        where: { email }
    });
    if (existedUser) {
        res.status(400).json({
            message: "Customer already exists"
        });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const newUser = yield client_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                type,
                pocPhone,
                pocName,
                gstNumber,
                dpiit: dpiit2,
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
    }
    catch (e) {
        console.log(e);
        res.status(400).json({
            message: "Something went wrong, can't create a user"
        });
    }
});
exports.createUser = createUser;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield client_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true
            }
        });
        res.status(200).json({
            message: "All users",
            data: users
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Cannot get users at the moment"
        });
    }
});
exports.getAllUsers = getAllUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.id);
    const { name, email, password, type, pocPhone, pocName, gstNumber, dpiit, dpiitDate } = req.body;
    const dpiit2 = (dpiit === "true") ? true : false;
    const files = req.files;
    const uploadFiles = (files, folder) => __awaiter(void 0, void 0, void 0, function* () {
        return yield Promise.all(files.map(file => (0, uploadFile_1.uploadFile)(file, folder)));
    });
    const tdsFilePaths = files.tdsFile ? yield uploadFiles(files.tdsFile, 'tdsFiles') : [];
    const gstFilePaths = files.gstFile ? yield uploadFiles(files.gstFile, 'gstFiles') : [];
    const ndaFilePaths = files.ndaFile ? yield uploadFiles(files.ndaFile, 'ndaFiles') : [];
    const dpiitFilePaths = files.dpiitFile ? yield uploadFiles(files.dpiitFile, 'dpiitFiles') : [];
    const agreementFilePaths = files.agreementFile ? yield uploadFiles(files.agreementFile, 'agreementFiles') : [];
    const qunatifoFilePaths = files.qunatifoFile ? yield uploadFiles(files.qunatifoFile, 'qunatifoFiles') : [];
    const panCardPaths = files.panCard ? yield uploadFiles(files.panCard, 'panCards') : [];
    const udhyanFilePaths = files.udhyanFile ? yield uploadFiles(files.udhyanFile, 'udhyanFiles') : [];
    const existingUser = yield client_1.default.user.findUnique({
        where: { id: userId }
    });
    if (!existingUser) {
        res.status(404).json({
            message: "User not found"
        });
        return;
    }
    const hashedPassword = password ? yield bcrypt_1.default.hash(password, 10) : undefined;
    try {
        const updatedUser = yield client_1.default.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                password: hashedPassword,
                type,
                pocPhone,
                pocName,
                gstNumber,
                dpiit: dpiit2,
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
    }
    catch (e) {
        console.log(e);
        res.status(400).json({
            message: "Something went wrong, can't update the user"
        });
    }
});
exports.updateUser = updateUser;
const createContractor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, workType, startup } = req.body;
    const startup2 = (startup == "true") ? true : false;
    try {
        const files = req.files;
        const uploadFiles = (files, folder) => __awaiter(void 0, void 0, void 0, function* () {
            return yield Promise.all(files.map(file => (0, uploadFile_1.uploadFile)(file, folder)));
        });
        const agreementFilePaths = files.agreementFile ? yield uploadFiles(files.agreementFile, 'agreementFiles') : [];
        const ndaFilePaths = files.ndaFile ? yield uploadFiles(files.ndaFile, 'ndaFiles') : [];
        const otherFilePaths = files.other ? yield uploadFiles(files.other, 'otherFiles') : [];
        const existedFirm = yield client_1.default.firm.findUnique({
            where: { email }
        });
        if (existedFirm) {
            res.status(400).json({
                message: "Firm already exists"
            });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newFirm = yield client_1.default.firm.create({
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
    }
    catch (e) {
        console.log(e);
        res.status(400).json({
            message: "Something went wrong, can't create a firm"
        });
    }
});
exports.createContractor = createContractor;
const updateFirm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firmId = parseInt(req.params.id);
        const { name, email, workType, startup, agreementFile, ndaFile, other } = req.body;
        const existingFirm = yield client_1.default.firm.findUnique({
            where: { id: firmId }
        });
        if (!existingFirm) {
            res.status(404).json({ message: "Firm not found" });
            return;
        }
        const files = req.files;
        const agreementFileFiles = files.agreementFile || [];
        const ndaFileFiles = files.ndaFile || [];
        const otherFiles = files.other || [];
        const agreementFilePaths = yield Promise.all(agreementFileFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'agreementFiles')));
        const ndaFilePaths = yield Promise.all(ndaFileFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'ndaFiles')));
        const otherFilePaths = yield Promise.all(otherFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'otherFiles')));
        const updatedFirm = yield client_1.default.firm.update({
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
        const agreementFileUrl = updatedFirm.agreementFile ? yield (0, uploadFile_1.getPublicUrl)(updatedFirm.agreementFile) : null;
        const ndaFileUrl = updatedFirm.ndaFile ? yield (0, uploadFile_1.getPublicUrl)(updatedFirm.ndaFile) : null;
        const otherFileUrl = updatedFirm.other ? yield (0, uploadFile_1.getPublicUrl)(updatedFirm.other) : null;
        res.status(200).json({
            message: "Firm updated successfully",
            firm: Object.assign(Object.assign({}, updatedFirm), { agreementFile: agreementFileUrl, ndaFile: ndaFileUrl, other: otherFileUrl })
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
const getContractorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contractorId = parseInt(req.params.id);
        const contractor = yield client_1.default.firm.findUnique({
            where: { id: contractorId }
        });
        if (!contractor) {
            res.status(404).json({ message: "Contractor not found" });
            return;
        }
        const agreementFileUrl = contractor.agreementFile ? yield (0, uploadFile_1.getPublicUrl)(contractor.agreementFile) : null;
        const ndaFileUrl = contractor.ndaFile ? yield (0, uploadFile_1.getPublicUrl)(contractor.ndaFile) : null;
        const otherFileUrl = contractor.other ? yield (0, uploadFile_1.getPublicUrl)(contractor.other) : null;
        res.status(200).json({
            message: "Contractor found",
            contractor: Object.assign(Object.assign({}, contractor), { agreementFile: agreementFileUrl, ndaFile: ndaFileUrl, other: otherFileUrl })
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "An error occurred while fetching the contractor"
        });
    }
});
exports.getContractorById = getContractorById;
const getAllFirms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firms = yield client_1.default.firm.findMany({
            select: {
                id: true,
                name: true,
                email: true
            }
        });
        res.status(200).json({
            message: "All firms",
            data: firms
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Cannot get firms at the moment"
        });
    }
});
exports.getAllFirms = getAllFirms;
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, firmId, dateOfOrder, typeOfOrder, payementExpected, amountCharged, amountPaid, orderStatus, commentStatusCycle, dateOdExpectation, nextActionLawyer, nextActionClient, govtAppNumber, dateOfFilling, lawyerRefrenceNumber, inmNumber, orderCompleteDate } = req.body;
    const userId2 = parseInt(userId);
    const firmId2 = parseInt(firmId);
    const amountCharged2 = parseInt(amountCharged);
    const amountPaid2 = parseInt(amountPaid);
    const commentStatusCycleArray = Array.isArray(commentStatusCycle) ? commentStatusCycle : [commentStatusCycle];
    const govtAppNumber2 = parseInt(govtAppNumber);
    const lawyerRefrenceNumber2 = parseInt(lawyerRefrenceNumber);
    try {
        const files = req.files;
        const documentProvidedFiles = files.documentProvided || [];
        const invoiceUploadedFiles = files.invoiceUploaded || [];
        const fileUploadedFiles = files.fileUploaded || [];
        const documentProvidedPaths = yield Promise.all(documentProvidedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'documentsProvided')));
        const invoiceUploadedPaths = yield Promise.all(invoiceUploadedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'invoicesUploaded')));
        const fileUploadedPaths = yield Promise.all(fileUploadedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'lawyerFiles')));
        const newOrder = yield client_1.default.order.create({
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
                govtAppNumber: govtAppNumber2,
                dateOfFilling,
                lawyerRefrenceNumber: lawyerRefrenceNumber2,
                inmNumber,
                orderCompleteDate
            }
        });
        res.status(200).json({
            message: "New order is created",
            newOrder
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Can't create order"
        });
    }
});
exports.createOrder = createOrder;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// updated
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = parseInt(req.params.id);
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
        const documentProvidedPaths = yield Promise.all(documentProvidedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'documentsProvided')));
        const invoiceUploadedPaths = yield Promise.all(invoiceUploadedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'invoicesUploaded')));
        const fileUploadedPaths = yield Promise.all(fileUploadedFiles.map(file => (0, uploadFile_1.uploadFile)(file, 'lawyerfiles')));
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
const getOrdersByFirm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { cursor, take } = req.query;
    const takeNumber = parseInt(take) || 10;
    const cursorObject = cursor ? { id: parseInt(cursor) } : undefined;
    try {
        const orders = yield client_1.default.order.findMany({
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
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});
exports.getOrdersByFirm = getOrdersByFirm;
//updated
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cursor, limit = 15, name, email, includeInactive } = req.query;
        const pageSize = parseInt(limit) || 15;
        const whereClause = {};
        if (name) {
            whereClause.name = { contains: name, mode: "insensitive" };
        }
        if (email) {
            whereClause.email = { contains: email, mode: "insensitive" };
        }
        if (includeInactive !== 'true') {
            whereClause.isDeleted = false;
        }
        const users = yield client_1.default.user.findMany({
            take: pageSize + 1,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: parseInt(cursor) } : undefined,
            where: Object.keys(whereClause).length ? whereClause : undefined,
        });
        const hasNextPage = users.length > pageSize;
        if (hasNextPage)
            users.pop();
        const nextCursor = hasNextPage ? users[users.length - 1].id : null;
        res.status(200).json({
            message: "all users",
            data: users,
            nextCursor,
        });
    }
    catch (error) {
        res.status(404).json({
            message: "cannot get users at the moment",
        });
    }
});
exports.getUsers = getUsers;
// need to update
const getContractor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cursor, limit, name, email } = req.query;
        const pageSize = parseInt(limit) || 10;
        const whereClause = {};
        if (name) {
            whereClause.name = { contains: name, mode: "insensitive" };
        }
        if (email) {
            whereClause.email = { contains: email, mode: "insensitive" };
        }
        const firms = yield client_1.default.firm.findMany({
            take: pageSize + 1,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: parseInt(cursor) } : undefined,
            where: Object.keys(whereClause).length ? whereClause : undefined,
        });
        const hasNextPage = firms.length > pageSize;
        if (hasNextPage)
            firms.pop();
        const firmsWithFileLinks = yield Promise.all(firms.map((firm) => __awaiter(void 0, void 0, void 0, function* () {
            const agreementFileUrl = firm.agreementFile ? yield (0, uploadFile_1.getPublicUrl)(firm.agreementFile) : null;
            const ndaFileUrl = firm.ndaFile ? yield (0, uploadFile_1.getPublicUrl)(firm.ndaFile) : null;
            const otherFileUrl = firm.other ? yield (0, uploadFile_1.getPublicUrl)(firm.other) : null;
            return Object.assign(Object.assign({}, firm), { agreementFile: agreementFileUrl, ndaFile: ndaFileUrl, other: otherFileUrl });
        })));
        res.status(200).json({
            message: "All firms",
            firms: firmsWithFileLinks,
            nextCursor: hasNextPage ? firms[firms.length - 1].id : null
        });
    }
    catch (error) {
        console.log(error);
        res.status(404).json({
            message: "Cannot get firms at the moment"
        });
    }
});
exports.getContractor = getContractor;
//this is to get whole order (updated)
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = parseInt(req.params.id);
        const order = yield client_1.default.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        const generateFileLinks = (files, folder) => __awaiter(void 0, void 0, void 0, function* () {
            const links = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                const publicUrl = yield (0, uploadFile_1.getPublicUrl)(`${folder}/${path_1.default.basename(file)}`);
                return {
                    filename: path_1.default.basename(file),
                    url: publicUrl
                };
            })));
            return links;
        });
        const documentProvidedLinks = yield generateFileLinks(order.documentProvided, 'documentsProvided');
        const invoiceUploadedLinks = yield generateFileLinks(order.invoiceUploaded, 'invoicesUploaded');
        const fileUploadedLinks = yield generateFileLinks(order.fileUploaded, 'lawyerfiles');
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
exports.getOrderById = getOrderById;
//this is to get list of order 10(updated)
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cursor, limit = 2, userId } = req.query;
        const limitNumber = parseInt(limit);
        const orders = yield client_1.default.order.findMany({
            take: limitNumber,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: parseInt(cursor) } : undefined,
            where: userId ? { userId: parseInt(userId) } : undefined,
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Can't fetch the orders, something went wrong"
        });
    }
});
exports.getOrders = getOrders;
//updated
const userById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield client_1.default.user.findUnique({
            where: { id: parseInt(id) },
        });
        if (user) {
            res.status(200).json({ user });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Cannot get user at the moment" });
    }
});
exports.userById = userById;
