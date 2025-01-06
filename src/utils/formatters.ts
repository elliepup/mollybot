export function formatCurrency(amount: number): string {
    if (isNaN(amount) || !isFinite(amount)) amount = 0;
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    const formatted = absoluteAmount.toLocaleString('en-US');
    return isNegative ? `($${formatted})` : `$${formatted}`;
}
