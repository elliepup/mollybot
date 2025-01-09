CREATE TABLE fishing_profiles (
    user_id VARCHAR PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    equipped_rod_id VARCHAR REFERENCES fishing_rods(rod_id) ON DELETE SET NULL;
    fishing_bait VARCHAR DEFAULT 'worms',
    common_fish_caught INT DEFAULT 0,
    uncommon_fish_caught INT DEFAULT 0,
    rare_fish_caught INT DEFAULT 0,
    legendary_fish_caught INT DEFAULT 0,
    mythical_fish_caught INT DEFAULT 0,
    fishing_skill_xp BIGINT DEFAULT 0,
    total_catches INT DEFAULT 0,
    last_fish_catch TIMESTAMP WITH TIME ZONE,
    last_fished TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)