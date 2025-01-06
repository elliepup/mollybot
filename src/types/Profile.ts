import { EconomyProfile } from './Economy';
import { FishingProfile } from './Fishing';

export interface UserProfile {
    user_id: string;
    username: string;
    created_at: string;
    economy?: EconomyProfile;
    fishing?: FishingProfile;
}