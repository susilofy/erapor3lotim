import { FullAppDatabase } from '../types';
import { createInitialDatabase, initialLearningScopes, CUSTOM_DEFAULT_LOGO_KEY, getSystemDefaultLogo } from '../data/defaultData';
import { TUT_WURI_LOGO_PNG } from '../data/logoBase64';
import { calculateNilaiAkhir, generateCompetencyDescription } from './competencyGenerator';

export const STORAGE_KEY = 'RAPOR_SD_DATABASE_V1';

export function getCustomDefaultLogo(): string | null {
  try {
    return localStorage.getItem(CUSTOM_DEFAULT_LOGO_KEY);
  } catch {
    return null;
  }
}

export function setCustomDefaultLogo(logo: string): void {
  try {
    if (logo && logo.trim().length > 0) {
      localStorage.setItem(CUSTOM_DEFAULT_LOGO_KEY, logo);
    }
  } catch (err) {
    console.error('Failed to save custom default logo:', err);
  }
}

export function clearCustomDefaultLogo(): void {
  try {
    localStorage.removeItem(CUSTOM_DEFAULT_LOGO_KEY);
  } catch {
    // ignore
  }
}

export function loadDatabaseFromStorage(): FullAppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialDatabase();
      saveDatabaseToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as FullAppDatabase;
    // Basic sanity check
    if (!parsed.school || !parsed.students || !parsed.subjects) {
      const initial = createInitialDatabase();
      saveDatabaseToStorage(initial);
      return initial;
    }

    let needsSave = false;

    // Enforce locked school name to SD Negeri 3 Loloan Timur
    if (parsed.school.namaSekolah !== 'SD Negeri 3 Loloan Timur') {
      parsed.school.namaSekolah = 'SD Negeri 3 Loloan Timur';
      needsSave = true;
    }

    // Auto-update to SD Negeri 3 Loloan Timur defaults if previously using placeholder school
    if (
      parsed.school.npsn === '50102345' ||
      !parsed.school.npsn
    ) {
      parsed.school = {
        ...parsed.school,
        namaSekolah: 'SD Negeri 3 Loloan Timur',
        npsn: '50100938',
        nss: '101220202026',
        alamat: 'Kelurahan Loloan Timur',
        desaKelurahan: 'Loloan Timur',
        kecamatan: 'Jembrana',
        kabupaten: 'Jembrana',
        provinsi: 'Bali',
        kodePos: '82116',
        telepon: '-',
        email: 'sdnegeri3loloantimur@gmail.com',
        website: '-',
        namaKepalaSekolah: 'Susilo Fitri Yatmoko, M.Pd.',
        nipKepalaSekolah: '19880521 201101 1 010',
      };
      if (parsed.reportSettings && parsed.reportSettings.tempatRapor === 'Jakarta') {
        parsed.reportSettings.tempatRapor = 'Jembrana';
      }
      needsSave = true;
    } else {
      // Sync requested school address & email updates if matched previous default
      if (
        parsed.school.email === 'sdnegeri3loloantimur.com' ||
        !parsed.school.email ||
        parsed.school.email === 'info@sdn1nusantara.sch.id'
      ) {
        parsed.school.email = 'sdnegeri3loloantimur@gmail.com';
        needsSave = true;
      }
      if (
        parsed.school.alamat === 'Jl. Gunung Krakatau, Kelurahan Loloan Timur' ||
        parsed.school.alamat === 'Jl. Merdeka Belajar No. 45, Jakarta Pusat'
      ) {
        parsed.school.alamat = 'Kelurahan Loloan Timur';
        needsSave = true;
      }
    }

    // Ensure Bahasa Daerah Bali is present
    const hasBali = parsed.subjects.some(
      (s) => s.id === 'sub-9' || s.nama.toLowerCase().includes('bali')
    );
    if (!hasBali) {
      const nextNo = parsed.subjects.length > 0 ? Math.max(...parsed.subjects.map((s) => s.no)) + 1 : 9;
      const subBali = { id: 'sub-9', no: nextNo, nama: 'Bahasa Daerah Bali', kktp: 75, isActive: true };
      parsed.subjects.push(subBali);

      // Add learning scopes for Bahasa Daerah Bali
      const baliLms = initialLearningScopes.filter((lm) => lm.subjectId === 'sub-9');
      for (const lm of baliLms) {
        if (!parsed.learningScopes.some((existing) => existing.id === lm.id)) {
          parsed.learningScopes.push(lm);
        }
      }

      // Initialize default scores for students
      if (parsed.scores && parsed.students) {
        const baliScores = [86, 88, 84, 86];
        for (const sem of [1, 2] as const) {
          if (!parsed.scores[sem]) parsed.scores[sem] = {};
          for (const student of parsed.students) {
            if (!parsed.scores[sem][student.id]) parsed.scores[sem][student.id] = {};
            if (!parsed.scores[sem][student.id]['sub-9']) {
              const scoresMap: Record<string, number | null> = {};
              baliLms.forEach((lm, idx) => {
                scoresMap[lm.id] = baliScores[idx % baliScores.length];
              });
              const na = calculateNilaiAkhir(baliLms, scoresMap);
              const desc = generateCompetencyDescription(
                subBali.nama,
                subBali.kktp,
                baliLms,
                scoresMap,
                student.noUrut || 1
              );
              parsed.scores[sem][student.id]['sub-9'] = {
                scores: scoresMap,
                nilaiAkhir: na,
                capaianKompetensi: desc,
                isManualDescription: false,
                descVariationIndex: student.noUrut || 1,
              };
            }
          }
        }
      }
      needsSave = true;
    }

    // Ensure Koding dan Kecerdasan Artifisial is present
    const hasCoding = parsed.subjects.some(
      (s) =>
        s.id === 'sub-10' ||
        s.nama.toLowerCase().includes('koding') ||
        s.nama.toLowerCase().includes('kecerdasan artifisial')
    );
    if (!hasCoding) {
      const nextNo = parsed.subjects.length > 0 ? Math.max(...parsed.subjects.map((s) => s.no)) + 1 : 10;
      const subCoding = {
        id: 'sub-10',
        no: nextNo,
        nama: 'Koding dan Kecerdasan Artifisial',
        kktp: 75,
        isActive: true,
      };
      parsed.subjects.push(subCoding);

      // Add learning scopes for Koding dan Kecerdasan Artifisial
      const codingLms = initialLearningScopes.filter((lm) => lm.subjectId === 'sub-10');
      for (const lm of codingLms) {
        if (!parsed.learningScopes.some((existing) => existing.id === lm.id)) {
          parsed.learningScopes.push(lm);
        }
      }

      // Initialize default scores for students
      if (parsed.scores && parsed.students) {
        const codingScores = [90, 88, 92, 85];
        for (const sem of [1, 2] as const) {
          if (!parsed.scores[sem]) parsed.scores[sem] = {};
          for (const student of parsed.students) {
            if (!parsed.scores[sem][student.id]) parsed.scores[sem][student.id] = {};
            if (!parsed.scores[sem][student.id]['sub-10']) {
              const scoresMap: Record<string, number | null> = {};
              codingLms.forEach((lm, idx) => {
                scoresMap[lm.id] = codingScores[idx % codingScores.length];
              });
              const na = calculateNilaiAkhir(codingLms, scoresMap);
              const desc = generateCompetencyDescription(
                subCoding.nama,
                subCoding.kktp,
                codingLms,
                scoresMap,
                student.noUrut || 1
              );
              parsed.scores[sem][student.id]['sub-10'] = {
                scores: scoresMap,
                nilaiAkhir: na,
                capaianKompetensi: desc,
                isManualDescription: false,
                descVariationIndex: student.noUrut || 1,
              };
            }
          }
        }
      }
      needsSave = true;
    }

    // Logo Sekolah: Prioritaskan logo default kustom yang diunggah pengguna atau logo yang sedang aktif
    // Perbarui juga jika masih menggunakan logo Tut Wuri lama (256x256) ke logo resmi Kemdikbud baru (tut-wuri-handayani-7779.png)
    const customDefault = getCustomDefaultLogo();
    const isOldTutWuri = (logoStr?: string) =>
      Boolean(
        logoStr &&
        (logoStr.includes('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhm') ||
         logoStr.includes('SD Negeri 1 Nusantara') ||
         logoStr.includes('<svg') ||
         logoStr.includes('%231E3A8A'))
      );

    if (customDefault && isOldTutWuri(customDefault)) {
      clearCustomDefaultLogo();
    }

    const updatedCustomDefault = getCustomDefaultLogo();
    if (updatedCustomDefault && !isOldTutWuri(updatedCustomDefault)) {
      if (
        !parsed.school.logoSekolah ||
        isOldTutWuri(parsed.school.logoSekolah)
      ) {
        parsed.school.logoSekolah = updatedCustomDefault;
        needsSave = true;
      }
    } else {
      if (
        parsed.school.logoSekolah &&
        parsed.school.logoSekolah !== TUT_WURI_LOGO_PNG &&
        !isOldTutWuri(parsed.school.logoSekolah)
      ) {
        setCustomDefaultLogo(parsed.school.logoSekolah);
      } else if (
        !parsed.school.logoSekolah ||
        isOldTutWuri(parsed.school.logoSekolah)
      ) {
        parsed.school.logoSekolah = TUT_WURI_LOGO_PNG;
        needsSave = true;
      }
    }

    // Auto-clear data guru/wali, data siswa, dan lingkup materi sesuai permintaan pengguna
    if (!(parsed as any)._clearedDataGuruSiswaLingkupMateri) {
      parsed.teacher = {
        namaGuru: '',
        nip: '',
        nuptk: '',
        jabatan: '',
        kelasDiampu: '',
        tahunAjaran: parsed.teacher?.tahunAjaran || '2026/2027',
      };
      if (parsed.classInfo) {
        parsed.classInfo.waliKelas = '';
      }
      parsed.students = [];
      parsed.learningScopes = [];
      parsed.scores = { 1: {}, 2: {} };
      parsed.cocurricular = { 1: null, 2: null };
      parsed.extracurricular = { 1: {}, 2: {} };
      parsed.attendance = { 1: {}, 2: {} };
      parsed.teacherNotes = { 1: {}, 2: {} };
      parsed.promotions = {};
      (parsed as any)._clearedDataGuruSiswaLingkupMateri = true;
      needsSave = true;
    }

    if (needsSave) {
      saveDatabaseToStorage(parsed);
    }

    return parsed;
  } catch (err) {
    console.error('Failed to load from storage, using initial data:', err);
    return createInitialDatabase();
  }
}

export function clearTeacherStudentLearningScopeData(db: FullAppDatabase): FullAppDatabase {
  const cleared: FullAppDatabase = {
    ...db,
    teacher: {
      namaGuru: '',
      nip: '',
      nuptk: '',
      jabatan: '',
      kelasDiampu: '',
      tahunAjaran: db.teacher?.tahunAjaran || '2026/2027',
    },
    classInfo: {
      ...db.classInfo,
      waliKelas: '',
    },
    students: [],
    learningScopes: [],
    scores: { 1: {}, 2: {} },
    cocurricular: { 1: null, 2: null },
    extracurricular: { 1: {}, 2: {} },
    attendance: { 1: {}, 2: {} },
    teacherNotes: { 1: {}, 2: {} },
    promotions: {},
    savedAt: new Date().toISOString(),
  };
  (cleared as any)._clearedDataGuruSiswaLingkupMateri = true;
  saveDatabaseToStorage(cleared);
  return cleared;
}

export function saveDatabaseToStorage(db: FullAppDatabase): void {
  try {
    const updated: FullAppDatabase = {
      ...db,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function exportDatabaseAsJson(db: FullAppDatabase): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement('a');
  const cleanClass = db.classInfo.namaKelas.replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Backup_RaporSD_${cleanClass}_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export interface BackupValidationResult {
  isValid: boolean;
  errorMessage?: string;
  summary?: {
    namaSekolah: string;
    namaKelas: string;
    semester: number;
    tahunAjaran: string;
    jumlahSiswa: number;
    jumlahMapel: number;
    savedAt: string;
  };
  data?: FullAppDatabase;
}

export function validateBackupJson(rawText: string): BackupValidationResult {
  try {
    const data = JSON.parse(rawText) as FullAppDatabase;
    if (!data || typeof data !== 'object') {
      return { isValid: false, errorMessage: 'Format file JSON tidak valid.' };
    }

    if (!data.school || typeof data.school.namaSekolah !== 'string') {
      return { isValid: false, errorMessage: 'File backup tidak memiliki Data Sekolah yang valid.' };
    }

    if (!Array.isArray(data.students)) {
      return { isValid: false, errorMessage: 'File backup tidak memiliki Data Siswa yang valid.' };
    }

    if (!Array.isArray(data.subjects)) {
      return { isValid: false, errorMessage: 'File backup tidak memiliki Data Mata Pelajaran yang valid.' };
    }

    // Always enforce locked school name
    if (data.school) {
      data.school.namaSekolah = 'SD Negeri 3 Loloan Timur';
    }

    return {
      isValid: true,
      summary: {
        namaSekolah: 'SD Negeri 3 Loloan Timur',
        namaKelas: data.classInfo?.namaKelas || 'Kelas',
        semester: data.classInfo?.semester || 1,
        tahunAjaran: data.classInfo?.tahunAjaran || '-',
        jumlahSiswa: data.students.length,
        jumlahMapel: data.subjects.length,
        savedAt: data.savedAt || new Date().toISOString(),
      },
      data,
    };
  } catch (err) {
    return { isValid: false, errorMessage: 'Gagal membaca file JSON. Pastikan file tidak rusak.' };
  }
}

export function resetDatabase(): FullAppDatabase {
  const initial = createInitialDatabase();
  saveDatabaseToStorage(initial);
  return initial;
}

export function restoreBackupFromJson(
  file: File,
  onSuccess: (data: FullAppDatabase) => void,
  onError: (error: string) => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const res = validateBackupJson(content);
      if (res.isValid && res.data) {
        saveDatabaseToStorage(res.data);
        onSuccess(res.data);
      } else {
        onError(res.errorMessage || 'File cadangan tidak valid.');
      }
    } catch (err: any) {
      onError(err.message || 'Gagal memproses file.');
    }
  };
  reader.onerror = () => {
    onError('Gagal membaca file dari penyimpanan lokal.');
  };
  reader.readAsText(file);
}

// Aliases for clean imports
export const loadDatabase = loadDatabaseFromStorage;
export const saveDatabase = saveDatabaseToStorage;
export const exportBackupJson = exportDatabaseAsJson;
