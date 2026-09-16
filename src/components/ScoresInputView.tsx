import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Check,
  Filter,
  Calculator,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ChevronDown,
  FileCheck,
  Layers,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  Student,
  Subject,
  LingkupMateri,
  ScoresDatabase,
  StudentSubjectScore,
  ReportSettings,
} from '../types';
import {
  calculateNilaiAkhir,
  generateCompetencyDescription,
  roundScoreValue,
  formatScoreDisplay,
} from '../utils/competencyGenerator';
import {
  exportScoresRecapToExcel,
  exportSubjectScoresTemplateToExcel,
  exportAllSubjectsScoresWorkbook,
} from '../utils/excelHelper';
import { ScoreImportModal } from './ScoreImportModal';

interface ScoresInputViewProps {
  students: Student[];
  subjects: Subject[];
  learningScopes: LingkupMateri[];
  scores: ScoresDatabase;
  semester: 1 | 2;
  className: string;
  reportSettings?: ReportSettings;
  onUpdateScores: (newScores: ScoresDatabase) => void;
  onUpdateReportSettings?: (newSettings: ReportSettings) => void;
}

export const ScoresInputView: React.FC<ScoresInputViewProps> = ({
  students,
  subjects,
  learningScopes,
  scores,
  semester,
  className,
  reportSettings,
  onUpdateScores,
  onUpdateReportSettings,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  const currentFormat: 'bulat' | 'desimal_2' = reportSettings?.formatNilai || 'desimal_2';

  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const currentScopes = learningScopes.filter(
    (lm) => lm.subjectId === selectedSubjectId && lm.semester === semester
  );

  const currentSemesterScores = scores[semester] || {};

  const handleFormatChange = (newFormat: 'bulat' | 'desimal_2') => {
    if (onUpdateReportSettings && reportSettings) {
      onUpdateReportSettings({ ...reportSettings, formatNilai: newFormat });
    }

    // Recalculate Nilai Akhir for all active students across all subjects in this semester
    const newSemesterScores = { ...(scores[semester] || {}) };
    for (const student of activeStudents) {
      const studentScores = newSemesterScores[student.id];
      if (!studentScores) continue;

      const updatedStudentScores: Record<string, StudentSubjectScore> = { ...studentScores };
      for (const sub of subjects) {
        const rec = studentScores[sub.id];
        if (!rec || !rec.scores) continue;

        const subScopes = learningScopes.filter(
          (lm) => lm.subjectId === sub.id && lm.semester === semester
        );
        const recalculatedNa = calculateNilaiAkhir(subScopes, rec.scores, newFormat);
        updatedStudentScores[sub.id] = {
          ...rec,
          nilaiAkhir: recalculatedNa,
        };
      }
      newSemesterScores[student.id] = updatedStudentScores;
    }

    onUpdateScores({
      ...scores,
      [semester]: newSemesterScores,
    });

    setStatusMessage(
      `Bentuk nilai berhasil diubah menjadi: ${
        newFormat === 'desimal_2'
          ? '2 Angka di Belakang Koma (dibulatkan ke atas jika angka di belakang koma >= 5)'
          : 'Bilangan Bulat'
      }. Seluruh Nilai Akhir telah diperbarui otomatis.`
    );
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleScoreChange = (studentId: string, scopeId: string, valStr: string) => {
    setValidationError(null);
    let parsed: number | null = null;
    if (valStr.trim() !== '') {
      const normalized = valStr.replace(',', '.');
      const num = Number(normalized);
      if (isNaN(num) || num < 0 || num > 100) {
        setValidationError('Nilai harus berupa angka antara 0 sampai 100!');
        return;
      }
      parsed = roundScoreValue(num, currentFormat);
    }

    const studentScores = currentSemesterScores[studentId] || {};
    const existingRec = studentScores[selectedSubjectId] || {
      scores: {},
      nilaiAkhir: null,
      capaianKompetensi: '',
      isManualDescription: false,
    };

    const newScoresMap = {
      ...existingRec.scores,
      [scopeId]: parsed,
    };

    const newNilaiAkhir = calculateNilaiAkhir(currentScopes, newScoresMap, currentFormat);

    // Auto-update competency description if not manually locked
    let newDesc = existingRec.capaianKompetensi;
    if (!existingRec.isManualDescription) {
      const studentObj = students.find((s) => s.id === studentId);
      newDesc = generateCompetencyDescription(
        selectedSubject.nama,
        selectedSubject.kktp,
        currentScopes,
        newScoresMap,
        studentObj?.noUrut || 1
      );
    }

    const updatedRecord: StudentSubjectScore = {
      ...existingRec,
      scores: newScoresMap,
      nilaiAkhir: newNilaiAkhir,
      capaianKompetensi: newDesc,
    };

    const newDb: ScoresDatabase = {
      ...scores,
      [semester]: {
        ...currentSemesterScores,
        [studentId]: {
          ...studentScores,
          [selectedSubjectId]: updatedRecord,
        },
      },
    };

    onUpdateScores(newDb);
  };

  const handleGenerateAllCompetencies = () => {
    const newSemesterScores = { ...(scores[semester] || {}) };

    for (const student of activeStudents) {
      const studentScores = newSemesterScores[student.id] || {};
      const rec = studentScores[selectedSubjectId];
      if (rec) {
        const desc = generateCompetencyDescription(
          selectedSubject.nama,
          selectedSubject.kktp,
          currentScopes,
          rec.scores,
          student.noUrut || 1
        );
        newSemesterScores[student.id] = {
          ...studentScores,
          [selectedSubjectId]: {
            ...rec,
            capaianKompetensi: desc,
            isManualDescription: false,
          },
        };
      }
    }

    onUpdateScores({
      ...scores,
      [semester]: newSemesterScores,
    });

    setStatusMessage('Seluruh deskripsi capaian kompetensi berhasil disinkronkan!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleClearSubjectScores = () => {
    if (!confirm(`Kosongkan semua nilai ${selectedSubject.nama} di Semester ${semester}?`)) {
      return;
    }

    const newSemesterScores = { ...(scores[semester] || {}) };
    for (const student of activeStudents) {
      const studentScores = newSemesterScores[student.id] || {};
      if (studentScores[selectedSubjectId]) {
        delete studentScores[selectedSubjectId];
        newSemesterScores[student.id] = { ...studentScores };
      }
    }

    onUpdateScores({
      ...scores,
      [semester]: newSemesterScores,
    });
    setStatusMessage('Nilai berhasil dikosongkan.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleApplyImportedScores = (
    targetSubjId: string,
    importedScores: Record<string, Record<string, number | null>>,
    options: { autoUpdateCompetency: boolean; preserveExistingScores: boolean }
  ) => {
    const newSemesterScores = { ...(scores[semester] || {}) };
    const targetSubjectObj = subjects.find((s) => s.id === targetSubjId) || selectedSubject;
    const targetSubjectScopes = learningScopes.filter(
      (lm) => lm.subjectId === targetSubjId && lm.semester === semester
    );

    let updatedStudentsCount = 0;
    let totalValuesCount = 0;

    for (const student of activeStudents) {
      const studentImported = importedScores[student.id];
      if (!studentImported) continue;

      const currentStudentScores = newSemesterScores[student.id] || {};
      const existingRec = currentStudentScores[targetSubjId] || {
        scores: {},
        nilaiAkhir: null,
        capaianKompetensi: '',
        isManualDescription: false,
        descVariationIndex: student.noUrut || 1,
      };

      const mergedScores: Record<string, number | null> = options.preserveExistingScores
        ? { ...existingRec.scores }
        : {};

      let hasNewValue = false;
      for (const [scopeId, val] of Object.entries(studentImported)) {
        if (val !== null && val !== undefined) {
          mergedScores[scopeId] = val;
          hasNewValue = true;
          totalValuesCount++;
        } else if (!options.preserveExistingScores) {
          mergedScores[scopeId] = null;
        }
      }

      if (hasNewValue) {
        updatedStudentsCount++;
      }

      const newNilaiAkhir = calculateNilaiAkhir(targetSubjectScopes, mergedScores, currentFormat);

      let newDesc = existingRec.capaianKompetensi;
      if (options.autoUpdateCompetency || !existingRec.isManualDescription || !newDesc) {
        newDesc = generateCompetencyDescription(
          targetSubjectObj.nama,
          targetSubjectObj.kktp,
          targetSubjectScopes,
          mergedScores,
          student.noUrut || 1
        );
      }

      newSemesterScores[student.id] = {
        ...currentStudentScores,
        [targetSubjId]: {
          scores: mergedScores,
          nilaiAkhir: newNilaiAkhir,
          capaianKompetensi: newDesc,
          isManualDescription: false,
          descVariationIndex: student.noUrut || 1,
        },
      };
    }

    const newDb: ScoresDatabase = {
      ...scores,
      [semester]: newSemesterScores,
    };

    onUpdateScores(newDb);
    setSelectedSubjectId(targetSubjId);
    setStatusMessage(
      `Berhasil mengimpor ${totalValuesCount} nilai untuk ${updatedStudentsCount} siswa pada mata pelajaran ${targetSubjectObj.nama}!`
    );
    setTimeout(() => setStatusMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Input Nilai Sumatif - Semester {semester}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Input nilai sumatif per lingkup materi (0-100), atau gunakan menu ekspor & impor Excel untuk kemudahan input massal.
          </p>
        </div>

        {/* Action Buttons: Export Menu, Import Menu, Sync */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Export Menu Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Menu Ekspor</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fade-in text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Format Nilai Mata Pelajaran
                </div>
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    exportSubjectScoresTemplateToExcel(
                      students,
                      selectedSubject,
                      currentScopes,
                      scores,
                      semester,
                      className,
                      false
                    );
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-start space-x-2.5 transition-colors"
                >
                  <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Format Nilai Mapel Ini (.xlsx)</span>
                    <span className="text-[11px] text-slate-500">
                      Berisi siswa aktif & nilai saat ini ({selectedSubject.nama})
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    exportSubjectScoresTemplateToExcel(
                      students,
                      selectedSubject,
                      currentScopes,
                      scores,
                      semester,
                      className,
                      true
                    );
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-start space-x-2.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Template Kosong Mapel Ini (.xlsx)</span>
                    <span className="text-[11px] text-slate-500">
                      Kolom nilai kosong, siap dibagikan ke guru mapel
                    </span>
                  </div>
                </button>

                <div className="px-3 py-1.5 border-t border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Format Lengkap & Rekap
                </div>

                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    exportAllSubjectsScoresWorkbook(
                      students,
                      subjects,
                      learningScopes,
                      scores,
                      semester,
                      className
                    );
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-start space-x-2.5 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Format Semua Mapel (.xlsx)</span>
                    <span className="text-[11px] text-slate-500">
                      1 file dengan lembar/sheet terpisah per mata pelajaran
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    exportScoresRecapToExcel(students, subjects, scores, semester, className);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-start space-x-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Rekap Nilai Siswa (.xlsx)</span>
                    <span className="text-[11px] text-slate-500">
                      Tabel nilai akhir dan rata-rata semua mata pelajaran
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Import Menu Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
            title="Impor nilai sumatif dari file Excel (.xlsx)"
          >
            <Upload className="w-4 h-4" />
            <span>Menu Impor Excel</span>
          </button>

          {/* Sync Competency Button */}
          <button
            onClick={handleGenerateAllCompetencies}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            title="Perbarui otomatis seluruh kalimat capaian kompetensi untuk mata pelajaran ini"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sinkronkan Capaian</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2.5 shadow-xs animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {validationError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center space-x-2.5 shadow-xs animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Subject selector, Score Format & info */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5 w-full xl:w-auto">
          {/* Mapel Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 shrink-0">Pilih Mapel:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800"
            >
              {subjects.filter((s) => s.isActive).map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nama} (KKTP: {sub.kktp})
                </option>
              ))}
            </select>
          </div>

          {/* Pilihan Bentuk Nilai (Desimal 2 Digit vs Bilangan Bulat) */}
          <div className="flex flex-wrap items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-700 shrink-0 flex items-center space-x-1">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Bentuk Nilai:</span>
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => handleFormatChange('desimal_2')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  currentFormat === 'desimal_2'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="2 Angka di Belakang Koma (misal: 85,75). Dibulatkan ke atas jika angka berikutnya >= 5"
              >
                <span>2 Angka Desimal</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${currentFormat === 'desimal_2' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  (85,75)
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange('bulat')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  currentFormat === 'bulat'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Bilangan bulat utuh tanpa koma (misal: 86). Dibulatkan ke atas jika desimal >= 0.5"
              >
                <span>Bilangan Bulat</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${currentFormat === 'bulat' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  (86)
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs w-full xl:w-auto justify-between xl:justify-end">
          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            KKTP Mapel: {selectedSubject?.kktp || 75}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {currentScopes.length} Lingkup Materi
          </span>

          {/* Quick Excel export/import for current subject */}
          <button
            onClick={() =>
              exportSubjectScoresTemplateToExcel(
                students,
                selectedSubject,
                currentScopes,
                scores,
                semester,
                className,
                false
              )
            }
            className="px-2.5 py-1 text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 rounded-md border border-slate-200 font-medium flex items-center space-x-1"
            title="Unduh format Excel untuk mata pelajaran yang dipilih ini"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Format Excel</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-2.5 py-1 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 font-medium flex items-center space-x-1"
            title="Impor nilai Excel langsung ke mata pelajaran ini"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Nilai</span>
          </button>

          <button
            onClick={handleClearSubjectScores}
            className="text-red-600 hover:text-red-800 text-xs flex items-center space-x-1 px-2 py-1 hover:bg-red-50 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kosongkan Mapel Ini</span>
          </button>
        </div>
      </div>

      {/* Format Information Banner */}
      <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Bentuk Nilai Aktif:{' '}
            <strong className="text-blue-900 font-bold">
              {currentFormat === 'desimal_2'
                ? '2 Angka di Belakang Koma (Desimal)'
                : 'Bilangan Bulat'}
            </strong>{' '}
            • Aturan pembulatan:{' '}
            {currentFormat === 'desimal_2'
              ? 'Dibulatkan ke atas jika angka di belakang koma (digit berikutnya) lebih dari atau sama dengan 5 (≥ 5).'
              : 'Dibulatkan ke atas jika desimal lebih dari atau sama dengan 5 (≥ 0,5).'}
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
          Format otomatis diterapkan ke Rapor Siswa
        </span>
      </div>

      {/* Grid Spreadsheet Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {currentScopes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="font-semibold text-sm">Belum ada Lingkup Materi untuk mata pelajaran ini.</p>
            <p className="text-xs text-slate-400 mt-1">
              Silakan buka menu <strong>Lingkup Materi</strong> untuk menambahkan materi sumatif terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center w-12 sticky left-0 bg-slate-50 z-10">No</th>
                  <th className="py-3 px-4 min-w-[200px] sticky left-12 bg-slate-50 z-10">
                    Nama Siswa
                  </th>
                  {currentScopes.map((scope) => (
                    <th key={scope.id} className="py-3 px-3 text-center min-w-[125px]">
                      <div className="font-bold text-blue-700">{scope.kode}</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate max-w-[140px] mx-auto" title={scope.judul}>
                        {scope.judul}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">KKTP: {scope.kktp}</div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center bg-blue-50 text-blue-900 font-bold min-w-[110px]">
                    <div>Nilai Akhir</div>
                    <div className="text-[9px] font-normal text-blue-700 lowercase mt-0.5">
                      {currentFormat === 'desimal_2' ? '(2 Desimal, ≥5 ↑)' : '(Bulat)'}
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[280px]">Ringkasan Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {activeStudents.map((student, idx) => {
                  const studentScores = currentSemesterScores[student.id]?.[selectedSubjectId];
                  const scoresMap = studentScores?.scores || {};
                  const nilaiAkhir = studentScores?.nilaiAkhir ?? null;
                  const desc = studentScores?.capaianKompetensi || '-';

                  return (
                    <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500 sticky left-0 bg-white z-10">
                        {student.noUrut || idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-sans font-bold text-slate-800 sticky left-12 bg-white z-10">
                        <div className="truncate max-w-[200px]" title={student.namaLengkap}>
                          {student.namaLengkap}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">
                          NISN: {student.nisn}
                        </div>
                      </td>

                      {/* Scope scores inputs */}
                      {currentScopes.map((scope) => {
                        const rawScore = scoresMap[scope.id];
                        const val = rawScore !== null && rawScore !== undefined ? rawScore : '';
                        const isBelow = rawScore !== null && rawScore !== undefined && rawScore < scope.kktp;

                        return (
                          <td key={scope.id} className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              step={currentFormat === 'desimal_2' ? '0.01' : '1'}
                              min={0}
                              max={100}
                              value={val}
                              placeholder="-"
                              onChange={(e) =>
                                handleScoreChange(student.id, scope.id, e.target.value)
                              }
                              onBlur={(e) => {
                                if (e.target.value.trim() !== '') {
                                  const normalized = e.target.value.replace(',', '.');
                                  const num = Number(normalized);
                                  if (!isNaN(num) && num >= 0 && num <= 100) {
                                    const rounded = roundScoreValue(num, currentFormat);
                                    handleScoreChange(student.id, scope.id, String(rounded));
                                  }
                                }
                              }}
                              className={`w-20 px-2 py-1.5 border rounded-md text-center text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isBelow
                                  ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold'
                                  : val !== ''
                                  ? 'border-slate-300 bg-white text-slate-800'
                                  : 'border-slate-200 bg-slate-50 text-slate-400'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Calculated Final Score */}
                      <td className="py-2.5 px-4 text-center bg-blue-50/40">
                        {nilaiAkhir !== null ? (
                          <span
                            className={`inline-block px-3 py-1 rounded-md text-xs font-bold font-mono ${
                              nilaiAkhir >= selectedSubject.kktp
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {formatScoreDisplay(nilaiAkhir, currentFormat)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Competency preview */}
                      <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px] leading-snug">
                        <div className="line-clamp-2" title={desc}>
                          {desc}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Calculation & Export/Import Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export & Import Guide */}
        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-3">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-emerald-900">Panduan Praktis Ekspor & Impor Nilai:</p>
            <ol className="list-decimal list-inside space-y-1 text-emerald-800 text-[11px] leading-relaxed">
              <li>
                Klik <strong>Menu Ekspor</strong> untuk mengunduh format file Excel (format mapel ini, template kosong, atau semua mapel).
              </li>
              <li>
                Isi nilai sumatif siswa (0 s.d. 100) pada kolom LM 1, LM 2, dst. menggunakan Microsoft Excel atau Google Sheets.
              </li>
              <li>
                Klik <strong>Menu Impor Excel</strong>, unggah file hasil pengisian, periksa pratinjau, lalu klik <strong>Terapkan Nilai</strong>.
              </li>
              <li>
                Nilai Akhir dan deskripsi Capaian Kompetensi Kurikulum Merdeka akan otomatis dihitung dan diperbarui.
              </li>
            </ol>
          </div>
        </div>

        {/* Formula Guide */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
          <Calculator className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-800">Prinsip & Formula Perhitungan Nilai Rapor:</p>
            <p className="leading-relaxed text-[11px]">
              <strong>Nilai Akhir</strong> = Σ Nilai Sumatif Lingkup Materi ÷ Jumlah Lingkup Materi yang dinilai.
            </p>
            <div className="text-slate-600 text-[11px] space-y-0.5 mt-1">
              <p>
                • <strong>Pilihan 2 Angka Desimal:</strong> Dibulatkan ke atas jika angka di belakang koma (digit berikutnya) ≥ 5.
                <span className="text-slate-500 block text-[10px]">Contoh: 85,745 → 85,75; 82,333 → 82,33; 80 → 80,00.</span>
              </p>
              <p>
                • <strong>Pilihan Bilangan Bulat:</strong> Dibulatkan ke atas jika desimal ≥ 0,5.
                <span className="text-slate-500 block text-[10px]">Contoh: 82,5 → 83; 82,4 → 82.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Import Modal */}
      <ScoreImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        students={students}
        subjects={subjects}
        learningScopes={learningScopes}
        semester={semester}
        className={className}
        initialSubjectId={selectedSubjectId}
        onApplyScores={handleApplyImportedScores}
      />
    </div>
  );
};
