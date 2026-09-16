import React from 'react';
import { SchoolInfo, Student, ClassInfo } from '../../types';
import { TUT_WURI_LOGO_PNG } from '../../data/logoBase64';
import { getSystemDefaultLogo } from '../../data/defaultData';

interface CoverPageProps {
  school: SchoolInfo;
  student: Student;
  classInfo: ClassInfo;
}

export const CoverPage: React.FC<CoverPageProps> = ({ school, student, classInfo }) => {
  const logoSrc = school.logoSekolah || (school as any).logo || getSystemDefaultLogo();

  return (
    <div
      className="report-page a4-page flex flex-col justify-between items-center text-center p-[1.25cm] bg-white text-black border border-black print:border-none shadow-md print:shadow-none min-h-[297mm] w-[210mm] mx-auto box-border font-serif"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Header & Logo */}
      <div className="w-full pt-4 space-y-5 text-black">
        <div className="flex justify-center">
          <img
            src={logoSrc}
            alt="Logo Tut Wuri Handayani"
            className="w-32 h-32 object-contain drop-shadow-xs"
            crossOrigin="anonymous"
          />
        </div>

        <div className="space-y-2 text-black">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-black">
            RAPOR PESERTA DIDIK
          </h1>
          <h2 className="text-xl font-bold tracking-wide uppercase text-black">
            SEKOLAH DASAR (SD)
          </h2>
          <p className="text-sm font-sans text-black font-semibold tracking-wide">
            KURIKULUM MERDEKA
          </p>
        </div>
      </div>

      {/* Student Details in decorative box */}
      <div className="w-full max-w-md my-6 space-y-5 text-black">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-black font-sans font-medium">
            Nama Peserta Didik
          </p>
          <div className="py-2.5 px-4 border-2 border-black rounded-md bg-white font-bold text-base tracking-wide uppercase font-sans text-black">
            {student.namaLengkap}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-black font-sans font-medium">
            NIS / NISN
          </p>
          <div className="py-2 px-4 border border-black rounded-md bg-white font-bold text-sm tracking-widest font-mono text-black">
            {student.nis} / {student.nisn}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-black font-sans font-medium">
            Kelas / Fase
          </p>
          <div className="py-1.5 px-4 font-semibold text-sm font-sans text-black">
            {classInfo.namaKelas} ({classInfo.fase})
          </div>
        </div>
      </div>

      {/* Bottom School Details */}
      <div className="w-full pb-6 space-y-2 border-t border-black pt-5 text-black">
        <h3 className="text-lg font-bold uppercase tracking-wide text-black">
          {school.namaSekolah}
        </h3>
        <p className="text-xs text-black font-sans max-w-md mx-auto leading-relaxed">
          {school.alamat}
          {school.kelurahan && `, ${school.kelurahan}`}
          {school.kecamatan && `, Kec. ${school.kecamatan}`}
        </p>
        <p className="text-xs text-black font-sans">
          {school.kabupatenKota && `${school.kabupatenKota}, `}
          {school.provinsi} {school.kodePos && `Kode Pos: ${school.kodePos}`}
        </p>
        <p className="text-xs text-black font-sans mt-2 font-mono">
          NPSN: {school.npsn} {school.nss ? `| NSS: ${school.nss}` : ''}
        </p>
      </div>
    </div>
  );
};
