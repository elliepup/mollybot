import { FishRarity } from '../types/Fishing';

export const FISHING_XP_REWARDS: Record<FishRarity, number> = {
    common: 1,
    uncommon: 3,
    rare: 8,
    epic: 15,
    legendary: 35,
    mythical: 50
};

export function getRarityStars(rarity: FishRarity): string {
    const ratings = {
        common: '☆☆☆☆☆',
        uncommon: '★☆☆☆☆',
        rare: '★★☆☆☆',
        epic: '★★★☆☆',
        legendary: '★★★★☆',
        mythical: '★★★★★'
    };
    return ratings[rarity] || '☆☆☆☆☆';
}

export function getRarityColor(rarity: FishRarity): number {
    const colors = {
        common: 0x919191,     // White
        uncommon: 0xFFFFFF,   // Light Blue
        rare: 0x82FDFF,       // Blue
        epic: 0x6B00FD,      // Purple
        legendary: 0xFBFF00,  // Dark Purple
        mythical: 0xFF00E0    // Red
    };
    return colors[rarity] || 0xffffff;
}
