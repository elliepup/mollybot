import { createClient } from '@supabase/supabase-js';
import { UserProfile, EconomyProfile } from '../types/Profile';
import { Job, JobList, JobTier } from '../types/Job';
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
    response?: string;
}> {
    const { data: profile } = await supabase
        .from('economy_profiles')
        .select('last_work, wallet_balance, job_id')
        .eq('user_id', userId)
        .single();

    if (!profile) throw new Error('Profile not found');

    const now = new Date();
    const currentJob = await getCurrentJob(userId);
    
    // If last_work is null, allow them to work
    if (!profile.last_work) {
        const earned = currentJob 
            ? Math.floor(Math.random() * (currentJob.maxPay - currentJob.minPay + 1)) + currentJob.minPay
            : Math.floor(Math.random() * (120 - 40 + 1)) + 40;

        const response = currentJob?.responses 
            ? currentJob.responses[Math.floor(Math.random() * currentJob.responses.length)]
            : undefined;

        const { error } = await supabase
            .from('economy_profiles')
            .update({
                wallet_balance: profile.wallet_balance + earned,
                last_work: now.toISOString()
            })
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true, earned, response };
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

    const earned = currentJob 
        ? Math.floor(Math.random() * (currentJob.maxPay - currentJob.minPay + 1)) + currentJob.minPay
        : Math.floor(Math.random() * (120 - 40 + 1)) + 40;

    const response = currentJob?.responses 
        ? currentJob.responses[Math.floor(Math.random() * currentJob.responses.length)]
        : undefined;

    const { error } = await supabase
        .from('economy_profiles')
        .update({
            wallet_balance: profile.wallet_balance + earned,
            last_work: now.toISOString()
        })
        .eq('user_id', userId);

    if (error) throw error;

    return { success: true, earned, response };
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

function getJobTier(jobId: string): JobTier | null {
    const allJobs = jobs as JobList;
    for (const [tier, jobList] of Object.entries(allJobs)) {
        if (jobList.some((job: Job) => job.id === jobId)) {
            return tier as JobTier;
        }
    }
    return null;
}

function getSuccessRate(currentTier: JobTier | null, targetTier: JobTier): number {
    const tiers: JobTier[] = ['entry_level', 'regular', 'professional'];

    // If unemployed (no current job)
    if (!currentTier) {
        switch (targetTier) {
            case 'entry_level': return 0.8;   // 80% chance for entry level
            case 'regular': return 0.02;      // 2% chance for regular
            case 'professional': return 0;     // 0% chance for professional (must work your way up)
            default: return 0;
        }
    }

    const currentTierIndex = tiers.indexOf(currentTier);
    const targetTierIndex = tiers.indexOf(targetTier);

    // Applying for lower tier jobs
    if (targetTierIndex < currentTierIndex) {
        return 1; // 100% chance for lower tier jobs
    }

    // Applying within same tier
    if (targetTierIndex === currentTierIndex) {
        return 0.75; // 75% chance for same tier jobs
    }

    // Progressive chances for next tier
    if (currentTier === 'entry_level' && targetTier === 'regular') {
        return 0.4; // 40% chance for regular when in entry level
    }

    if (currentTier === 'entry_level' && targetTier === 'professional') {
        return 0.01; // 1% chance for professional from entry level
    }

    if (currentTier === 'regular' && targetTier === 'professional') {
        return 0.2; // 20% chance for professional when in regular
    }

    return 0; // Default to 0% chance for invalid progressions
}

export async function applyForJob(userId: string, jobId: string): Promise<{
    success: boolean;
    cooldownRemaining?: number;
    error?: string;
}> {
    const { data: profile } = await supabase
        .from('economy_profiles')
        .select('last_job_apply, job_id')
        .eq('user_id', userId)
        .single();

    if (!profile) throw new Error('Profile not found');

    // Check cooldown
    const now = new Date();
    if (profile.last_job_apply) {
        const lastApply = new Date(profile.last_job_apply);
        const cooldownTime = 24 * 60 * 60 * 1000 * 0; // just for testing, set to 0 for no cooldown
        const timeSinceLastApply = now.getTime() - lastApply.getTime();

        if (timeSinceLastApply < cooldownTime) {
            return {
                success: false,
                cooldownRemaining: Math.ceil((cooldownTime - timeSinceLastApply) / 1000)
            };
        }
    }

    // Get current and target job tiers
    const targetTier = getJobTier(jobId);
    const currentTier = profile.job_id ? getJobTier(profile.job_id) : null;

    if (!targetTier) {
        return { success: false, error: 'Invalid job ID' };
    }

    // If already has this job
    if (profile.job_id === jobId) {
        return { success: false, error: 'You already have this job!' };
    }

    // Calculate success chance
    const successRate = getSuccessRate(currentTier, targetTier);
    const succeeded = Math.random() < successRate;

    // Always update last_job_apply even if application fails
    await supabase
        .from('economy_profiles')
        .update({ last_job_apply: now.toISOString() })
        .eq('user_id', userId);

    if (!succeeded) {
        return { 
            success: false, 
            error: `Your job application was rejected! (${Math.floor(successRate * 100)}% success rate)`
        };
    }

    // Update job if succeeded
    const { error } = await supabase
        .from('economy_profiles')
        .update({
            job_id: jobId,
            last_job_apply: now.toISOString()
        })
        .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
}