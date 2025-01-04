import { createClient } from '@supabase/supabase-js';
import { UserProfile, EconomyProfile } from '../types/Profile';
import { Job, JobList } from '../types/Job';
import jobs from '../data/jobs.json';

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

export async function processWork(userId: string): Promise<{
    success: boolean;
    cooldownRemaining?: number;
    earned?: number;
}> {
    const { data: profile } = await supabase
        .from('economy_profiles')
        .select('last_work, wallet_balance')
        .eq('user_id', userId)
        .single();

    if (!profile) throw new Error('Profile not found');

    const now = new Date();
    
    // If last_work is null, allow them to work
    if (!profile.last_work) {
        const earned = Math.floor(Math.random() * (120 - 40 + 1)) + 40;

        const { error } = await supabase
            .from('economy_profiles')
            .update({
                wallet_balance: profile.wallet_balance + earned,
                last_work: now.toISOString()
            })
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true, earned };
    }

    const lastWork = new Date(profile.last_work);
    const cooldownTime = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    const timeSinceLastWork = now.getTime() - lastWork.getTime();

    if (timeSinceLastWork < cooldownTime) {
        return {
            success: false,
            cooldownRemaining: Math.ceil((cooldownTime - timeSinceLastWork) / 1000)
        };
    }

    const earned = Math.floor(Math.random() * (120 - 40 + 1)) + 40;

    const { error } = await supabase
        .from('economy_profiles')
        .update({
            wallet_balance: profile.wallet_balance + earned,
            last_work: now.toISOString()
        })
        .eq('user_id', userId);

    if (error) throw error;

    return { success: true, earned };
}

export async function getCurrentJob(userId: string): Promise<Job | null> {
    const { data: profile } = await supabase
        .from('economy_profiles')
        .select('job_id')
        .eq('user_id', userId)
        .single();

    if (!profile || !profile.job_id) return null;

    const allJobs = jobs as JobList;
    for (const tier of Object.values(allJobs)) {
        const job = tier.find((j: Job) => j.id === profile.job_id);
        if (job) return job;
    }

    return null;
}