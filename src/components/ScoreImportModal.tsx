import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Download,
  FileCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Subject, LingkupMateri } from '../types';
import {
  readWorkbookFromFile,
  parseSubjectScoresFromWorkbook,
  ParseScoresResult,
  exportSubjectScoresTemplateToExcel,
} from '../utils/excelHelper';

interface ScoreImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  subjects: Subject[];
  learningScopes: LingkupMateri[];
  semester: 1 | 2;
  className: string;
  initialSubjectId: string;
  onApplyScores: (
    subjectId: string,
    importedScores: Record<string, Record<string, number | null>>,
    options: { autoUpdateCompetency: boolean; preserveExistingScores: boolean }
  ) => void;
}

export const ScoreImportModal: React.FC<ScoreImportModalProps> = ({
  isOpen,
  onClose,
  students,
  subjects,
  learningScopes,
  semester,
  className,
  initialSubjectId,
  onApplyScores,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [parseResult, setParseResult] = useState<ParseScoresResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Import options
  const [autoUpdateCompetency, setAutoUpdateCompetency] = useState<boolean>(true);
  const [preserveExistingScores, setPreserveExistingScores] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedSubjectId when initialSubjectId changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSubjectId(initialSubjectId || subjects[0]?.id || '');
    }
  }, [isOpen, initialSubjectId, subjects]);

  const activeSubjects = subjects.filter((s) => s.isActive);
  const targetSubject = activeSubjects.find((s) => s.id === selectedSubjectId) || activeSubjects[0];
  const targetScopes = learningScopes.filter(
    (lm) => lm.subjectId === targetSubject?.id && lm.semester === semester
  );

  // Reset file state when modal closes
  const handleClose = () => {
    setFile(null);
    setWorkbook(null);
    setAvailableSheets([]);
    setSelectedSheet('');
    setParseResult(null);
    setErrorMessage(null);
    onClose();
  };

  const handleFileSelected = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Check extension
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setErrorMessage('Format file harus berupa spreadsheet Excel (.xlsx atau .xls).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const wb = await readWorkbookFromFile(selectedFile);
      setFile(selectedFile);
      setWorkbook(wb);
      setAvailableSheets(wb.SheetNames);

      // Try to auto-match sheet name with target subject
      let defaultSheet = wb.SheetNames[0];
      if (targetSubject) {
        const subNameClean = targetSubject.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchedSheet = wb.SheetNames.find((s) => {
          const sClean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
          return sClean.includes(subNameClean) || subNameClean.includes(sClean);
        });
        if (matchedSheet) {
          defaultSheet = matchedSheet;
        }
      }

      setSelectedSheet(defaultSheet);
      executeParsing(wb, defaultSheet, targetSubject, targetScopes);
    } catch (err: any) {
      setErrorMessage(`Gagal membaca file Excel: ${err.message || 'File mungkin rusak atau tidak kompatibel.'}`);
      setParseResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeParsing = (
    wb: XLSX.WorkBook,
    sheetName: string,
    subj: Subject,
    scopes: LingkupMateri[]
  ) => {
    try {
      setErrorMessage(null);
      const res = parseSubjectScoresFromWorkbook(wb, sheetName, subj, scopes, students);
      setParseResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses data pada lembar kerja terpilih.');
      setParseResult(null);
    }
  };

  // Re-run parsing if user changes sheet or subject
  const handleSheetChange = (newSheet: string) => {
    setSelectedSheet(newSheet);
    if (workbook && targetSubject) {
      executeParsing(workbook, newSheet, targetSubject, targetScopes);
    }
  };

  const handleSubjectChange = (newSubjId: string) => {
    setSelectedSubjectId(newSubjId);
    const newSubj = activeSubjects.find((s) => s.id === newSubjId);
    const newScopes = learningScopes.filter(
      (lm) => lm.subjectId === newSubjId && lm.semester === semester
    );

    if (workbook && newSubj) {
      // Auto switch sheet if matching
      let sheetToUse = selectedSheet;
      const subNameClean = newSubj.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matched = availableSheets.find((s) =>
        s.toLowerCase().replace(/[^a-z0-9]/g, '').includes(subNameClean)
      );
      if (matched) {
        sheetToUse = matched;
        setSelectedSheet(matched);
      }
      executeParsing(workbook, sheetToUse, newSubj, newScopes);
    }
  };

  const handleApply = () => {
    if (!parseResult || !targetSubject) return;

    // Collect valid student scores
    const importedScores: Record<string, Record<string, number | null>> = {};

    for (const studentRow of parseResult.studentRows) {
      if (studentRow.hasValidScore) {
        importedScores[studentRow.studentId] = studentRow.scores;
      }
    }

    onApplyScores(targetSubject.id, importedScores, {
      autoUpdateCompetency,
      preserveExistingScores,
    });

    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Impor Nilai Sumatif dari Excel
              </h2>
              <p className="text-xs text-slate-500">
                Semester {semester} - {className}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Subject Selector */}
          <div className="bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mata Pelajaran Tujuan:
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none w-64 sm:w-72"
              >
                {activeSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} (KKTP: {s.kktp})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (targetSubject) {
                  exportSubjectScoresTemplateToExcel(
                    students,
                    targetSubject,
                    targetScopes,
                    {},
                    semester,
                    className,
                    true
                  );
                }
              }}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-xs hover:bg-blue-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Format Kosong (.xlsx)</span>
            </button>
          </div>

          {/* File Upload Zone */}
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelected(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Klik untuk memilih file Excel atau seret file ke sini
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format <strong>.xlsx</strong> atau <strong>.xls</strong> dengan kolom NISN, Nama Siswa, dan kolom LM 1, LM 2, dst.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info & Sheet Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center space-x-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block truncate max-w-[280px]">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {availableSheets.length > 1 && (
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-slate-600">Pilih Lembar (Sheet):</span>
                      <select
                        value={selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                      >
                        {availableSheets.map((sh) => (
                          <option key={sh} value={sh}>
                            {sh}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setFile(null);
                      setWorkbook(null);
                      setParseResult(null);
                      setErrorMessage(null);
                    }}
                    className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-md border border-red-200 font-semibold"
                  >
                    Ganti File
                  </button>
                </div>
              </div>

              {/* Status Alert if error or warning */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {parseResult && parseResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Catatan Penyesuaian Kolom:</p>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px]">
                      {parseResult.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Column Mapping Summary */}
              {parseResult && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Pencocokan Kolom Lingkup Materi:</span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {parseResult.matchedScopes.length} dari {targetScopes.length} kolom terdeteksi
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {targetScopes.map((scope) => {
                      const matched = parseResult.matchedScopes.find((m) => m.id === scope.id);
                      return (
                        <span
                          key={scope.id}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center space-x-1 ${
                            matched
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-600 border border-slate-300'
                          }`}
                        >
                          <span>{scope.kode}</span>
                          {matched ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <span className="text-[10px] text-slate-500">(belum ada nilai)</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parsed Students Table Preview */}
              {parseResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data Nilai yang Ditemukan ({parseResult.totalStudentsWithScores} Siswa):
                    </span>
                    <span className="text-slate-500 font-medium">
                      Total {parseResult.totalScoresRead} nilai terbaca
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 sticky top-0 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 text-center w-10">No</th>
                          <th className="py-2 px-3">Nama Siswa</th>
                          <th className="py-2 px-2 text-center w-24">NISN</th>
                          {targetScopes.map((scope) => (
                            <th key={scope.id} className="py-2 px-2 text-center w-16">
                              {scope.kode}
                            </th>
                          ))}
                          <th className="py-2 px-3 text-center w-20">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-xs">
                        {parseResult.studentRows.map((row, idx) => (
                          <tr
                            key={row.studentId}
                            className={`hover:bg-slate-50 transition-colors ${
                              !row.hasValidScore ? 'opacity-40 bg-slate-50/50' : ''
                            }`}
                          >
                            <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                              {row.studentName}
                            </td>
                            <td className="py-2 px-2 text-center text-slate-500">{row.nisn}</td>
                            {targetScopes.map((scope) => {
                              const val = row.scores[scope.id];
                              return (
                                <td
                                  key={scope.id}
                                  className="py-2 px-2 text-center font-bold text-slate-700"
                                >
                                  {val !== null && val !== undefined ? (
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                                        val >= targetSubject.kktp
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {val}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3 text-center">
                              {row.hasValidScore ? (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <span>{row.scoreCount} Nilai</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Kosong</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Options Checkboxes */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoUpdateCompetency}
                    onChange={(e) => setAutoUpdateCompetency(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">
                    Otomatis perbarui narasi Capaian Kompetensi Kurikulum Merdeka
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preserveExistingScores}
                    onChange={(e) => setPreserveExistingScores(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>
                    Pertahankan nilai lama yang sudah ada di aplikasi jika kolom di file Excel kosong
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Batal
          </button>

          <button
            disabled={!parseResult || parseResult.totalStudentsWithScores === 0 || isProcessing}
            onClick={handleApply}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-xs ${
              !parseResult || parseResult.totalStudentsWithScores === 0 || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Terapkan Nilai ({parseResult?.totalStudentsWithScores || 0} Siswa)
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
