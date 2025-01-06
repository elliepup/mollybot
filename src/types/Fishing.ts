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

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythical';

export type Mutation = 'mutation' | 'mutation_2' | 'mutation_3' | 'mutation_4';

export interface Fish {
    fish_id: string;
    current_owner_id: string;
    original_owner_id: string;
    name: string;
    rarity: FishRarity;
    value: number;
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
    created_at: string;
    locked: boolean;
    shiny: boolean;
    mutation: Mutation | null;
}
