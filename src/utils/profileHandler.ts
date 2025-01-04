import { createClient } from '@supabase/supabase-js';
import { UserProfile, EconomyProfile } from '../types/Profile';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

export async function getOrCreateProfile(userId: string, username: string): Promise<{
    user: UserProfile;
    economy: EconomyProfile;
}> {
    // First, get or create user profile
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

    // Then, get or create economy profile
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

    return {
        user: userProfile,
        economy: economyProfile
    };
}
