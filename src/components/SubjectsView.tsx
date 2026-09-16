import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { Subject } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  onUpdateSubjects: (subjects: Subject[]) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ subjects, onUpdateSubjects }) => {
  const [list, setList] = useState<Subject[]>(subjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ nama: '', kktp: 75, isActive: true });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({ nama: '', kktp: 75, isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ nama: subject.nama, kktp: subject.kktp, isActive: subject.isActive });
    setIsModalOpen(true);
  };

  const handleToggleActive = (id: string) => {
    const updated = list.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setList(updated);
    onUpdateSubjects(updated);
  };

  const handleKktpDirectChange = (id: string, newKktp: number) => {
    const valid = Math.max(0, Math.min(100, isNaN(newKktp) ? 75 : newKktp));
    const updated = list.map((s) => (s.id === id ? { ...s, kktp: valid } : s));
    setList(updated);
    onUpdateSubjects(updated);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      const updated = list.map((s) =>
        s.id === editingSubject.id
          ? { ...s, nama: formData.nama, kktp: formData.kktp, isActive: formData.isActive }
          : s
      );
      setList(updated);
      onUpdateSubjects(updated);
      setStatusMessage('Mata pelajaran berhasil diperbarui!');
    } else {
      const newSubject: Subject = {
        id: `sub-${Date.now()}`,
        no: list.length + 1,
        nama: formData.nama,
        kktp: formData.kktp,
        isActive: formData.isActive,
      };
      const updated = [...list, newSubject];
      setList(updated);
      onUpdateSubjects(updated);
      setStatusMessage('Mata pelajaran baru berhasil ditambahkan!');
    }
    setIsModalOpen(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      const updated = list
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, no: idx + 1 }));
      setList(updated);
      onUpdateSubjects(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Data Mata Pelajaran & KKTP</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) digunakan sistem untuk menentukan capaian baik dan materi yang perlu bimbingan.
          </p>
        </div>

        <button
          id="btn-add-subject"
          onClick={handleOpenAdd}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Subjects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-3 text-center w-12">No</th>
              <th className="py-3 px-4">Nama Mata Pelajaran</th>
              <th className="py-3 px-4 text-center w-28">KKTP Satuan</th>
              <th className="py-3 px-3 text-center w-24">Status Rapor</th>
              <th className="py-3 px-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((sub, idx) => (
              <tr
                key={sub.id}
                className={`hover:bg-slate-50/80 transition-colors ${
                  !sub.isActive ? 'bg-slate-50/50 text-slate-400' : ''
                }`}
              >
                <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  <div className="flex items-center space-x-2">
                    <span>{sub.nama}</span>
                    {!sub.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-600">
                        Dinonaktifkan
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex items-center justify-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={sub.kktp}
                      onChange={(e) => handleKktpDirectChange(sub.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-xs font-bold text-blue-700 bg-blue-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => handleToggleActive(sub.id)}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      sub.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {sub.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"
                      title="Edit Mapel"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                      title="Hapus Mapel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Catatan Guru:</strong> Nilai KKTP dapat langsung diketik dan diubah pada tabel di atas. Nilai KKTP standar Kurikulum Merdeka pada umumnya bernilai <strong>75</strong>. Sistem akan langsung mengadaptasi perhitungan capaian kompetensi secara dinamis.
        </p>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>{editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</span>
            </h3>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))}
                  placeholder="Contoh: Muatan Lokal Bahasa Daerah"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={formData.kktp}
                  onChange={(e) => setFormData((p) => ({ ...p, kktp: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">Rentang nilai: 0 - 100</p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveCheck" className="text-slate-700 font-medium cursor-pointer">
                  Mata pelajaran aktif dan dicantumkan di rapor
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
