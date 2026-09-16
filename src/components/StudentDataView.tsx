import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Check,
  FileSpreadsheet,
  X,
  AlertCircle,
  FileDown,
} from 'lucide-react';
import { Student } from '../types';
import {
  exportStudentsToExcel,
  downloadStudentImportTemplate,
  parseStudentsFromExcel,
} from '../utils/excelHelper';

interface StudentDataViewProps {
  students: Student[];
  className: string;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBatchAddStudents: (newStudents: Partial<Student>[]) => void;
}

export const StudentDataView: React.FC<StudentDataViewProps> = ({
  students,
  className,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBatchAddStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Pindah' | 'Keluar' | 'Lulus'>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Form state
  const defaultFormData: Omit<Student, 'id'> = {
    noUrut: (students.length > 0 ? Math.max(...students.map((s) => s.noUrut || 0)) + 1 : 1),
    namaLengkap: '',
    nis: '',
    nisn: '',
    jenisKelamin: 'L',
    tempatLahir: '',
    tanggalLahir: '2014-01-01',
    agama: 'Islam',
    alamat: '',
    namaAyah: '',
    namaIbu: '',
    namaWali: '-',
    noKK: '',
    nik: '',
    status: 'Aktif',
  };

  const [formData, setFormData] = useState<Omit<Student, 'id'>>(defaultFormData);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        s.namaLengkap.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'Semua' || s.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => (a.noUrut || 0) - (b.noUrut || 0));
  }, [students, searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      ...defaultFormData,
      noUrut: (students.length > 0 ? Math.max(...students.map((s) => s.noUrut || 0)) + 1 : 1),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      noUrut: student.noUrut,
      namaLengkap: student.namaLengkap,
      nis: student.nis,
      nisn: student.nisn,
      jenisKelamin: student.jenisKelamin,
      tempatLahir: student.tempatLahir,
      tanggalLahir: student.tanggalLahir,
      agama: student.agama,
      alamat: student.alamat,
      namaAyah: student.namaAyah,
      namaIbu: student.namaIbu,
      namaWali: student.namaWali || '-',
      noKK: student.noKK || '',
      nik: student.nik || '',
      status: student.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdateStudent({ ...formData, id: editingStudent.id });
    } else {
      onAddStudent(formData);
    }
    setIsModalOpen(false);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImportStatus('Membaca file Excel...');
        const parsed = await parseStudentsFromExcel(file);
        if (parsed.length === 0) {
          alert('File Excel tidak memiliki data siswa yang dapat dibaca.');
          setImportStatus(null);
          return;
        }
        onBatchAddStudents(parsed);
        setImportStatus(`Berhasil mengimpor ${parsed.length} siswa!`);
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        console.error(err);
        alert('Gagal mengimpor file Excel. Pastikan format tabel sesuai template.');
        setImportStatus(null);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Data Siswa ({students.length} Terdaftar)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola identitas lengkap peserta didik untuk cover, biodata, dan penerbitan rapor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={downloadStudentImportTemplate}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 border border-slate-300 transition-colors"
            title="Unduh format Excel untuk import data"
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

          {/* Export Excel */}
          <button
            onClick={() => exportStudentsToExcel(students, className)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 border border-slate-300 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {/* Add Student */}
          <button
            id="btn-add-student"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIS, atau NISN..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Pindah">Pindah</option>
            <option value="Keluar">Keluar</option>
            <option value="Lulus">Lulus</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Nama Peserta Didik</th>
                <th className="py-3 px-3">NIS / NISN</th>
                <th className="py-3 px-3 text-center">L/P</th>
                <th className="py-3 px-3">TTL</th>
                <th className="py-3 px-3">Nama Orang Tua</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-500">
                      {s.noUrut}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.namaLengkap}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{s.alamat}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      <div>{s.nis || '-'}</div>
                      <div className="text-slate-400 text-[10px]">{s.nisn || '-'}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {s.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{s.tempatLahir}</div>
                      <div className="text-[10px] text-slate-400">{s.tanggalLahir}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>Ayah: {s.namaAyah || '-'}</div>
                      <div>Ibu: {s.namaIbu || '-'}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                          title="Hapus Siswa"
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 animate-scale-up">
            <div className="flex items-center space-x-3 text-red-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-800">Konfirmasi Hapus Siswa</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Apakah Anda yakin ingin menghapus data siswa ini beserta seluruh nilai dan catatan rapornya? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Urut Absen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.noUrut}
                    onChange={(e) => setFormData((p) => ({ ...p, noUrut: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap Siswa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData((p) => ({ ...p, namaLengkap: e.target.value }))}
                    placeholder="Contoh: Ahmad Fauzan Pratama"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData((p) => ({ ...p, nis: e.target.value }))}
                    placeholder="Nomor Induk Siswa"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NISN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData((p) => ({ ...p, nisn: e.target.value }))}
                    placeholder="10 digit NISN"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData((p) => ({ ...p, jenisKelamin: e.target.value as 'L' | 'P' }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData((p) => ({ ...p, tempatLahir: e.target.value }))}
                    placeholder="Contoh: Jakarta"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData((p) => ({ ...p, tanggalLahir: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Agama</label>
                  <select
                    value={formData.agama}
                    onChange={(e) => setFormData((p) => ({ ...p, agama: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Ayah Kandung</label>
                  <input
                    type="text"
                    value={formData.namaAyah}
                    onChange={(e) => setFormData((p) => ({ ...p, namaAyah: e.target.value }))}
                    placeholder="Nama Ayah"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Ibu Kandung</label>
                  <input
                    type="text"
                    value={formData.namaIbu}
                    onChange={(e) => setFormData((p) => ({ ...p, namaIbu: e.target.value }))}
                    placeholder="Nama Ibu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Wali (Jika Ada)</label>
                  <input
                    type="text"
                    value={formData.namaWali}
                    onChange={(e) => setFormData((p) => ({ ...p, namaWali: e.target.value }))}
                    placeholder="Nama Wali / -"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">NIK Siswa (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData((p) => ({ ...p, nik: e.target.value }))}
                    placeholder="16 digit NIK"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor KK (Opsional)</label>
                  <input
                    type="text"
                    value={formData.noKK}
                    onChange={(e) => setFormData((p) => ({ ...p, noKK: e.target.value }))}
                    placeholder="16 digit No KK"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pindah">Pindah</option>
                    <option value="Keluar">Keluar</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>
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
                  {editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
