import { FullAppDatabase, TeacherProfileMeta } from '../types';
import { createInitialDatabase } from '../data/defaultData';
import { STORAGE_KEY, loadDatabaseFromStorage, saveDatabaseToStorage, exportBackupJson } from './storageHelper';

export const PROFILES_LIST_KEY = 'RAPOR_PROFILES_LIST_V2';
export const ACTIVE_PROFILE_ID_KEY = 'RAPOR_ACTIVE_PROFILE_ID';

export const DEFAULT_PROFILES: TeacherProfileMeta[] = [
  {
    id: 'profil-1',
    nomor: 1,
    namaProfil: 'Guru Kelas 1',
    kelas: 'Kelas I',
    tingkat: 1,
    fase: 'Fase A',
    namaGuru: '',
    nipGuru: '',
    warnaTema: 'blue',
  },
  {
    id: 'profil-2',
    nomor: 2,
    namaProfil: 'Guru Kelas 2',
    kelas: 'Kelas II',
    tingkat: 2,
    fase: 'Fase A',
    namaGuru: '',
    nipGuru: '',
    warnaTema: 'emerald',
  },
  {
    id: 'profil-3',
    nomor: 3,
    namaProfil: 'Guru Kelas 3',
    kelas: 'Kelas III',
    tingkat: 3,
    fase: 'Fase B',
    namaGuru: '',
    nipGuru: '',
    warnaTema: 'amber',
  },
  {
    id: 'profil-4',
    nomor: 4,
    namaProfil: 'Guru Kelas 4',
    kelas: 'Kelas IV',
    tingkat: 4,
    fase: 'Fase B',
    namaGuru: '',
    nipGuru: '',
    warnaTema: 'purple',
  },
  {
    id: 'profil-5',
    nomor: 5,
    namaProfil: 'Guru Kelas 5',
    kelas: 'Kelas V',
    tingkat: 5,
    fase: 'Fase C',
    namaGuru: '',
    nipGuru: '',
    warnaTema: 'rose',
  },
  {
    id: 'profil-6',
    nomor: 6,
    namaProfil: 'Guru Kelas 6',
    kelas: 'Kelas VI',
    tingkat: 6,
    fase: 'Fase C',
    namaGuru: '',
    nipGuru: '',
    warnaTema: 'indigo',
  },
];

export function getProfileDbKey(profileId: string): string {
  return `RAPOR_DB_PROFILE_${profileId}`;
}

/**
 * Mendapatkan daftar seluruh profil guru (1 s.d. 6).
 * Melakukan migrasi data yang sudah ada sebelumnya secara otomatis tanpa kehilangan data.
 */
export function getProfilesList(): TeacherProfileMeta[] {
  try {
    const raw = localStorage.getItem(PROFILES_LIST_KEY);
    if (!raw) {
      // Periksa apakah ada data lama di STORAGE_KEY
      const legacyRaw = localStorage.getItem(STORAGE_KEY);
      const profiles = [...DEFAULT_PROFILES];

      let activeId = 'profil-6'; // default kelas 6

      if (legacyRaw) {
        try {
          const legacyDb = JSON.parse(legacyRaw) as FullAppDatabase;
          const tingkat = legacyDb.classInfo?.tingkat || 6;
          const matchedId = `profil-${Math.min(Math.max(tingkat, 1), 6)}`;
          activeId = matchedId;

          const idx = profiles.findIndex((p) => p.id === matchedId);
          if (idx !== -1) {
            profiles[idx] = {
              ...profiles[idx],
              namaProfil: `Guru ${legacyDb.classInfo?.namaKelas || profiles[idx].kelas}`,
              kelas: legacyDb.classInfo?.namaKelas || profiles[idx].kelas,
              fase: legacyDb.classInfo?.fase || profiles[idx].fase,
              namaGuru: legacyDb.teacher?.namaGuru || '',
              nipGuru: legacyDb.teacher?.nip || '',
              terakhirDiubah: legacyDb.savedAt || new Date().toISOString(),
            };
          }

          // Simpan database lama ke slot profil terkait
          localStorage.setItem(getProfileDbKey(matchedId), JSON.stringify(legacyDb));
        } catch {
          // Abaikan error parsing legacy
        }
      }

      localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(profiles));
      if (!localStorage.getItem(ACTIVE_PROFILE_ID_KEY)) {
        localStorage.setItem(ACTIVE_PROFILE_ID_KEY, activeId);
      }
      return profiles;
    }

    const parsed = JSON.parse(raw) as TeacherProfileMeta[];
    if (Array.isArray(parsed) && parsed.length >= 6) {
      return parsed;
    }
    return DEFAULT_PROFILES;
  } catch (err) {
    console.error('Failed to get profiles list:', err);
    return DEFAULT_PROFILES;
  }
}

/**
 * Menyimpan daftar profil ke localStorage
 */
export function saveProfilesList(profiles: TeacherProfileMeta[]): void {
  try {
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profiles list:', err);
  }
}

/**
 * Mendapatkan ID profil yang sedang aktif
 */
export function getActiveProfileId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
    if (active) return active;
    const profiles = getProfilesList();
    const fallbackId = profiles[0]?.id || 'profil-1';
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, fallbackId);
    return fallbackId;
  } catch {
    return 'profil-1';
  }
}

/**
 * Mengubah ID profil yang aktif
 */
export function setActiveProfileId(profileId: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, profileId);
  } catch (err) {
    console.error('Failed to set active profile id:', err);
  }
}

/**
 * Mendapatkan objek profil yang sedang aktif
 */
export function getActiveProfile(): TeacherProfileMeta {
  const activeId = getActiveProfileId();
  const profiles = getProfilesList();
  return profiles.find((p) => p.id === activeId) || profiles[0] || DEFAULT_PROFILES[0];
}

/**
 * Memuat database untuk profil tertentu
 */
export function loadDatabaseForProfile(profileId: string): FullAppDatabase {
  const key = getProfileDbKey(profileId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Jika slot ini belum pernah dipakai, inisialisasi database khusus kelas terkait
      const profiles = getProfilesList();
      const meta = profiles.find((p) => p.id === profileId) || DEFAULT_PROFILES[0];
      
      const newDb = createInitialDatabase();
      newDb.classInfo = {
        ...newDb.classInfo,
        namaKelas: meta.kelas,
        tingkat: meta.tingkat,
        fase: meta.fase,
        waliKelas: meta.namaGuru || '',
      };
      newDb.teacher = {
        ...newDb.teacher,
        namaGuru: meta.namaGuru || '',
        nip: meta.nipGuru || '',
        kelasDiampu: meta.kelas,
      };

      saveDatabaseForProfile(profileId, newDb);
      return newDb;
    }

    const parsed = JSON.parse(raw) as FullAppDatabase;
    // Pastikan nama sekolah terkunci pada SD Negeri 3 Loloan Timur
    if (parsed.school) {
      parsed.school.namaSekolah = 'SD Negeri 3 Loloan Timur';
    }
    return parsed;
  } catch (err) {
    console.error(`Failed to load database for profile ${profileId}:`, err);
    return createInitialDatabase();
  }
}

/**
 * Menyimpan database untuk profil tertentu
 */
export function saveDatabaseForProfile(profileId: string, db: FullAppDatabase): void {
  const key = getProfileDbKey(profileId);
  try {
    const updated: FullAppDatabase = {
      ...db,
      savedAt: new Date().toISOString(),
    };
    if (updated.school) {
      updated.school.namaSekolah = 'SD Negeri 3 Loloan Timur';
    }
    localStorage.setItem(key, JSON.stringify(updated));

    // Sinkronkan juga ke STORAGE_KEY agar fungsi export/backup global tetap kompatibel
    if (getActiveProfileId() === profileId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    // Otomatis perbarui metadata profil (nama guru, kelas, tanggal diubah)
    syncActiveProfileFromDb(profileId, updated);
  } catch (err) {
    console.error(`Failed to save database for profile ${profileId}:`, err);
  }
}

/**
 * Memperbarui metadata profil guru
 */
export function updateProfileMeta(
  profileId: string,
  updates: Partial<TeacherProfileMeta>
): TeacherProfileMeta[] {
  const profiles = getProfilesList();
  const index = profiles.findIndex((p) => p.id === profileId);
  if (index !== -1) {
    profiles[index] = {
      ...profiles[index],
      ...updates,
      terakhirDiubah: new Date().toISOString(),
    };
    saveProfilesList(profiles);
  }
  return profiles;
}

/**
 * Sinkronisasi otomatis data profil dari database kelas aktif
 */
export function syncActiveProfileFromDb(profileId: string, db: FullAppDatabase): void {
  try {
    const profiles = getProfilesList();
    const index = profiles.findIndex((p) => p.id === profileId);
    if (index !== -1) {
      let changed = false;
      const current = profiles[index];

      if (db.teacher?.namaGuru && db.teacher.namaGuru !== current.namaGuru) {
        current.namaGuru = db.teacher.namaGuru;
        changed = true;
      }
      if (db.teacher?.nip && db.teacher.nip !== current.nipGuru) {
        current.nipGuru = db.teacher.nip;
        changed = true;
      }
      if (db.classInfo?.namaKelas && db.classInfo.namaKelas !== current.kelas) {
        current.kelas = db.classInfo.namaKelas;
        changed = true;
      }
      if (db.classInfo?.fase && db.classInfo.fase !== current.fase) {
        current.fase = db.classInfo.fase;
        changed = true;
      }

      current.terakhirDiubah = db.savedAt || new Date().toISOString();
      if (changed) {
        saveProfilesList(profiles);
      }
    }
  } catch (err) {
    console.error('Failed to sync profile from db:', err);
  }
}

/**
 * Mengambil ringkasan data suatu profil (jumlah siswa, status nilai, dll)
 */
export function getProfileSummary(profileId: string): {
  studentCount: number;
  subjectCount: number;
  savedAt: string;
  namaGuru: string;
  kelas: string;
} {
  try {
    const key = getProfileDbKey(profileId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const profiles = getProfilesList();
      const meta = profiles.find((p) => p.id === profileId) || DEFAULT_PROFILES[0];
      return {
        studentCount: 0,
        subjectCount: 10,
        savedAt: '-',
        namaGuru: meta.namaGuru || 'Belum diatur',
        kelas: meta.kelas,
      };
    }
    const db = JSON.parse(raw) as FullAppDatabase;
    return {
      studentCount: Array.isArray(db.students) ? db.students.length : 0,
      subjectCount: Array.isArray(db.subjects) ? db.subjects.length : 10,
      savedAt: db.savedAt ? new Date(db.savedAt).toLocaleDateString('id-ID') : '-',
      namaGuru: db.teacher?.namaGuru || 'Belum diatur',
      kelas: db.classInfo?.namaKelas || 'Kelas',
    };
  } catch {
    return {
      studentCount: 0,
      subjectCount: 10,
      savedAt: '-',
      namaGuru: 'Belum diatur',
      kelas: 'Kelas',
    };
  }
}

/**
 * Mengosongkan data suatu profil kembali ke keadaan awal
 */
export function resetProfileDatabase(profileId: string): FullAppDatabase {
  const profiles = getProfilesList();
  const meta = profiles.find((p) => p.id === profileId) || DEFAULT_PROFILES[0];

  const newDb = createInitialDatabase();
  newDb.classInfo = {
    ...newDb.classInfo,
    namaKelas: meta.kelas,
    tingkat: meta.tingkat,
    fase: meta.fase,
    waliKelas: '',
  };
  newDb.teacher = {
    ...newDb.teacher,
    namaGuru: '',
    nip: '',
    kelasDiampu: meta.kelas,
  };

  saveDatabaseForProfile(profileId, newDb);
  return newDb;
}

/**
 * Download file backup JSON khusus profil database
 */
export function exportDatabaseAsJson(db: FullAppDatabase): void {
  exportBackupJson(db);
}
