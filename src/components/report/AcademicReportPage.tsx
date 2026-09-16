import React from 'react';
import {
  Student,
  SchoolInfo,
  TeacherInfo,
  ClassInfo,
  ReportSettings,
  Subject,
  LingkupMateri,
  ScoresDatabase,
  CocurricularDatabase,
  ExtracurricularDatabase,
  AttendanceDatabase,
  TeacherNotesDatabase,
  PromotionDatabase,
} from '../../types';
import { formatScoreDisplay } from '../../utils/competencyGenerator';

interface AcademicReportPageProps {
  student: Student;
  school: SchoolInfo;
  teacher: TeacherInfo;
  classInfo: ClassInfo;
  reportSettings: ReportSettings;
  subjects: Subject[];
  learningScopes: LingkupMateri[];
  scores: ScoresDatabase;
  cocurricular: CocurricularDatabase;
  extracurricular: ExtracurricularDatabase;
  attendance: AttendanceDatabase;
  teacherNotes: TeacherNotesDatabase;
  promotions: PromotionDatabase;
  semester: 1 | 2;
  pageToShow?: 'all' | 'page1' | 'page2';
  tableFontSizeMode?: 'auto' | 'normal' | 'large';
}

export const AcademicReportPage: React.FC<AcademicReportPageProps> = ({
  student,
  school,
  teacher,
  classInfo,
  reportSettings,
  subjects,
  scores,
  cocurricular,
  extracurricular,
  attendance,
  teacherNotes,
  promotions,
  semester,
  pageToShow = 'all',
  tableFontSizeMode = 'auto',
}) => {
  const activeSubjects = subjects.filter((s) => s.isActive);
  const currentSemesterScores = scores[semester]?.[student.id] || {};
  const currentProject = cocurricular[semester];
  const studentCocurricularDesc = currentProject?.capaianSiswa?.[student.id];

  // Penyesuaian otomatis tipografi & spasi mengikuti kapasitas ukuran tabel intrakurikuler
  const subjectCount = activeSubjects.length;

  const autoTypography = (() => {
    if (tableFontSizeMode === 'large') {
      return {
        headerHeight: 'h-8',
        headerText: 'text-[12px]',
        noText: 'text-[12px] font-bold',
        subjectText: 'text-[12.5px] font-bold leading-snug',
        scoreText: 'text-[13.5px] font-black',
        descText: 'text-[12px] leading-relaxed',
        padding: 'py-2 px-3',
      };
    }
    if (tableFontSizeMode === 'normal') {
      return {
        headerHeight: 'h-7.5',
        headerText: 'text-[11.5px]',
        noText: 'text-[11.5px] font-bold',
        subjectText: 'text-[12px] font-bold leading-snug',
        scoreText: 'text-[12.5px] font-bold',
        descText: 'text-[11px] leading-normal',
        padding: 'py-1.5 px-2.5',
      };
    }
    // Otomatis (Auto) menyesuaikan proporsional dengan jumlah mata pelajaran & tinggi halaman
    if (subjectCount <= 6) {
      return {
        headerHeight: 'h-9',
        headerText: 'text-xs',
        noText: 'text-[13px] font-bold',
        subjectText: 'text-[13.5px] font-bold leading-normal',
        scoreText: 'text-[14px] font-black',
        descText: 'text-[12.5px] leading-relaxed',
        padding: 'py-2.5 px-3.5',
      };
    } else if (subjectCount <= 8) {
      return {
        headerHeight: 'h-8.5',
        headerText: 'text-[12px]',
        noText: 'text-[12.5px] font-bold',
        subjectText: 'text-[13px] font-bold leading-normal',
        scoreText: 'text-[13.5px] font-black',
        descText: 'text-[12px] leading-relaxed',
        padding: 'py-2 px-3',
      };
    } else if (subjectCount === 9) {
      return {
        headerHeight: 'h-8',
        headerText: 'text-[11.5px]',
        noText: 'text-[12px] font-bold',
        subjectText: 'text-[12.5px] font-bold leading-snug',
        scoreText: 'text-[13px] font-extrabold',
        descText: 'text-[11.5px] leading-relaxed',
        padding: 'py-2 px-3',
      };
    } else if (subjectCount === 10) {
      // Pas optimal untuk 10 mapel agar tulisan besar, jelas, hitam pekat, dan sangat mudah dibaca
      return {
        headerHeight: 'h-7.5',
        headerText: 'text-[11.5px]',
        noText: 'text-[11.5px] font-bold',
        subjectText: 'text-[12px] font-bold leading-snug',
        scoreText: 'text-[13px] font-extrabold',
        descText: 'text-[11px] leading-relaxed',
        padding: 'py-1.5 px-3',
      };
    } else {
      // 11 mapel atau lebih
      return {
        headerHeight: 'h-7',
        headerText: 'text-[11px]',
        noText: 'text-[11px] font-bold',
        subjectText: 'text-[11.5px] font-bold leading-tight',
        scoreText: 'text-[12px] font-bold',
        descText: 'text-[10.5px] leading-normal',
        padding: 'py-1 px-2.5',
      };
    }
  })();

  const getAdaptiveDescClass = (descText: string) => {
    if (!descText || descText === '-') return 'text-center text-black italic font-normal';
    if (tableFontSizeMode === 'auto') {
      // Deskripsi pendek mendapatkan ukuran huruf lebih besar dan lega
      if (descText.length < 100 && subjectCount <= 10) {
        return 'text-[12px] leading-relaxed text-black font-normal';
      }
      if (descText.length > 250 && subjectCount >= 10) {
        return 'text-[10.5px] leading-snug text-black font-normal';
      }
    }
    return `${autoTypography.descText} text-black font-normal`;
  };

  const studentExtras = extracurricular[semester]?.[student.id] || [];
  const studentAttendance = attendance[semester]?.[student.id] || {
    sakit: 0,
    izin: 0,
    alpa: 0,
  };
  const studentNote = teacherNotes[semester]?.[student.id] || '';

  const statusItem = promotions[student.id];
  const isKelas6 = classInfo.tingkat === 6;

  const formattedDate = new Date(reportSettings.tanggalRapor).toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  const renderPage1 = () => (
    <div
      className="report-page a4-page p-[1.25cm] bg-white text-black border border-black print:border-none shadow-md print:shadow-none min-h-[297mm] h-[297mm] w-[210mm] mx-auto box-border font-serif flex flex-col justify-between text-xs mb-8 print:mb-0"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Title Header */}
        <div className="text-center pb-2 border-b-2 border-black shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black">
            LAPORAN HASIL BELAJAR (RAPOR)
          </h2>
        </div>

        {/* Student & Class Identity Top Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-sans text-[11px] py-2 border-b border-black shrink-0 text-black">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 text-black font-medium">Nama Peserta Didik</span>
              <span className="w-3 text-center">:</span>
              <span className="font-bold uppercase text-black">{student.namaLengkap}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-black font-medium">NISN / NIS</span>
              <span className="w-3 text-center">:</span>
              <span className="font-mono text-black">{student.nisn} / {student.nis}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-black font-medium">Nama Sekolah</span>
              <span className="w-3 text-center">:</span>
              <span className="font-bold text-black">{school.namaSekolah}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-black font-medium">Alamat Sekolah</span>
              <span className="w-3 text-center">:</span>
              <span className="truncate text-black">{school.alamat}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex">
              <span className="w-28 text-black font-medium">Kelas</span>
              <span className="w-3 text-center">:</span>
              <span className="font-bold text-black">{classInfo.namaKelas}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-black font-medium">Fase</span>
              <span className="w-3 text-center">:</span>
              <span className="text-black">{classInfo.fase}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-black font-medium">Semester</span>
              <span className="w-3 text-center">:</span>
              <span className="font-bold text-black">{semester} ({semester === 1 ? 'Ganjil' : 'Genap'})</span>
            </div>
            <div className="flex">
              <span className="w-28 text-black font-medium">Tahun Ajaran</span>
              <span className="w-3 text-center">:</span>
              <span className="text-black">{classInfo.tahunAjaran}</span>
            </div>
          </div>
        </div>

        {/* Section A: Nilai Intrakurikuler - Pas hingga batas margin bawah */}
        <div className="flex-1 flex flex-col min-h-0 pt-2 font-sans">
          <h3 className="font-bold text-xs text-black uppercase font-serif pb-1.5 shrink-0">
            A. Nilai Pembelajaran Intrakurikuler
          </h3>
          <div className="flex-1 flex flex-col min-h-0">
            <table className="report-table-thin w-full h-full text-left border-collapse border-[0.75px] border-black table-fixed">
              <thead>
                <tr className={`bg-slate-100 text-black text-center font-bold shrink-0 ${autoTypography.headerHeight} ${autoTypography.headerText}`}>
                  <th className="border-[0.75px] border-black py-1 px-1.5 w-9 align-middle text-black font-bold">No</th>
                  <th className="border-[0.75px] border-black py-1 px-3 w-48 text-left align-middle text-black font-bold">Muatan Pelajaran</th>
                  <th className="border-[0.75px] border-black py-1 px-1.5 w-16 text-center align-middle text-black font-bold">Nilai Akhir</th>
                  <th className="border-[0.75px] border-black py-1 px-3 text-center align-middle text-black font-bold">Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody>
                {activeSubjects.map((sub, idx) => {
                  const subScore = currentSemesterScores[sub.id];
                  const na = subScore?.nilaiAkhir ?? null;
                  const desc = subScore?.capaianKompetensi || '-';

                  return (
                    <tr key={sub.id}>
                      <td className={`border-[0.75px] border-black ${autoTypography.padding} text-center align-middle font-bold font-mono text-black ${autoTypography.noText}`}>
                        {idx + 1}
                      </td>
                      <td className={`border-[0.75px] border-black ${autoTypography.padding} align-middle text-black ${autoTypography.subjectText}`}>
                        {sub.nama}
                      </td>
                      <td className={`border-[0.75px] border-black ${autoTypography.padding} text-center align-middle font-mono text-black ${autoTypography.scoreText}`}>
                        {na !== null ? formatScoreDisplay(na, reportSettings.formatNilai || 'desimal_2') : '-'}
                      </td>
                      <td
                        className={`border-[0.75px] border-black ${autoTypography.padding} align-middle text-justify text-black ${getAdaptiveDescClass(desc)}`}
                        style={{ color: '#000000' }}
                      >
                        {desc}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Page 1 */}
      <div className="pt-2 mt-1 border-t border-black font-sans text-[10px] text-black flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2 font-medium text-black">
          <span className="font-bold text-black">{school.namaSekolah}</span>
          <span className="text-black">|</span>
          <span className="text-black">{classInfo.namaKelas}</span>
          <span className="text-black">|</span>
          <span className="font-semibold uppercase text-black">{student.namaLengkap}</span>
        </div>
        <span className="font-medium text-black">Halaman 1 dari 2</span>
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div
      className="report-page a4-page p-[1.25cm] bg-white text-black border border-black print:border-none shadow-md print:shadow-none min-h-[297mm] h-[297mm] w-[210mm] mx-auto box-border font-serif flex flex-col justify-between text-xs"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="space-y-2.5 flex-1 flex flex-col text-black">
        {/* Section B: Kokurikuler (Jika ada tema) */}
        {currentProject?.tema && (
          <div className="space-y-1 font-sans text-black">
            <h3 className="font-bold text-xs text-black uppercase font-serif">
              B. Kokurikuler (Projek Penguatan Profil Pelajar Pancasila)
            </h3>
            <div className="border-[0.75px] border-black p-2 rounded-xs text-[11px] space-y-0.5 bg-slate-50/40 text-black">
              <div className="font-bold text-black">
                Tema: <span className="font-normal text-black">{currentProject.tema}</span>
              </div>
              <div className="text-[10px] text-black leading-relaxed text-justify">
                <span className="font-semibold text-black">Deskripsi Capaian: </span>
                {studentCocurricularDesc ||
                  'Ananda aktif berpartisipasi dan menunjukkan perkembangan karakter profil pelajar Pancasila dengan sangat baik.'}
              </div>
            </div>
          </div>
        )}

        {/* Two-column layout for Ekskul & Kehadiran */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-sans text-[11px] text-black">
          {/* Section C: Ekstrakurikuler (Predikat: Cukup, Baik, Sangat Baik) */}
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-black uppercase font-serif">
              C. Ekstrakurikuler
            </h3>
            <table className="report-table-thin w-full text-left border-collapse border-[0.75px] border-black text-[10.5px]">
              <thead>
                <tr className="bg-slate-100 text-center font-bold text-black">
                  <th className="border-[0.75px] border-black py-1 px-1.5 w-8 text-black font-bold">No</th>
                  <th className="border-[0.75px] border-black py-1 px-2 w-32 text-left text-black font-bold">Kegiatan</th>
                  <th className="border-[0.75px] border-black py-1 px-2 text-center text-black font-bold">Keterangan / Predikat</th>
                </tr>
              </thead>
              <tbody>
                {studentExtras.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="border-[0.75px] border-black py-2 text-center text-black italic">
                      -
                    </td>
                  </tr>
                ) : (
                  studentExtras.map((ex, exIdx) => (
                    <tr key={ex.ekskulId}>
                      <td className="border-[0.75px] border-black py-1 px-1.5 text-center text-black">{exIdx + 1}</td>
                      <td className="border-[0.75px] border-black py-1 px-2 font-medium text-black">{ex.namaEkskul}</td>
                      <td className="border-[0.75px] border-black py-1 px-2 text-center font-semibold text-black">
                        {ex.keterangan || 'Baik'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section D: Ketidakhadiran */}
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-black uppercase font-serif">
              D. Ketidakhadiran
            </h3>
            <table className="report-table-thin w-full border-collapse border-[0.75px] border-black text-[10.5px]">
              <tbody>
                <tr>
                  <td className="border-[0.75px] border-black py-1 px-3 w-36 font-medium text-black">Sakit</td>
                  <td className="border-[0.75px] border-black py-1 px-3 text-center font-bold font-mono text-black">
                    {studentAttendance.sakit || 0} hari
                  </td>
                </tr>
                <tr>
                  <td className="border-[0.75px] border-black py-1 px-3 font-medium text-black">Izin</td>
                  <td className="border-[0.75px] border-black py-1 px-3 text-center font-bold font-mono text-black">
                    {studentAttendance.izin || 0} hari
                  </td>
                </tr>
                <tr>
                  <td className="border-[0.75px] border-black py-1 px-3 font-medium text-black">Tanpa Keterangan</td>
                  <td className="border-[0.75px] border-black py-1 px-3 text-center font-bold font-mono text-black">
                    {studentAttendance.alpa || 0} hari
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section E: Catatan Wali Kelas */}
        <div className="space-y-1 font-sans text-black">
          <h3 className="font-bold text-xs text-black uppercase font-serif">
            E. Catatan Wali Kelas
          </h3>
          <div className="border-[0.75px] border-black p-2 rounded-xs text-[10.5px] italic text-black leading-relaxed min-h-[40px] bg-slate-50/30">
            {studentNote ||
              'Pertahankan prestasimu, tingkatkan terus semangat belajar, dan selalu bersikap santun kepada sesama.'}
          </div>
        </div>

        {/* Section F: Status Kenaikan Kelas / Keputusan Akhir Tahun (HANYA PADA SEMESTER 2) */}
        {semester === 2 && (
          <div className="space-y-1 font-sans text-black">
            <h3 className="font-bold text-xs text-black uppercase font-serif">
              F. Keputusan Akhir Tahun
            </h3>
            <div className="border-[0.75px] border-black p-2 rounded-xs text-[10.5px] text-black bg-slate-50/40 leading-relaxed">
              <div className="text-black">
                Berdasarkan pencapaian seluruh kompetensi, peserta didik dinyatakan:
              </div>
              <div className="font-bold text-black text-[11px] mt-0.5 pl-3">
                <span className="underline decoration-black underline-offset-2">
                  {statusItem?.keterangan ||
                    (isKelas6
                      ? 'Dinyatakan Lulus dari Satuan Pendidikan SD'
                      : `Naik ke Kelas ${['', 'II', 'III', 'IV', 'V', 'VI', 'Lanjutan'][classInfo.tingkat] || ''}`)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section G/F: Tanggapan Orang Tua / Wali Murid */}
        <div className="space-y-1 font-sans text-black">
          <h3 className="font-bold text-xs text-black uppercase font-serif">
            {semester === 2 ? 'G. Tanggapan Orang Tua / Wali Murid' : 'F. Tanggapan Orang Tua / Wali Murid'}
          </h3>
          <div className="border-[0.75px] border-black p-2.5 rounded-xs min-h-[70px] bg-slate-50/10">
            <div className="space-y-2.5 pt-0.5">
              <div className="border-b border-dotted border-black h-1.5"></div>
              <div className="border-b border-dotted border-black h-1.5"></div>
              <div className="border-b border-dotted border-black h-1.5"></div>
              <div className="border-b border-dotted border-black h-1.5"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Titimangsa & Tanda Tangan 3 Pihak */}
      <div className="pt-2 mt-1 border-t border-black font-sans text-xs shrink-0 text-black">
        {/* Top date */}
        <div className="text-right pb-1 text-black">
          <p>
            {reportSettings.tempatRapor}, {formattedDate}
          </p>
        </div>

        {/* Signature Triad */}
        <div className="grid grid-cols-3 gap-3 text-center text-[11px] mb-1 text-black">
          {/* Orang Tua / Wali */}
          <div className="flex flex-col justify-between min-h-[96px]">
            <p className="font-medium text-[10.5px] text-black">Orang Tua / Wali Peserta Didik,</p>
            <div className="h-14 flex items-center justify-center"></div>
            <div>
              <p className="border-b border-black w-40 mx-auto"></p>
              <p className="text-[10px] text-black mt-0.5">(.................................................)</p>
            </div>
          </div>

          {/* Guru Kelas / Wali Kelas */}
          <div className="flex flex-col justify-between min-h-[96px]">
            <p className="font-medium text-[10.5px] text-black">Guru Kelas / Wali Kelas,</p>
            <div className="h-14 flex items-center justify-center">
              {reportSettings.modeTandaTangan === 'gambar' && teacher.tandaTanganGuru ? (
                <img
                  src={teacher.tandaTanganGuru}
                  alt="TTD Guru"
                  className="max-h-full max-w-[130px] object-contain"
                />
              ) : null}
            </div>
            <div>
              <p className="font-bold underline text-black uppercase">{teacher.namaGuru}</p>
              <p className="font-mono text-[10px] text-black">NIP. {teacher.nip}</p>
            </div>
          </div>

          {/* Mengetahui Kepala Sekolah */}
          <div className="flex flex-col justify-between min-h-[96px]">
            <p className="font-medium text-[10.5px] text-black">Mengetahui,<br />Kepala Sekolah,</p>
            <div className="h-14 flex items-center justify-center">
              {reportSettings.modeTandaTangan === 'gambar' && school.tandaTanganKepsek ? (
                <img
                  src={school.tandaTanganKepsek}
                  alt="TTD Kepsek"
                  className="max-h-full max-w-[130px] object-contain"
                />
              ) : null}
            </div>
            <div>
              <p className="font-bold underline text-black uppercase">
                {school.namaKepalaSekolah}
              </p>
              <p className="font-mono text-[10px] text-black">NIP. {school.nipKepalaSekolah}</p>
            </div>
          </div>
        </div>

        {/* 80 Spasi Kosong di Bawah Tanda Tangan */}
        <div className="h-[80px] min-h-[80px] select-none flex flex-col justify-between py-1" aria-hidden="true">
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="text-[6px] leading-[1px] text-transparent select-none">
              &nbsp;
            </div>
          ))}
        </div>
      </div>

      {/* Footer Page 2 */}
      <div className="pt-2 border-t border-black font-sans text-[10px] text-black flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2 font-medium text-black">
          <span className="font-bold text-black">{school.namaSekolah}</span>
          <span className="text-black">|</span>
          <span className="text-black">{classInfo.namaKelas}</span>
          <span className="text-black">|</span>
          <span className="font-semibold uppercase text-black">{student.namaLengkap}</span>
        </div>
        <span className="font-medium text-black">Halaman 2 dari 2</span>
      </div>
    </div>
  );

  return (
    <>
      {(pageToShow === 'all' || pageToShow === 'page1') && renderPage1()}
      {(pageToShow === 'all' || pageToShow === 'page2') && renderPage2()}
    </>
  );
};
