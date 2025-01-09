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