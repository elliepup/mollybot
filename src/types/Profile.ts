export interface UserProfile {
    user_id: string;
    username: string;
    created_at: string;
}

export interface EconomyProfile {
    user_id: string;
    wallet_balance: number;
    bank_balance: number;
    selected_job: string;
    last_work: string;
    last_daily: string | null;
    job_id: string | null;
    last_job_apply: string | null;
    created_at: string;
}
