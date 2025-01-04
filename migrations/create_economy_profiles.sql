CREATE TABLE economy_profiles (
    user_id VARCHAR PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    wallet_balance BIGINT DEFAULT 0,
    bank_balance BIGINT DEFAULT 0,
    job_id VARCHAR DEFAULT 'unemployed',
    last_work NULL,
    last_daily NULL,
    last_job_apply NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);