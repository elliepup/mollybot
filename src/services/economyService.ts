import { supabase } from './supabaseClient';

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

// Make sure withdrawMoney is properly exported
export async function withdrawMoney(userId: string, amount: number): Promise<{
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

    if (amount > profile.bank_balance) {
        return { success: false, error: 'You don\'t have enough money in your bank' };
    }

    const { error } = await supabase
        .from('economy_profiles')
        .update({
            wallet_balance: profile.wallet_balance + amount,
            bank_balance: profile.bank_balance - amount
        })
        .eq('user_id', userId);

    if (error) throw error;

    return {
        success: true,
        newWalletBalance: profile.wallet_balance + amount,
        newBankBalance: profile.bank_balance - amount
    };
}

export async function claimDailyReward(userId: string): Promise<{
    success: boolean;
    error?: string;
    cooldownRemaining?: number;
    amount?: number;
    streak?: number;
}> {
    const { data: profile } = await supabase
        .from('economy_profiles')
        .select('wallet_balance, last_daily, daily_streak')
        .eq('user_id', userId)
        .single();

    if (!profile) throw new Error('Profile not found');

    const now = new Date();
    if (profile.last_daily) {
        const lastDaily = new Date(profile.last_daily);
        const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const timeSinceLastDaily = now.getTime() - lastDaily.getTime();

        if (timeSinceLastDaily < cooldownTime) {
            return {
                success: false,
                cooldownRemaining: Math.ceil((cooldownTime - timeSinceLastDaily) / 1000)
            };
        }
    }

    // Calculate streak
    let streak = profile.daily_streak || 0;
    if (profile.last_daily) {
        const lastDaily = new Date(profile.last_daily);
        const hoursSinceLastDaily = (now.getTime() - lastDaily.getTime()) / (1000 * 60 * 60);
        
        // If more than 48 hours have passed, reset streak
        if (hoursSinceLastDaily > 48) {
            streak = 0;
        }
    }
    streak++;

    // Calculate reward (base 100 + 10 per streak, max 250)
    const amount = Math.min(100 + (streak * 10), 250);

    const { error } = await supabase
        .from('economy_profiles')
        .update({
            wallet_balance: profile.wallet_balance + amount,
            last_daily: now.toISOString(),
            daily_streak: streak
        })
        .eq('user_id', userId);

    if (error) throw error;

    return {
        success: true,
        amount,
        streak
    };
}

export type LeaderboardType = 'total' | 'wallet' | 'bank';

export async function getLeaderboard(type: LeaderboardType = 'total', limit: number = 10) {
    let query = supabase
        .from('economy_profiles')
        .select('user_id, wallet_balance, bank_balance');

    if (type === 'wallet') {
        query = query.order('wallet_balance', { ascending: false });
    } else if (type === 'bank') {
        query = query.order('bank_balance', { ascending: false });
    } else {
        query = query.order('wallet_balance', { ascending: false })
            .order('bank_balance', { ascending: false });
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    return data.map(profile => ({
        ...profile,
        total: profile.wallet_balance + profile.bank_balance
    }))
    .sort((a, b) => type === 'total' ? b.total - a.total : 0);
}
