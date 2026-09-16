import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Check, Filter } from 'lucide-react';
import { Subject, LingkupMateri } from '../types';

interface LearningScopeViewProps {
  subjects: Subject[];
  learningScopes: LingkupMateri[];
  semester: 1 | 2;
  onUpdateScopes: (scopes: LingkupMateri[]) => void;
}

export const LearningScopeView: React.FC<LearningScopeViewProps> = ({
  subjects,
  learningScopes,
  semester,
  onUpdateScopes,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScope, setEditingScope] = useState<LingkupMateri | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const currentScopes = learningScopes.filter(
    (lm) => lm.subjectId === selectedSubjectId && lm.semester === semester
  );

  const [formData, setFormData] = useState({
    kode: 'LM 1',
    judul: '',
    kktp: selectedSubject?.kktp || 75,
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingScope(null);
    const nextLmNumber = currentScopes.length + 1;
    setFormData({
      kode: `LM ${nextLmNumber}`,
      judul: '',
      kktp: selectedSubject?.kktp || 75,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (scope: LingkupMateri) => {
    setEditingScope(scope);
    setFormData({
      kode: scope.kode,
      judul: scope.judul,
      kktp: scope.kktp,
      isActive: scope.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScope) {
      const updated = learningScopes.map((lm) =>
        lm.id === editingScope.id
          ? {
              ...lm,
              kode: formData.kode,
              judul: formData.judul,
              kktp: formData.kktp,
              isActive: formData.isActive,
            }
          : lm
      );
      onUpdateScopes(updated);
      setStatusMessage('Lingkup materi berhasil diperbarui!');
    } else {
      const newScope: LingkupMateri = {
        id: `lm-${Date.now()}`,
        subjectId: selectedSubjectId,
        kode: formData.kode,
        judul: formData.judul,
        kktp: formData.kktp,
        semester,
        isActive: formData.isActive,
      };
      onUpdateScopes([...learningScopes, newScope]);
      setStatusMessage('Lingkup materi baru berhasil ditambahkan!');
    }
    setIsModalOpen(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteScope = (id: string) => {
    if (confirm('Hapus lingkup materi ini? Nilai terkait akan terhapus.')) {
      onUpdateScopes(learningScopes.filter((lm) => lm.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Lingkup Materi (Sumatif) - Semester {semester}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tentukan materi atau tujuan pembelajaran yang dinilai secara sumatif (misal: LM 1 s.d LM 4) untuk setiap mata pelajaran.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Lingkup Materi</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Subject Filter Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Pilih Mata Pelajaran:</span>
        </div>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full sm:w-96 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"
        >
          {subjects.filter((s) => s.isActive).map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.nama} (KKTP Mapel: {sub.kktp})
            </option>
          ))}
        </select>
      </div>

      {/* Scopes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
            Daftar Lingkup Materi: <span className="text-blue-700">{selectedSubject?.nama}</span>
          </h2>
          <span className="text-[11px] font-semibold text-slate-500">
            {currentScopes.length} Lingkup Materi Terdaftar
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-3 text-center w-16">Kode</th>
              <th className="py-3 px-4">Judul / Deskripsi Lingkup Materi</th>
              <th className="py-3 px-4 text-center w-24">KKTP LM</th>
              <th className="py-3 px-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentScopes.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  Belum ada lingkup materi untuk mata pelajaran ini di Semester {semester}.
                </td>
              </tr>
            ) : (
              currentScopes.map((scope) => (
                <tr key={scope.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">
                    {scope.kode}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 leading-relaxed">
                    {scope.judul}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200">
                      {scope.kktp}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(scope)}
                        className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"
                        title="Edit Lingkup Materi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteScope(scope.id)}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                        title="Hapus Lingkup Materi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>{editingScope ? 'Edit Lingkup Materi' : 'Tambah Lingkup Materi'}</span>
            </h3>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  disabled
                  value={selectedSubject?.nama}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Sumatif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kode}
                    onChange={(e) => setFormData((p) => ({ ...p, kode: e.target.value }))}
                    placeholder="Contoh: LM 1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    KKTP Materi <span className="text-red-500">*</span>
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
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Materi / Capaian Pembelajaran <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.judul}
                  onChange={(e) => setFormData((p) => ({ ...p, judul: e.target.value }))}
                  placeholder="Contoh: Operasi Hitung Campuran Bilangan Pecahan dan Desimal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Judul ini akan dirangkai secara otomatis menjadi narasi capaian kompetensi pada rapor.
                </p>
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
