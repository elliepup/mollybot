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
