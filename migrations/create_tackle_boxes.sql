CREATE TABLE tackle_boxes (
    user_id VARCHAR PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    worms INT DEFAULT 0,
    shrimp INT DEFAULT 0,
    crickets INT DEFAULT 0,
    leeches INT DEFAULT 0,
    minnows INT DEFAULT 0,
    nightcrawlers INT DEFAULT 0
)