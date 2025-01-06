CREATE TABLE caught_fish (
    catch_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fish_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    rarity VARCHAR NOT NULL,
    value BIGINT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    shiny BOOLEAN DEFAULT FALSE,
    mutation VARCHAR,
    current_owner_id VARCHAR REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    original_owner_id VARCHAR REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    caught_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    image_url VARCHAR NOT NULL,
    CONSTRAINT valid_mutation CHECK (
        mutation IN ('albino', 'golden', 'giant', 'ancient', 'prismatic', 'void', 'cursed')
    )
)
