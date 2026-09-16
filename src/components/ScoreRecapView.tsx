import React, { useState, useMemo, useRef } from 'react';
import {
  Student,
  Subject,
  ScoresDatabase,
  SchoolInfo,
  TeacherInfo,
  ClassInfo,
  ReportSettings,
} from '../types';
import { formatScoreDisplay, roundScoreValue } from '../utils/competencyGenerator';
import { exportLegerToExcel, LegerExportStudentRow } from '../utils/excelHelper';
import { LegerDocumentModal } from './report/LegerDocumentModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import {
  Trophy,
  FileSpreadsheet,
  Printer,
  Search,
  ArrowUpDown,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  FileText,
} from 'lucide-react';

interface ScoreRecapViewProps {
  students: Student[];
  subjects: Subject[];
  scores: ScoresDatabase;
  semester: 1 | 2;
  school: SchoolInfo;
  teacher: TeacherInfo;
  classInfo: ClassInfo;
  reportSettings: ReportSettings;
}

type SortBy = 'no_urut' | 'ranking' | 'total_nilai' | 'nama';

export const ScoreRecapView: React.FC<ScoreRecapViewProps> = ({
  students,
  subjects,
  scores,
  semester,
  school,
  teacher,
  classInfo,
  reportSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('no_urut');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const activeStudents = useMemo(
    () => students.filter((s) => s.status === 'Aktif'),
    [students]
  );
  const activeSubjects = useMemo(
    () => subjects.filter((s) => s.isActive),
    [subjects]
  );

  const currentFormat = reportSettings.formatNilai || 'desimal_2';

  // 1. Calculate raw student scores and totals
  const studentRecords = useMemo(() => {
    const records = activeStudents.map((student) => {
      const studentSemesterScores = scores[semester]?.[student.id] || {};
      const scoresBySubject: Record<string, number | null> = {};
      let total = 0;
      let validCount = 0;

      activeSubjects.forEach((sub) => {
        const na = studentSemesterScores[sub.id]?.nilaiAkhir;
        if (na !== null && na !== undefined && !isNaN(na)) {
          scoresBySubject[sub.id] = na;
          total += na;
          validCount += 1;
        } else {
          scoresBySubject[sub.id] = null;
        }
      });

      const average = validCount > 0 ? total / validCount : 0;
      const roundedTotal = roundScoreValue(total, currentFormat);
      const roundedAverage = roundScoreValue(average, currentFormat);

      return {
        student,
        scoresBySubject,
        totalScore: roundedTotal,
        averageScore: roundedAverage,
        validSubjectCount: validCount,
      };
    });

    // Sort by total score descending to assign competition rankings
    const sortedForRank = [...records].sort((a, b) => b.totalScore - a.totalScore);

    // Assign standard competition ranking (1, 2, 2, 4...)
    let currentRank = 1;
    const rankedRecords = sortedForRank.map((rec, index) => {
      if (index > 0 && rec.totalScore < sortedForRank[index - 1].totalScore) {
        currentRank = index + 1;
      }
      return {
        ...rec,
        rank: rec.totalScore > 0 ? currentRank : sortedForRank.length,
      };
    });

    return rankedRecords;
  }, [activeStudents, activeSubjects, scores, semester, currentFormat]);

  // 2. Class Statistics
  const classStats = useMemo(() => {
    const subjectAverages: Record<string, number> = {};
    const subjectHighest: Record<string, number> = {};
    const subjectLowest: Record<string, number> = {};
    const subjectPassCount: Record<string, number> = {};

    activeSubjects.forEach((sub) => {
      const validScores = studentRecords
        .map((r) => r.scoresBySubject[sub.id])
        .filter((s): s is number => s !== null && s !== undefined);

      if (validScores.length > 0) {
        const sum = validScores.reduce((acc, curr) => acc + curr, 0);
        subjectAverages[sub.id] = roundScoreValue(sum / validScores.length, currentFormat);
        subjectHighest[sub.id] = Math.max(...validScores);
        subjectLowest[sub.id] = Math.min(...validScores);
        subjectPassCount[sub.id] = validScores.filter((s) => s >= sub.kktp).length;
      } else {
        subjectAverages[sub.id] = 0;
        subjectHighest[sub.id] = 0;
        subjectLowest[sub.id] = 0;
        subjectPassCount[sub.id] = 0;
      }
    });

    const allTotals = studentRecords.map((r) => r.totalScore).filter((t) => t > 0);
    const highestTotal = allTotals.length > 0 ? Math.max(...allTotals) : 0;
    const lowestTotal = allTotals.length > 0 ? Math.min(...allTotals) : 0;

    const allAverages = studentRecords.map((r) => r.averageScore).filter((a) => a > 0);
    const totalAverage =
      allAverages.length > 0
        ? roundScoreValue(allAverages.reduce((a, b) => a + b, 0) / allAverages.length, currentFormat)
        : 0;

    const rank1Student = studentRecords.find((r) => r.rank === 1 && r.totalScore > 0);

    return {
      subjectAverages,
      subjectHighest,
      subjectLowest,
      subjectPassCount,
      totalAverage,
      highestTotal,
      lowestTotal,
      rank1Student,
    };
  }, [activeSubjects, studentRecords, currentFormat]);

  // 3. Filtered & Sorted student records for display
  const displayedRecords = useMemo(() => {
    let filtered = studentRecords.filter((rec) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        rec.student.namaLengkap.toLowerCase().includes(query) ||
        rec.student.nis.toLowerCase().includes(query) ||
        rec.student.nisn.toLowerCase().includes(query)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'no_urut') {
        return (a.student.noUrut || 0) - (b.student.noUrut || 0);
      }
      if (sortBy === 'ranking') {
        return a.rank - b.rank;
      }
      if (sortBy === 'total_nilai') {
        return b.totalScore - a.totalScore;
      }
      if (sortBy === 'nama') {
        return a.student.namaLengkap.localeCompare(b.student.namaLengkap);
      }
      return 0;
    });
  }, [studentRecords, searchQuery, sortBy]);

  // Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const exportRows: LegerExportStudentRow[] = studentRecords.map((r) => ({
      noUrut: r.student.noUrut,
      nis: r.student.nis,
      nisn: r.student.nisn,
      namaLengkap: r.student.namaLengkap,
      jenisKelamin: r.student.jenisKelamin,
      subjectScores: r.scoresBySubject,
      totalNilaiAkhir: r.totalScore,
      rataRataNilaiAkhir: r.averageScore,
      ranking: r.rank,
    }));

    exportLegerToExcel({
      school,
      classInfo,
      teacher,
      reportSettings,
      subjects: activeSubjects,
      studentRows: exportRows,
      semester,
      stats: {
        subjectAverages: classStats.subjectAverages,
        totalAverage: classStats.totalAverage,
        highestTotal: classStats.highestTotal,
        lowestTotal: classStats.lowestTotal,
      },
    });
  };

  const formattedDate = reportSettings.tanggalRapor
    ? new Date(reportSettings.tanggalRapor).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <div className="space-y-6">
      {/* Header & Controls (Screen only) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span>Rekapitulasi Nilai Siswa (Leger Nilai)</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    Semester {semester === 1 ? '1 (Ganjil)' : '2 (Genap)'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar seluruh Nilai Akhir mata pelajaran, jumlah total nilai, rata-rata, dan peringkat kelas{' '}
                  <strong className="text-slate-700">{classInfo.namaKelas}</strong> TP {classInfo.tahunAjaran}.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              id="btn-export-leger-excel"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Unduh Rekap Nilai ke format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              id="btn-print-leger"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Cetak & Download Dokumen Leger Nilai Resmi (Format Lanskap)"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Leger</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau NIS siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-medium text-slate-500 flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Urutkan:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="no_urut">No. Urut (Presensi Siswa)</option>
              <option value="ranking">Ranking Tertinggi (Peringkat 1 s.d. Terakhir)</option>
              <option value="total_nilai">Jumlah Nilai Terbanyak</option>
              <option value="nama">Nama Siswa (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Bento Cards (Screen only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Card 1: Total Siswa */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Jumlah Siswa Aktif</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-slate-900">{activeStudents.length}</span>
              <span className="text-[11px] text-slate-500">
                (L: {activeStudents.filter((s) => s.jenisKelamin === 'L').length}, P:{' '}
                {activeStudents.filter((s) => s.jenisKelamin === 'P').length})
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Rata-Rata Nilai Kelas */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rata-Rata Nilai Kelas</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold text-slate-900">
                {formatScoreDisplay(classStats.totalAverage, currentFormat)}
              </span>
              <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Skala 100
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Peringkat 1 Kelas */}
        <div className="p-4 bg-white rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-amber-800 flex items-center space-x-1">
              <span>Peringkat 1 (Juara Kelas)</span>
            </p>
            {classStats.rank1Student ? (
              <div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {classStats.rank1Student.student.namaLengkap}
                </p>
                <p className="text-[11px] text-slate-600">
                  Total: <strong>{formatScoreDisplay(classStats.rank1Student.totalScore, currentFormat)}</strong> (Rata-rata:{' '}
                  {formatScoreDisplay(classStats.rank1Student.averageScore, currentFormat)})
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada nilai</p>
            )}
          </div>
        </div>

        {/* Card 4: Rentang Nilai */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Mata Pelajaran Aktif</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-slate-900">{activeSubjects.length}</span>
              <span className="text-[11px] text-slate-500">Mapel Intrakurikuler</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table for Screen Display */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center space-x-2">
            <span>Matriks Rekapitulasi Nilai Akhir & Peringkat</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-normal normal-case">
              Menampilkan {displayedRecords.length} siswa
            </span>
          </h3>
          <span className="text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-mono">
            Format: {currentFormat === 'desimal_2' ? '2 Angka Desimal' : 'Bilangan Bulat'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold text-[11px]">
                <th className="py-2.5 px-2.5 text-center w-12 border-r border-slate-200">No</th>
                <th className="py-2.5 px-3 w-28 border-r border-slate-200">NIS / NISN</th>
                <th className="py-2.5 px-4 min-w-[200px] border-r border-slate-200">Nama Siswa</th>
                <th className="py-2.5 px-2 text-center w-10 border-r border-slate-200">L/P</th>

                {/* Subject Headers */}
                {activeSubjects.map((sub) => (
                  <th
                    key={sub.id}
                    className="py-2 px-2 text-center min-w-[72px] border-r border-slate-200 font-medium"
                    title={`${sub.nama} (KKTP: ${sub.kktp})`}
                  >
                    <div className="font-bold text-slate-900 truncate max-w-[90px] mx-auto">
                      {sub.nama.length > 12 ? sub.nama.slice(0, 10) + '..' : sub.nama}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">KKTP: {sub.kktp}</div>
                  </th>
                ))}

                {/* Summary Headers */}
                <th className="py-2.5 px-3 text-center min-w-[100px] bg-blue-50/70 border-r border-slate-200 font-bold text-blue-950">
                  <div>Jumlah Nilai</div>
                  <div className="text-[10px] text-blue-700 font-normal font-mono">(Σ NA)</div>
                </th>
                <th className="py-2.5 px-3 text-center min-w-[90px] bg-emerald-50/70 border-r border-slate-200 font-bold text-emerald-950">
                  <div>Rata-Rata</div>
                  <div className="text-[10px] text-emerald-700 font-normal font-mono">(Rerata NA)</div>
                </th>
                <th className="py-2.5 px-3 text-center min-w-[90px] bg-amber-50/70 font-bold text-amber-950">
                  <div>Ranking</div>
                  <div className="text-[10px] text-amber-700 font-normal font-mono">(Peringkat)</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeSubjects.length + 7}
                    className="py-8 text-center text-slate-400 italic text-xs"
                  >
                    Tidak ditemukan data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                displayedRecords.map((rec) => {
                  const isTop1 = rec.rank === 1 && rec.totalScore > 0;
                  const isTop2 = rec.rank === 2 && rec.totalScore > 0;
                  const isTop3 = rec.rank === 3 && rec.totalScore > 0;

                  return (
                    <tr
                      key={rec.student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop1 ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2 px-2 text-center font-mono font-semibold text-slate-700 border-r border-slate-200">
                        {rec.student.noUrut}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px] border-r border-slate-200">
                        <div>{rec.student.nis}</div>
                        <div className="text-[10px] text-slate-400">{rec.student.nisn}</div>
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200">
                        <button
                          onClick={() => setSelectedStudentForDetail(rec.student)}
                          className="font-medium text-slate-900 hover:text-blue-600 text-left cursor-pointer transition-colors block"
                        >
                          {rec.student.namaLengkap}
                        </button>
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] text-slate-600">
                        {rec.student.jenisKelamin}
                      </td>

                      {/* Subject Scores */}
                      {activeSubjects.map((sub) => {
                        const score = rec.scoresBySubject[sub.id];
                        const isUnderKktp = score !== null && score < sub.kktp;
                        return (
                          <td
                            key={sub.id}
                            className={`py-2 px-2 text-center font-mono text-[11.5px] border-r border-slate-200 ${
                              isUnderKktp
                                ? 'text-rose-600 font-bold bg-rose-50/50'
                                : score !== null
                                ? 'text-slate-800'
                                : 'text-slate-300'
                            }`}
                          >
                            {score !== null ? formatScoreDisplay(score, currentFormat) : '-'}
                          </td>
                        );
                      })}

                      {/* Total Score */}
                      <td className="py-2 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/40 border-r border-slate-200">
                        {rec.totalScore > 0 ? formatScoreDisplay(rec.totalScore, currentFormat) : '-'}
                      </td>

                      {/* Average Score */}
                      <td className="py-2 px-3 text-center font-mono font-bold text-emerald-900 bg-emerald-50/40 border-r border-slate-200">
                        {rec.averageScore > 0
                          ? formatScoreDisplay(rec.averageScore, currentFormat)
                          : '-'}
                      </td>

                      {/* Ranking Badge */}
                      <td className="py-2 px-3 text-center bg-amber-50/40">
                        {rec.totalScore > 0 ? (
                          <div className="inline-flex items-center justify-center">
                            {isTop1 && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950 shadow-xs">
                                <Trophy className="w-3 h-3 text-amber-950" />
                                <span>1</span>
                              </span>
                            )}
                            {isTop2 && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-300 text-slate-900 shadow-xs">
                                <Award className="w-3 h-3 text-slate-800" />
                                <span>2</span>
                              </span>
                            )}
                            {isTop3 && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 shadow-xs">
                                <Award className="w-3 h-3 text-amber-800" />
                                <span>3</span>
                              </span>
                            )}
                            {!isTop1 && !isTop2 && !isTop3 && (
                              <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-100 text-slate-700">
                                {rec.rank}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Bottom Statistics Footer */}
            <tfoot className="bg-slate-100 text-slate-800 font-bold text-[11px] border-t-2 border-slate-300">
              {/* Row 1: Rata-Rata Kelas */}
              <tr className="border-b border-slate-200">
                <td colSpan={4} className="py-2.5 px-4 text-right border-r border-slate-200 text-slate-700">
                  RATA-RATA KELAS:
                </td>
                {activeSubjects.map((sub) => (
                  <td
                    key={sub.id}
                    className="py-2 px-2 text-center font-mono text-emerald-800 border-r border-slate-200"
                  >
                    {formatScoreDisplay(classStats.subjectAverages[sub.id], currentFormat)}
                  </td>
                ))}
                <td className="py-2 px-3 text-center font-mono text-blue-900 bg-blue-100/60 border-r border-slate-200">
                  -
                </td>
                <td className="py-2 px-3 text-center font-mono text-emerald-950 bg-emerald-100/60 border-r border-slate-200">
                  {formatScoreDisplay(classStats.totalAverage, currentFormat)}
                </td>
                <td className="py-2 px-3 text-center text-slate-400 bg-amber-100/40">-</td>
              </tr>

              {/* Row 2: Nilai Tertinggi */}
              <tr className="border-b border-slate-200">
                <td colSpan={4} className="py-2 px-4 text-right border-r border-slate-200 text-slate-700">
                  NILAI TERTINGGI (MAKS):
                </td>
                {activeSubjects.map((sub) => (
                  <td
                    key={sub.id}
                    className="py-2 px-2 text-center font-mono text-blue-800 border-r border-slate-200"
                  >
                    {formatScoreDisplay(classStats.subjectHighest[sub.id], currentFormat)}
                  </td>
                ))}
                <td className="py-2 px-3 text-center font-mono text-blue-900 bg-blue-100/60 border-r border-slate-200">
                  {formatScoreDisplay(classStats.highestTotal, currentFormat)}
                </td>
                <td className="py-2 px-3 text-center text-slate-400 bg-emerald-100/60 border-r border-slate-200">
                  -
                </td>
                <td className="py-2 px-3 text-center text-slate-400 bg-amber-100/40">-</td>
              </tr>

              {/* Row 3: Nilai Terendah */}
              <tr>
                <td colSpan={4} className="py-2 px-4 text-right border-r border-slate-200 text-slate-700">
                  NILAI TERENDAH (MIN):
                </td>
                {activeSubjects.map((sub) => (
                  <td
                    key={sub.id}
                    className="py-2 px-2 text-center font-mono text-slate-700 border-r border-slate-200"
                  >
                    {formatScoreDisplay(classStats.subjectLowest[sub.id], currentFormat)}
                  </td>
                ))}
                <td className="py-2 px-3 text-center font-mono text-blue-900 bg-blue-100/60 border-r border-slate-200">
                  {formatScoreDisplay(classStats.lowestTotal, currentFormat)}
                </td>
                <td className="py-2 px-3 text-center text-slate-400 bg-emerald-100/60 border-r border-slate-200">
                  -
                </td>
                <td className="py-2 px-3 text-center text-slate-400 bg-amber-100/40">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* PRINT-ONLY SECTION (Formatted for Landscape Print) */}
      <div className="hidden print:block font-serif text-black p-4">
        {/* Kop Judul Leger */}
        <div className="text-center border-b-2 border-black pb-3 mb-3">
          <h1 className="text-base font-bold uppercase tracking-wider">
            REKAPITULASI HASIL BELAJAR SISWA (LEGER NILAI)
          </h1>
          <h2 className="text-sm font-bold uppercase">{school.namaSekolah}</h2>
          <div className="text-xs flex justify-center space-x-4 mt-1 font-sans">
            <span>Kelas: <strong>{classInfo.namaKelas}</strong></span>
            <span>•</span>
            <span>Fase: <strong>{classInfo.fase}</strong></span>
            <span>•</span>
            <span>Semester: <strong>{semester === 1 ? '1 (Ganjil)' : '2 (Genap)'}</strong></span>
            <span>•</span>
            <span>Tahun Ajaran: <strong>{classInfo.tahunAjaran}</strong></span>
          </div>
        </div>

        {/* Print Table */}
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-slate-200 text-center font-bold">
              <th className="border border-black py-1 px-1 w-7">No</th>
              <th className="border border-black py-1 px-1.5 w-16">NIS</th>
              <th className="border border-black py-1 px-2 text-left w-48">Nama Siswa</th>
              <th className="border border-black py-1 px-1 w-6">L/P</th>

              {activeSubjects.map((sub) => (
                <th key={sub.id} className="border border-black py-1 px-1">
                  <div>{sub.nama}</div>
                  <div className="text-[8px] font-normal">KKTP: {sub.kktp}</div>
                </th>
              ))}

              <th className="border border-black py-1 px-1.5 w-16">Jumlah Nilai</th>
              <th className="border border-black py-1 px-1.5 w-14">Rata-Rata</th>
              <th className="border border-black py-1 px-1 w-12">Ranking</th>
            </tr>
          </thead>
          <tbody>
            {studentRecords
              .sort((a, b) => (a.student.noUrut || 0) - (b.student.noUrut || 0))
              .map((rec, idx) => (
                <tr key={rec.student.id} className="border-b border-black">
                  <td className="border border-black py-0.5 px-1 text-center font-mono">
                    {rec.student.noUrut || idx + 1}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center font-mono">
                    {rec.student.nis}
                  </td>
                  <td className="border border-black py-0.5 px-2 font-medium">
                    {rec.student.namaLengkap}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center">
                    {rec.student.jenisKelamin}
                  </td>

                  {activeSubjects.map((sub) => {
                    const s = rec.scoresBySubject[sub.id];
                    return (
                      <td key={sub.id} className="border border-black py-0.5 px-1 text-center font-mono">
                        {s !== null ? formatScoreDisplay(s, currentFormat) : '-'}
                      </td>
                    );
                  })}

                  <td className="border border-black py-0.5 px-1 text-center font-mono font-bold">
                    {rec.totalScore > 0 ? formatScoreDisplay(rec.totalScore, currentFormat) : '-'}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center font-mono font-bold">
                    {rec.averageScore > 0 ? formatScoreDisplay(rec.averageScore, currentFormat) : '-'}
                  </td>
                  <td className="border border-black py-0.5 px-1 text-center font-mono font-bold">
                    {rec.totalScore > 0 ? rec.rank : '-'}
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot className="font-bold bg-slate-100 text-[9.5px]">
            <tr>
              <td colSpan={4} className="border border-black py-1 px-2 text-right">
                RATA-RATA KELAS:
              </td>
              {activeSubjects.map((sub) => (
                <td key={sub.id} className="border border-black py-1 px-1 text-center font-mono">
                  {formatScoreDisplay(classStats.subjectAverages[sub.id], currentFormat)}
                </td>
              ))}
              <td className="border border-black py-1 px-1 text-center font-mono">-</td>
              <td className="border border-black py-1 px-1 text-center font-mono">
                {formatScoreDisplay(classStats.totalAverage, currentFormat)}
              </td>
              <td className="border border-black py-1 px-1 text-center font-mono">-</td>
            </tr>
          </tfoot>
        </table>

        {/* Titimangsa & Tanda Tangan */}
        <div className="mt-6 flex justify-between items-start text-xs font-serif break-inside-avoid">
          {/* Kepala Sekolah */}
          <div className="text-center w-64">
            <p>Mengetahui,</p>
            <p>Kepala Sekolah {school.namaSekolah}</p>
            <div className="h-16 flex items-center justify-center">
              {reportSettings.modeTandaTangan === 'gambar' && school.tandaTanganKepsek ? (
                <img
                  src={school.tandaTanganKepsek}
                  alt="TTD Kepsek"
                  className="max-h-full max-w-[120px] object-contain"
                />
              ) : null}
            </div>
            <p className="font-bold underline uppercase">{school.namaKepalaSekolah}</p>
            <p className="font-mono text-[11px]">NIP. {school.nipKepalaSekolah || '-'}</p>
          </div>

          {/* Guru Kelas */}
          <div className="text-center w-64">
            <p>
              {reportSettings.tempatRapor || 'Ditetapkan di Sekolah'}, {formattedDate}
            </p>
            <p>Guru Kelas / Wali Kelas</p>
            <div className="h-16 flex items-center justify-center">
              {reportSettings.modeTandaTangan === 'gambar' && teacher.tandaTanganGuru ? (
                <img
                  src={teacher.tandaTanganGuru}
                  alt="TTD Guru"
                  className="max-h-full max-w-[120px] object-contain"
                />
              ) : null}
            </div>
            <p className="font-bold underline uppercase">{teacher.namaGuru}</p>
            <p className="font-mono text-[11px]">NIP. {teacher.nip || '-'}</p>
          </div>
        </div>
      </div>

      {/* Modal Detail Nilai Siswa (Saat nama siswa diklik) */}
      {selectedStudentForDetail && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
          onClick={() => setSelectedStudentForDetail(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedStudentForDetail.namaLengkap}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  NIS: {selectedStudentForDetail.nis} | NISN: {selectedStudentForDetail.nisn} | No. Urut:{' '}
                  {selectedStudentForDetail.noUrut}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Score List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-slate-700">Rincian Nilai Akhir Per Mata Pelajaran:</p>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {activeSubjects.map((sub) => {
                  const s = scores[semester]?.[selectedStudentForDetail.id]?.[sub.id];
                  const na = s?.nilaiAkhir;
                  const isPass = na !== null && na !== undefined && na >= sub.kktp;
                  return (
                    <div key={sub.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-800">{sub.nama}</p>
                        <p className="text-[11px] text-slate-500">KKTP: {sub.kktp}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-md ${
                            na === null || na === undefined
                              ? 'bg-slate-100 text-slate-400'
                              : isPass
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {na !== null && na !== undefined
                            ? formatScoreDisplay(na, currentFormat)
                            : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dokumen Leger Siap Cetak & Download PDF Lanskap */}
      <LegerDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        school={school}
        classInfo={classInfo}
        teacher={teacher}
        reportSettings={reportSettings}
        subjects={activeSubjects}
        studentRecords={studentRecords}
        classStats={classStats}
        semester={semester}
      />
    </div>
  );
};
