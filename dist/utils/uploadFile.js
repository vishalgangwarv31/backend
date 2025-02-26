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
exports.uploadFile = uploadFile;
exports.getPublicUrl = getPublicUrl;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function uploadFile(file, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        const { data, error } = yield supabase.storage
            .from('user-files')
            .upload(`${folder}/${uniqueName}`, file.buffer, {
            cacheControl: '3600',
            upsert: false
        });
        if (error) {
            throw error;
        }
        return data.path;
    });
}
function getPublicUrl(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield supabase.storage
            .from('user-files')
            .getPublicUrl(path, { download: true });
        return data.publicUrl;
    });
}
