/**
 * Utility for calculating sales tax rates and tax amounts.
 */

const US_STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04, AK: 0.00, AZ: 0.056, AR: 0.065, CA: 0.0725,
  CO: 0.029, CT: 0.0635, DE: 0.00, FL: 0.06, GA: 0.04,
  HI: 0.04, ID: 0.06, IL: 0.0625, IN: 0.07, IA: 0.06,
  KS: 0.065, KY: 0.06, LA: 0.0445, ME: 0.055, MD: 0.06,
  MA: 0.0625, MI: 0.06, MN: 0.06875, MS: 0.07, MO: 0.04225,
  MT: 0.00, NE: 0.055, NV: 0.0685, NH: 0.00, NJ: 0.06625,
  NM: 0.04875, NY: 0.04, NC: 0.0475, ND: 0.05, OH: 0.0575,
  OK: 0.045, OR: 0.00, PA: 0.06, RI: 0.07, SC: 0.06,
  SD: 0.042, TN: 0.07, TX: 0.0625, UT: 0.061, VT: 0.06,
  VA: 0.053, WA: 0.065, WV: 0.06, WI: 0.05, WY: 0.04,
  DC: 0.06,
};

const STATE_NAME_TO_CODE: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC',
};

// Default fallback tax rate if US location is specified but state is unknown (e.g. store home state CA rate)
const DEFAULT_FALLBACK_TAX_RATE = 0.0725;

/**
 * Normalizes state input (either "CA" or "California") into 2-letter uppercase code.
 */
export function getStateCode(state?: string): string | null {
  if (!state) return null;
  const trimmed = state.trim();
  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }
  const code = STATE_NAME_TO_CODE[trimmed.toLowerCase()];
  return code || null;
}

/**
 * Returns the tax rate (as a decimal, e.g. 0.0725) based on country and state.
 */
export function getTaxRate(country?: string, state?: string): number {
  const normCountry = (country || 'US').trim().toUpperCase();

  if (normCountry === 'US' || normCountry === 'USA' || normCountry === 'UNITED STATES') {
    const stateCode = getStateCode(state);
    if (stateCode && stateCode in US_STATE_TAX_RATES) {
      return US_STATE_TAX_RATES[stateCode];
    }
    // If state is not specified or recognized, use fallback rate
    return DEFAULT_FALLBACK_TAX_RATE;
  }

  // Non-US fallback rate (or 0 if international duty/tax is handled separately)
  return 0;
}

interface CalculateTaxParams {
  taxableAmount: number;
  country?: string;
  state?: string;
}

/**
 * Calculates sales tax amount rounded to 2 decimal places.
 */
export function calculateTax({ taxableAmount, country, state }: CalculateTaxParams): { taxRate: number; taxAmount: number } {
  if (taxableAmount <= 0) {
    return { taxRate: 0, taxAmount: 0 };
  }

  const taxRate = getTaxRate(country, state);
  const rawTax = taxableAmount * taxRate;
  const taxAmount = Math.round(rawTax * 100) / 100;

  return { taxRate, taxAmount };
}
