"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminRouter_1 = __importDefault(require("./routes/adminRouter"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const firmRouter_1 = __importDefault(require("./routes/firmRouter"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3000;
const corsOptions = {
    origin: 'http://localhost:5174',
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
dotenv_1.default.config();
app.get('/', (req, res) => {
    res.send("hello");
});
app.use('/api/admin', adminRouter_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/firm', firmRouter_1.default);
app.listen(PORT, () => {
    console.log("sd,jf");
});
