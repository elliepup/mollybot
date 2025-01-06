import { getRarityStars, getRarityColor, FISHING_XP_REWARDS } from '../../utils/rarityUtils';

describe('FISHING_XP_REWARDS', () => {
    it('should have correct XP values for each rarity', () => {
        expect(FISHING_XP_REWARDS.common).toBe(1);
        expect(FISHING_XP_REWARDS.uncommon).toBe(3);
        expect(FISHING_XP_REWARDS.rare).toBe(8);
        expect(FISHING_XP_REWARDS.epic).toBe(15);
        expect(FISHING_XP_REWARDS.legendary).toBe(35);
        expect(FISHING_XP_REWARDS.mythical).toBe(50);
    });
});

describe('getRarityStars', () => {
    it('should return correct star patterns for each rarity', () => {
        expect(getRarityStars('common')).toBe('☆☆☆☆☆');
        expect(getRarityStars('uncommon')).toBe('★☆☆☆☆');
        expect(getRarityStars('rare')).toBe('★★☆☆☆');
        expect(getRarityStars('epic')).toBe('★★★☆☆');
        expect(getRarityStars('legendary')).toBe('★★★★☆');
        expect(getRarityStars('mythical')).toBe('★★★★★');
    });

    it('should return default stars for invalid rarity', () => {
        // @ts-expect-error Testing invalid input
        expect(getRarityStars('invalid')).toBe('☆☆☆☆☆');
        // @ts-expect-error Testing undefined input
        expect(getRarityStars(undefined)).toBe('☆☆☆☆☆');
        // @ts-expect-error Testing null input
        expect(getRarityStars(null)).toBe('☆☆☆☆☆');
    });
});

describe('getRarityColor', () => {
    it('should return correct hex colors for each rarity', () => {
        expect(getRarityColor('common')).toBe(0x919191);
        expect(getRarityColor('uncommon')).toBe(0xFFFFFF);
        expect(getRarityColor('rare')).toBe(0x82FDFF);
        expect(getRarityColor('epic')).toBe(0x6B00FD);
        expect(getRarityColor('legendary')).toBe(0xFBFF00);
        expect(getRarityColor('mythical')).toBe(0xFF00E0);
    });

    it('should return default color for invalid rarity', () => {
        // @ts-expect-error Testing invalid input
        expect(getRarityColor('invalid')).toBe(0xffffff);
        // @ts-expect-error Testing undefined input
        expect(getRarityColor(undefined)).toBe(0xffffff);
        // @ts-expect-error Testing null input
        expect(getRarityColor(null)).toBe(0xffffff);
    });

    it('should return different colors for different rarities', () => {
        const colors = new Set([
            getRarityColor('common'),
            getRarityColor('uncommon'),
            getRarityColor('rare'),
            getRarityColor('epic'),
            getRarityColor('legendary'),
            getRarityColor('mythical')
        ]);
        // Ensure all colors are unique
        expect(colors.size).toBe(6);
    });
});