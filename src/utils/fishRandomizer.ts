import { Fish, FishRarity, BaitType } from '../types/Fishing';

export const RARITY_WEIGHTS = {
    common: 0.40,     // 40%
    uncommon: 0.30,   // 30%
    rare: 0.15,       // 15%
    epic: 0.10,       // 10%
    legendary: 0.04,  // 4%
    mythical: 0.01    // 1%
} as const;

const PREFERRED_BAIT_MULTIPLIER = 3;

export function getRandomFishFromPool(fishPool: Fish[], baitType: BaitType): Fish | null {
    if (!fishPool.length) return null;

    // First, apply rarity weights and create weighted pool
    const weightedByRarity = fishPool.flatMap(fish => {
        const weight = RARITY_WEIGHTS[fish.rarity];
        // Convert percentage to number of entries (multiply by 100 for more granular distribution)
        const copies = Math.round(weight * 100);
        return Array(copies).fill(fish);
    });

    // Then apply bait preferences
    const weightedPool = weightedByRarity.flatMap(fish => {
        const isPreferred = fish.preferred_bait?.includes(baitType);
        // Add more copies for preferred bait
        return isPreferred ? Array(PREFERRED_BAIT_MULTIPLIER).fill(fish) : [fish];
    });

    if (!weightedPool.length) return null;

    // Select random fish from weighted pool
    return weightedPool[Math.floor(Math.random() * weightedPool.length)];
}