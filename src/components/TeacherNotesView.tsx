import React, { useState } from 'react';
import { MessageSquare, Check, Sparkles, Lightbulb } from 'lucide-react';
import { Student, TeacherNotesDatabase } from '../types';

interface TeacherNotesViewProps {
  students: Student[];
  teacherNotes: TeacherNotesDatabase;
  semester: 1 | 2;
  onUpdateNotes: (updated: TeacherNotesDatabase) => void;
}

const NOTE_TEMPLATES = [
  'Pertahankan prestasimu, teruslah rajin belajar dan beribadah, serta jadilah teladan bagi teman-temanmu di kelas.',
  'Tingkatkan fokus saat pembelajaran dan lebih aktif bertanya di kelas. Kamu memiliki potensi dan bakat yang luar biasa.',
  'Ananda memiliki sikap santun, ramah, dan berakhlak baik. Tingkatkan lagi kemandirian dalam mengerjakan tugas-tugas sekolah.',
  'Tingkatkan kehadiran, konsentrasi belajar, dan kedisiplinan mengulang materi di rumah agar hasil capaian semakin maksimal.',
  'Semangat belajar ananda sangat membanggakan. Teruslah berkreasi, asah bakat kepemimpinan, dan selalu rendah hati.',
];

export const TeacherNotesView: React.FC<TeacherNotesViewProps> = ({
  students,
  teacherNotes,
  semester,
  onUpdateNotes,
}) => {
  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const currentSemesterNotes = teacherNotes[semester] || {};
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleNoteChange = (studentId: string, val: string) => {
    onUpdateNotes({
      ...teacherNotes,
      [semester]: {
        ...currentSemesterNotes,
        [studentId]: val,
      },
    });
  };

  const handleApplyTemplate = (studentId: string, template: string) => {
    onUpdateNotes({
      ...teacherNotes,
      [semester]: {
        ...currentSemesterNotes,
        [studentId]: template,
      },
    });
    setStatusMessage('Template motivasi diterapkan.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>Catatan Wali Kelas - Semester {semester}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Berikan catatan motivasi, arahan, dan apresiasi personal dari guru kelas untuk dicetak pada lembar rapor siswa.
          </p>
        </div>

        {statusMessage && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Template Suggestions Box */}
      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200 text-xs space-y-2">
        <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
          <Lightbulb className="w-4 h-4 text-indigo-600" />
          <span>Contoh Frasa & Inspirasi Catatan Wali Kelas:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-indigo-800 text-[11px]">
          {NOTE_TEMPLATES.map((tpl, idx) => (
            <div key={idx} className="bg-white p-2 rounded-lg border border-indigo-100 flex items-start space-x-1.5">
              <span className="font-bold text-indigo-500">•</span>
              <p className="italic">{tpl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Notes List */}
      <div className="space-y-4">
        {activeStudents.map((student, idx) => {
          const note = currentSemesterNotes[student.id] || '';

          return (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-indigo-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                    {student.noUrut || idx + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{student.namaLengkap}</span>
                  <span className="text-[11px] text-slate-400">({student.nisn})</span>
                </div>

                {/* Quick Templates Buttons */}
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-400 mr-1 flex items-center">
                    <Sparkles className="w-3 h-3 text-amber-500 mr-0.5" />
                    Pilih Cepat:
                  </span>
                  {NOTE_TEMPLATES.map((tpl, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => handleApplyTemplate(student.id, tpl)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 font-semibold border border-slate-200"
                      title={tpl}
                    >
                      Opsi {tIdx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => handleNoteChange(student.id, e.target.value)}
                  placeholder={`Tulis catatan khusus wali kelas untuk ${student.namaLengkap}...`}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed text-slate-800"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
