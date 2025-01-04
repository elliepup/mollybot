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

function getPayMultiplier(maxPay: number): number {
    // Higher pay = lower chance
    if (maxPay >= 400) return 0.3;      // 30% of original chance
    if (maxPay >= 200) return 0.5;      // 50% of original chance
    if (maxPay >= 150) return 0.7;      // 70% of original chance
    if (maxPay >= 100) return 0.8;      // 80% of original chance
    return 1;                           // No reduction for low-paying jobs
}

function getSuccessRate(currentTier: JobTier | null, targetTier: JobTier, targetJob: Job): number {
    const tiers: JobTier[] = ['entry_level', 'regular', 'professional'];

    // Calculate base success rate
    let baseRate: number;

    // If unemployed (no current job)
    if (!currentTier) {
        switch (targetTier) {
            case 'entry_level': baseRate = 0.8; break;   // 80% base chance
            case 'regular': baseRate = 0.02; break;      // 2% base chance
            case 'professional': baseRate = 0; break;     // 0% base chance
            default: return 0;
        }
    } else {
        const currentTierIndex = tiers.indexOf(currentTier);
        const targetTierIndex = tiers.indexOf(targetTier);

        // Applying for lower tier jobs
        if (targetTierIndex < currentTierIndex) {
            return 1; // Always 100% chance for lower tier jobs
        }

        // Applying within same tier
        if (targetTierIndex === currentTierIndex) {
            baseRate = 0.75; // 75% base chance
        }
        // Progressive chances for next tier
        else if (currentTier === 'entry_level' && targetTier === 'regular') {
            baseRate = 0.4; // 40% base chance
        }
        else if (currentTier === 'entry_level' && targetTier === 'professional') {
            baseRate = 0.01; // 1% base chance
        }
        else if (currentTier === 'regular' && targetTier === 'professional') {
            baseRate = 0.2; // 20% base chance
        }
        else {
            baseRate = 0;
        }
    }

    // Apply pay multiplier to base rate
    const finalRate = baseRate * getPayMultiplier(targetJob.maxPay);
    
    // Round to 4 decimal places for cleaner display
    return Math.round(finalRate * 10000) / 10000;
}

export async function applyForJob(userId: string, jobId: string): Promise<{
    success: boolean;
    cooldownRemaining?: number;
    error?: string;
    successRate?: number;  // Add this to show rate in message
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
        const cooldownTime = 24 * 60 * 60 * 1000;
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

    // Find the target job first
    const allJobs = jobs as JobList;
    let targetJob: Job | null = null;
    for (const tier of Object.values(allJobs)) {
        targetJob = tier.find((j: Job) => j.id === jobId) || null;
        if (targetJob) break;
    }

    if (!targetJob || !targetTier) {
        return { success: false, error: 'Invalid job ID' };
    }

    // If already has this job
    if (profile.job_id === jobId) {
        return { success: false, error: 'You already have this job!' };
    }

    // Calculate success chance
    const successRate = getSuccessRate(currentTier, targetTier, targetJob);
    const succeeded = Math.random() < successRate;

    // Always update last_job_apply even if application fails
    await supabase
        .from('economy_profiles')
        .update({ last_job_apply: now.toISOString() })
        .eq('user_id', userId);

    if (!succeeded) {
        return { 
            success: false, 
            error: `Your job application was rejected! (${(successRate * 100).toFixed(2)}% success rate)`
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

export async function depositMoney(userId: string, amount: number): Promise<{
    success: boolean;
    error?: string;
    newWalletBalance?: number;
    newBankBalance?: number;
}> {
    const { data: profile } = await supabase
        .from('economy_profiles')
        .select('wallet_balance, bank_balance')
        .eq('user_id', userId)
        .single();

    if (!profile) throw new Error('Profile not found');

    if (amount <= 0) {
        return { success: false, error: 'Amount must be greater than 0' };
    }

    if (amount > profile.wallet_balance) {
        return { success: false, error: 'You don\'t have enough money in your wallet' };
    }

    const { error } = await supabase
        .from('economy_profiles')
        .update({
            wallet_balance: profile.wallet_balance - amount,
            bank_balance: profile.bank_balance + amount
        })
        .eq('user_id', userId);

    if (error) throw error;

    return {
        success: true,
        newWalletBalance: profile.wallet_balance - amount,
        newBankBalance: profile.bank_balance + amount
    };
}