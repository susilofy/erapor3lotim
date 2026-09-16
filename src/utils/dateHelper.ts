/**
 * Helper utility for Indonesian date formatting.
 * Specifically converts student birth dates to Indonesian standard:
 * Tanggal-Bulan-Tahun (DD/MM/YYYY).
 */

/**
 * Formats any date string, number, or Date object into Indonesian standard DD/MM/YYYY.
 * Example inputs:
 *  - '2014-05-12' -> '12/05/2014'
 *  - '12/05/2014' -> '12/05/2014'
 *  - '12-05-2014' -> '12/05/2014'
 *  - 41771 (Excel serial) -> '12/05/2014'
 */
export function formatBirthDate(val?: string | number | Date | null): string {
  if (!val) return '-';
  const str = String(val).trim();
  if (str === '-' || str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return '-';
  }

  // 1. Check YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // 2. Check DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // 3. Check Excel numeric serial date (e.g. 41771 for 2014-05-12)
  if (!isNaN(Number(str)) && Number(str) > 10000 && Number(str) < 80000) {
    try {
      const date = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      }
    } catch {
      // ignore fallback
    }
  }

  // 4. Try standard Date parsing
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
      const d = String(parsed.getDate()).padStart(2, '0');
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const y = parsed.getFullYear();
      return `${d}/${m}/${y}`;
    }
  } catch {
    // ignore
  }

  return str;
}

/**
 * Converts any date representation to YYYY-MM-DD for HTML <input type="date"> value.
 */
export function parseDateToInput(val?: string | number | Date | null): string {
  if (!val) return '';
  const str = String(val).trim();
  if (str === '-' || str === '') return '';

  // 1. Check YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 2. Check DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 3. Check Excel numeric serial date
  if (!isNaN(Number(str)) && Number(str) > 10000 && Number(str) < 80000) {
    try {
      const date = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${y}-${m}-${d}`;
      }
    } catch {
      // ignore
    }
  }

  return '';
}

/**
 * Normalizes input date from user / excel into canonical storage format YYYY-MM-DD.
 */
export function normalizeDateToStorage(val?: any): string {
  const parsed = parseDateToInput(val);
  return parsed || String(val || '2014-01-01');
}
