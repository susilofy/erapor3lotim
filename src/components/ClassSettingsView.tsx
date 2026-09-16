import React, { useState } from 'react';
import { GraduationCap, Check, Calendar, MapPin, FileSignature, Calculator } from 'lucide-react';
import { ClassInfo, ReportSettings } from '../types';

interface ClassSettingsViewProps {
  classInfo: ClassInfo;
  reportSettings: ReportSettings;
  teacherName: string;
  onUpdateClass: (updated: ClassInfo) => void;
  onUpdateSettings: (updated: ReportSettings) => void;
  onSemesterChange: (sem: 1 | 2) => void;
}

export const ClassSettingsView: React.FC<ClassSettingsViewProps> = ({
  classInfo,
  reportSettings,
  teacherName,
  onUpdateClass,
  onUpdateSettings,
  onSemesterChange,
}) => {
  const [classData, setClassData] = useState<ClassInfo>(classInfo);
  const [settingsData, setSettingsData] = useState<ReportSettings>(reportSettings);
  const [isSaved, setIsSaved] = useState(false);

  const handleTingkatChange = (tingkat: number) => {
    let defaultFase: 'Fase A' | 'Fase B' | 'Fase C' = 'Fase A';
    if (tingkat >= 5) defaultFase = 'Fase C';
    else if (tingkat >= 3) defaultFase = 'Fase B';

    const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'][tingkat];
    setClassData((prev) => ({
      ...prev,
      tingkat,
      fase: defaultFase,
      namaKelas: `Kelas ${roman}`,
    }));
    setIsSaved(false);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClassData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettingsData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClass(classData);
    onUpdateSettings(settingsData);
    onSemesterChange(classData.semester);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Data Kelas & Pengaturan Rapor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi tingkat kelas, semester aktif, serta tanggal dan titimangsa pembagian rapor.
          </p>
        </div>

        {isSaved && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Pengaturan kelas tersimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class Details Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-2">
            Identitas Kelas (Kurikulum Merdeka)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={classData.tingkat}
                onChange={(e) => handleTingkatChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value={1}>Kelas 1 (Fase A)</option>
                <option value={2}>Kelas 2 (Fase A)</option>
                <option value={3}>Kelas 3 (Fase B)</option>
                <option value={4}>Kelas 4 (Fase B)</option>
                <option value={5}>Kelas 5 (Fase C)</option>
                <option value={6}>Kelas 6 (Fase C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Tampilan Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="namaKelas"
                required
                value={classData.namaKelas}
                onChange={handleClassChange}
                placeholder="Contoh: Kelas VI atau VI-A"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fase Kurikulum <span className="text-red-500">*</span>
              </label>
              <select
                name="fase"
                value={classData.fase}
                onChange={handleClassChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Fase A">Fase A (Kelas 1 - 2)</option>
                <option value="Fase B">Fase B (Kelas 3 - 4)</option>
                <option value="Fase C">Fase C (Kelas 5 - 6)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tahunAjaran"
                required
                value={classData.tahunAjaran}
                onChange={handleClassChange}
                placeholder="Contoh: 2026/2027"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wali Kelas Tercatat
              </label>
              <input
                type="text"
                name="waliKelas"
                value={classData.waliKelas || teacherName}
                onChange={handleClassChange}
                placeholder="Nama Wali Kelas"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Semester Setting Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-2 flex items-center justify-between">
            <span>Pengaturan Semester Aktif</span>
            <span className="text-[11px] text-blue-600 font-medium">Data tersimpan terpisah antar semester</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                classData.semester === 1
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="semester"
                value={1}
                checked={classData.semester === 1}
                onChange={() => setClassData((p) => ({ ...p, semester: 1 }))}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-sm text-slate-800">Semester 1 (Ganjil)</span>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluasi tengah tahun. Kolom Keterangan Naik Kelas / Lulus disembunyikan secara otomatis sesuai ketentuan dinas.
                </p>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                classData.semester === 2
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="semester"
                value={2}
                checked={classData.semester === 2}
                onChange={() => setClassData((p) => ({ ...p, semester: 2 }))}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-sm text-slate-800">Semester 2 (Genap)</span>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluasi akhir tahun. Menyertakan kolom Keterangan Naik Kelas (Kelas 1-5) atau Keterangan Lulus (Kelas 6).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Titimangsa & Signature Settings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-2">
            Titimangsa (Tempat & Tanggal Rapor)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Tempat Penerbitan Rapor <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                name="tempatRapor"
                required
                value={settingsData.tempatRapor}
                onChange={handleSettingsChange}
                placeholder="Contoh: Jakarta atau Negara"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Rapor <span className="text-red-500">*</span></span>
              </label>
              <input
                type="date"
                name="tanggalRapor"
                required
                value={settingsData.tanggalRapor}
                onChange={handleSettingsChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Calculator className="w-3.5 h-3.5 text-slate-400" />
                <span>Bentuk Nilai Sumatif & Nilai Rapor</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <label
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start space-x-3 ${
                    settingsData.formatNilai === 'desimal_2' || !settingsData.formatNilai
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-medium shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="formatNilai"
                    value="desimal_2"
                    checked={settingsData.formatNilai === 'desimal_2' || !settingsData.formatNilai}
                    onChange={() => setSettingsData((p) => ({ ...p, formatNilai: 'desimal_2' }))}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold block text-slate-800">2 Angka di Belakang Koma (Desimal)</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Contoh: 85,75 atau 80,00. Dibulatkan ke atas jika angka di belakang koma (digit berikutnya) ≥ 5.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start space-x-3 ${
                    settingsData.formatNilai === 'bulat'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-medium shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="formatNilai"
                    value="bulat"
                    checked={settingsData.formatNilai === 'bulat'}
                    onChange={() => setSettingsData((p) => ({ ...p, formatNilai: 'bulat' }))}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold block text-slate-800">Bilangan Bulat Utuh</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Contoh: 86. Dibulatkan ke atas jika desimal ≥ 0,5.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <FileSignature className="w-3.5 h-3.5 text-slate-400" />
                <span>Format Tanda Tangan pada Dokumen Cetak</span>
              </label>
              <div className="flex items-center space-x-4 mt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="modeTandaTangan"
                    value="kosong"
                    checked={settingsData.modeTandaTangan === 'kosong'}
                    onChange={() => setSettingsData((p) => ({ ...p, modeTandaTangan: 'kosong' }))}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Tanda tangan kosong (dicetak untuk ditandatangani manual & cap basah)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="modeTandaTangan"
                    value="gambar"
                    checked={settingsData.modeTandaTangan === 'gambar'}
                    onChange={() => setSettingsData((p) => ({ ...p, modeTandaTangan: 'gambar' }))}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Sertakan gambar tanda tangan digital (jika sudah diunggah)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            id="btn-save-class"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Pengaturan Kelas</span>
          </button>
        </div>
      </form>
    </div>
  );
};
