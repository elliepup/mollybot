export type FishingRod = 'basic' | 'amateur' | 'professional' | 'expert' | 'legendary';
export type BaitType = 'worms' | 'shrimp' | 'crickets' | 'leeches' | 'minnows' | 'nightcrawlers';

export interface TackleBox {
    user_id: string;
    worms: number;
    shrimp: number;
    crickets: number;
    leeches: number;
    minnows: number;
    nightcrawlers: number;
    created_at: string;
}

export interface FishingProfile {
    user_id: string;
    fishing_rod: FishingRod;
    fishing_bait: BaitType;
    common_fish_caught: number;
    uncommon_fish_caught: number;
    rare_fish_caught: number;
    legendary_fish_caught: number;
    mythical_fish_caught: number;
    fishing_skill_xp: number;
    total_catches: number;
    last_fish_catch: string | null;
    created_at: string;
}

export const FishRarity = {
    Common: 'common',
    Uncommon: 'uncommon',
    Rare: 'rare',
    Epic: 'epic',
    Legendary: 'legendary',
    Mythical: 'mythical'
} as const;

export type FishRarity = typeof FishRarity[keyof typeof FishRarity];

export interface Fish {
    fish_id: string;
    name: string;
    rarity: FishRarity;
    base_value: number;
    weight_range: {
        min: number;
        max: number;
    };
    length_range: {
        min: number;
        max: number;
    };
    image_url: string;
    catch_phrase?: string[];
    preferred_bait?: BaitType[];
    bodies_of_water?: string[];
}

export type FishMutation = 'albino' | 'golden' | 'giant' | 'ancient' | 'prismatic' | 'void' | 'cursed';

export interface CaughtFish {
    catch_id: string;
    fish_id: string;
    name: string;
    rarity: FishRarity;
    value: number;
    weight: number;
    length: number;
    shiny: boolean;
    mutation?: FishMutation;
    current_owner_id: string;
    original_owner_id: string;
    caught_at: string;
    image_url: string;
}

// Add a type for value multipliers
export interface FishModifiers {
    shinyMultiplier: number;
    mutationMultipliers: {
        [key in FishMutation]: number;
    };
    perfectSizeBonus: number;  // Bonus for fish near max size
}
