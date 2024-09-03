function formatNumber(
  value: number,
  locale: string = 'en-US',
): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (Number.isNaN(value)) {
    return '0';
  }

  if (value === 0) {
    return '0';
  }

  // Automatically determine formatting based on number's value
  if (Math.abs(value) < 1e-4) {
    // Use custom small number formatting for values less than 1e-4
    return formatSmallNumber(value, 4); // Here precision is fixed at 4 for very small numbers
  } else if (Math.abs(value) < 1) {
    // For numbers less than 1 and greater than or equal to 1e-4, format with up to 4 decimal places
    return value.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  } else {
    // For larger numbers, determine appropriate suffix and precision
    let divider = 1;
    let suffix = '';
    const precision = 2; // Default precision for larger numbers

    if (Math.abs(value) >= 1e12) {
      divider = 1e12;
      suffix = 'T';
    } else if (Math.abs(value) >= 1e9) {
      divider = 1e9;
      suffix = 'B';
    } else if (Math.abs(value) >= 1e6) {
      divider = 1e6;
      suffix = 'M';
    } else if (Math.abs(value) >= 1000) {
      divider = 1000;
      suffix = 'K';
    } else {
      // For numbers between 1 and 999, format with up to 2 decimal places
      return value.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: precision,
      });
    }

    // Apply division and suffix for larger numbers
    return `${(value / divider).toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
    })}${suffix}`;
  }
}

// Helper function for formatting very small numbers
function formatSmallNumber(value: number, precision: number): string {
  const stringValue = value.toPrecision(precision);
  const subscripts: { [key: string]: string } = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  const decimalIndex = stringValue.indexOf('.');
  if (decimalIndex !== -1) {
    const afterDecimal = stringValue.substring(decimalIndex + 1);
    const leadingZerosMatch = afterDecimal.match(/^0+/);
    if (leadingZerosMatch && leadingZerosMatch[0].length) {
      const leadingZerosCount = leadingZerosMatch[0].length;
      const significantDigits = afterDecimal
        .substring(leadingZerosCount)
        .slice(0, 4); // Keep up to 4 significant digits
      const leadingZerosSubscript = leadingZerosCount
        .toString()
        .split('')
        .map((digit) => subscripts[digit])
        .join('');
      return `${stringValue.substring(0, decimalIndex + 1)}0${leadingZerosSubscript}${significantDigits}`;
    }
  }
  return stringValue; // Use scientific notation for extremely small numbers
}

export default formatNumber;
