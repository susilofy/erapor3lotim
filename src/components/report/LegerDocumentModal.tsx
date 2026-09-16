import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Loader2,
  FileSpreadsheet,
  Check,
  Settings2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import {
  Student,
  Subject,
  SchoolInfo,
  TeacherInfo,
  ClassInfo,
  ReportSettings,
} from '../../types';
import { formatScoreDisplay } from '../../utils/competencyGenerator';
import { getSystemDefaultLogo } from '../../data/defaultData';

interface StudentRecordItem {
  student: Student;
  scoresBySubject: Record<string, number | null>;
  totalScore: number;
  averageScore: number;
  validSubjectCount: number;
  rank: number;
}

interface ClassStatsItem {
  subjectAverages: Record<string, number>;
  subjectHighest: Record<string, number>;
  subjectLowest: Record<string, number>;
  subjectPassCount: Record<string, number>;
  totalAverage: number;
  highestTotal: number;
  lowestTotal: number;
  rank1Student?: {
    student: Student;
    totalScore: number;
    averageScore: number;
    rank: number;
  };
}

interface LegerDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolInfo;
  classInfo: ClassInfo;
  teacher: TeacherInfo;
  reportSettings: ReportSettings;
  subjects: Subject[];
  studentRecords: StudentRecordItem[];
  classStats: ClassStatsItem;
  semester: 1 | 2;
}

export const LegerDocumentModal: React.FC<LegerDocumentModalProps> = ({
  isOpen,
  onClose,
  school,
  classInfo,
  teacher,
  reportSettings,
  subjects,
  studentRecords,
  classStats,
  semester,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [sortBy, setSortBy] = useState<'no_urut' | 'ranking' | 'nama'>('no_urut');
  const [paperFormat, setPaperFormat] = useState<'A4' | 'F4'>('A4');
  const [signatureMode, setSignatureMode] = useState<'auto' | 'gambar' | 'kosong'>(
    reportSettings.modeTandaTangan || 'auto'
  );
  const [fontSizeMode, setFontSizeMode] = useState<'compact' | 'normal'>('compact');

  const printAreaRef = useRef<HTMLDivElement>(null);

  const currentFormat = reportSettings.formatNilai || 'desimal_2';

  // Sorted records
  const sortedStudents = useMemo(() => {
    const list = [...studentRecords];
    if (sortBy === 'no_urut') {
      return list.sort((a, b) => (a.student.noUrut || 0) - (b.student.noUrut || 0));
    }
    if (sortBy === 'ranking') {
      return list.sort((a, b) => a.rank - b.rank);
    }
    if (sortBy === 'nama') {
      return list.sort((a, b) => a.student.namaLengkap.localeCompare(b.student.namaLengkap));
    }
    return list;
  }, [studentRecords, sortBy]);

  // Chunk students into pages
  const pages = useMemo(() => {
    if (rowsPerPage === 0 || sortedStudents.length <= rowsPerPage) {
      return [sortedStudents];
    }
    const chunks: StudentRecordItem[][] = [];
    for (let i = 0; i < sortedStudents.length; i += rowsPerPage) {
      chunks.push(sortedStudents.slice(i, i + rowsPerPage));
    }
    return chunks;
  }, [sortedStudents, rowsPerPage]);

  const formattedDate = useMemo(() => {
    return reportSettings.tanggalRapor
      ? new Date(reportSettings.tanggalRapor).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
  }, [reportSettings.tanggalRapor]);

  if (!isOpen) return null;

  // Handle native window print with dynamic landscape styling
  const handlePrint = () => {
    // Inject dynamic print style for landscape orientation
    const styleId = 'dynamic-leger-landscape-print';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${paperFormat === 'F4' ? '330mm 215mm' : '297mm 210mm'} landscape !important;
          margin: 6mm 8mm 6mm 8mm !important;
        }
        body {
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body > * {
          visibility: hidden !important;
        }
        #modal-leger-print-container,
        #modal-leger-print-container * {
          visibility: visible !important;
        }
        #modal-leger-print-container {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }
        .leger-sheet {
          box-shadow: none !important;
          border: none !important;
          page-break-after: always !important;
          break-after: page !important;
          margin-bottom: 0 !important;
          width: 100% !important;
          min-height: auto !important;
          padding: 6mm 8mm !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `;

    // Remove dynamic style after print closes so it doesn't affect other pages
    window.addEventListener(
      'afterprint',
      () => {
        styleEl?.remove();
      },
      { once: true }
    );

    // Trigger print safely
    try {
      window.print();
    } catch (err) {
      console.warn('Print blocked or failed in modal:', err);
      handleDownloadPdf();
    }
  };

  // Generate crisp A4 Landscape PDF via html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    try {
      setIsGeneratingPdf(true);
      setPdfProgress('Menyiapkan dokumen Leger Nilai...');

      const pageElements = printAreaRef.current.querySelectorAll<HTMLElement>('.leger-sheet');
      if (pageElements.length === 0) {
        alert('Tidak ada halaman dokumen yang dapat diproses.');
        return;
      }

      // Ensure fonts are loaded
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Initialize landscape jsPDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: paperFormat === 'F4' ? [330, 215] : 'a4',
        compress: true,
      });

      const pdfWidth = paperFormat === 'F4' ? 330 : 297;
      const pdfHeight = paperFormat === 'F4' ? 215 : 210;

      for (let i = 0; i < pageElements.length; i++) {
        setPdfProgress(`Memproses Halaman ${i + 1} dari ${pageElements.length} (Kualitas Cetak Tajam)...`);
        const pageEl = pageElements[i];

        const canvas = await html2canvas(pageEl, {
          scale: 3, // Ultra-high resolution for razor-sharp table text & lines
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: 1400,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          onclone: (clonedDoc) => {
            // Sanitize unsupported colors (oklch, lab) for html2canvas
            try {
              const tempCanvas = clonedDoc.createElement('canvas');
              tempCanvas.width = 1;
              tempCanvas.height = 1;
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) {
                const allEls = clonedDoc.querySelectorAll<HTMLElement>('.leger-sheet, .leger-sheet *');
                allEls.forEach((el) => {
                  el.style.setProperty('-webkit-font-smoothing', 'antialiased');
                  el.style.setProperty('text-rendering', 'geometricPrecision');

                  const comp = clonedDoc.defaultView?.getComputedStyle(el);
                  if (!comp) return;
                  const props = [
                    'color',
                    'backgroundColor',
                    'borderColor',
                    'borderTopColor',
                    'borderBottomColor',
                    'borderLeftColor',
                    'borderRightColor',
                  ] as const;
                  props.forEach((prop) => {
                    const val = comp.getPropertyValue(prop);
                    if (
                      val &&
                      (val.includes('oklch') ||
                        val.includes('oklab') ||
                        val.includes('color(') ||
                        val.includes('lab('))
                    ) {
                      try {
                        tempCtx.fillStyle = '#000000';
                        tempCtx.fillStyle = val;
                        el.style.setProperty(prop, tempCtx.fillStyle, 'important');
                      } catch {
                        el.style.setProperty(
                          prop,
                          prop.includes('background') ? '#ffffff' : '#000000',
                          'important'
                        );
                      }
                    }
                  });
                });
              }
            } catch (e) {
              console.warn('Color sanitization error:', e);
            }
          },
        });

        // Use lossless PNG to preserve razor-sharp grid borders and numerical data
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) {
          pdf.addPage(paperFormat === 'F4' ? [330, 215] : 'a4', 'landscape');
        }
        const imgHeight = Math.min((canvas.height * pdfWidth) / canvas.width, pdfHeight);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
      }

      const safeClassName = classInfo.namaKelas.replace(/\s+/g, '_');
      const filename = `Leger_Nilai_${safeClassName}_Semester_${semester}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      try {
        pdf.save(filename);
      } catch {
        // Fallback using blob URL
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }

      setPdfProgress('File PDF Leger berhasil diunduh!');
      setTimeout(() => setPdfProgress(null), 3000);
    } catch (err) {
      console.error('Error generating Leger PDF:', err);
      alert('Terjadi kesalahan saat memproses PDF. Silakan coba kembali.');
      setPdfProgress(null);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const shouldShowSignature = (type: 'kepsek' | 'guru') => {
    if (signatureMode === 'kosong') return false;
    if (signatureMode === 'gambar') return true;
    return reportSettings.modeTandaTangan === 'gambar';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col justify-between overflow-hidden">
      {/* Top Modal Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm sm:text-base text-white">
                Cetak Dokumen Leger Nilai
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {paperFormat} Lanskap
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Semester {semester === 1 ? '1 (Ganjil)' : '2 (Genap)'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {school.namaSekolah} • Kelas {classInfo.namaKelas} (Fase {classInfo.fase}) • TP {classInfo.tahunAjaran}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="hidden lg:flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs text-slate-300 mr-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            id="btn-modal-download-pdf"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Download Dokumen Leger ke format PDF (Siap Cetak / Bagikan)"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Download PDF Leger</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Print Button */}
          <button
            id="btn-modal-print-leger"
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Buka Dialog Cetak Printer (Format Lanskap)"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-1"
            title="Tutup Pratinjau (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sub-toolbar: Settings & Filters */}
      <div className="bg-slate-800 border-b border-slate-700/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          {/* Paper format selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Ukuran Kertas:</span>
            <div className="inline-flex bg-slate-900 p-0.5 rounded-md border border-slate-700">
              <button
                type="button"
                onClick={() => setPaperFormat('A4')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  paperFormat === 'A4'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Lanskap (297×210 mm)
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('F4')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  paperFormat === 'F4'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                F4 / Folio (330×215 mm)
              </button>
            </div>
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Baris per Lembar:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value={15}>15 Siswa / Lembar</option>
              <option value={20}>20 Siswa / Lembar</option>
              <option value={25}>25 Siswa / Lembar</option>
              <option value={30}>30 Siswa / Lembar</option>
              <option value={0}>Semua Siswa (1 Lembar Penuh)</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Urutan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="no_urut">No. Urut Presensi</option>
              <option value="ranking">Peringkat / Ranking (Tertinggi)</option>
              <option value="nama">Nama Siswa (A-Z)</option>
            </select>
          </div>

          {/* Font Density */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Kerapatan Font:</span>
            <div className="inline-flex bg-slate-900 p-0.5 rounded-md border border-slate-700">
              <button
                type="button"
                onClick={() => setFontSizeMode('compact')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  fontSizeMode === 'compact'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ringkas
              </button>
              <button
                type="button"
                onClick={() => setFontSizeMode('normal')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  fontSizeMode === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Normal
              </button>
            </div>
          </div>
        </div>

        {/* Right side page count indicator */}
        <div className="text-slate-400 text-xs font-mono">
          Total: <strong className="text-white">{sortedStudents.length}</strong> Siswa •{' '}
          <strong className="text-white">{pages.length}</strong> Lembar Dokumen
        </div>
      </div>

      {/* Progress alert notification */}
      {pdfProgress && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-center space-x-2 shrink-0 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{pdfProgress}</span>
        </div>
      )}

      {/* Main Preview Scroll Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-950 flex flex-col items-center">
        <div
          ref={printAreaRef}
          id="modal-leger-print-container"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
          }}
          className="transition-transform duration-150 space-y-8 print:space-y-0"
        >
          {pages.map((pageStudents, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === pages.length - 1;
            const startNumber = pageIndex * (rowsPerPage || sortedStudents.length) + 1;

            return (
              <div
                key={`page-${pageIndex}`}
                className={`leger-sheet bg-white text-black p-8 shadow-2xl mx-auto border border-slate-300 font-serif relative print:p-6 print:shadow-none print:border-none ${
                  paperFormat === 'F4'
                    ? 'w-[330mm] min-h-[215mm]'
                    : 'w-[297mm] min-h-[210mm]'
                }`}
                style={{
                  boxSizing: 'border-box',
                }}
              >
                {/* 1. KOP SURAT RESMI */}
                <div className="border-b-[2.5px] border-black pb-1 mb-2.5 text-center relative">
                  <div className="flex items-center justify-between">
                    {/* Logo Sekolah Kiri */}
                    <div className="w-20 h-20 flex items-center justify-center shrink-0">
                      {school.logoSekolah || getSystemDefaultLogo() ? (
                        <img
                          src={school.logoSekolah || getSystemDefaultLogo()}
                          alt="Logo Sekolah"
                          className="max-h-20 max-w-20 object-contain"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-slate-400 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">
                          LOGO
                        </div>
                      )}
                    </div>

                    {/* Teks Kop Sekolah */}
                    <div className="flex-1 px-4 leading-tight">
                      <p className="text-[12px] font-bold tracking-wider uppercase">
                        PEMERINTAH KABUPATEN {school.kabupaten.toUpperCase()}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider">
                        DINAS PENDIDIKAN, KEPEMUDAAN DAN OLAHRAGA
                      </p>
                      <h1 className="text-[17px] font-extrabold uppercase tracking-wide my-0.5">
                        {school.namaSekolah}
                      </h1>
                      <p className="text-[9.5px] text-slate-800 font-sans mt-0.5">
                        {school.alamat}, Kec. {school.kecamatan}, Kab. {school.kabupaten}, Prov. {school.provinsi} {school.kodePos ? `Kode Pos ${school.kodePos}` : ''}
                      </p>
                      <p className="text-[9px] text-slate-700 font-mono">
                        NPSN: {school.npsn} {school.nss ? `• NSS: ${school.nss}` : ''} {school.email ? `• Email: ${school.email}` : ''}
                      </p>
                    </div>

                    {/* Sisi Kanan: Ruang Keseimbangan Kop / Lambang Garuda / Tut Wuri */}
                    <div className="w-20 h-20 flex flex-col items-center justify-center shrink-0 text-center font-sans">
                      <div className="border border-black px-2 py-1 rounded text-[9px] font-bold uppercase bg-slate-50">
                        KURIKULUM MERDEKA
                      </div>
                    </div>
                  </div>
                  {/* Garis Ganda Kop */}
                  <div className="border-b border-black mt-1"></div>
                </div>

                {/* 2. JUDUL DOKUMEN LEGER */}
                <div className="text-center mb-2.5">
                  <h2 className="text-[13px] font-extrabold uppercase tracking-wider">
                    REKAPITULASI HASIL CAPAIAN BELAJAR PESERTA DIDIK (LEGER NILAI)
                  </h2>
                  <p className="text-[10.5px] font-bold uppercase mt-0.5">
                    TAHUN AJARAN {classInfo.tahunAjaran} — SEMESTER {semester === 1 ? '1 (GANJIL)' : '2 (GENAP)'}
                  </p>
                </div>

                {/* 3. IDENTITAS KELAS */}
                <div className="mb-2 bg-slate-50/70 border border-black/40 rounded-sm p-2 text-[10px] font-sans flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span>Satuan Pendidikan : </span>
                    <strong className="uppercase">{school.namaSekolah}</strong>
                  </div>
                  <div>
                    <span>Kelas / Fase : </span>
                    <strong>{classInfo.namaKelas} / {classInfo.fase}</strong>
                  </div>
                  <div>
                    <span>Guru Kelas : </span>
                    <strong>{classInfo.waliKelas || teacher.namaGuru}</strong>
                  </div>
                  <div>
                    <span>Format Nilai : </span>
                    <strong className="font-mono">
                      {currentFormat === 'desimal_2' ? 'Desimal (2 angka)' : 'Bilangan Bulat'}
                    </strong>
                  </div>
                  <div>
                    <span>Jumlah Siswa : </span>
                    <strong>
                      {sortedStudents.length} (L: {sortedStudents.filter((s) => s.student.jenisKelamin === 'L').length}, P: {sortedStudents.filter((s) => s.student.jenisKelamin === 'P').length})
                    </strong>
                  </div>
                </div>

                {/* 4. TABEL MATRIKS LEGER */}
                <table className="w-full border-collapse border border-black text-center font-sans">
                  <thead>
                    <tr className="bg-slate-200 text-black font-bold border-b border-black text-[9.5px]">
                      <th className="border border-black py-1 px-1 w-7" rowSpan={2}>
                        No
                      </th>
                      <th className="border border-black py-1 px-1.5 w-16" rowSpan={2}>
                        NIS / NISN
                      </th>
                      <th className="border border-black py-1 px-2 text-left min-w-[140px] max-w-[200px]" rowSpan={2}>
                        Nama Peserta Didik
                      </th>
                      <th className="border border-black py-1 px-0.5 w-6" rowSpan={2}>
                        L/P
                      </th>

                      {/* Mapel Headers */}
                      <th
                        className="border border-black py-1 px-1 text-center bg-slate-300/80"
                        colSpan={subjects.length}
                      >
                        Mata Pelajaran (Nilai Akhir Sumatif)
                      </th>

                      {/* Summary Headers */}
                      <th className="border border-black py-1 px-1.5 w-16 bg-blue-100/70" rowSpan={2}>
                        Jumlah (Σ)
                      </th>
                      <th className="border border-black py-1 px-1.5 w-14 bg-emerald-100/70" rowSpan={2}>
                        Rata-Rata
                      </th>
                      <th className="border border-black py-1 px-1 w-12 bg-amber-100/70" rowSpan={2}>
                        Peringkat
                      </th>
                    </tr>

                    {/* Baris Nama Mapel & KKTP */}
                    <tr className="bg-slate-100 text-[8.5px] border-b border-black font-semibold">
                      {subjects.map((sub) => (
                        <th
                          key={sub.id}
                          className="border border-black py-0.5 px-1 min-w-[48px] max-w-[70px] align-bottom"
                          title={sub.nama}
                        >
                          <div className="font-bold truncate" title={sub.nama}>
                            {sub.nama.length > 12 ? sub.nama.slice(0, 10) + '..' : sub.nama}
                          </div>
                          <div className="text-[7.5px] font-mono text-slate-700">
                            K:{sub.kktp}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className={fontSizeMode === 'compact' ? 'text-[9px]' : 'text-[9.5px]'}>
                    {pageStudents.map((rec, index) => {
                      const displayNo =
                        sortBy === 'no_urut'
                          ? rec.student.noUrut || startNumber + index
                          : startNumber + index;

                      return (
                        <tr
                          key={rec.student.id}
                          className="border-b border-black/70 hover:bg-slate-50 transition-colors"
                        >
                          <td className="border border-black py-0.5 px-1 font-mono">
                            {displayNo}
                          </td>
                          <td className="border border-black py-0.5 px-1 font-mono text-[8px] leading-tight">
                            <div>{rec.student.nis}</div>
                            <div className="text-slate-600">{rec.student.nisn}</div>
                          </td>
                          <td className="border border-black py-0.5 px-1.5 text-left font-medium truncate max-w-[180px]">
                            {rec.student.namaLengkap}
                          </td>
                          <td className="border border-black py-0.5 px-0.5 text-center font-mono">
                            {rec.student.jenisKelamin}
                          </td>

                          {/* Subject Scores */}
                          {subjects.map((sub) => {
                            const val = rec.scoresBySubject[sub.id];
                            const isBelowKktp = val !== null && val !== undefined && val < sub.kktp;
                            return (
                              <td
                                key={sub.id}
                                className={`border border-black py-0.5 px-1 font-mono text-center ${
                                  isBelowKktp ? 'text-red-700 font-bold bg-red-50/50' : ''
                                }`}
                              >
                                {val !== null && val !== undefined
                                  ? formatScoreDisplay(val, currentFormat)
                                  : '-'}
                              </td>
                            );
                          })}

                          {/* Total Score */}
                          <td className="border border-black py-0.5 px-1 font-mono font-bold bg-blue-50/40 text-blue-950">
                            {rec.totalScore > 0
                              ? formatScoreDisplay(rec.totalScore, currentFormat)
                              : '-'}
                          </td>

                          {/* Average Score */}
                          <td className="border border-black py-0.5 px-1 font-mono font-bold bg-emerald-50/40 text-emerald-950">
                            {rec.averageScore > 0
                              ? formatScoreDisplay(rec.averageScore, currentFormat)
                              : '-'}
                          </td>

                          {/* Rank */}
                          <td className="border border-black py-0.5 px-1 font-mono font-bold bg-amber-50/40 text-amber-950">
                            {rec.totalScore > 0 ? rec.rank : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* STATISTIK KELAS (Hanya tampil di lembar terakhir jika berhalaman ganda) */}
                  {isLastPage && (
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-black text-[8.5px]">
                      {/* Rata-Rata Kelas */}
                      <tr className="border-b border-black">
                        <td
                          colSpan={4}
                          className="border border-black py-0.5 px-2 text-right uppercase tracking-wider font-serif font-bold text-slate-800"
                        >
                          Rata-Rata Kelas:
                        </td>
                        {subjects.map((sub) => (
                          <td
                            key={sub.id}
                            className="border border-black py-0.5 px-1 text-center font-mono text-emerald-900"
                          >
                            {formatScoreDisplay(classStats.subjectAverages[sub.id], currentFormat)}
                          </td>
                        ))}
                        <td className="border border-black py-0.5 px-1 font-mono text-center">-</td>
                        <td className="border border-black py-0.5 px-1 font-mono text-center text-emerald-950 bg-emerald-100/50 font-extrabold">
                          {formatScoreDisplay(classStats.totalAverage, currentFormat)}
                        </td>
                        <td className="border border-black py-0.5 px-1 font-mono text-center">-</td>
                      </tr>

                      {/* Nilai Tertinggi */}
                      <tr className="border-b border-black">
                        <td
                          colSpan={4}
                          className="border border-black py-0.5 px-2 text-right uppercase tracking-wider font-serif font-bold text-slate-800"
                        >
                          Nilai Tertinggi (Maks):
                        </td>
                        {subjects.map((sub) => (
                          <td
                            key={sub.id}
                            className="border border-black py-0.5 px-1 text-center font-mono text-blue-900"
                          >
                            {formatScoreDisplay(classStats.subjectHighest[sub.id], currentFormat)}
                          </td>
                        ))}
                        <td className="border border-black py-0.5 px-1 font-mono text-center text-blue-950 bg-blue-100/50 font-extrabold">
                          {formatScoreDisplay(classStats.highestTotal, currentFormat)}
                        </td>
                        <td className="border border-black py-0.5 px-1 font-mono text-center">-</td>
                        <td className="border border-black py-0.5 px-1 font-mono text-center">-</td>
                      </tr>

                      {/* Nilai Terendah */}
                      <tr className="border-b border-black">
                        <td
                          colSpan={4}
                          className="border border-black py-0.5 px-2 text-right uppercase tracking-wider font-serif font-bold text-slate-800"
                        >
                          Nilai Terendah (Min):
                        </td>
                        {subjects.map((sub) => (
                          <td
                            key={sub.id}
                            className="border border-black py-0.5 px-1 text-center font-mono text-slate-800"
                          >
                            {formatScoreDisplay(classStats.subjectLowest[sub.id], currentFormat)}
                          </td>
                        ))}
                        <td className="border border-black py-0.5 px-1 font-mono text-center text-slate-900 font-extrabold">
                          {formatScoreDisplay(classStats.lowestTotal, currentFormat)}
                        </td>
                        <td className="border border-black py-0.5 px-1 font-mono text-center">-</td>
                        <td className="border border-black py-0.5 px-1 font-mono text-center">-</td>
                      </tr>

                      {/* Siswa Tuntas KKTP */}
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-black py-0.5 px-2 text-right uppercase tracking-wider font-serif font-bold text-slate-800"
                        >
                          Jumlah Siswa Tuntas KKTP:
                        </td>
                        {subjects.map((sub) => (
                          <td
                            key={sub.id}
                            className="border border-black py-0.5 px-1 text-center font-mono text-slate-800"
                          >
                            {classStats.subjectPassCount[sub.id] || 0} / {sortedStudents.length}
                          </td>
                        ))}
                        <td className="border border-black py-0.5 px-1 font-mono text-center" colSpan={3}>
                          -
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                {/* 5. TANDA TANGAN RESMI (Di Lembar Terakhir) */}
                {isLastPage && (
                  <div className="mt-4 pt-2 flex justify-between items-start text-[10.5px] font-serif break-inside-avoid">
                    {/* Kepala Sekolah */}
                    <div className="text-center w-64">
                      <p>Mengetahui,</p>
                      <p className="font-semibold">Kepala {school.namaSekolah}</p>
                      <div className="h-16 flex items-center justify-center my-1">
                        {shouldShowSignature('kepsek') && school.tandaTanganKepsek ? (
                          <img
                            src={school.tandaTanganKepsek}
                            alt="TTD Kepsek"
                            className="max-h-16 max-w-[140px] object-contain"
                          />
                        ) : (
                          <div className="text-slate-300 text-[10px] italic">
                            (Ruang Tanda Tangan & Stempel)
                          </div>
                        )}
                      </div>
                      <p className="font-bold underline uppercase">{school.namaKepalaSekolah}</p>
                      <p className="font-mono text-[9.5px]">NIP. {school.nipKepalaSekolah || '-'}</p>
                    </div>

                    {/* Informasi Leger Singkat */}
                    <div className="hidden sm:block text-center text-[9px] text-slate-500 font-sans max-w-xs self-center border border-dashed border-slate-300 p-2 rounded">
                      <p className="font-semibold text-slate-700">DOKUMEN PENILAIAN RESMI</p>
                      <p>Leger Nilai Semester {semester === 1 ? 'Ganjil' : 'Genap'} Tahun Ajaran {classInfo.tahunAjaran}</p>
                      <p className="text-[8px] mt-1 text-slate-400">Dicetak melalui Aplikasi Rapor SD Kurikulum Merdeka</p>
                    </div>

                    {/* Guru Kelas */}
                    <div className="text-center w-64">
                      <p>
                        {reportSettings.tempatRapor || school.kabupaten}, {formattedDate}
                      </p>
                      <p className="font-semibold">Guru Kelas / Wali Kelas</p>
                      <div className="h-16 flex items-center justify-center my-1">
                        {shouldShowSignature('guru') && teacher.tandaTanganGuru ? (
                          <img
                            src={teacher.tandaTanganGuru}
                            alt="TTD Guru"
                            className="max-h-16 max-w-[140px] object-contain"
                          />
                        ) : (
                          <div className="text-slate-300 text-[10px] italic">
                            (Ruang Tanda Tangan Guru)
                          </div>
                        )}
                      </div>
                      <p className="font-bold underline uppercase">
                        {classInfo.waliKelas || teacher.namaGuru}
                      </p>
                      <p className="font-mono text-[9.5px]">NIP. {teacher.nip || '-'}</p>
                    </div>
                  </div>
                )}

                {/* Footer Lembar */}
                <div className="absolute bottom-2 left-8 right-8 flex justify-between items-center text-[8px] text-slate-500 font-mono border-t border-slate-200 pt-1">
                  <span>
                    Leger Nilai Kelas {classInfo.namaKelas} - {school.namaSekolah}
                  </span>
                  <span>
                    Halaman {pageIndex + 1} dari {pages.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
