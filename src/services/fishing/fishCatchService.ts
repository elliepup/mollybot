import { BaitType, Fish, FishRarity, TackleBox } from "../../types/Fishing";
import { supabase } from "../supabaseClient";
import { FISHING_XP_REWARDS } from '../../utils/rarityUtils';
import { getRandomFishFromPool } from '../../utils/fishRandomizer';

type FishData = {
    [key in FishRarity]: Fish[];
};

// Add type for fishing profile stats columns
type FishingStatColumn = `${FishRarity}_fish_caught`;

export async function getRandomFish(baitType: BaitType): Promise<Fish | null> {
    // Get ALL fish from database
    const { data: fishList, error } = await supabase
        .from('fish_types')
        .select('*');

    if (error || !fishList?.length) {
        console.error('Error fetching fish:', error);
        return null;
    }

    // Transform database fields to match Fish interface
    const allFish = fishList.map(fish => ({
        fish_id: fish.fish_id,
        name: fish.name,
        rarity: fish.rarity as FishRarity,
        base_value: fish.base_value,
        weight_range: {
            min: fish.weight_min,
            max: fish.weight_max
        },
        length_range: {
            min: fish.length_min,
            max: fish.length_max
        },
        image_url: fish.image_url,
        catch_phrases: fish.catch_phrases,
        preferred_bait: fish.preferred_bait,
        bodies_of_water: fish.bodies_of_water
    }));

    return getRandomFishFromPool(allFish, baitType);
}

export async function saveCaughtFish(fish: Fish, stats: any, userId: string): Promise<boolean> {
    // First get current profile stats
    const { data: profile } = await supabase
        .from('fishing_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!profile) return false;

    // Calculate XP reward
    const xpReward = FISHING_XP_REWARDS[fish.rarity];
    const newXP = (profile.fishing_skill_xp || 0) + xpReward;

    // Create the caught fish record
    const { error: fishError } = await supabase
        .from('caught_fish')
        .insert([{
            catch_id: stats.catch_id,
            fish_id: fish.fish_id,
            name: fish.name,
            rarity: fish.rarity,
            value: stats.value,
            weight: stats.weight,
            length: stats.length,
            current_owner_id: userId,
            original_owner_id: userId,
            image_url: fish.image_url,
            mutation: stats.mutation || null
        }]);

    if (fishError) {
        console.error('Error saving caught fish:', fishError);
        return false;
    }

    // Create the stat column name with type safety
    const statColumn: FishingStatColumn = `${fish.rarity}_fish_caught`;

    // Update fishing profile statistics including XP
    const { error: statsError } = await supabase
        .from('fishing_profiles')
        .update({
            [statColumn]: (profile[statColumn] || 0) + 1,
            total_catches: (profile.total_catches || 0) + 1,
            last_fish_catch: new Date().toISOString(),
            fishing_skill_xp: newXP
        })
        .eq('user_id', userId);

    if (statsError) {
        console.error('Error updating fishing stats:', statsError);
        return false;
    }

    return true;
}

export async function deductBait(userId: string, baitType: BaitType): Promise<boolean> {
    // First get current bait amount
    const { data: tackleBox } = await supabase
        .from('tackle_boxes')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!tackleBox) return false;

    // Type assertion to ensure tackleBox has the correct shape
    const typedTackleBox = tackleBox as TackleBox;
    const currentAmount = typedTackleBox[baitType] || 0;

    const { error } = await supabase
        .from('tackle_boxes')
        .update({
            [baitType]: currentAmount - 1
        })
        .eq('user_id', userId);

    if (error) {
        console.error('Error deducting bait:', error);
        return false;
    }

    return true;
}

export async function startFishing(userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('fishing_profiles')
        .update({ last_fished: new Date().toISOString() })
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating last_fished:', error);
        return false;
    }

    return true;
}

export async function getUserFishCollection(userId: string) {
    const { data: collection } = await supabase
        .from('caught_fish')
        .select('*')
        .eq('current_owner_id', userId)
        .order('caught_at', { ascending: false });

    return collection || [];
}

export async function getFishByCatchId(catchId: string) {
    const { data: fish } = await supabase
        .from('caught_fish')
        .select('*')
        .eq('catch_id', catchId)
        .single();

    return fish;
}