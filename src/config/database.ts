import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('Database credentials not found in environment variables');
}

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        }
    }
);

// Test the connection
export async function testConnection() {
    try {
        const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
        if (error) throw error;
        console.log('Successfully connected to Supabase!');
        return true;
    } catch (error) {
        console.error('Error connecting to Supabase:', error);
        return false;
    }
}
