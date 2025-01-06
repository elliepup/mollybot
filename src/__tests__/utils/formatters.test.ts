import { formatCurrency } from '../../utils/formatters';

describe('formatCurrency', () => {
    test.each([
        [0, '$0'],
        [1, '$1'],
        [100, '$100'],
        [1000, '$1,000'],
        [1000000, '$1,000,000'],
        [-1000, '($1,000)'],
        [1234567, '$1,234,567'],
        [Number.MAX_SAFE_INTEGER, '$9,007,199,254,740,991']
    ])('formats %p as %p', (input, expected) => {
        expect(formatCurrency(input)).toBe(expected);
    });

    it('should handle invalid inputs', () => {
        expect(formatCurrency(NaN)).toBe('$0');
        expect(formatCurrency(Infinity)).toBe('$0');
        expect(formatCurrency(-Infinity)).toBe('$0');
    });
});