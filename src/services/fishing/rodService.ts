import { supabase } from '../supabaseClient';
import { RodData } from '../../types/Fishing';
import rodData from '../../data/rods.json';

export async function getRodById(rodId: string) {
    const { data: rod, error } = await supabase
        .from('fishing_rods')
        .select('*')
        .eq('rod_id', rodId)
        .single();

    if (error || !rod) {
        return null;
    }

    const typedRodData = rodData as RodData;
    const rodInfo = typedRodData.rods[rod.rod_type];

    return {
        ...rod,
        info: rodInfo
    };
}

export async function getUserRodCollection(userId: string) {
    const { data: rods } = await supabase
        .from('fishing_rods')
        .select('*')
        .eq('user_id', userId)
        .order('acquired_at', { ascending: false });

    if (!rods) return [];

    const typedRodData = rodData as RodData;
    return rods.map(rod => ({
        ...rod,
        info: typedRodData.rods[rod.rod_type]
    }));
}

export async function equipRod(userId: string, rodId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    // Verify rod ownership before equipping
    const { data: rod } = await supabase
        .from('fishing_rods')
        .select('rod_id')
        .eq('rod_id', rodId)
        .eq('user_id', userId)
        .single();

    if (!rod) {
        return {
            success: false,
            error: 'Rod not found or not owned by user'
        };
    }

    // Update equipped rod
    const { error } = await supabase
        .from('fishing_profiles')
        .update({ equipped_rod_id: rodId })
        .eq('user_id', userId);

    if (error) {
        return {
            success: false,
            error: 'Failed to equip rod'
        };
    }

    return {
        success: true
    };
}

export async function getEquippedRod(userId: string) {
    const { data: profile } = await supabase
        .from('fishing_profiles')
        .select('equipped_rod_id')
        .eq('user_id', userId)
        .single();

    if (!profile?.equipped_rod_id) {
        return null;
    }

    return getRodById(profile.equipped_rod_id);
}