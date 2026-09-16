import React, { useRef, useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  FileJson,
  ShieldCheck,
} from 'lucide-react';
import { FullAppDatabase } from '../types';

interface DatabaseBackupViewProps {
  db: FullAppDatabase;
  onExportBackup: () => void;
  onRestoreBackup: (file: File) => void;
  onResetData: () => void;
  onClearTeacherStudentScopes?: () => void;
}

export const DatabaseBackupView: React.FC<DatabaseBackupViewProps> = ({
  db,
  onExportBackup,
  onRestoreBackup,
  onResetData,
  onClearTeacherStudentScopes,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClearSpecific = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengosongkan isian Data Guru/Wali, Data Siswa, Lingkup Materi, dan seluruh Nilai terkait?'
      )
    ) {
      if (onClearTeacherStudentScopes) {
        onClearTeacherStudentScopes();
        setStatusMessage('Isian data guru/wali, data siswa, dan lingkup materi berhasil dikosongkan.');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestoreBackup(file);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Cadangan Data & Pemulihan (Backup & Restore)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simpan salinan seluruh data rapor Anda ke file JSON di komputer atau pulihkan data sebelumnya dengan aman.
          </p>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Keamanan & Penyimpanan Lokal:</p>
          <p className="leading-relaxed">
            Seluruh data sekolah, siswa, nilai, dan catatan tersimpan secara otomatis di peramban (browser) Anda. Untuk keamanan berkala atau berpindah komputer/laptop, lakukan <strong>Cadangkan Data (Backup JSON)</strong> dan simpan file tersebut di flashdisk atau Google Drive Anda.
          </p>
        </div>
      </div>

      {/* 3 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-sm text-slate-800">Cadangkan Data (Export JSON)</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh seluruh berkas data aplikasi (Data Sekolah, Guru, Siswa, Nilai Semester 1 & 2, Ekskul, Absensi, dan Catatan) ke dalam satu file JSON.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onExportBackup}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Cadangan JSON</span>
            </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-sm text-slate-800">Pulihkan Data (Restore JSON)</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unggah file JSON cadangan yang pernah Anda unduh sebelumnya untuk mengembalikan seluruh isi data rapor.
            </p>
          </div>

          <div className="pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih File JSON & Pulihkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Summary Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-slate-800 uppercase tracking-wide border-b pb-2">
          Ringkasan Basis Data Aktif Saat Ini
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Sekolah</span>
            <span className="font-bold text-slate-900 truncate block">{db.school.namaSekolah}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Kelas & TA</span>
            <span className="font-bold text-slate-900 truncate block">
              {db.classInfo.namaKelas} ({db.classInfo.tahunAjaran})
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Siswa Aktif</span>
            <span className="font-bold text-slate-900 block">
              {db.students.filter((s) => s.status === 'Aktif').length} Siswa
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Mata Pelajaran</span>
            <span className="font-bold text-slate-900 block">{db.subjects.length} Mapel</span>
          </div>
        </div>
      </div>

      {/* Clear Specific Data (Guru/Wali, Siswa, Lingkup Materi) */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 text-xs space-y-3">
        <div className="flex items-center space-x-2 text-amber-900 font-bold">
          <RotateCcw className="w-4 h-4 text-amber-700" />
          <span>Kosongkan Isian Data Guru/Wali, Siswa, & Lingkup Materi</span>
        </div>
        <p className="text-amber-800 leading-relaxed text-[11px]">
          Fitur ini mengosongkan seluruh isian data guru/wali kelas, daftar siswa, lingkup materi, serta seluruh nilai dan catatan rapor yang terkait. Informasi profil sekolah dan susunan mata pelajaran tetap aman tersimpan.
        </p>
        <button
          onClick={handleClearSpecific}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kosongkan Data (Guru, Siswa, Lingkup Materi)</span>
        </button>
      </div>

      {/* Reset to Default */}
      <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 text-xs space-y-3">
        <div className="flex items-center space-x-2 text-red-800 font-bold">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Kembalikan ke Data Awal Bawaan (Factory Reset)</span>
        </div>
        <p className="text-red-700 leading-relaxed text-[11px]">
          Jika Anda ingin menghapus seluruh pengisian data saat ini dan kembali ke data contoh bawaan sistem, klik tombol di bawah ini. Pastikan Anda sudah membuat cadangan data jika diperlukan.
        </p>
        <button
          onClick={onResetData}
          className="px-4 py-2 bg-white hover:bg-red-100 text-red-700 border border-red-300 font-bold rounded-lg transition-colors flex items-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Data Bawaan</span>
        </button>
      </div>
    </div>
  );
};
