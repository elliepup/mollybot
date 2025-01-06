import { supabase } from './supabaseClient';
import { BaitType, TackleBox } from '../types/Fishing';

export async function setBait(userId: string, baitType: BaitType): Promise<{
    success: boolean;
    currentBait: BaitType;
    baitCount: number;
}> {
    // Get current tackle box and fishing profile
    const [{ data: tackleBox }, { data: profile }] = await Promise.all([
        supabase
            .from('tackle_boxes')
            .select('*')
            .eq('user_id', userId)
            .single(),
        supabase
            .from('fishing_profiles')
            .select('fishing_bait')
            .eq('user_id', userId)
            .single()
    ]);

    // Update the fishing profile with new bait selection
    const { error } = await supabase
        .from('fishing_profiles')
        .update({ fishing_bait: baitType })
        .eq('user_id', userId);

    if (error) throw error;

    return {
        success: true,
        currentBait: baitType,
        baitCount: tackleBox ? tackleBox[baitType] : 0
    };
}

export async function getTackleBox(userId: string): Promise<TackleBox | null> {
    const { data: tackleBox } = await supabase
        .from('tackle_boxes')
        .select('*')
        .eq('user_id', userId)
        .single();

    return tackleBox;
}

export async function addBaitToTackleBox(userId: string, baitType: BaitType, amount: number): Promise<{
    success: boolean;
    error?: string;
    newAmount?: number;
}> {
    const { data: tackleBox } = await supabase
        .from('tackle_boxes')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!tackleBox) {
        // Create new tackle box if it doesn't exist
        const { error } = await supabase
            .from('tackle_boxes')
            .insert([{ 
                user_id: userId,
                [baitType]: amount 
            }]);

        if (error) throw error;
        return { success: true, newAmount: amount };
    }

    const currentAmount = tackleBox[baitType as keyof TackleBox] as number || 0;
    
    // Update existing tackle box
    const { error } = await supabase
        .from('tackle_boxes')
        .update({
            [baitType]: currentAmount + amount
        })
        .eq('user_id', userId);

    if (error) throw error;

    return {
        success: true,
        newAmount: currentAmount + amount
    };
}
