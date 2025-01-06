import { supabase } from '../services/supabaseClient';

export async function generateUniqueId(tableName: string, idColumn: string): Promise<string> {
    let isUnique = false;
    let id = '';

    while (!isUnique) {
        // Generate 6 character alphanumeric ID (lowercase)
        id = Math.random().toString(36).substring(2, 8).toLowerCase();
        
        // Check if ID exists in the specified table
        const { data } = await supabase
            .from(tableName)
            .select(idColumn)
            .eq(idColumn, id)
            .single();

        if (!data) {
            isUnique = true;
        }
    }

    return id;
}
