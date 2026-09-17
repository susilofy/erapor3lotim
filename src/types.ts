export interface SchoolInfo {
  namaSekolah: string;
  npsn: string;
  nss: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  email: string;
  telepon: string;
  website: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  logoSekolah: string; // base64 or URL
}

export interface TeacherInfo {
  namaGuru: string;
  nip: string;
  nuptk: string;
  jabatan: string;
  kelasDiampu: string;
  tahunAjaran: string;
  tandaTanganGuru?: string;
}

export interface ClassInfo {
  namaKelas: string;
  fase: 'Fase A' | 'Fase B' | 'Fase C';
  tingkat: number; // 1 to 6
  tahunAjaran: string;
  semester: 1 | 2;
  waliKelas: string;
}

export interface ReportSettings {
  tempatRapor: string;
  tanggalRapor: string; // YYYY-MM-DD
  modeTandaTangan: 'kosong' | 'gambar';
  tandaTanganKepsekImg?: string;
  tandaTanganGuruImg?: string;
  formatNilai?: 'bulat' | 'desimal_2'; // 'bulat': Bilangan Bulat, 'desimal_2': 2 Angka di Belakang Koma
}

export interface Student {
  id: string;
  noUrut: number;
  namaLengkap: string;
  nis: string;
  nisn: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: string;
  alamat: string;
  namaAyah: string;
  namaIbu: string;
  namaWali: string;
  noKK: string;
  nik: string;
  status: 'Aktif' | 'Pindah' | 'Keluar' | 'Lulus';
}

export interface Subject {
  id: string;
  no: number;
  nama: string;
  kktp: number;
  isActive: boolean;
}

export interface LingkupMateri {
  id: string;
  subjectId: string;
  kode: string; // e.g., LM 1, LM 2, LM 3, LM 4
  judul: string;
  kktp: number;
  semester: 1 | 2;
  isActive: boolean;
}

export interface StudentSubjectScore {
  // scores map: lingkupMateriId -> score (0-100)
  scores: Record<string, number | null>;
  nilaiAkhir: number | null;
  capaianKompetensi: string;
  isManualDescription: boolean;
  descVariationIndex?: number;
}

// Stored as: scores[semester][studentId][subjectId] = StudentSubjectScore
export type ScoresDatabase = Record<number, Record<string, Record<string, StudentSubjectScore>>>;

export interface CocurricularProject {
  tema: string;
  deskripsi: string;
  // studentId -> capaian description
  capaianSiswa: Record<string, string>;
}

// Stored per semester: cocurricular[semester] = CocurricularProject
export type CocurricularDatabase = Record<number, CocurricularProject>;

export interface ExtracurricularItem {
  id: string;
  nama: string;
}

export interface StudentExtraRecord {
  ekskulId: string;
  namaEkskul: string;
  keterangan: string;
}

// Stored per semester: extracurricular[semester][studentId] = StudentExtraRecord[]
export type ExtracurricularDatabase = Record<number, Record<string, StudentExtraRecord[]>>;

export interface AttendanceRecord {
  sakit: number;
  izin: number;
  alpa: number; // Tanpa Keterangan
}

// Stored per semester: attendance[semester][studentId] = AttendanceRecord
export type AttendanceDatabase = Record<number, Record<string, AttendanceRecord>>;

// Stored per semester: teacherNotes[semester][studentId] = string
export type TeacherNotesDatabase = Record<number, Record<string, string>>;

export interface PromotionRecord {
  status: 'Naik' | 'Tinggal' | 'Lulus' | 'Tidak Lulus';
  keterangan: string; // e.g. "Naik ke Kelas VI", "Lulus"
}

// Stored per semester (used mainly in semester 2): promotion[studentId] = PromotionRecord
export type PromotionDatabase = Record<string, PromotionRecord>;

export interface FullAppDatabase {
  version: string;
  savedAt: string;
  school: SchoolInfo;
  teacher: TeacherInfo;
  classInfo: ClassInfo;
  reportSettings: ReportSettings;
  students: Student[];
  subjects: Subject[];
  learningScopes: LingkupMateri[];
  scores: ScoresDatabase;
  cocurricular: CocurricularDatabase;
  extracurricularList: ExtracurricularItem[];
  extracurricular: ExtracurricularDatabase;
  attendance: AttendanceDatabase;
  teacherNotes: TeacherNotesDatabase;
  promotions: PromotionDatabase;
}

export interface TeacherProfileMeta {
  id: string; // e.g. 'profil-1' s.d. 'profil-6'
  nomor: number; // 1 to 6
  namaProfil: string; // e.g. 'Guru Kelas 1'
  kelas: string; // e.g. 'Kelas I'
  tingkat: number; // 1 to 6
  fase: 'Fase A' | 'Fase B' | 'Fase C';
  namaGuru: string;
  nipGuru: string;
  warnaTema: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
  terakhirDiubah?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'profil'
  | 'sekolah'
  | 'guru'
  | 'kelas'
  | 'siswa'
  | 'mapel'
  | 'lingkup_materi'
  | 'nilai'
  | 'capaian'
  | 'kokurikuler'
  | 'ekstrakurikuler'
  | 'absensi'
  | 'catatan'
  | 'status_siswa'
  | 'rekap_nilai'
  | 'preview_rapor'
  | 'database';
