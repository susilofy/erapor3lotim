import { LingkupMateri } from '../types';

interface MaterialScoreEvaluation {
  judul: string;
  score: number;
  kktp: number;
  isMastered: boolean;
}

const POSITIVE_OPENERS = [
  "Ananda menunjukkan penguasaan yang sangat baik dalam",
  "Ananda sudah memahami dan menguasai konsep",
  "Memiliki pemahaman yang sangat baik dalam materi",
  "Menunjukkan capaian kompetensi yang optimal dalam",
  "Ananda telah berkembang sangat baik dalam mempelajari",
];

const POSITIVE_CLOSERS = [
  "dengan sangat baik.",
  "secara optimal dan mandiri.",
  "dengan pemahaman yang matang.",
  "secara aktif dan percaya diri.",
];

const GUIDANCE_OPENERS = [
  "Ananda masih perlu bimbingan dan pendampingan dalam",
  "Perlu penguatan serta latihan berkelanjutan pada materi",
  "Disarankan untuk mendapatkan pendampingan lebih lanjut dalam",
  "Masih membutuhkan bimbingan bertahap dalam memahami",
  "Perlu terus didampingi untuk memperkuat pemahaman pada materi",
];

export function formatMaterialList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, serta ${items[items.length - 1]}`;
}

/**
 * Generates an educational, constructive competency description in Indonesian
 * based on student scores across Learning Scopes (Lingkup Materi) vs KKTP.
 */
export function generateCompetencyDescription(
  subjectName: string,
  subjectKktp: number,
  scopes: LingkupMateri[],
  scoresMap: Record<string, number | null>,
  variationSeed: number = 0
): string {
  const evaluations: MaterialScoreEvaluation[] = [];

  for (const scope of scopes) {
    const score = scoresMap[scope.id];
    if (score !== null && score !== undefined && !isNaN(score)) {
      const threshold = scope.kktp || subjectKktp;
      evaluations.push({
        judul: scope.judul.trim(),
        score,
        kktp: threshold,
        isMastered: score >= threshold,
      });
    }
  }

  if (evaluations.length === 0) {
    return "Belum ada nilai sumatif yang dimasukkan untuk mata pelajaran ini.";
  }

  const mastered = evaluations.filter((e) => e.isMastered);
  const needsGuidance = evaluations.filter((e) => !e.isMastered);

  const posOpenerIdx = Math.abs(variationSeed) % POSITIVE_OPENERS.length;
  const posCloserIdx = Math.abs(variationSeed) % POSITIVE_CLOSERS.length;
  const guidOpenerIdx = Math.abs(variationSeed) % GUIDANCE_OPENERS.length;

  const parts: string[] = [];

  if (mastered.length > 0) {
    // Sort mastered by highest score first
    mastered.sort((a, b) => b.score - a.score);
    const titles = mastered.map((m) => m.judul.toLowerCase());
    const opener = POSITIVE_OPENERS[posOpenerIdx];
    const closer = POSITIVE_CLOSERS[posCloserIdx];
    parts.push(`${opener} ${formatMaterialList(titles)} ${closer}`);
  }

  if (needsGuidance.length > 0) {
    // Sort needs guidance by lowest score first
    needsGuidance.sort((a, b) => a.score - b.score);
    const titles = needsGuidance.map((m) => m.judul.toLowerCase());
    const opener = GUIDANCE_OPENERS[guidOpenerIdx];
    parts.push(`${opener} ${formatMaterialList(titles)}.`);
  }

  return parts.join(" ");
}

/**
 * Pembulatan nilai:
 * - 'desimal_2': 2 angka di belakang koma, dibulatkan ke atas jika digit berikutnya >= 5
 * - 'bulat': bilangan bulat, dibulatkan ke atas jika angka di belakang koma >= 5 (>= 0.5)
 */
export function roundScoreValue(
  value: number,
  format: 'bulat' | 'desimal_2' = 'desimal_2'
): number {
  if (isNaN(value)) return value;
  if (format === 'desimal_2') {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
  return Math.round(value);
}

/**
 * Calculates Nilai Akhir (average of summatives with configurable rounding format)
 */
export function calculateNilaiAkhir(
  scopes: LingkupMateri[],
  scoresMap: Record<string, number | null>,
  format: 'bulat' | 'desimal_2' = 'desimal_2'
): number | null {
  const validScores: number[] = [];
  for (const scope of scopes) {
    const s = scoresMap[scope.id];
    if (s !== null && s !== undefined && !isNaN(s)) {
      validScores.push(s);
    }
  }

  if (validScores.length === 0) return null;
  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / validScores.length;
  return roundScoreValue(avg, format);
}

/**
 * Formats a score for display:
 * - 'desimal_2': '85,75' (selalu 2 digit desimal di belakang koma)
 * - 'bulat': '86'
 */
export function formatScoreDisplay(
  value: number | null | undefined,
  format: 'bulat' | 'desimal_2' = 'desimal_2'
): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  if (format === 'desimal_2') {
    const rounded = roundScoreValue(value, 'desimal_2');
    return rounded.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return Math.round(value).toString();
}
