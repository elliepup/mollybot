import { supabase } from './supabaseClient';
import { BaitType, TackleBox, Fish, FishRarity } from '../types/Fishing';
import fishData from '../data/fish.json';
import { generateUniqueId } from '../utils/idGenerator';
import { FISHING_XP_REWARDS } from '../utils/rarityUtils';

const FISHING_COOLDOWN_MS = 30000; // 30 seconds

type FishData = {
    [key in FishRarity]: Fish[];
};

// Add type for fishing profile stats columns
type FishingStatColumn = `${FishRarity}_fish_caught`;

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

export async function verifyBait(userId: string): Promise<{
    success: boolean;
    error?: string;
    currentBait?: BaitType;
    baitCount?: number;
    cooldownRemaining?: number;
}> {
    // Get current profile and tackle box
    const [{ data: profile }, { data: tackleBox }] = await Promise.all([
        supabase
            .from('fishing_profiles')
            .select('fishing_bait, last_fished')
            .eq('user_id', userId)
            .single(),
        supabase
            .from('tackle_boxes')
            .select('*')
            .eq('user_id', userId)
            .single()
    ]);

    // Check cooldown first
    if (profile?.last_fished) {
        const lastFished = new Date(profile.last_fished);
        const timeSinceLastFish = Date.now() - lastFished.getTime();
        
        if (timeSinceLastFish < FISHING_COOLDOWN_MS) {
            return {
                success: false,
                error: 'You need to wait before fishing again!',
                cooldownRemaining: Math.ceil((FISHING_COOLDOWN_MS - timeSinceLastFish) / 1000)
            };
        }
    }

    if (!profile || !profile.fishing_bait) {
        return {
            success: false,
            error: 'You need to select bait first! Use `/bait` to choose your bait.'
        };
    }

    if (!tackleBox || !tackleBox[profile.fishing_bait]) {
        return {
            success: false,
            error: `You don't have any ${profile.fishing_bait}! Buy some from the shop.`
        };
    }

    const baitCount = tackleBox[profile.fishing_bait as keyof TackleBox] as number;
    if (baitCount <= 0) {
        return {
            success: false,
            error: `You're out of ${profile.fishing_bait}! Buy more from the shop.`
        };
    }

    return {
        success: true,
        currentBait: profile.fishing_bait,
        baitCount
    };
}

export function getRandomFish(baitType: BaitType): Fish | null {
    // Compile all fish that prefer this bait
    const possibleFish: Fish[] = [];
    const typedFishData = fishData as FishData;
    
    Object.values(typedFishData).forEach((fishList) => {
        fishList.forEach(fish => {
            // Cast preferred_bait to BaitType[] to ensure type safety
            const preferredBait = fish.preferred_bait as BaitType[] | undefined;
            if (preferredBait?.includes(baitType)) {
                // Higher chance (duplicate entries) if it's preferred bait
                possibleFish.push(fish, fish);
            } else {
                // Still catchable with non-preferred bait
                possibleFish.push(fish);
            }
        });
    });

    if (possibleFish.length === 0) return null;
    return possibleFish[Math.floor(Math.random() * possibleFish.length)];
}

export async function generateFishStats(fish: Fish, userId: string) {
    // Generate unique ID for this catch
    const uniqueId = await generateUniqueId('caught_fish', 'catch_id');
    
    // Generate random length first
    const length = Number((Math.random() * (fish.length_range.max - fish.length_range.min) + fish.length_range.min).toFixed(1));
    
    // Calculate length percentage relative to possible range
    const lengthPercentage = (length - fish.length_range.min) / (fish.length_range.max - fish.length_range.min);
    
    // Calculate weight based on length with some randomness
    const baseWeight = fish.weight_range.min + ((fish.weight_range.max - fish.weight_range.min) * lengthPercentage);
    const randomFactor = 0.85 + (Math.random() * 0.3); // Random factor between 0.85 and 1.15
    const weight = Number((baseWeight * randomFactor).toFixed(1));
    
    // Calculate weight percentage relative to possible range
    const weightPercentage = (weight - fish.weight_range.min) / (fish.weight_range.max - fish.weight_range.min);
    
    // Calculate value multiplier based on average of length and weight percentages
    const sizePercentage = (lengthPercentage + weightPercentage) / 2;
    const valueMultiplier = 0.5 + sizePercentage; // Range: 0.5x to 1.5x base value
    
    // Calculate final value
    const value = Math.round(fish.base_value * valueMultiplier);
    
    // Perfect catch if either metric is in top 10%
    const isPerfect = length >= fish.length_range.max * 0.9 || weight >= fish.weight_range.max * 0.9;
    
    return {
        catch_id: uniqueId,
        weight,
        length,
        value,
        isPerfect,
        catchPhrase: fish.catch_phrase?.[Math.floor(Math.random() * fish.catch_phrase.length)] || "You caught a fish!"
    };
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
            image_url: fish.image_url
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
