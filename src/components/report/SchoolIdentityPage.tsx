import React from 'react';
import { SchoolInfo } from '../../types';

interface SchoolIdentityPageProps {
  school: SchoolInfo;
}

export const SchoolIdentityPage: React.FC<SchoolIdentityPageProps> = ({ school }) => {
  return (
    <div
      className="report-page a4-page p-[1.25cm] bg-white text-black border border-black print:border-none shadow-md print:shadow-none min-h-[297mm] w-[210mm] mx-auto box-border font-serif flex flex-col justify-between text-black"
      style={{ boxSizing: 'border-box' }}
    >
      <div>
        <div className="text-center pb-5 border-b-2 border-black space-y-1 text-black">
          <h2 className="text-lg font-bold uppercase tracking-wide text-black">
            RAPOR PESERTA DIDIK
          </h2>
          <h3 className="text-base font-bold uppercase text-black">
            SEKOLAH DASAR (SD)
          </h3>
        </div>

        <div className="mt-6 space-y-4 font-sans text-xs text-black">
          <h4 className="font-bold text-sm text-black uppercase tracking-wide border-b border-black pb-1 font-serif">
            Identitas Satuan Pendidikan
          </h4>

          <table className="report-table-thin w-full text-left border-[0.75px] border-black border-collapse">
            <tbody className="divide-y divide-black">
              <tr>
                <td className="w-8 py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">1.</td>
                <td className="w-56 py-2 px-3 font-semibold text-black border-[0.75px] border-black">Nama Satuan Pendidikan</td>
                <td className="w-4 py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 font-bold uppercase text-black border-[0.75px] border-black">{school.namaSekolah}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">2.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">NPSN</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 font-mono text-black border-[0.75px] border-black">{school.npsn}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">3.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">NSS / NIS</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 font-mono text-black border-[0.75px] border-black">{school.nss || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">4.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">Alamat Sekolah</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 text-black border-[0.75px] border-black">{school.alamat}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">5.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">Kode Pos</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 font-mono text-black border-[0.75px] border-black">{school.kodePos || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">6.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">Telepon</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 font-mono text-black border-[0.75px] border-black">{school.telepon || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">7.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">Kelurahan / Desa</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 text-black border-[0.75px] border-black">{school.kelurahan || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">8.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">Kecamatan</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 text-black border-[0.75px] border-black">{school.kecamatan || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">9.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">Kabupaten / Kota</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 text-black border-[0.75px] border-black">{school.kabupatenKota || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">10.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">Provinsi</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 text-black border-[0.75px] border-black">{school.provinsi || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">11.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">Website</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 text-black border-[0.75px] border-black">{school.website || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-center font-bold text-black border-[0.75px] border-black">12.</td>
                <td className="py-2 px-3 font-semibold text-black border-[0.75px] border-black">E-mail</td>
                <td className="py-2 text-center text-black border-y border-[0.75px] border-black">:</td>
                <td className="py-2 px-3 text-black border-[0.75px] border-black">{school.email || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Petunjuk Penggunaan Rapor */}
        <div className="mt-6 space-y-2 font-sans text-xs text-black">
          <h4 className="font-bold text-xs text-black uppercase font-serif">
            Petunjuk Penggunaan Buku Rapor:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px] text-black pl-1">
            <li>Buku Laporan Hasil Belajar (Rapor) ini dipergunakan selama peserta didik mengikuti pembelajaran di Sekolah Dasar.</li>
            <li>Apabila peserta didik berpindah sekolah, buku rapor ini dibawa serta dan diserahkan kepada pihak sekolah penerima.</li>
            <li>Buku laporan ini wajib dirawat dan dijaga keutuhannya oleh orang tua/wali peserta didik.</li>
            <li>Nilai rapor dan capaian kompetensi menggambarkan perkembangan kemampuan akademik dan karakter secara objektif.</li>
          </ol>
        </div>
      </div>

      <div className="text-center text-[10px] text-black font-sans border-t border-black pt-3">
        Halaman 2 • Dokumen Rapor Resmi Kurikulum Merdeka
      </div>
    </div>
  );
};
