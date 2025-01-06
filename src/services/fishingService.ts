import { supabase } from './supabaseClient';
import { BaitType, TackleBox, Fish, FishRarity } from '../types/Fishing';
import fishData from '../data/fish.json';

type FishData = {
    [key in FishRarity]: Fish[];
};

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
}> {
    // Get current profile and tackle box
    const [{ data: profile }, { data: tackleBox }] = await Promise.all([
        supabase
            .from('fishing_profiles')
            .select('fishing_bait')
            .eq('user_id', userId)
            .single(),
        supabase
            .from('tackle_boxes')
            .select('*')
            .eq('user_id', userId)
            .single()
    ]);

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

export function generateFishStats(fish: Fish) {
    // Generate random weight and length within range
    const weight = Number((Math.random() * (fish.weight_range.max - fish.weight_range.min) + fish.weight_range.min).toFixed(1));
    const length = Number((Math.random() * (fish.length_range.max - fish.length_range.min) + fish.length_range.min).toFixed(1));
    
    // Calculate if it's a perfect catch (within 90% of max)
    const isPerfect = weight >= fish.weight_range.max * 0.9 || length >= fish.length_range.max * 0.9;
    
    return {
        weight,
        length,
        isPerfect,
        catchPhrase: fish.catch_phrase?.[Math.floor(Math.random() * fish.catch_phrase.length)] || "You caught a fish!"
    };
}
