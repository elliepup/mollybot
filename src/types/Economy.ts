export interface EconomyProfile {
    user_id: string;
    wallet_balance: number;
    bank_balance: number;
    selected_job: string;
    last_work: string;
    last_daily: string | null;
    daily_streak: number;
    job_id: string | null;
    last_job_apply: string | null;
    created_at: string;
}
