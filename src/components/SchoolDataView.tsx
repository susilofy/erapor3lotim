import React, { useState, useEffect } from 'react';
import { School, Upload, Check, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { SchoolInfo } from '../types';
import { DEFAULT_SCHOOL_LOGO } from '../data/defaultData';
import { TUT_WURI_LOGO_PNG } from '../data/logoBase64';
import { getCustomDefaultLogo, setCustomDefaultLogo, clearCustomDefaultLogo } from '../utils/storageHelper';

interface SchoolDataViewProps {
  school: SchoolInfo;
  onUpdate: (updated: SchoolInfo) => void;
}

export const SchoolDataView: React.FC<SchoolDataViewProps> = ({ school, onUpdate }) => {
  const [formData, setFormData] = useState<SchoolInfo>(school);
  const [isSaved, setIsSaved] = useState(false);
  const [logoNotice, setLogoNotice] = useState<string | null>(null);

  // Sync with prop updates
  useEffect(() => {
    setFormData(school);
  }, [school]);

  // Pastikan logo kustom sekolah yang sudah diunggah tersimpan sebagai default
  useEffect(() => {
    if (
      school.logoSekolah &&
      school.logoSekolah !== TUT_WURI_LOGO_PNG &&
      !school.logoSekolah.includes('SD Negeri 1 Nusantara')
    ) {
      setCustomDefaultLogo(school.logoSekolah);
    }
  }, [school.logoSekolah]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          const updated = { ...formData, logoSekolah: base64 };
          setFormData(updated);
          // Simpan secara permanen sebagai logo default kustom sekolah
          setCustomDefaultLogo(base64);
          // Langsung perbarui database utama agar instan tercermin di Cover, Rapor, dan Leger
          onUpdate(updated);
          setLogoNotice('Logo baru berhasil diunggah & dijadikan sebagai default sekolah!');
          setTimeout(() => setLogoNotice(null), 4000);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleUseTutWuriLogo = () => {
    const updated = { ...formData, logoSekolah: TUT_WURI_LOGO_PNG };
    setFormData(updated);
    onUpdate(updated);
    setLogoNotice('Beralih ke Logo Kemendikbud (Tut Wuri Handayani). Logo kustom Anda tetap tersimpan!');
    setTimeout(() => setLogoNotice(null), 4000);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUseCustomDefault = () => {
    const custom = getCustomDefaultLogo();
    if (custom) {
      const updated = { ...formData, logoSekolah: custom };
      setFormData(updated);
      onUpdate(updated);
      setLogoNotice('Logo default kustom hasil upload kembali aktif!');
      setTimeout(() => setLogoNotice(null), 4000);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleResetToKemdikbud = () => {
    clearCustomDefaultLogo();
    const updated = { ...formData, logoSekolah: TUT_WURI_LOGO_PNG };
    setFormData(updated);
    onUpdate(updated);
    setLogoNotice('Berhasil direset ke Logo Standar Kemendikbud resmi.');
    setTimeout(() => setLogoNotice(null), 4000);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.logoSekolah &&
      formData.logoSekolah !== TUT_WURI_LOGO_PNG &&
      !formData.logoSekolah.includes('SD Negeri 1 Nusantara')
    ) {
      setCustomDefaultLogo(formData.logoSekolah);
    }
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const savedCustomLogo = getCustomDefaultLogo();
  const isCustomActive = Boolean(formData.logoSekolah && formData.logoSekolah !== TUT_WURI_LOGO_PNG);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <School className="w-5 h-5 text-blue-600" />
            <span>Data Sekolah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Informasi satuan pendidikan ini akan otomatis tercantum pada Cover, Biodata, dan Lembar Rapor.
          </p>
        </div>

        {isSaved && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Data sekolah tersimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo and Core Identity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Logo Section */}
          <div className="flex flex-col p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Logo Sekolah</span>
              {isCustomActive ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Logo Unggahan (Default)
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                  Logo Kemendikbud
                </span>
              )}
            </div>

            {/* Current Active Preview */}
            <div className="w-full h-32 rounded-lg bg-white p-2 border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden mb-3">
              {formData.logoSekolah ? (
                <img
                  src={formData.logoSekolah}
                  alt="Logo Sekolah Aktif"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <School className="w-12 h-12 text-slate-300" />
              )}
            </div>

            {/* Pilihan Default Logo Header */}
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Pilihan Default Logo:</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">klik untuk ganti</span>
            </div>

            {/* Options List */}
            <div className="space-y-2 w-full mb-3">
              {/* Option 1: Logo Unggahan (Pilihan Default) */}
              <div
                onClick={savedCustomLogo ? handleUseCustomDefault : undefined}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isCustomActive
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                    : savedCustomLogo
                    ? 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                    : 'border-dashed border-slate-300 bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="opt-custom-logo"
                      name="logoOption"
                      checked={isCustomActive}
                      onChange={handleUseCustomDefault}
                      disabled={!savedCustomLogo}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="opt-custom-logo" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Logo Hasil Upload
                    </label>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">
                    Pilihan Default
                  </span>
                </div>

                {savedCustomLogo ? (
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                        <img src={savedCustomLogo} alt="Uploaded logo" className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-[10px] text-slate-500">Tersimpan sebagai default</span>
                    </div>
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Ganti File
                    </label>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1 pl-5">
                    Belum ada logo diunggah. Unggah file untuk menjadikannya pilihan default.
                  </p>
                )}
              </div>

              {/* Option 2: Logo Standar Kemendikbud */}
              <div
                onClick={handleUseTutWuriLogo}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  !isCustomActive
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="opt-tutwuri-logo"
                      name="logoOption"
                      checked={!isCustomActive}
                      onChange={handleUseTutWuriLogo}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="opt-tutwuri-logo" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Logo Kemendikbud
                    </label>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2 pt-1.5 border-t border-slate-100 pl-5">
                  <div className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    <img src={TUT_WURI_LOGO_PNG} alt="Tut Wuri Handayani" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-[10px] text-slate-500">Standar Resmi Kementerian</span>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <label
              htmlFor="logo-upload"
              className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-xs w-full text-center"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{savedCustomLogo ? 'Unggah / Ganti Logo Baru' : 'Unggah Logo Sekolah (PNG/JPG)'}</span>
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {savedCustomLogo && (
              <button
                type="button"
                onClick={handleResetToKemdikbud}
                className="mt-1 text-slate-400 hover:text-red-600 text-[10px] text-center w-full py-0.5 transition-colors"
                title="Hapus logo kustom dan kembalikan ke default Kemendikbud resmi"
              >
                Reset ke Default Kemendikbud
              </button>
            )}

            {logoNotice && (
              <div className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 mt-2 animate-fade-in text-center w-full">
                {logoNotice}
              </div>
            )}

            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Khusus logo yang sudah diunggah, otomatis diterapkan sebagai pembaharuan pilihan default dan tetap dapat dirubah/diganti kapan saja.
            </p>
          </div>

          {/* School Name, NPSN, NSS */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekolah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="namaSekolah"
                required
                value={formData.namaSekolah}
                onChange={handleChange}
                placeholder="Contoh: SD NEGERI 1 NUSANTARA"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NPSN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="npsn"
                  required
                  value={formData.npsn}
                  onChange={handleChange}
                  placeholder="Nomor Pokok Sekolah Nasional"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NSS (Jika Ada)
                </label>
                <input
                  type="text"
                  name="nss"
                  value={formData.nss}
                  onChange={handleChange}
                  placeholder="Nomor Statistik Sekolah"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Sekolah <span className="text-red-500">*</span>
              </label>
              <textarea
                name="alamat"
                required
                rows={2}
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Alamat jalan, nomor, RT/RW"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Region & Location Details */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-2">
            Wilayah Administrasi & Kontak
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Desa / Kelurahan</label>
              <input
                type="text"
                name="desaKelurahan"
                value={formData.desaKelurahan}
                onChange={handleChange}
                placeholder="Contoh: Nusantara Jaya"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kecamatan</label>
              <input
                type="text"
                name="kecamatan"
                value={formData.kecamatan}
                onChange={handleChange}
                placeholder="Contoh: Menteng"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                name="kabupaten"
                value={formData.kabupaten}
                onChange={handleChange}
                placeholder="Contoh: Kota Jakarta Pusat"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Provinsi</label>
              <input
                type="text"
                name="provinsi"
                value={formData.provinsi}
                onChange={handleChange}
                placeholder="Contoh: DKI Jakarta"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kode Pos</label>
              <input
                type="text"
                name="kodePos"
                value={formData.kodePos}
                onChange={handleChange}
                placeholder="Contoh: 10310"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nomor Telepon</label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                placeholder="Contoh: (021) 3928172"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Sekolah</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sdn@sekolah.sch.id"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Website Sekolah</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://sdn1nusantara.sch.id"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Headmaster Information */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-2">
            Pimpinan Sekolah (Kepala Sekolah)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Kepala Sekolah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="namaKepalaSekolah"
                required
                value={formData.namaKepalaSekolah}
                onChange={handleChange}
                placeholder="Contoh: Drs. H. Suryanto, M.Pd."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Kepala Sekolah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nipKepalaSekolah"
                required
                value={formData.nipKepalaSekolah}
                onChange={handleChange}
                placeholder="Contoh: 19680512 199303 1 005"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            id="btn-save-school"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan Data Sekolah</span>
          </button>
        </div>
      </form>
    </div>
  );
};
