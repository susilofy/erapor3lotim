import React from 'react';
import { Student, SchoolInfo, ReportSettings } from '../../types';

interface StudentBiodataPageProps {
  student: Student;
  school: SchoolInfo;
  reportSettings: ReportSettings;
}

export const StudentBiodataPage: React.FC<StudentBiodataPageProps> = ({
  student,
  school,
  reportSettings,
}) => {
  return (
    <div
      className="report-page a4-page p-[1.25cm] bg-white text-black border border-black print:border-none shadow-md print:shadow-none min-h-[297mm] w-[210mm] mx-auto box-border font-serif flex flex-col justify-between text-black"
      style={{ boxSizing: 'border-box' }}
    >
      <div>
        <div className="text-center pb-4 border-b-2 border-black text-black">
          <h2 className="text-base font-bold uppercase tracking-wider text-black">
            KETERANGAN TENTANG DIRI PESERTA DIDIK
          </h2>
        </div>

        <div className="mt-5 space-y-4 font-sans text-xs text-black">
          <table className="w-full text-left text-black">
            <tbody className="space-y-1">
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">1.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Nama Peserta Didik (Lengkap)</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 font-bold uppercase text-black">{student.namaLengkap}</td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">2.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Nomor Induk Siswa (NIS)</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 font-mono text-black">{student.nis}</td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">3.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Nomor Induk Siswa Nasional (NISN)</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 font-mono text-black">{student.nisn}</td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">4.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Tempat, Tanggal Lahir</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 text-black">
                  {student.tempatLahir}, {student.tanggalLahir}
                </td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">5.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Jenis Kelamin</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 text-black">
                  {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">6.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Agama</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 text-black">{student.agama}</td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">7.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Pendidikan Sebelumnya</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 text-black">TK / RA / Paud</td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">8.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Alamat Peserta Didik</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 leading-relaxed text-black">{student.alamat}</td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">9.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Nama Orang Tua</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 text-black">
                  <div>a. Ayah : {student.namaAyah || '-'}</div>
                  <div>b. Ibu : {student.namaIbu || '-'}</div>
                </td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">10.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Pekerjaan Orang Tua</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 text-black">
                  <div>a. Ayah : Karyawan / Wiraswasta</div>
                  <div>b. Ibu : Ibu Rumah Tangga</div>
                </td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">11.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Alamat Orang Tua</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 text-black">{student.alamat}</td>
              </tr>
              <tr className="align-top">
                <td className="w-8 py-1.5 font-bold text-black">12.</td>
                <td className="w-60 py-1.5 font-semibold text-black">Wali Peserta Didik</td>
                <td className="w-4 py-1.5 text-center text-black">:</td>
                <td className="py-1.5 text-black">
                  <div>a. Nama Wali : {student.namaWali || '-'}</div>
                  <div>b. Pekerjaan Wali : -</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo & Signature Section */}
      <div className="mt-6 pt-3 border-t border-black flex justify-end items-end gap-6 sm:gap-8 font-sans text-black">
        {/* Photo 3x4 diletakkan dekat di sebelah kiri blok tanda tangan kepala sekolah */}
        <div className="w-28 h-36 border-2 border-dashed border-black bg-white flex items-center justify-center text-center p-2 text-[10px] text-black font-semibold shrink-0 mb-1">
          Pas Foto<br />3 x 4 cm
        </div>

        {/* Headmaster Signature Block */}
        <div className="text-center w-64 space-y-1 text-xs text-black shrink-0">
          <p className="text-black">
            {reportSettings.tempatRapor},{' '}
            {new Date(reportSettings.tanggalRapor).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="font-semibold text-black">Kepala Sekolah,</p>

          <div className="h-20 flex items-center justify-center">
            {reportSettings.modeTandaTangan === 'gambar' && school.tandaTanganKepsek ? (
              <img
                src={school.tandaTanganKepsek}
                alt="TTD Kepsek"
                className="max-h-full max-w-[150px] object-contain"
              />
            ) : null}
          </div>

          <p className="font-bold underline uppercase text-black">
            {school.namaKepalaSekolah}
          </p>
          <p className="font-mono text-[11px] text-black">NIP. {school.nipKepalaSekolah}</p>
        </div>
      </div>

      {/* 6 Spasi Kosong di Bawah Tanda Tangan */}
      <div className="h-14 flex flex-col justify-around py-1" aria-hidden="true">
        <div className="h-2"></div>
        <div className="h-2"></div>
        <div className="h-2"></div>
        <div className="h-2"></div>
        <div className="h-2"></div>
        <div className="h-2"></div>
      </div>

      <div className="pt-2.5 mt-2 border-t border-black font-sans text-[10px] text-black flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2 font-medium text-black">
          <span className="font-bold text-black">{school.namaSekolah}</span>
          <span className="text-black">|</span>
          <span className="text-black">Biodata Siswa</span>
          <span className="text-black">|</span>
          <span className="font-semibold uppercase text-black">{student.namaLengkap}</span>
        </div>
        <span className="font-medium text-black">Halaman 3</span>
      </div>
    </div>
  );
};
