import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL || !process.env.DATABASE_PASSWORD) {
    throw new Error('Database credentials not found in environment variables');
}

export const supabase = createClient(
    process.env.DATABASE_URL,
    process.env.DATABASE_PASSWORD,
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
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) throw error;
        console.log('Successfully connected to Supabase!');
        return true;
    } catch (error) {
        console.error('Error connecting to Supabase:', error);
        return false;
    }
}
