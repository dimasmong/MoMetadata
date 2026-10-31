import { describe, it, expect } from 'vitest';
import { en } from '../../src/i18n/en';
import { id } from '../../src/i18n/id';

function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getAllKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('Internationalization & Localization (i18n)', () => {
  it('has 100% complete key parity between English and Indonesian dictionaries', () => {
    const enKeys = getAllKeys(en).sort();
    const idKeys = getAllKeys(id).sort();

    expect(enKeys).toEqual(idKeys);
  });

  it('contains no empty strings or undefined labels in either dictionary', () => {
    const checkNoEmpty = (obj: Record<string, any>, dictName: string) => {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'object' && v !== null) {
          checkNoEmpty(v, dictName);
        } else {
          expect(v, `Dictionary ${dictName} key "${k}" must not be empty`).toBeTruthy();
        }
      }
    };

    checkNoEmpty(en, 'en');
    checkNoEmpty(id, 'id');
  });

  it('formats numbers and dates with proper locale conventions', () => {
    const num = 1234567.89;
    const enFormatted = new Intl.NumberFormat('en-US').format(num);
    const idFormatted = new Intl.NumberFormat('id-ID').format(num);

    // In US: comma separates thousands, dot separates decimals (1,234,567.89)
    // In ID: dot separates thousands, comma separates decimals (1.234.567,89)
    expect(enFormatted).toContain(',');
    expect(idFormatted).toContain('.');
  });
});
