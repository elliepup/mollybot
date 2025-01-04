CREATE TABLE economy_profiles (
    user_id VARCHAR PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    wallet_balance BIGINT DEFAULT 0,
    bank_balance BIGINT DEFAULT 0,
    selected_job VARCHAR DEFAULT 'unemployed',
    last_work TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_daily TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);