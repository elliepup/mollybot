export interface Job {
    id: string;
    name: string;
    description: string;
    minPay: number;
    maxPay: number;
    responses?: string[];
}

export type JobTier = 'entry_level' | 'regular' | 'professional';

export interface JobList {
    entry_level: Job[];
    regular: Job[];
    professional: Job[];
}
