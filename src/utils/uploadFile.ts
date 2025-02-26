import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv"

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
        .from('user-files')
        .upload(`${folder}/${uniqueName}`, file.buffer, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        throw error;
    }

    return data.path;
}

export async function getPublicUrl(path: string): Promise<string> {
    const { data } = await supabase.storage
        .from('user-files')
        .getPublicUrl(path ,{ download: true });

    return data.publicUrl;
}

