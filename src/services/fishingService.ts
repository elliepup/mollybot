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
