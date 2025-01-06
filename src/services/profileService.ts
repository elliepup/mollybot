import { UserProfile } from '../types/Profile';
import { EconomyProfile } from '../types/Economy';
import { FishingProfile } from '../types/Fishing';
import { supabase } from './supabaseClient';

export async function getOrCreateProfile(userId: string, username: string | undefined | null): Promise<{
    user: UserProfile;
    economy: EconomyProfile;
    fishing: FishingProfile;
}> {
    // Create or get user profile
    let { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!userProfile) {
        const { data: newProfile, error } = await supabase
            .from('user_profiles')
            .insert([{ user_id: userId, username }])
            .select()
            .single();

        if (error) throw error;
        userProfile = newProfile;
    }

    // Create or get economy profile
    let { data: economyProfile } = await supabase
        .from('economy_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!economyProfile) {
        const { data: newEconomyProfile, error } = await supabase
            .from('economy_profiles')
            .insert([{ user_id: userId }])
            .select()
            .single();

        if (error) throw error;
        economyProfile = newEconomyProfile;
    }

    // Create or get fishing profile
    let { data: fishingProfile } = await supabase
        .from('fishing_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!fishingProfile) {
        const { data: newFishingProfile, error } = await supabase
            .from('fishing_profiles')
            .insert([{ 
                user_id: userId,
                fishing_rod: 'basic',
                fishing_bait: 'worms',
                common_fish_caught: 0,
                uncommon_fish_caught: 0,
                rare_fish_caught: 0,
                legendary_fish_caught: 0,
                mythical_fish_caught: 0,
                fishing_skill_xp: 0,
                total_catches: 0
            }])
            .select()
            .single();

        if (error) throw error;
        fishingProfile = newFishingProfile;
    }

    return { 
        user: userProfile, 
        economy: economyProfile,
        fishing: fishingProfile
    };
}
