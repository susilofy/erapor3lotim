import React, { useState } from 'react';
import {
  GraduationCap,
  Check,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Student, PromotionDatabase, ClassInfo, PromotionRecord } from '../types';

interface StudentStatusViewProps {
  students: Student[];
  promotions: PromotionDatabase;
  classInfo: ClassInfo;
  semester: 1 | 2;
  onUpdatePromotions: (updated: PromotionDatabase) => void;
}

export const StudentStatusView: React.FC<StudentStatusViewProps> = ({
  students,
  promotions,
  classInfo,
  semester,
  onUpdatePromotions,
}) => {
  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isKelas6 = classInfo.tingkat === 6;
  const nextKelasRoman = ['', 'II', 'III', 'IV', 'V', 'VI', 'SMP/MTs'][classInfo.tingkat] || 'Lanjutan';

  const handleStatusChange = (
    studentId: string,
    status: 'Naik' | 'Tinggal' | 'Lulus' | 'Tidak Lulus',
    keterangan: string
  ) => {
    const updated: PromotionDatabase = {
      ...promotions,
      [studentId]: { status, keterangan },
    };
    onUpdatePromotions(updated);
  };

  const handleSetAllPromoted = () => {
    const updated: PromotionDatabase = { ...promotions };
    activeStudents.forEach((s) => {
      updated[s.id] = {
        status: isKelas6 ? 'Lulus' : 'Naik',
        keterangan: isKelas6
          ? 'Dinyatakan Lulus dari Satuan Pendidikan SD'
          : `Naik ke Kelas ${nextKelasRoman}`,
      };
    });

    onUpdatePromotions(updated);
    setStatusMessage(
      isKelas6
        ? 'Semua siswa berhasil ditandai LULUS!'
        : `Semua siswa berhasil ditandai NAIK KE KELAS ${nextKelasRoman}!`
    );
    setTimeout(() => setStatusMessage(null), 3000);
  };

  if (semester === 1) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Status Kenaikan Kelas / Kelulusan</span>
          </h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 space-y-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <h2 className="font-bold text-sm">Status Kenaikan Kelas Hanya Berlaku pada Semester 2</h2>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Sesuai pedoman Kurikulum Merdeka Kemendikbudristek, penetapan status kenaikan kelas untuk Kelas 1 s.d 5 atau kelulusan untuk Kelas 6 <strong>hanya dilakukan pada akhir Semester 2 (Genap)</strong>.
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Pada rapor Semester 1 (Ganjil), kolom keputusan kenaikan kelas / kelulusan tidak dicantumkan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>
              {isKelas6
                ? 'Penentuan Status Kelulusan (Kelas VI) - Semester 2'
                : `Penentuan Status Kenaikan Kelas (${classInfo.namaKelas}) - Semester 2`}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isKelas6
              ? 'Tentukan keputusan kelulusan peserta didik kelas VI menuju jenjang SMP/MTs.'
              : `Tentukan keputusan kenaikan kelas peserta didik menuju Kelas ${nextKelasRoman}.`}
          </p>
        </div>

        <button
          onClick={handleSetAllPromoted}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isKelas6 ? 'Tandai Semua Siswa Lulus' : 'Tandai Semua Siswa Naik Kelas'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Info Format Rapor */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start space-x-2.5">
        <span className="text-base leading-none pt-0.5">ℹ️</span>
        <div className="leading-relaxed">
          <div className="font-semibold text-blue-950">Format Kalimat pada Lembar Rapor (Bagian F. Keputusan Akhir Tahun):</div>
          <div className="mt-0.5 text-slate-700 italic">
            &ldquo;Berdasarkan pencapaian seluruh kompetensi, peserta didik dinyatakan: <span className="font-semibold text-slate-900 not-italic underline decoration-slate-400">[Keterangan yang Dicetak di Rapor]</span>&rdquo;
          </div>
        </div>
      </div>

      {/* Decision Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-3 text-center w-12">No</th>
              <th className="py-3 px-4">Nama Lengkap Siswa</th>
              <th className="py-3 px-4 text-center w-40">Status Keputusan</th>
              <th className="py-3 px-4">Keterangan yang Dicetak di Rapor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeStudents.map((student, idx) => {
              const current: PromotionRecord = promotions[student.id] || {
                status: isKelas6 ? 'Lulus' : 'Naik',
                keterangan: isKelas6
                  ? 'Dinyatakan Lulus dari Satuan Pendidikan SD'
                  : `Naik ke Kelas ${nextKelasRoman}`,
              };

              return (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-slate-500">
                    {student.noUrut || idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    <div>{student.namaLengkap}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">
                      NISN: {student.nisn}
                    </div>
                  </td>

                  {/* Status Picker */}
                  <td className="py-3 px-4 text-center">
                    {isKelas6 ? (
                      <select
                        value={current.status}
                        onChange={(e) => {
                          const val = e.target.value as 'Lulus' | 'Tidak Lulus';
                          handleStatusChange(
                            student.id,
                            val,
                            val === 'Lulus'
                              ? 'Dinyatakan Lulus dari Satuan Pendidikan SD'
                              : 'Tidak Lulus'
                          );
                        }}
                        className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          current.status === 'Lulus'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                      >
                        <option value="Lulus">Lulus</option>
                        <option value="Tidak Lulus">Tidak Lulus</option>
                      </select>
                    ) : (
                      <select
                        value={current.status}
                        onChange={(e) => {
                          const val = e.target.value as 'Naik' | 'Tinggal';
                          handleStatusChange(
                            student.id,
                            val,
                            val === 'Naik'
                              ? `Naik ke Kelas ${nextKelasRoman}`
                              : `Tinggal di Kelas ${classInfo.namaKelas}`
                          );
                        }}
                        className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          current.status === 'Naik'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                      >
                        <option value="Naik">Naik Kelas</option>
                        <option value="Tinggal">Tinggal Kelas</option>
                      </select>
                    )}
                  </td>

                  {/* Text for report card */}
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={current.keterangan}
                      onChange={(e) =>
                        handleStatusChange(student.id, current.status, e.target.value)
                      }
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
