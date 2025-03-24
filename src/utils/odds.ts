export const convertOdds = {
  americanToDecimal: (american: number): number => {
    if (american > 0) {
      return (american / 100) + 1;
    } else {
      return (100 / Math.abs(american)) + 1;
    }
  },

  decimalToAmerican: (decimal: number): number => {
    if (decimal >= 2) {
      return (decimal - 1) * 100;
    } else {
      return -100 / (decimal - 1);
    }
  },

  fractionalToDecimal: (fractional: string): number => {
    const [numerator, denominator] = fractional.split('/').map(Number);
    return (numerator / denominator) + 1;
  },

  decimalToFractional: (decimal: number): string => {
    const fraction = decimal - 1;
    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
    const denominator = 100;
    const numerator = fraction * denominator;
    const divisor = gcd(numerator, denominator);
    return `${numerator/divisor}/${denominator/divisor}`;
  },

  formatOdds: (value: number, format: 'american' | 'decimal' | 'fractional'): string => {
    switch (format) {
      case 'american':
        return value >= 0 ? `+${value}` : value.toString();
      case 'decimal':
        return value.toFixed(2);
      case 'fractional':
        return convertOdds.decimalToFractional(value);
      default:
        return value.toString();
    }
  }
};