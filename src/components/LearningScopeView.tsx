import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  Filter,
  FileSpreadsheet,
  Upload,
  FileDown,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { Subject, LingkupMateri } from '../types';
import {
  exportLearningScopesToExcel,
  downloadLearningScopeImportTemplate,
  parseLearningScopesFromExcel,
} from '../utils/excelHelper';

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
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
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
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDeleteScope = (id: string) => {
    if (confirm('Hapus lingkup materi ini? Nilai terkait akan terhapus.')) {
      onUpdateScopes(learningScopes.filter((lm) => lm.id !== id));
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    downloadLearningScopeImportTemplate(subjects, semester, selectedSubjectId);
  };

  // Import Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Membaca file Excel Lingkup Materi...');
      const parsed = await parseLearningScopesFromExcel(file, subjects, semester, selectedSubjectId);
      if (parsed.length === 0) {
        alert('File Excel tidak memiliki baris materi yang valid. Pastikan terdapat kolom Judul / Capaian Pembelajaran.');
        setImportStatus(null);
        return;
      }

      // Merge intelligently into existing learningScopes:
      // If same (subjectId, semester, kode) -> update judul & kktp
      // Otherwise -> add new
      let updatedScopes = [...learningScopes];
      let addedCount = 0;
      let updatedCount = 0;

      parsed.forEach((newItem) => {
        const existingIdx = updatedScopes.findIndex(
          (s) =>
            s.subjectId === newItem.subjectId &&
            s.semester === newItem.semester &&
            s.kode.toLowerCase().trim() === newItem.kode.toLowerCase().trim()
        );

        if (existingIdx >= 0) {
          updatedScopes[existingIdx] = {
            ...updatedScopes[existingIdx],
            judul: newItem.judul,
            kktp: newItem.kktp,
            isActive: true,
          };
          updatedCount++;
        } else {
          updatedScopes.push({
            id: `lm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            subjectId: newItem.subjectId,
            kode: newItem.kode,
            judul: newItem.judul,
            kktp: newItem.kktp,
            semester: newItem.semester,
            isActive: true,
          });
          addedCount++;
        }
      });

      onUpdateScopes(updatedScopes);
      setStatusMessage(
        `Berhasil mengimpor ${parsed.length} Lingkup Materi (${addedCount} baru, ${updatedCount} diperbarui)!`
      );
      setImportStatus(null);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Error importing Lingkup Materi:', err);
      alert('Gagal mengimpor file Excel Lingkup Materi. Pastikan format tabel sesuai template.');
      setImportStatus(null);
    }
    e.target.value = '';
  };

  // Export Current Subject
  const handleExportCurrentSubject = () => {
    exportLearningScopesToExcel(learningScopes, subjects, semester, selectedSubjectId);
    setIsExportMenuOpen(false);
  };

  // Export All Subjects
  const handleExportAllSubjects = () => {
    exportLearningScopesToExcel(learningScopes, subjects, semester, 'all');
    setIsExportMenuOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Excel Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Lingkup Materi (Sumatif) - Semester {semester}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tentukan materi atau tujuan pembelajaran yang dinilai secara sumatif (LM 1 s.d LM 4) untuk setiap mata pelajaran.
          </p>
        </div>

        {/* Toolbar: Template, Import, Export, Add */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Download Template */}
          <button
            onClick={handleDownloadTemplate}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 border border-slate-300 transition-colors"
            title="Unduh format tabel Excel untuk pengisian lingkup materi"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span>Template Excel</span>
          </button>

          {/* Import Excel */}
          <label className="cursor-pointer px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-1.5 border border-emerald-300 transition-colors">
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>Import Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>

          {/* Export Excel Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1 border border-slate-300 transition-colors"
              title="Ekspor daftar lingkup materi ke file Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs animate-fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pilihan Ekspor Excel
                </div>
                <button
                  onClick={handleExportCurrentSubject}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700 font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Mapel Ini ({selectedSubject?.nama})</span>
                </button>
                <button
                  onClick={handleExportAllSubjects}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700 font-medium border-t border-slate-100"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Semua Mata Pelajaran</span>
                </button>
              </div>
            )}
          </div>

          {/* Tambah Lingkup Materi Manual */}
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah LM</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center space-x-2 animate-pulse">
          <Upload className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

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
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">
                        Belum ada lingkup materi untuk {selectedSubject?.nama} di Semester {semester}.
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Anda dapat menambahkan materi secara manual, atau mengunggah sekaligus melalui file Excel.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleOpenAdd}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Manual</span>
                      </button>
                      <button
                        onClick={handleDownloadTemplate}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs flex items-center space-x-1 border border-slate-300"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Unduh Template Excel</span>
                      </button>
                    </div>
                  </div>
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
