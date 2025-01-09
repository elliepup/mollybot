import { supabase } from '../supabaseClient';
import rodData from '../../data/rods.json';
import { generateUniqueId } from '../../utils/idGenerator';

// Gacha rates for rod rarities
export const ROD_RARITY_RATES = {
    common: 0.60,      // 60% - Driftwood/Bamboo
    uncommon: 0.25,    // 25% - Angler's Whisper/Coral Weaver
    rare: 0.10,       // 10% - Tide Caller/Frost Fisher
    epic: 0.04,       // 4%  - Storm Breaker/Void Fisher
    legendary: 0.008,  // 0.8% - Celestial Fisher/Lunar Dreamer
    mythical: 0.002    // 0.2% - Leviathan Lure/Star Seeker
} as const;

const PULL_COSTS = {
    single: 300,    // 300 essence per pull
    multi: 2700     // 2700 essence for 10 pulls (10% discount)
};

export type RodRarity = keyof typeof ROD_RARITY_RATES;

interface GachaPullResult {
    rod_id: string;
    rod_type: string;
    rarity: RodRarity;
    isNew: boolean;
}

export async function pullRod(userId: string, isMultiPull: boolean = false): Promise<{
    success: boolean;
    error?: string;
    results?: GachaPullResult[];
    newBalance?: number;
}> {
    const pullCount = isMultiPull ? 10 : 1;
    const cost = isMultiPull ? PULL_COSTS.multi : PULL_COSTS.single;

    // Check if user has enough essence
    const { data: profile, error: profileError } = await supabase
        .from('economy_profiles')
        .select('astral_essence')
        .eq('user_id', userId)
        .single();

    if (profileError || !profile) {
        return {
            success: false,
            error: 'Failed to fetch user profile'
        };
    }

    if (profile.astral_essence < cost) {
        return {
            success: false,
            error: `Not enough astral essence! Need ${cost} but have ${profile.astral_essence}`
        };
    }

    // Perform gacha pulls
    const pulls = Array.from({ length: pullCount }, () => performSinglePull());
    
    // Generate unique IDs for each rod
    const rodIds = await Promise.all(
        pulls.map(() => generateUniqueId('fishing_rods', 'rod_id'))
    );

    // Begin transaction
    const { data: result, error: transactionError } = await supabase.rpc('process_rod_pulls', {
        p_user_id: userId,
        p_cost: cost,
        p_rod_types: pulls.map(p => p.rod_type),
        p_rod_ids: rodIds
    });

    if (transactionError) {
        return {
            success: false,
            error: transactionError.message
        };
    }

    return {
        success: true,
        results: pulls.map((pull, i) => ({
            ...pull,
            rod_id: rodIds[i],
            isNew: result.new_rods.includes(pull.rod_type)
        })),
        newBalance: result.new_balance
    };
}

function performSinglePull(): { rod_type: string; rarity: RodRarity } {
    const roll = Math.random();
    let cumulative = 0;

    // Determine rarity based on rates
    let selectedRarity: RodRarity = 'common';
    for (const [rarity, rate] of Object.entries(ROD_RARITY_RATES)) {
        cumulative += rate;
        if (roll <= cumulative) {
            selectedRarity = rarity as RodRarity;
            break;
        }
    }

    // Get all rods of the selected rarity
    const rodsOfRarity = Object.entries(rodData.rods)
        .filter(([_, rod]) => rod.rarity === selectedRarity)
        .map(([id]) => id);

    // Randomly select one rod from the rarity pool
    const rod_type = rodsOfRarity[Math.floor(Math.random() * rodsOfRarity.length)];

    return { rod_type, rarity: selectedRarity };
}