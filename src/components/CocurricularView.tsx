import React, { useState } from 'react';
import { Sparkles, Check, Lightbulb } from 'lucide-react';
import { Student, CocurricularDatabase, CocurricularProject } from '../types';

interface CocurricularViewProps {
  students: Student[];
  cocurricular: CocurricularDatabase;
  semester: 1 | 2;
  onUpdateCocurricular: (updated: CocurricularDatabase) => void;
}

const SAMPLE_TEMPLATES = [
  'Ananda sudah sangat baik dalam bernalar kritis dan bergotong royong, serta aktif berpartisipasi dalam setiap tahapan projek.',
  'Ananda menunjukkan kepedulian tinggi terhadap lingkungan, kreatif dalam merancang karya, dan santun saat bekerja sama dalam kelompok.',
  'Ananda menunjukkan perkembangan yang baik dalam kerja sama, serta perlu terus didampingi dalam mengomunikasikan ide secara percaya diri.',
  'Ananda mandiri dan bertanggung jawab menyelesaikan tugas projek tepat waktu, serta mampu menghargai pendapat rekan satu tim.',
];

export const CocurricularView: React.FC<CocurricularViewProps> = ({
  students,
  cocurricular,
  semester,
  onUpdateCocurricular,
}) => {
  const activeStudents = students.filter((s) => s.status === 'Aktif');

  const currentProject: CocurricularProject = cocurricular[semester] || {
    tema: '',
    deskripsi: '',
    capaianSiswa: {},
  };

  const [tema, setTema] = useState(currentProject.tema);
  const [deskripsi, setDeskripsi] = useState(currentProject.deskripsi);
  const [capaianMap, setCapaianMap] = useState<Record<string, string>>(
    currentProject.capaianSiswa || {}
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCapaianChange = (studentId: string, val: string) => {
    setCapaianMap((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleApplyTemplate = (studentId: string, template: string) => {
    setCapaianMap((prev) => ({ ...prev, [studentId]: template }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CocurricularDatabase = {
      ...cocurricular,
      [semester]: {
        tema,
        deskripsi,
        capaianSiswa: capaianMap,
      },
    };
    onUpdateCocurricular(updated);
    setStatusMessage('Data Kokurikuler (P5) berhasil disimpan!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Kokurikuler / Projek P5 - Semester {semester}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kegiatan kokurikuler mencakup projek penguatan profil pelajar Pancasila beserta narasi perkembangan karakter siswa.
          </p>
        </div>

        {statusMessage && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Project Header Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-2">
            Informasi Tema & Deskripsi Projek
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tema Projek Kokurikuler <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Contoh: Gaya Hidup Berkelanjutan: Mengolah Sampah Plastik Menjadi Karya Seni"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Singkat Kegiatan Projek
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan ringkasan tujuan dan aktivitas pelaksanaan projek kokurikuler di kelas..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Student Achievements */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Capaian Siswa pada Projek Kokurikuler
            </h2>
            <span className="text-[11px] text-slate-400">
              {activeStudents.length} Siswa Aktif
            </span>
          </div>

          <div className="space-y-4">
            {activeStudents.map((student, idx) => (
              <div
                key={student.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center justify-center">
                      {student.noUrut || idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{student.namaLengkap}</span>
                    <span className="text-[10px] text-slate-400">({student.nisn})</span>
                  </div>

                  {/* Template picker */}
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400 flex items-center mr-1">
                      <Lightbulb className="w-3 h-3 text-amber-500 mr-0.5" />
                      Template Cepat:
                    </span>
                    {SAMPLE_TEMPLATES.map((tpl, tIdx) => (
                      <button
                        key={tIdx}
                        type="button"
                        onClick={() => handleApplyTemplate(student.id, tpl)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                        title={tpl}
                      >
                        T{tIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={capaianMap[student.id] || ''}
                  onChange={(e) => handleCapaianChange(student.id, e.target.value)}
                  placeholder={`Tulis deskripsi capaian kokurikuler untuk ${student.namaLengkap}...`}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Data Kokurikuler</span>
          </button>
        </div>
      </form>
    </div>
  );
};
