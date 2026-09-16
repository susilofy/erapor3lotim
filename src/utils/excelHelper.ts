import * as XLSX from 'xlsx';
import {
  Student,
  Subject,
  LingkupMateri,
  ScoresDatabase,
  SchoolInfo,
  TeacherInfo,
  ClassInfo,
  ReportSettings,
} from '../types';
import { formatBirthDate, normalizeDateToStorage } from './dateHelper';

export function exportStudentsToExcel(students: Student[], className: string): void {
  const rows = students.map((s, idx) => ({
    'No Urut': s.noUrut || idx + 1,
    'Nama Lengkap': s.namaLengkap,
    'NIS': s.nis,
    'NISN': s.nisn,
    'Jenis Kelamin (L/P)': s.jenisKelamin,
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir (DD/MM/YYYY)': formatBirthDate(s.tanggalLahir),
    'Tanggal Lahir': formatBirthDate(s.tanggalLahir),
    'Agama': s.agama,
    'Alamat': s.alamat,
    'Nama Ayah': s.namaAyah,
    'Nama Ibu': s.namaIbu,
    'Nama Wali': s.namaWali || '-',
    'NIK': s.nik || '',
    'No KK': s.noKK || '',
    'Status': s.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

  const fileName = `Data_Siswa_${className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function downloadStudentImportTemplate(): void {
  const templateRows = [
    {
      'No Urut': 1,
      'Nama Lengkap': 'Contoh Siswa Pratama',
      'NIS': '2101',
      'NISN': '0123456789',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (DD/MM/YYYY)': '12/05/2014',
      'Tanggal Lahir': '12/05/2014',
      'Agama': 'Islam',
      'Alamat': 'Jl. Pendidikan No. 10',
      'Nama Ayah': 'Bambang',
      'Nama Ibu': 'Siti',
      'Nama Wali': '-',
      'NIK': '3171051234560001',
      'No KK': '3171051234560002',
      'Status': 'Aktif',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
  XLSX.writeFile(workbook, 'Template_Import_Siswa.xlsx');
}

export async function parseStudentsFromExcel(file: File): Promise<Partial<Student>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        const students: Partial<Student>[] = rawRows.map((row, idx) => {
          const nama = row['Nama Lengkap'] || row['Nama'] || row['namaLengkap'] || `Siswa ${idx + 1}`;
          const jk = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['JK'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
          return {
            noUrut: Number(row['No Urut'] || row['No'] || idx + 1),
            namaLengkap: String(nama).trim(),
            nis: String(row['NIS'] || row['nis'] || '').trim(),
            nisn: String(row['NISN'] || row['nisn'] || '').trim(),
            jenisKelamin: jk,
            tempatLahir: String(row['Tempat Lahir'] || row['tempatLahir'] || '-').trim(),
            tanggalLahir: normalizeDateToStorage(
              row['Tanggal Lahir (DD/MM/YYYY)'] ||
              row['Tanggal Lahir'] ||
              row['Tanggal Lahir (YYYY-MM-DD)'] ||
              row['tanggalLahir'] ||
              '2014-01-01'
            ),
            agama: String(row['Agama'] || row['agama'] || 'Islam').trim(),
            alamat: String(row['Alamat'] || row['alamat'] || '-').trim(),
            namaAyah: String(row['Nama Ayah'] || row['namaAyah'] || '-').trim(),
            namaIbu: String(row['Nama Ibu'] || row['namaIbu'] || '-').trim(),
            namaWali: String(row['Nama Wali'] || row['namaWali'] || '-').trim(),
            nik: String(row['NIK'] || row['nik'] || '').trim(),
            noKK: String(row['No KK'] || row['noKK'] || '').trim(),
            status: 'Aktif',
          };
        });

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function exportScoresRecapToExcel(
  students: Student[],
  subjects: Subject[],
  scores: ScoresDatabase,
  semester: number,
  className: string
): void {
  const currentScores = scores[semester] || {};
  const activeStudents = students.filter((s) => s.status === 'Aktif');

  const rows = activeStudents.map((student, idx) => {
    const rowObj: Record<string, any> = {
      'No': student.noUrut || idx + 1,
      'Nama Siswa': student.namaLengkap,
      'NISN': student.nisn,
      'NIS': student.nis,
    };

    let totalScore = 0;
    let countSubject = 0;

    for (const sub of subjects.filter((s) => s.isActive)) {
      const scoreObj = currentScores[student.id]?.[sub.id];
      const na = scoreObj?.nilaiAkhir ?? null;
      rowObj[sub.nama] = na !== null ? na : '-';
      if (na !== null) {
        totalScore += na;
        countSubject++;
      }
    }

    rowObj['Rata-Rata'] = countSubject > 0 ? Math.round(totalScore / countSubject) : '-';
    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap Sem ${semester}`);

  const fileName = `Rekap_Nilai_${className.replace(/\s+/g, '_')}_Sem${semester}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Exports Excel template for a single subject with active students and its learning scopes.
 * Can be pre-filled with current scores or blank.
 */
export function exportSubjectScoresTemplateToExcel(
  students: Student[],
  subject: Subject,
  scopes: LingkupMateri[],
  scores: ScoresDatabase,
  semester: number,
  className: string,
  isBlankTemplate: boolean = false
): void {
  const currentScores = scores[semester] || {};
  const activeStudents = students.filter((s) => s.status === 'Aktif');

  const rows = activeStudents.map((student, idx) => {
    const studentScoreRec = currentScores[student.id]?.[subject.id];
    const scoresMap = studentScoreRec?.scores || {};

    const rowObj: Record<string, any> = {
      'No': student.noUrut || idx + 1,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Nama Siswa': student.namaLengkap,
    };

    scopes.forEach((scope) => {
      const colHeader = `${scope.kode}: ${scope.judul.slice(0, 35)}`;
      const val = !isBlankTemplate ? scoresMap[scope.id] : null;
      rowObj[colHeader] = val !== null && val !== undefined ? val : '';
    });

    if (!isBlankTemplate) {
      rowObj['Nilai Akhir'] = studentScoreRec?.nilaiAkhir ?? '';
    }

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // NISN
    { wch: 10 }, // NIS
    { wch: 28 }, // Nama Siswa
    ...scopes.map(() => ({ wch: 20 })),
    { wch: 12 }, // Nilai Akhir
  ];

  const workbook = XLSX.utils.book_new();
  const cleanSheetName = subject.nama.slice(0, 28).replace(/[\\/?*[\]:]/g, '_');
  XLSX.utils.book_append_sheet(workbook, worksheet, cleanSheetName);

  const cleanSubjectName = subject.nama.replace(/\s+/g, '_');
  const typeStr = isBlankTemplate ? 'Template_Kosong' : 'Format_Nilai';
  const fileName = `${typeStr}_${cleanSubjectName}_${className.replace(/\s+/g, '_')}_Sem${semester}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Exports a comprehensive Excel workbook with one sheet per active subject + recap sheet.
 */
export function exportAllSubjectsScoresWorkbook(
  students: Student[],
  subjects: Subject[],
  scopes: LingkupMateri[],
  scores: ScoresDatabase,
  semester: number,
  className: string
): void {
  const currentScores = scores[semester] || {};
  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const activeSubjects = subjects.filter((s) => s.isActive);
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Rekap Nilai Semua Mapel
  const rekapRows = activeStudents.map((student, idx) => {
    const rowObj: Record<string, any> = {
      'No': student.noUrut || idx + 1,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Nama Siswa': student.namaLengkap,
    };
    let totalScore = 0;
    let countSubject = 0;

    for (const sub of activeSubjects) {
      const na = currentScores[student.id]?.[sub.id]?.nilaiAkhir ?? null;
      rowObj[sub.nama] = na !== null ? na : '';
      if (na !== null) {
        totalScore += na;
        countSubject++;
      }
    }
    rowObj['Rata-Rata'] = countSubject > 0 ? Math.round(totalScore / countSubject) : '';
    return rowObj;
  });

  const rekapWs = XLSX.utils.json_to_sheet(rekapRows);
  XLSX.utils.book_append_sheet(workbook, rekapWs, 'Rekap Semua Mapel');

  // Sheet per active subject
  activeSubjects.forEach((sub, subIdx) => {
    const subScopes = scopes.filter((lm) => lm.subjectId === sub.id && lm.semester === semester);
    const subRows = activeStudents.map((student, idx) => {
      const studentScoreRec = currentScores[student.id]?.[sub.id];
      const scoresMap = studentScoreRec?.scores || {};
      const rowObj: Record<string, any> = {
        'No': student.noUrut || idx + 1,
        'NISN': student.nisn,
        'NIS': student.nis,
        'Nama Siswa': student.namaLengkap,
      };

      subScopes.forEach((lm) => {
        const val = scoresMap[lm.id];
        rowObj[`${lm.kode}: ${lm.judul.slice(0, 35)}`] = val !== null && val !== undefined ? val : '';
      });

      rowObj['Nilai Akhir'] = studentScoreRec?.nilaiAkhir ?? '';
      return rowObj;
    });

    const subWs = XLSX.utils.json_to_sheet(subRows);
    subWs['!cols'] = [
      { wch: 5 },
      { wch: 14 },
      { wch: 10 },
      { wch: 28 },
      ...subScopes.map(() => ({ wch: 20 })),
      { wch: 12 },
    ];

    const shortSheetName = `${subIdx + 1}. ${sub.nama.slice(0, 24)}`.replace(/[\\/?*[\]:]/g, '_');
    XLSX.utils.book_append_sheet(workbook, subWs, shortSheetName);
  });

  const fileName = `Format_Nilai_Lengkap_${className.replace(/\s+/g, '_')}_Sem${semester}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export interface ParsedScoreRow {
  studentId: string;
  studentName: string;
  nisn: string;
  nis: string;
  scores: Record<string, number | null>;
  hasValidScore: boolean;
  scoreCount: number;
}

export interface ParseScoresResult {
  sheetNames: string[];
  selectedSheet: string;
  matchedSubject: Subject;
  matchedScopes: { id: string; kode: string; judul: string; colName: string }[];
  unmatchedScopes: { id: string; kode: string; judul: string }[];
  studentRows: ParsedScoreRow[];
  totalStudentsWithScores: number;
  totalScoresRead: number;
  warnings: string[];
}

/**
 * Reads an uploaded Excel file into an XLSX workbook object.
 */
export async function readWorkbookFromFile(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses scores from a specific sheet of a workbook for a given subject and scopes.
 */
export function parseSubjectScoresFromWorkbook(
  workbook: XLSX.WorkBook,
  sheetName: string,
  subject: Subject,
  scopes: LingkupMateri[],
  students: Student[]
): ParseScoresResult {
  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const targetSheetName = sheetName || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[targetSheetName];
  const warnings: string[] = [];

  if (!worksheet) {
    throw new Error(`Lembar kerja (sheet) "${targetSheetName}" tidak ditemukan.`);
  }

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  if (rawRows.length === 0) {
    throw new Error(`Lembar kerja "${targetSheetName}" kosong atau tidak memiliki data baris.`);
  }

  // Identify all keys in the sheet
  const allHeaders: string[] = Object.keys(rawRows[0] || {});

  // Match columns for each Lingkup Materi
  const matchedScopes: { id: string; kode: string; judul: string; colName: string }[] = [];
  const unmatchedScopes: { id: string; kode: string; judul: string }[] = [];

  scopes.forEach((scope) => {
    const cleanKode = scope.kode.replace(/\s+/g, '').toUpperCase(); // e.g. "LM1"

    // Find header matching kode
    const foundCol = allHeaders.find((h) => {
      const cleanH = h.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (cleanH.startsWith(cleanKode) || cleanH.includes(cleanKode)) return true;
      // also test "SUMATIF 1", "TP 1", etc.
      const numMatch = scope.kode.match(/\d+/);
      if (numMatch) {
        const num = numMatch[0];
        if (cleanH.includes(`LM${num}`) || cleanH.includes(`MATERI${num}`) || cleanH.includes(`SUMATIF${num}`)) {
          return true;
        }
      }
      // Check partial title match
      if (scope.judul.length > 5 && h.toLowerCase().includes(scope.judul.slice(0, 10).toLowerCase())) {
        return true;
      }
      return false;
    });

    if (foundCol) {
      matchedScopes.push({
        id: scope.id,
        kode: scope.kode,
        judul: scope.judul,
        colName: foundCol,
      });
    } else {
      unmatchedScopes.push({
        id: scope.id,
        kode: scope.kode,
        judul: scope.judul,
      });
    }
  });

  if (matchedScopes.length === 0) {
    warnings.push(
      `Kolom Lingkup Materi (${scopes.map((s) => s.kode).join(', ')}) tidak terdeteksi secara otomatis. Sistem akan mencoba mencocokkan kolom nilai secara berurutan.`
    );
  }

  // Parse each active student's scores
  let totalScoresRead = 0;
  const studentRows: ParsedScoreRow[] = [];

  for (const student of activeStudents) {
    // Find matching row for student
    const matchedRow = rawRows.find((row) => {
      // 1. By NISN
      const rowNisn = String(row['NISN'] || row['nisn'] || row['Nisn'] || '').trim();
      if (rowNisn && rowNisn === student.nisn.trim()) return true;

      // 2. By NIS
      const rowNis = String(row['NIS'] || row['nis'] || row['Nis'] || '').trim();
      if (rowNis && rowNis === student.nis.trim()) return true;

      // 3. By Name
      const rowNama = String(row['Nama Siswa'] || row['Nama Lengkap'] || row['Nama'] || row['nama'] || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const stuNama = student.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (rowNama && stuNama && (rowNama === stuNama || rowNama.includes(stuNama) || stuNama.includes(rowNama))) {
        return true;
      }

      return false;
    });

    const parsedScoresMap: Record<string, number | null> = {};
    let hasValidScore = false;
    let studentScoreCount = 0;

    if (matchedRow) {
      // Extract scores for each scope
      scopes.forEach((scope, scopeIdx) => {
        let rawVal: any = undefined;

        // Try matched column first
        const matched = matchedScopes.find((m) => m.id === scope.id);
        if (matched && matchedRow[matched.colName] !== undefined && matchedRow[matched.colName] !== '') {
          rawVal = matchedRow[matched.colName];
        } else if (matchedScopes.length === 0) {
          // Fallback positional: Look for numeric columns after student name
          const nonInfoCols = allHeaders.filter(
            (h) => !['no', 'nisn', 'nis', 'nama', 'namasiswa', 'namalengkap'].includes(h.toLowerCase().replace(/[^a-z]/g, ''))
          );
          if (nonInfoCols[scopeIdx] && matchedRow[nonInfoCols[scopeIdx]] !== undefined) {
            rawVal = matchedRow[nonInfoCols[scopeIdx]];
          }
        }

        if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
          const num = typeof rawVal === 'number' ? rawVal : Number(String(rawVal).replace(',', '.').trim());
          if (!isNaN(num) && num >= 0 && num <= 100) {
            // Bulatkan ke 2 desimal jika angka berikutnya >= 5
            parsedScoresMap[scope.id] = Math.round((num + Number.EPSILON) * 100) / 100;
            hasValidScore = true;
            studentScoreCount++;
            totalScoresRead++;
          } else if (!isNaN(num)) {
            warnings.push(
              `Nilai untuk ${student.namaLengkap} pada ${scope.kode} (${rawVal}) berada di luar rentang 0-100 dan dilewati.`
            );
          }
        }
      });
    }

    studentRows.push({
      studentId: student.id,
      studentName: student.namaLengkap,
      nisn: student.nisn,
      nis: student.nis,
      scores: parsedScoresMap,
      hasValidScore,
      scoreCount: studentScoreCount,
    });
  }

  const totalStudentsWithScores = studentRows.filter((r) => r.hasValidScore).length;

  return {
    sheetNames: workbook.SheetNames,
    selectedSheet: targetSheetName,
    matchedSubject: subject,
    matchedScopes,
    unmatchedScopes,
    studentRows,
    totalStudentsWithScores,
    totalScoresRead,
    warnings,
  };
}

export interface LegerExportStudentRow {
  noUrut: number;
  nis: string;
  nisn: string;
  namaLengkap: string;
  jenisKelamin: string;
  subjectScores: Record<string, number | null>;
  totalNilaiAkhir: number;
  rataRataNilaiAkhir: number;
  ranking: number;
}

export function exportLegerToExcel(options: {
  school: SchoolInfo;
  classInfo: ClassInfo;
  teacher: TeacherInfo;
  reportSettings: ReportSettings;
  subjects: Subject[];
  studentRows: LegerExportStudentRow[];
  semester: 1 | 2;
  stats: {
    subjectAverages: Record<string, number>;
    totalAverage: number;
    highestTotal: number;
    lowestTotal: number;
  };
}): void {
  const { school, classInfo, teacher, reportSettings, subjects, studentRows, semester, stats } = options;

  const data: (string | number)[][] = [];

  // Title rows
  data.push(['REKAPITULASI NILAI RAPOR PESERTA DIDIK (LEGER NILAI)']);
  data.push([school.namaSekolah.toUpperCase()]);
  data.push([
    `Kelas: ${classInfo.namaKelas}`,
    `Fase: ${classInfo.fase}`,
    `Semester: ${semester === 1 ? '1 (Ganjil)' : '2 (Genap)'}`,
    `Tahun Ajaran: ${classInfo.tahunAjaran}`,
  ]);
  data.push([`Wali Kelas: ${teacher.namaGuru}`, `NIP: ${teacher.nip || '-'}`]);
  data.push([]); // blank row

  // Header Row 1 (Category / Column headers)
  const headers: string[] = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P'];
  subjects.forEach((sub) => {
    headers.push(`${sub.nama} (KKTP: ${sub.kktp})`);
  });
  headers.push('Jumlah Nilai Akhir', 'Rata-Rata', 'Ranking');
  data.push(headers);

  // Student rows
  studentRows.forEach((row, idx) => {
    const rowValues: (string | number)[] = [
      row.noUrut || idx + 1,
      row.nis || '',
      row.nisn || '',
      row.namaLengkap,
      row.jenisKelamin,
    ];

    subjects.forEach((sub) => {
      const val = row.subjectScores[sub.id];
      rowValues.push(val !== null && val !== undefined ? val : '-');
    });

    rowValues.push(
      row.totalNilaiAkhir,
      Math.round((row.rataRataNilaiAkhir + Number.EPSILON) * 100) / 100,
      row.ranking
    );

    data.push(rowValues);
  });

  // Summary statistics rows
  data.push([]); // blank row

  const avgRow: (string | number)[] = ['', '', '', 'RATA-RATA KELAS', ''];
  subjects.forEach((sub) => {
    avgRow.push(stats.subjectAverages[sub.id] || '-');
  });
  avgRow.push('-', stats.totalAverage, '-');
  data.push(avgRow);

  const maxRow: (string | number)[] = ['', '', '', 'NILAI TERTINGGI (MAKS)', ''];
  subjects.forEach((sub) => {
    const scores = studentRows
      .map((r) => r.subjectScores[sub.id])
      .filter((s): s is number => s !== null && s !== undefined);
    maxRow.push(scores.length > 0 ? Math.max(...scores) : '-');
  });
  maxRow.push(stats.highestTotal, '-', '-');
  data.push(maxRow);

  const minRow: (string | number)[] = ['', '', '', 'NILAI TERENDAH (MIN)', ''];
  subjects.forEach((sub) => {
    const scores = studentRows
      .map((r) => r.subjectScores[sub.id])
      .filter((s): s is number => s !== null && s !== undefined);
    minRow.push(scores.length > 0 ? Math.min(...scores) : '-');
  });
  minRow.push(stats.lowestTotal, '-', '-');
  data.push(minRow);

  // Signatures
  data.push([]);
  data.push([]);
  data.push([
    '',
    '',
    '',
    '',
    '',
    ...subjects.slice(2).map(() => ''),
    `${reportSettings.tempatRapor || 'Ditetapkan di Sekolah'}, ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
  ]);
  data.push([
    '',
    '',
    'Mengetahui,',
    '',
    '',
    ...subjects.slice(2).map(() => ''),
    'Guru Kelas / Wali Kelas,',
  ]);
  data.push([
    '',
    '',
    'Kepala Sekolah',
    '',
    '',
    ...subjects.slice(2).map(() => ''),
    '',
  ]);
  data.push([]);
  data.push([]);
  data.push([
    '',
    '',
    school.namaKepalaSekolah,
    '',
    '',
    ...subjects.slice(2).map(() => ''),
    teacher.namaGuru,
  ]);
  data.push([
    '',
    '',
    `NIP. ${school.nipKepalaSekolah || '-'}`,
    '',
    '',
    ...subjects.slice(2).map(() => ''),
    `NIP. ${teacher.nip || '-'}`,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths: { wch: number }[] = [
    { wch: 5 },  // No
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 30 }, // Nama
    { wch: 6 },  // L/P
  ];
  subjects.forEach(() => {
    colWidths.push({ wch: 15 });
  });
  colWidths.push({ wch: 18 }); // Jumlah
  colWidths.push({ wch: 12 }); // Rata-rata
  colWidths.push({ wch: 10 }); // Ranking
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  const safeSheetName = `Leger_${classInfo.namaKelas.replace(/\s+/g, '_')}_Sem${semester}`.slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const fileName = `Rekap_Nilai_Leger_${classInfo.namaKelas.replace(/\s+/g, '_')}_Semester_${semester}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// ==========================================
// LINGKUP MATERI EXPORT & IMPORT
// ==========================================

export function exportLearningScopesToExcel(
  learningScopes: LingkupMateri[],
  subjects: Subject[],
  semester: 1 | 2,
  subjectFilterId?: string
): void {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const filteredScopes = learningScopes.filter((lm) => {
    const isSemMatch = lm.semester === semester;
    if (!isSemMatch) return false;
    if (subjectFilterId && subjectFilterId !== 'all') {
      return lm.subjectId === subjectFilterId;
    }
    return true;
  });

  // Sort by subject name, then kode
  filteredScopes.sort((a, b) => {
    const subA = subjectMap.get(a.subjectId)?.nama || '';
    const subB = subjectMap.get(b.subjectId)?.nama || '';
    if (subA !== subB) return subA.localeCompare(subB);
    return a.kode.localeCompare(b.kode, undefined, { numeric: true });
  });

  const rows = filteredScopes.map((lm, idx) => {
    const sub = subjectMap.get(lm.subjectId);
    return {
      'No': idx + 1,
      'Mata Pelajaran': sub?.nama || lm.subjectId,
      'Kode LM': lm.kode,
      'Judul / Capaian Pembelajaran': lm.judul,
      'KKTP': lm.kktp,
      'Semester': lm.semester,
      'Status': lm.isActive ? 'Aktif' : 'Non-Aktif',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 28 }, // Mata Pelajaran
    { wch: 12 }, // Kode LM
    { wch: 60 }, // Judul / Capaian Pembelajaran
    { wch: 10 }, // KKTP
    { wch: 12 }, // Semester
    { wch: 12 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  const sheetName = `LM_Sem_${semester}`.slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const subjectNamePart = subjectFilterId && subjectFilterId !== 'all'
    ? (subjectMap.get(subjectFilterId)?.nama || 'Mapel').replace(/[^a-zA-Z0-9]/g, '_')
    : 'Semua_Mapel';

  const fileName = `Lingkup_Materi_${subjectNamePart}_Sem_${semester}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function downloadLearningScopeImportTemplate(
  subjects: Subject[],
  semester: 1 | 2,
  selectedSubjectId?: string
): void {
  const activeSubjects = subjects.filter((s) => s.isActive);
  const selectedSub = activeSubjects.find((s) => s.id === selectedSubjectId) || activeSubjects[0];

  const templateRows = [
    {
      'Mata Pelajaran': selectedSub?.nama || 'Pendidikan Pancasila',
      'Kode LM': 'LM 1',
      'Judul / Capaian Pembelajaran': 'Memahami nilai-nilai Pancasila dan penerapannya dalam kehidupan sehari-hari',
      'KKTP': selectedSub?.kktp || 75,
      'Semester': semester,
    },
    {
      'Mata Pelajaran': selectedSub?.nama || 'Pendidikan Pancasila',
      'Kode LM': 'LM 2',
      'Judul / Capaian Pembelajaran': 'Mengenal norma, hak, dan kewajiban sebagai anggota keluarga dan warga sekolah',
      'KKTP': selectedSub?.kktp || 75,
      'Semester': semester,
    },
    {
      'Mata Pelajaran': activeSubjects[1]?.nama || 'Bahasa Indonesia',
      'Kode LM': 'LM 1',
      'Judul / Capaian Pembelajaran': 'Menyimak, memahami informasi teks bacaan, dan menceritakan kembali secara runut',
      'KKTP': activeSubjects[1]?.kktp || 75,
      'Semester': semester,
    },
    {
      'Mata Pelajaran': activeSubjects[2]?.nama || 'Matematika',
      'Kode LM': 'LM 1',
      'Judul / Capaian Pembelajaran': 'Memahami operasi hitung penjumlahan dan pengurangan bilangan cacah sampai 1.000',
      'KKTP': activeSubjects[2]?.kktp || 75,
      'Semester': semester,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  worksheet['!cols'] = [
    { wch: 28 }, // Mata Pelajaran
    { wch: 12 }, // Kode LM
    { wch: 65 }, // Judul / Capaian Pembelajaran
    { wch: 10 }, // KKTP
    { wch: 12 }, // Semester
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template LM');
  XLSX.writeFile(workbook, `Template_Import_Lingkup_Materi_Sem_${semester}.xlsx`);
}

export interface ParsedLingkupMateri {
  subjectId: string;
  kode: string;
  judul: string;
  kktp: number;
  semester: 1 | 2;
  isActive: boolean;
}

export async function parseLearningScopesFromExcel(
  file: File,
  subjects: Subject[],
  currentSemester: 1 | 2,
  defaultSubjectId?: string
): Promise<ParsedLingkupMateri[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        const activeSubjects = subjects.filter((s) => s.isActive);
        const defaultSub = subjects.find((s) => s.id === defaultSubjectId) || activeSubjects[0];

        const findSubject = (inputName?: any): Subject => {
          if (!inputName) return defaultSub;
          const clean = String(inputName).trim().toLowerCase();

          // 1. Exact match by nama
          const exact = subjects.find((s) => s.nama.toLowerCase() === clean);
          if (exact) return exact;

          // 2. ID match
          const byId = subjects.find((s) => s.id.toLowerCase() === clean);
          if (byId) return byId;

          // 3. Partial / substring match
          const partial = subjects.find((s) => {
            const sName = s.nama.toLowerCase();
            return sName.includes(clean) || clean.includes(sName);
          });
          if (partial) return partial;

          return defaultSub;
        };

        const result: ParsedLingkupMateri[] = [];

        rawRows.forEach((row) => {
          const rawSubName =
            row['Mata Pelajaran'] ||
            row['Mapel'] ||
            row['Nama Mata Pelajaran'] ||
            row['MataPelajaran'] ||
            row['Subject'];
          const matchedSub = findSubject(rawSubName);

          const judul = String(
            row['Judul / Capaian Pembelajaran'] ||
            row['Judul Materi'] ||
            row['Judul'] ||
            row['Deskripsi'] ||
            row['Lingkup Materi'] ||
            row['Capaian Pembelajaran'] ||
            row['Materi'] ||
            row['Tujuan Pembelajaran'] ||
            ''
          ).trim();

          // Skip empty rows
          if (!judul) return;

          let kode = String(
            row['Kode LM'] ||
            row['Kode'] ||
            row['LM'] ||
            row['KodeLM'] ||
            row['Kode Materi'] ||
            ''
          ).trim();

          if (!kode) {
            const countForSub = result.filter((r) => r.subjectId === matchedSub.id).length;
            kode = `LM ${countForSub + 1}`;
          }

          const rawKktp = Number(
            row['KKTP'] || row['KKM'] || row['Nilai Minimal'] || matchedSub.kktp || 75
          );
          const kktp = isNaN(rawKktp)
            ? (matchedSub.kktp || 75)
            : Math.max(0, Math.min(100, rawKktp));

          const rawSem = Number(row['Semester'] || row['Sem'] || currentSemester);
          const sem: 1 | 2 = (rawSem === 2 || rawSem === 1) ? (rawSem as 1 | 2) : currentSemester;

          result.push({
            subjectId: matchedSub.id,
            kode,
            judul,
            kktp,
            semester: sem,
            isActive: true,
          });
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
