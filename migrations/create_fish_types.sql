CREATE TABLE fish_types (
    fish_id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    rarity VARCHAR NOT NULL,
    base_value INTEGER NOT NULL,
    weight_min DECIMAL(10,2) NOT NULL,
    weight_max DECIMAL(10,2) NOT NULL,
    length_min DECIMAL(10,2) NOT NULL,
    length_max DECIMAL(10,2) NOT NULL,
    image_url VARCHAR,
    catch_phrases TEXT[],
    preferred_bait VARCHAR[],
    bodies_of_water VARCHAR[],
    CONSTRAINT valid_rarity CHECK (
        rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical')
    )
);