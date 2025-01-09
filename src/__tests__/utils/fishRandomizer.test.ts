import { getRandomFishFromPool, RARITY_WEIGHTS } from '../../utils/fishRandomizer';
import { Fish, FishRarity, BaitType } from '../../types/Fishing';

describe('Fish Randomizer', () => {
    // Mock fish data for testing
    const mockFish: Fish[] = [
        {
            fish_id: 'common_fish',
            name: 'Common Fish',
            rarity: 'common',
            base_value: 1,
            weight_range: { min: 1, max: 2 },
            length_range: { min: 1, max: 2 },
            image_url: '',
            catch_phrases: [],
            preferred_bait: ['worms'],
            bodies_of_water: ['pond']
        },
        {
            fish_id: 'rare_fish',
            name: 'Rare Fish',
            rarity: 'rare',
            base_value: 10,
            weight_range: { min: 2, max: 4 },
            length_range: { min: 2, max: 4 },
            image_url: '',
            catch_phrases: [],
            preferred_bait: ['shrimp'],
            bodies_of_water: ['ocean']
        }
    ];

    describe('RARITY_WEIGHTS', () => {
        it('should have correct percentages that sum to 100%', () => {
            const sum = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
            expect(sum).toBeCloseTo(1.0);
        });

        it('should have all required rarity levels', () => {
            expect(RARITY_WEIGHTS).toHaveProperty('common');
            expect(RARITY_WEIGHTS).toHaveProperty('uncommon');
            expect(RARITY_WEIGHTS).toHaveProperty('rare');
            expect(RARITY_WEIGHTS).toHaveProperty('epic');
            expect(RARITY_WEIGHTS).toHaveProperty('legendary');
            expect(RARITY_WEIGHTS).toHaveProperty('mythical');
        });
    });

    describe('getRandomFishFromPool', () => {
        it('should return null for empty fish pool', () => {
            const result = getRandomFishFromPool([], 'worms');
            expect(result).toBeNull();
        });

        it('should return a fish when given valid input', () => {
            const result = getRandomFishFromPool(mockFish, 'worms');
            expect(result).toBeTruthy();
            expect(result).toHaveProperty('fish_id');
        });

        it('should prefer fish with matching bait type', () => {
            const results = new Map<string, number>();
            const iterations = 1000;

            // Run multiple iterations to check distribution
            for (let i = 0; i < iterations; i++) {
                const fish = getRandomFishFromPool(mockFish, 'worms');
                if (fish) {
                    results.set(fish.fish_id, (results.get(fish.fish_id) || 0) + 1);
                }
            }

            // Common fish with preferred bait should appear more often
            expect(results.get('common_fish')).toBeGreaterThan(results.get('rare_fish') || 0);
        });

        it('should still catch fish with non-preferred bait', () => {
            const results = new Map<string, number>();
            const iterations = 1000;

            // Test with non-preferred bait
            for (let i = 0; i < iterations; i++) {
                const fish = getRandomFishFromPool(mockFish, 'minnows');
                if (fish) {
                    results.set(fish.fish_id, (results.get(fish.fish_id) || 0) + 1);
                }
            }

            // Should still catch both types of fish
            expect(results.get('common_fish')).toBeGreaterThan(0);
            expect(results.get('rare_fish')).toBeGreaterThan(0);
        });

        it('should respect rarity weights in distribution', () => {
            const results = new Map<FishRarity, number>();
            const iterations = 10000;
            const testFish: Fish[] = Object.keys(RARITY_WEIGHTS).map(rarity => ({
                fish_id: rarity,
                name: rarity,
                rarity: rarity as FishRarity,
                base_value: 1,
                weight_range: { min: 1, max: 2 },
                length_range: { min: 1, max: 2 },
                image_url: '',
                catch_phrases: [],
                preferred_bait: ['worms'],
                bodies_of_water: ['pond']
            }));

            for (let i = 0; i < iterations; i++) {
                const fish = getRandomFishFromPool(testFish, 'worms');
                if (fish) {
                    results.set(fish.rarity, (results.get(fish.rarity) || 0) + 1);
                }
            }

            // Check if distribution roughly matches weights
            Object.entries(RARITY_WEIGHTS).forEach(([rarity, weight]) => {
                const count = results.get(rarity as FishRarity) || 0;
                const actualWeight = count / iterations;
                // Allow for 5% margin of error
                expect(Math.abs(actualWeight - weight)).toBeLessThan(0.05);
            });
        });
    });
});