import {
  FullAppDatabase,
  SchoolInfo,
  TeacherInfo,
  ClassInfo,
  ReportSettings,
  Student,
  Subject,
  LingkupMateri,
  ExtracurricularItem,
  ScoresDatabase,
  CocurricularDatabase,
  ExtracurricularDatabase,
  AttendanceDatabase,
  TeacherNotesDatabase,
  PromotionDatabase,
} from '../types';
import { generateCompetencyDescription, calculateNilaiAkhir } from '../utils/competencyGenerator';
import { TUT_WURI_LOGO_PNG } from './logoBase64';

export const CUSTOM_DEFAULT_LOGO_KEY = 'RAPOR_SD_CUSTOM_DEFAULT_LOGO';

/**
 * Mendapatkan logo default sekolah.
 * Jika pengguna pernah mengunggah logo kustom yang disimpan sebagai default, gunakan logo tersebut.
 * Jika belum, gunakan logo standar Tut Wuri Handayani (Kemendikbudristek).
 */
export function getSystemDefaultLogo(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const custom = window.localStorage.getItem(CUSTOM_DEFAULT_LOGO_KEY);
      if (custom && custom.trim().length > 0) {
        return custom;
      }
    } catch {
      // ignore
    }
  }
  return TUT_WURI_LOGO_PNG;
}

// Logo default sekolah: memprioritaskan logo kustom hasil upload yang disimpan pengguna, atau logo resmi Tut Wuri Handayani
export const DEFAULT_SCHOOL_LOGO = getSystemDefaultLogo();

export const initialSchool: SchoolInfo = {
  namaSekolah: 'SD Negeri 3 Loloan Timur',
  npsn: '50100938',
  nss: '101220202026',
  alamat: 'Kelurahan Loloan Timur',
  desaKelurahan: 'Loloan Timur',
  kecamatan: 'Jembrana',
  kabupaten: 'Jembrana',
  provinsi: 'Bali',
  kodePos: '82116',
  email: 'sdnegeri3loloantimur@gmail.com',
  telepon: '-',
  website: '-',
  namaKepalaSekolah: 'Susilo Fitri Yatmoko, M.Pd.',
  nipKepalaSekolah: '19880521 201101 1 010',
  logoSekolah: getSystemDefaultLogo(),
};

export const initialTeacher: TeacherInfo = {
  namaGuru: '',
  nip: '',
  nuptk: '',
  jabatan: '',
  kelasDiampu: '',
  tahunAjaran: '2026/2027',
};

export const initialClass: ClassInfo = {
  namaKelas: 'Kelas VI',
  fase: 'Fase C',
  tingkat: 6,
  tahunAjaran: '2026/2027',
  semester: 1,
  waliKelas: '',
};

export const initialReportSettings: ReportSettings = {
  tempatRapor: 'Jembrana',
  tanggalRapor: '2026-12-19',
  modeTandaTangan: 'kosong',
  formatNilai: 'desimal_2',
};

export const initialSubjects: Subject[] = [
  { id: 'sub-1', no: 1, nama: 'Pendidikan Agama dan Budi Pekerti', kktp: 75, isActive: true },
  { id: 'sub-2', no: 2, nama: 'Pendidikan Pancasila', kktp: 75, isActive: true },
  { id: 'sub-3', no: 3, nama: 'Bahasa Indonesia', kktp: 75, isActive: true },
  { id: 'sub-4', no: 4, nama: 'Matematika', kktp: 75, isActive: true },
  { id: 'sub-5', no: 5, nama: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', kktp: 75, isActive: true },
  { id: 'sub-6', no: 6, nama: 'Seni Rupa', kktp: 75, isActive: true },
  { id: 'sub-7', no: 7, nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)', kktp: 75, isActive: true },
  { id: 'sub-8', no: 8, nama: 'Bahasa Inggris', kktp: 75, isActive: true },
  { id: 'sub-9', no: 9, nama: 'Bahasa Daerah Bali', kktp: 75, isActive: true },
  { id: 'sub-10', no: 10, nama: 'Koding dan Kecerdasan Artifisial', kktp: 75, isActive: true },
];

export const initialLearningScopes: LingkupMateri[] = [];

export const initialStudents: Student[] = [];

export const initialExtracurricularList: ExtracurricularItem[] = [
  { id: 'ex-1', nama: 'Pramuka' },
  { id: 'ex-2', nama: 'Sepak Bola' },
  { id: 'ex-3', nama: 'Bola Voli' },
  { id: 'ex-4', nama: 'Seni Tari' },
  { id: 'ex-5', nama: 'Seni Musik' },
  { id: 'ex-6', nama: 'Seni Lukis' },
  { id: 'ex-7', nama: 'Pencak Silat' },
  { id: 'ex-8', nama: 'PMR' },
  { id: 'ex-9', nama: 'UKS' },
  { id: 'ex-10', nama: 'Komputer' },
  { id: 'ex-11', nama: 'Keagamaan' },
];

export function buildInitialScores(): ScoresDatabase {
  return {
    1: {},
    2: {},
  };
}

export const initialCocurricular: CocurricularDatabase = {
  1: null,
  2: null,
};

export const initialExtracurricular: ExtracurricularDatabase = {
  1: {},
  2: {},
};

export const initialAttendance: AttendanceDatabase = {
  1: {},
  2: {},
};

export const initialTeacherNotes: TeacherNotesDatabase = {
  1: {},
  2: {},
};

export const initialPromotions: PromotionDatabase = {};

export function createInitialDatabase(): FullAppDatabase {
  return {
    version: '1.0.0',
    savedAt: new Date().toISOString(),
    school: {
      ...initialSchool,
      logoSekolah: getSystemDefaultLogo(),
    },
    teacher: initialTeacher,
    classInfo: initialClass,
    reportSettings: initialReportSettings,
    students: initialStudents,
    subjects: initialSubjects,
    learningScopes: initialLearningScopes,
    scores: buildInitialScores(),
    cocurricular: initialCocurricular,
    extracurricularList: initialExtracurricularList,
    extracurricular: initialExtracurricular,
    attendance: initialAttendance,
    teacherNotes: initialTeacherNotes,
    promotions: initialPromotions,
  };
}
