import React, { useState } from 'react';
import { CalendarCheck, Check, RotateCcw } from 'lucide-react';
import { Student, AttendanceDatabase, AttendanceRecord } from '../types';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceDatabase;
  semester: 1 | 2;
  onUpdateAttendance: (updated: AttendanceDatabase) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  semester,
  onUpdateAttendance,
}) => {
  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const currentSemesterAttendance = attendance[semester] || {};
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAttendanceChange = (
    studentId: string,
    field: keyof AttendanceRecord,
    valStr: string
  ) => {
    const num = Math.max(0, parseInt(valStr) || 0);
    const existing = currentSemesterAttendance[studentId] || { sakit: 0, izin: 0, alpa: 0 };
    const updatedRecord = { ...existing, [field]: num };

    onUpdateAttendance({
      ...attendance,
      [semester]: {
        ...currentSemesterAttendance,
        [studentId]: updatedRecord,
      },
    });
  };

  const handleSetAllZero = () => {
    const newRecords: Record<string, AttendanceRecord> = {};
    activeStudents.forEach((s) => {
      newRecords[s.id] = { sakit: 0, izin: 0, alpa: 0 };
    });

    onUpdateAttendance({
      ...attendance,
      [semester]: newRecords,
    });
    setStatusMessage('Seluruh absensi diatur ke 0 hari (Nihil).');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <span>Rekap Kehadiran Siswa - Semester {semester}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Input jumlah hari ketidakhadiran siswa selama satu semester (Sakit, Izin, Tanpa Keterangan).
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleSetAllZero}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 border border-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Set Semua 0 (Hadir Penuh)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Nama Lengkap Peserta Didik</th>
                <th className="py-3 px-3 text-center w-28">
                  Sakit (hari)
                </th>
                <th className="py-3 px-3 text-center w-28">
                  Izin (hari)
                </th>
                <th className="py-3 px-3 text-center w-28">
                  Tanpa Keterangan (hari)
                </th>
                <th className="py-3 px-4 text-center w-36">Total Absen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {activeStudents.map((student, idx) => {
                const rec = currentSemesterAttendance[student.id] || {
                  sakit: 0,
                  izin: 0,
                  alpa: 0,
                };
                const total = (rec.sakit || 0) + (rec.izin || 0) + (rec.alpa || 0);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                      {student.noUrut || idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-800">
                      <div>{student.namaLengkap}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">
                        NIS: {student.nis}
                      </div>
                    </td>

                    {/* Sakit */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={150}
                        value={rec.sakit}
                        onChange={(e) =>
                          handleAttendanceChange(student.id, 'sakit', e.target.value)
                        }
                        className="w-16 px-2 py-1.5 border border-slate-300 rounded text-center text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Izin */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={150}
                        value={rec.izin}
                        onChange={(e) =>
                          handleAttendanceChange(student.id, 'izin', e.target.value)
                        }
                        className="w-16 px-2 py-1.5 border border-slate-300 rounded text-center text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Alpa */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={150}
                        value={rec.alpa}
                        onChange={(e) =>
                          handleAttendanceChange(student.id, 'alpa', e.target.value)
                        }
                        className={`w-16 px-2 py-1.5 border rounded text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          rec.alpa > 0
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : 'border-slate-300 text-slate-800'
                        }`}
                      />
                    </td>

                    {/* Total */}
                    <td className="py-2.5 px-4 text-center font-bold">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs ${
                          total === 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : total > 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {total} hari
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
