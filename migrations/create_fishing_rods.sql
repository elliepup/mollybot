CREATE TABLE fishing_rods (
    rod_id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    rod_type VARCHAR NOT NULL,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    common_catches INT DEFAULT 0,
    uncommon_catches INT DEFAULT 0,
    rare_catches INT DEFAULT 0,
    epic_catches INT DEFAULT 0,
    legendary_catches INT DEFAULT 0,
    mythical_catches INT DEFAULT 0,
    total_catches INT DEFAULT 0,
    CONSTRAINT valid_rod_type CHECK (
        rod_type IN (
            'driftwood_pole', 'bamboo_caster', 'angler_whisper', 
            'coral_weaver', 'tide_caller', 'frost_fisher',
            'storm_breaker', 'void_fisher', 'celestial_fisher',
            'lunar_dreamer', 'leviathan_lure', 'star_seeker'
        )
    )
);

-- Create index for faster user lookups
CREATE INDEX fishing_rods_user_id_idx ON fishing_rods(user_id);