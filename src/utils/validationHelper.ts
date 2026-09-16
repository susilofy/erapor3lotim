import { FullAppDatabase } from '../types';

export interface CompletenessItem {
  id: string;
  label: string;
  isComplete: boolean;
  details?: string;
  category: 'master' | 'nilai' | 'tambahan';
}

export interface CompletenessReport {
  items: CompletenessItem[];
  overallStatus: 'Draft' | 'Lengkap' | 'Siap Cetak';
  completedCount: number;
  totalCount: number;
  percent: number;
  studentCompleteness: Record<string, { isReady: boolean; missingItems: string[] }>;
}

export function checkReportCompleteness(db: FullAppDatabase, semester: number): CompletenessReport {
  const items: CompletenessItem[] = [];
  const activeStudents = db.students.filter((s) => s.status === 'Aktif');
  const activeSubjects = db.subjects.filter((s) => s.isActive);
  const currentScores = db.scores[semester] || {};
  const currentAttendance = db.attendance[semester] || {};
  const currentTeacherNotes = db.teacherNotes[semester] || {};
  const currentCocurricular = db.cocurricular[semester];
  const currentExtra = db.extracurricular[semester] || {};

  // 1. Data Sekolah
  const isSchoolComplete = Boolean(
    db.school.namaSekolah?.trim() &&
    db.school.npsn?.trim() &&
    db.school.alamat?.trim() &&
    db.school.namaKepalaSekolah?.trim() &&
    db.school.nipKepalaSekolah?.trim()
  );
  items.push({
    id: 'school',
    label: 'Data Sekolah & Kepala Sekolah',
    isComplete: isSchoolComplete,
    details: isSchoolComplete ? 'Data sekolah terisi lengkap' : 'Nama, NPSN, alamat, atau data Kepala Sekolah belum terisi',
    category: 'master',
  });

  // 2. Data Guru
  const isTeacherComplete = Boolean(
    db.teacher.namaGuru?.trim() && db.teacher.nip?.trim() && db.teacher.kelasDiampu?.trim()
  );
  items.push({
    id: 'teacher',
    label: 'Data Guru / Wali Kelas',
    isComplete: isTeacherComplete,
    details: isTeacherComplete ? 'Data guru wali kelas lengkap' : 'Nama, NIP, atau kelas yang diampu belum lengkap',
    category: 'master',
  });

  // 3. Data Siswa
  const isStudentsComplete = activeStudents.length > 0;
  items.push({
    id: 'students',
    label: 'Data Siswa Aktif',
    isComplete: isStudentsComplete,
    details: isStudentsComplete ? `${activeStudents.length} siswa aktif terdaftar` : 'Belum ada siswa aktif terdaftar',
    category: 'master',
  });

  // 4. Data Mata Pelajaran
  const isSubjectsComplete = activeSubjects.length > 0;
  items.push({
    id: 'subjects',
    label: 'Data Mata Pelajaran & KKTP',
    isComplete: isSubjectsComplete,
    details: isSubjectsComplete ? `${activeSubjects.length} mata pelajaran aktif` : 'Belum ada mata pelajaran aktif',
    category: 'master',
  });

  // 5. Nilai Sumatif & Nilai Akhir
  let missingScoreCount = 0;
  for (const student of activeStudents) {
    for (const sub of activeSubjects) {
      const rec = currentScores[student.id]?.[sub.id];
      if (!rec || rec.nilaiAkhir === null || rec.nilaiAkhir === undefined) {
        missingScoreCount++;
      }
    }
  }
  const isScoresComplete = activeStudents.length > 0 && activeSubjects.length > 0 && missingScoreCount === 0;
  items.push({
    id: 'scores',
    label: 'Nilai Sumatif & Nilai Akhir',
    isComplete: isScoresComplete,
    details: isScoresComplete
      ? 'Semua nilai sumatif terisi lengkap'
      : `${missingScoreCount} entri nilai mata pelajaran siswa masih kosong`,
    category: 'nilai',
  });

  // 6. Capaian Kompetensi
  let missingDescCount = 0;
  for (const student of activeStudents) {
    for (const sub of activeSubjects) {
      const rec = currentScores[student.id]?.[sub.id];
      if (!rec?.capaianKompetensi?.trim() || rec.capaianKompetensi.startsWith('Belum ada')) {
        missingDescCount++;
      }
    }
  }
  const isDescComplete = activeStudents.length > 0 && activeSubjects.length > 0 && missingDescCount === 0;
  items.push({
    id: 'competency',
    label: 'Capaian Kompetensi Otomatis',
    isComplete: isDescComplete,
    details: isDescComplete
      ? 'Seluruh deskripsi capaian kompetensi telah digenerate'
      : `${missingDescCount} deskripsi capaian kompetensi belum terisi`,
    category: 'nilai',
  });

  // 7. Kokurikuler
  const isCocurricularComplete = Boolean(
    currentCocurricular?.tema?.trim() &&
    activeStudents.every((s) => Boolean(currentCocurricular.capaianSiswa[s.id]?.trim()))
  );
  items.push({
    id: 'cocurricular',
    label: 'Kokurikuler',
    isComplete: isCocurricularComplete,
    details: isCocurricularComplete
      ? 'Tema dan capaian seluruh siswa terisi'
      : 'Tema projek atau capaian siswa belum terisi lengkap',
    category: 'tambahan',
  });

  // 8. Ekstrakurikuler
  const isExtraComplete = activeStudents.every((s) => (currentExtra[s.id] || []).length > 0);
  items.push({
    id: 'extra',
    label: 'Ekstrakurikuler Siswa',
    isComplete: isExtraComplete,
    details: isExtraComplete
      ? 'Seluruh siswa memiliki catatan ekstrakurikuler'
      : 'Sebagian siswa belum memiliki catatan ekstrakurikuler',
    category: 'tambahan',
  });

  // 9. Rekap Absensi
  const isAttendanceComplete = activeStudents.every((s) => currentAttendance[s.id] !== undefined);
  items.push({
    id: 'attendance',
    label: 'Rekap Kehadiran (S/I/A)',
    isComplete: isAttendanceComplete,
    details: isAttendanceComplete
      ? 'Data absensi seluruh siswa tercatat'
      : 'Terdapat siswa yang data absensinya belum diinput',
    category: 'tambahan',
  });

  // 10. Catatan Guru Kelas
  const isNotesComplete = activeStudents.every((s) => Boolean(currentTeacherNotes[s.id]?.trim()));
  items.push({
    id: 'notes',
    label: 'Catatan Guru / Wali Kelas',
    isComplete: isNotesComplete,
    details: isNotesComplete
      ? 'Catatan perkembangan belajar seluruh siswa terisi'
      : 'Sebagian siswa belum memiliki catatan wali kelas',
    category: 'tambahan',
  });

  // 11. Status Naik Kelas / Lulus (Khusus Semester 2)
  if (semester === 2) {
    const isPromotionComplete = activeStudents.every((s) => Boolean(db.promotions[s.id]?.keterangan?.trim()));
    items.push({
      id: 'promotion',
      label: 'Status Keterangan Naik Kelas / Lulus',
      isComplete: isPromotionComplete,
      details: isPromotionComplete
        ? 'Status kenaikan/kelulusan seluruh siswa terisi'
        : 'Status kenaikan/kelulusan belum ditentukan untuk semua siswa',
      category: 'tambahan',
    });
  }

  // Per-student status calculation
  const studentCompleteness: Record<string, { isReady: boolean; missingItems: string[] }> = {};
  for (const student of activeStudents) {
    const missing: string[] = [];

    // Check subjects scores
    for (const sub of activeSubjects) {
      const rec = currentScores[student.id]?.[sub.id];
      if (!rec || rec.nilaiAkhir === null || rec.nilaiAkhir === undefined) {
        missing.push(`Nilai ${sub.nama}`);
      } else if (!rec.capaianKompetensi?.trim() || rec.capaianKompetensi.startsWith('Belum ada')) {
        missing.push(`Deskripsi ${sub.nama}`);
      }
    }

    if (!currentCocurricular?.capaianSiswa[student.id]?.trim()) {
      missing.push('Capaian Kokurikuler');
    }
    if (!(currentExtra[student.id] || []).length) {
      missing.push('Ekstrakurikuler');
    }
    if (currentAttendance[student.id] === undefined) {
      missing.push('Absensi');
    }
    if (!currentTeacherNotes[student.id]?.trim()) {
      missing.push('Catatan Wali Kelas');
    }
    if (semester === 2 && !db.promotions[student.id]?.keterangan?.trim()) {
      missing.push('Status Naik Kelas/Lulus');
    }

    studentCompleteness[student.id] = {
      isReady: missing.length === 0,
      missingItems: missing,
    };
  }

  const completedCount = items.filter((i) => i.isComplete).length;
  const totalCount = items.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  let overallStatus: 'Draft' | 'Lengkap' | 'Siap Cetak' = 'Draft';
  if (percent === 100) {
    overallStatus = 'Siap Cetak';
  } else if (percent >= 80) {
    overallStatus = 'Lengkap';
  }

  return {
    items,
    overallStatus,
    completedCount,
    totalCount,
    percent,
    studentCompleteness,
  };
}
