import React, { useState } from 'react';
import {
  Award,
  RefreshCw,
  Edit3,
  RotateCcw,
  Check,
  Filter,
  Users,
  Sparkles,
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
import { generateCompetencyDescription, formatScoreDisplay } from '../utils/competencyGenerator';

interface CompetencyViewProps {
  students: Student[];
  subjects: Subject[];
  learningScopes: LingkupMateri[];
  scores: ScoresDatabase;
  semester: 1 | 2;
  reportSettings?: ReportSettings;
  onUpdateScores: (newScores: ScoresDatabase) => void;
}

export const CompetencyView: React.FC<CompetencyViewProps> = ({
  students,
  subjects,
  learningScopes,
  scores,
  semester,
  reportSettings,
  onUpdateScores,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const currentScopes = learningScopes.filter(
    (lm) => lm.subjectId === selectedSubjectId && lm.semester === semester
  );

  const currentSemesterScores = scores[semester] || {};

  const handleRegenerateOne = (studentId: string) => {
    const studentObj = students.find((s) => s.id === studentId);
    const studentScores = currentSemesterScores[studentId] || {};
    const rec = studentScores[selectedSubjectId];
    if (!rec) return;

    const currentVariation = rec.descVariationIndex || 0;
    const nextVariation = currentVariation + 1;

    const newDesc = generateCompetencyDescription(
      selectedSubject.nama,
      selectedSubject.kktp,
      currentScopes,
      rec.scores,
      nextVariation
    );

    const updatedRec: StudentSubjectScore = {
      ...rec,
      capaianKompetensi: newDesc,
      isManualDescription: false,
      descVariationIndex: nextVariation,
    };

    onUpdateScores({
      ...scores,
      [semester]: {
        ...currentSemesterScores,
        [studentId]: {
          ...studentScores,
          [selectedSubjectId]: updatedRec,
        },
      },
    });

    setStatusMessage(`Capaian ${studentObj?.namaLengkap} berhasil diregenerasi.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartEdit = (studentId: string, currentText: string) => {
    setEditingKey(studentId);
    setEditText(currentText);
  };

  const handleSaveEdit = (studentId: string) => {
    const studentScores = currentSemesterScores[studentId] || {};
    const rec = studentScores[selectedSubjectId];
    if (!rec) return;

    const updatedRec: StudentSubjectScore = {
      ...rec,
      capaianKompetensi: editText.trim(),
      isManualDescription: true,
    };

    onUpdateScores({
      ...scores,
      [semester]: {
        ...currentSemesterScores,
        [studentId]: {
          ...studentScores,
          [selectedSubjectId]: updatedRec,
        },
      },
    });

    setEditingKey(null);
    setStatusMessage('Capaian kompetensi berhasil diedit manual!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleResetToAuto = (studentId: string) => {
    const studentObj = students.find((s) => s.id === studentId);
    const studentScores = currentSemesterScores[studentId] || {};
    const rec = studentScores[selectedSubjectId];
    if (!rec) return;

    const newDesc = generateCompetencyDescription(
      selectedSubject.nama,
      selectedSubject.kktp,
      currentScopes,
      rec.scores,
      studentObj?.noUrut || 1
    );

    const updatedRec: StudentSubjectScore = {
      ...rec,
      capaianKompetensi: newDesc,
      isManualDescription: false,
    };

    onUpdateScores({
      ...scores,
      [semester]: {
        ...currentSemesterScores,
        [studentId]: {
          ...studentScores,
          [selectedSubjectId]: updatedRec,
        },
      },
    });

    setStatusMessage('Dikembalikan ke hasil otomatis.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleRegenerateAll = () => {
    const newSemesterScores = { ...(scores[semester] || {}) };
    activeStudents.forEach((student, idx) => {
      const studentScores = newSemesterScores[student.id] || {};
      const rec = studentScores[selectedSubjectId];
      if (rec) {
        const nextVar = (rec.descVariationIndex || idx) + 1;
        const newDesc = generateCompetencyDescription(
          selectedSubject.nama,
          selectedSubject.kktp,
          currentScopes,
          rec.scores,
          nextVar
        );
        newSemesterScores[student.id] = {
          ...studentScores,
          [selectedSubjectId]: {
            ...rec,
            capaianKompetensi: newDesc,
            isManualDescription: false,
            descVariationIndex: nextVar,
          },
        };
      }
    });

    onUpdateScores({
      ...scores,
      [semester]: newSemesterScores,
    });

    setStatusMessage(`Semua deskripsi ${selectedSubject.nama} berhasil diregenerasi!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Generator Capaian Kompetensi Otomatis - Semester {semester}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Narasi capaian peserta didik dirangkai otomatis berdasarkan nilai sumatif dan KKTP ({selectedSubject?.kktp || 75}). Guru dapat meregenerasi atau mengedit manual.
          </p>
        </div>

        <button
          onClick={handleRegenerateAll}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Regenerasi Semua Siswa</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Subject Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Mata Pelajaran:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            {subjects.filter((s) => s.isActive).map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.nama} (KKTP: {sub.kktp})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Nilai ≥ KKTP: Menguasai • Nilai &lt; KKTP: Perlu Bimbingan</span>
        </div>
      </div>

      {/* Cards List for Students */}
      <div className="space-y-3">
        {activeStudents.map((student, idx) => {
          const studentScores = currentSemesterScores[student.id]?.[selectedSubjectId];
          const na = studentScores?.nilaiAkhir ?? null;
          const desc = studentScores?.capaianKompetensi || 'Belum ada nilai sumatif terisi.';
          const isManual = studentScores?.isManualDescription || false;
          const isEditing = editingKey === student.id;

          return (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 transition-all hover:border-slate-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {student.noUrut || idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{student.namaLengkap}</h3>
                    <p className="text-[11px] text-slate-400">NISN: {student.nisn}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-slate-500">Nilai Akhir:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
                        na !== null && na >= selectedSubject.kktp
                          ? 'bg-emerald-100 text-emerald-800'
                          : na !== null
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {na !== null ? formatScoreDisplay(na, reportSettings?.formatNilai || 'desimal_2') : '-'}
                    </span>
                  </div>

                  {isManual && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                      Diedit Manual
                    </span>
                  )}
                </div>
              </div>

              {/* Description Body */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2.5 text-xs border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingKey(null)}
                      className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleSaveEdit(student.id)}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold"
                    >
                      Simpan Deskripsi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200 flex-1">
                    {desc}
                  </p>

                  {/* Actions for this student */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => handleRegenerateOne(student.id)}
                      className="p-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs flex items-center space-x-1"
                      title="Buat variasi kalimat otomatis baru"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Variasi Kalimat</span>
                    </button>

                    <button
                      onClick={() => handleStartEdit(student.id, desc)}
                      className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs flex items-center space-x-1"
                      title="Edit kalimat secara manual"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Edit Manual</span>
                    </button>

                    {isManual && (
                      <button
                        onClick={() => handleResetToAuto(student.id)}
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center space-x-1"
                        title="Kembalikan ke deskripsi otomatis"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Reset Otomatis</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
