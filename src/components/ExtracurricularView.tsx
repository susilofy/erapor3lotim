import React, { useState } from 'react';
import { Trophy, Plus, Trash2, Check, UserPlus } from 'lucide-react';
import {
  Student,
  ExtracurricularItem,
  ExtracurricularDatabase,
  StudentExtraRecord,
} from '../types';

interface ExtracurricularViewProps {
  students: Student[];
  extracurricularList: ExtracurricularItem[];
  extracurricular: ExtracurricularDatabase;
  semester: 1 | 2;
  onUpdateList: (list: ExtracurricularItem[]) => void;
  onUpdateExtracurricular: (updated: ExtracurricularDatabase) => void;
}

export const ExtracurricularView: React.FC<ExtracurricularViewProps> = ({
  students,
  extracurricularList,
  extracurricular,
  semester,
  onUpdateList,
  onUpdateExtracurricular,
}) => {
  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const currentSemesterExtra = extracurricular[semester] || {};

  const [newExtraName, setNewExtraName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAddActivityType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraName.trim()) return;
    const newItem: ExtracurricularItem = {
      id: `ex-${Date.now()}`,
      nama: newExtraName.trim(),
    };
    onUpdateList([...extracurricularList, newItem]);
    setNewExtraName('');
    setStatusMessage('Jenis ekstrakurikuler berhasil ditambahkan!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleAddStudentExtra = (studentId: string, ekskulId: string) => {
    const existing = currentSemesterExtra[studentId] || [];
    const item = extracurricularList.find((e) => e.id === ekskulId);
    if (!item) return;

    if (existing.some((e) => e.ekskulId === ekskulId)) {
      alert('Siswa sudah terdaftar pada ekstrakurikuler ini.');
      return;
    }

    const newRecord: StudentExtraRecord = {
      ekskulId: item.id,
      namaEkskul: item.nama,
      keterangan: 'Baik',
    };

    const updated = {
      ...extracurricular,
      [semester]: {
        ...currentSemesterExtra,
        [studentId]: [...existing, newRecord],
      },
    };
    onUpdateExtracurricular(updated);
  };

  const handleUpdateStudentKeterangan = (
    studentId: string,
    ekskulId: string,
    keterangan: string
  ) => {
    const existing = currentSemesterExtra[studentId] || [];
    const updatedRecords = existing.map((r) =>
      r.ekskulId === ekskulId ? { ...r, keterangan } : r
    );

    onUpdateExtracurricular({
      ...extracurricular,
      [semester]: {
        ...currentSemesterExtra,
        [studentId]: updatedRecords,
      },
    });
  };

  const handleRemoveStudentExtra = (studentId: string, ekskulId: string) => {
    const existing = currentSemesterExtra[studentId] || [];
    const updatedRecords = existing.filter((r) => r.ekskulId !== ekskulId);

    onUpdateExtracurricular({
      ...extracurricular,
      [semester]: {
        ...currentSemesterExtra,
        [studentId]: updatedRecords,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-orange-600" />
            <span>Ekstrakurikuler Siswa - Semester {semester}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Catat kegiatan ekstrakurikuler wajib (Pramuka) dan pilihan siswa beserta keterangan predikatnya.
          </p>
        </div>

        {statusMessage && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Add Custom Activity Form */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto">
          <h2 className="text-xs font-bold text-slate-700 uppercase">Tambah Jenis Ekstrakurikuler</h2>
          <p className="text-[11px] text-slate-400">Pramuka, Olahraga, Kesenian, UKS, dll.</p>
        </div>

        <form onSubmit={handleAddActivityType} className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            required
            value={newExtraName}
            onChange={(e) => setNewExtraName(e.target.value)}
            placeholder="Nama ekstrakurikuler baru..."
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </form>
      </div>

      {/* Student List & Extra records */}
      <div className="space-y-4">
        {activeStudents.map((student, idx) => {
          const studentExtras = currentSemesterExtra[student.id] || [];

          return (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {student.noUrut || idx + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{student.namaLengkap}</span>
                  <span className="text-[11px] text-slate-400">({student.nisn})</span>
                </div>

                {/* Quick Add Extracurricular Dropdown */}
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddStudentExtra(student.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-slate-50 text-slate-700"
                  >
                    <option value="" disabled>
                      + Tambah Kegiatan...
                    </option>
                    {extracurricularList.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table for this student */}
              {studentExtras.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Belum ada ekstrakurikuler yang ditambahkan untuk siswa ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {studentExtras.map((record, rIdx) => (
                    <div
                      key={record.ekskulId}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
                    >
                      <div className="w-36 font-bold text-slate-800 shrink-0 flex items-center space-x-1.5">
                        <span className="text-slate-400">{rIdx + 1}.</span>
                        <span>{record.namaEkskul}</span>
                      </div>

                      <div className="flex-1 w-full flex items-center space-x-2">
                        <label className="text-[11px] font-semibold text-slate-500 shrink-0">
                          Keterangan / Predikat:
                        </label>
                        <select
                          value={
                            record.keterangan === 'Sangat Baik' || record.keterangan === 'Cukup'
                              ? record.keterangan
                              : 'Baik'
                          }
                          onChange={(e) =>
                            handleUpdateStudentKeterangan(
                              student.id,
                              record.ekskulId,
                              e.target.value
                            )
                          }
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Sangat Baik">Sangat Baik</option>
                          <option value="Baik">Baik</option>
                          <option value="Cukup">Cukup</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleRemoveStudentExtra(student.id, record.ekskulId)}
                        className="p-1 text-red-500 hover:text-red-700 self-end sm:self-center"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
