import { Fish, FishMutation } from "../../types/Fishing";
import { generateUniqueId } from "../../utils/idGenerator";

export async function generateFishStats(fish: Fish, userId: string, luckMultiplier = 1.0) {
    // Generate unique ID for this catch
    const uniqueId = await generateUniqueId('caught_fish', 'catch_id');
    
    // Generate random length first
    const length = Number((Math.random() * (fish.length_range.max - fish.length_range.min) + fish.length_range.min).toFixed(1));
    
    // Calculate length percentage relative to possible range
    const lengthPercentage = (length - fish.length_range.min) / (fish.length_range.max - fish.length_range.min);
    
    // Calculate weight based on length with some randomness
    const baseWeight = fish.weight_range.min + ((fish.weight_range.max - fish.weight_range.min) * lengthPercentage);
    const randomFactor = 0.85 + (Math.random() * 0.3); // Random factor between 0.85 and 1.15
    const weight = Number((baseWeight * randomFactor).toFixed(1));
    
    // Calculate weight percentage relative to possible range
    const weightPercentage = (weight - fish.weight_range.min) / (fish.weight_range.max - fish.weight_range.min);
    
    // Calculate value multiplier based on average of length and weight percentages
    const sizePercentage = (lengthPercentage + weightPercentage) / 2;
    const valueMultiplier = 0.5 + sizePercentage; // Range: 0.5x to 1.5x base value
    
    // Calculate final value
    const value = Math.round(fish.base_value * valueMultiplier);
    
    // Perfect catch if either metric is in top 10%
    const isPerfect = length >= fish.length_range.max * 0.9 || weight >= fish.weight_range.max * 0.9;
    
    // Calculate mutation chance based on luck multiplier
    const mutationChance = Math.min(0.1 * luckMultiplier, 0.5); // Max 50% chance
    const mutation = Math.random() < mutationChance ? getRandomMutation() : null;
    
    return {
        catch_id: uniqueId,
        weight,
        length,
        value,
        isPerfect,
        mutation,
        catchPhrase: fish.catch_phrases?.[Math.floor(Math.random() * fish.catch_phrases.length)] || "You caught a fish!"
    };

function getRandomMutation(): FishMutation {
    const mutations: FishMutation[] = ['albino', 'golden', 'giant', 'ancient', 'prismatic', 'void', 'cursed'];
    return mutations[Math.floor(Math.random() * mutations.length)];
}
}