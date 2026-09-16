import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Sparkles,
  Check,
  Loader2,
  Users,
  FileSpreadsheet,
} from 'lucide-react';
import {
  FullAppDatabase,
  Student,
} from '../types';
import { CoverPage } from './report/CoverPage';
import { SchoolIdentityPage } from './report/SchoolIdentityPage';
import { StudentBiodataPage } from './report/StudentBiodataPage';
import { AcademicReportPage } from './report/AcademicReportPage';
import {
  exportStudentReportToDoc,
  exportAllStudentsReportToDoc,
  exportStudentReportToDocx,
} from '../utils/docExporter';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface ReportPreviewViewProps {
  data: FullAppDatabase;
  onNavigateTab?: (tab: any) => void;
  onLoadSampleStudent?: () => void;
}

const BLANK_TEMPLATE_STUDENT: Student = {
  id: 'blangko-template-id',
  noUrut: 1,
  namaLengkap: '......................................................',
  nis: '................',
  nisn: '................',
  jenisKelamin: 'L',
  tempatLahir: '................',
  tanggalLahir: '2014-01-01',
  agama: 'Islam',
  alamat: '................',
  namaAyah: '................',
  namaIbu: '................',
  namaWali: '-',
  noKK: '................',
  nik: '................',
  status: 'Aktif',
};

export const ReportPreviewView: React.FC<ReportPreviewViewProps> = ({
  data,
  onNavigateTab,
  onLoadSampleStudent,
}) => {
  const activeStudents = data.students.filter((s) => s.status === 'Aktif');
  const isBlankMode = activeStudents.length === 0;
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'cover' | 'school' | 'biodata' | 'academic'>('academic');
  const [tableFontSizeMode, setTableFontSizeMode] = useState<'auto' | 'normal' | 'large'>('auto');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const currentStudent: Student =
    activeStudents[selectedStudentIndex] || activeStudents[0] || BLANK_TEMPLATE_STUDENT;

  const handlePrevStudent = () => {
    if (activeStudents.length <= 1) return;
    setSelectedStudentIndex((prev) => (prev > 0 ? prev - 1 : activeStudents.length - 1));
  };

  const handleNextStudent = () => {
    if (activeStudents.length <= 1) return;
    setSelectedStudentIndex((prev) => (prev < activeStudents.length - 1 ? prev + 1 : 0));
  };

  // Direct Word (.doc) Download
  const handleDownloadDoc = (student: Student) => {
    try {
      setIsGeneratingDoc(true);
      setPdfProgress(`Membuat berkas Word (.doc) untuk ${student.namaLengkap}...`);
      exportStudentReportToDoc(data, student, data.classInfo.semester);
      setTimeout(() => {
        setPdfProgress(null);
        setIsGeneratingDoc(false);
      }, 800);
    } catch (err: any) {
      setIsGeneratingDoc(false);
      setPdfProgress(null);
      alert('Gagal mengunduh file Word (.doc): ' + err.message);
    }
  };

  // Direct Word (.docx) Download
  const handleDownloadDocx = async (student: Student) => {
    try {
      setIsGeneratingDoc(true);
      setPdfProgress(`Membuat berkas Word (.docx) untuk ${student.namaLengkap}...`);
      await exportStudentReportToDocx(data, student, data.classInfo.semester);
      setTimeout(() => {
        setPdfProgress(null);
        setIsGeneratingDoc(false);
      }, 800);
    } catch (err: any) {
      setIsGeneratingDoc(false);
      setPdfProgress(null);
      alert('Gagal mengunduh file Word (.docx): ' + err.message);
    }
  };

  // All Students Word (.doc) Download
  const handleDownloadAllDoc = () => {
    try {
      setIsGeneratingDoc(true);
      setPdfProgress('Membuat berkas Word (.doc) untuk seluruh siswa...');
      exportAllStudentsReportToDoc(data, data.classInfo.semester);
      setTimeout(() => {
        setPdfProgress(null);
        setIsGeneratingDoc(false);
      }, 1000);
    } catch (err: any) {
      setIsGeneratingDoc(false);
      setPdfProgress(null);
      alert('Gagal mengunduh file Word kolektif: ' + err.message);
    }
  };

  // Direct PDF Download via html2canvas & jsPDF with ultra-high sharpness & calibrated table lines
  const handleDownloadPdf = async (student: Student) => {
    if (!printAreaRef.current) return;
    try {
      setIsGeneratingPdf(true);
      setPdfProgress(`Menyiapkan dokumen PDF rapor beresolusi tinggi untuk ${student.namaLengkap}...`);

      // Ensure all custom fonts and web glyphs are completely loaded before rasterization
      if (document.fonts) {
        await document.fonts.ready;
      }

      const pages = printAreaRef.current.querySelectorAll<HTMLElement>('.report-page');
      if (pages.length === 0) {
        alert('Tidak ada halaman rapor yang dapat diproses.');
        return;
      }

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < pages.length; i++) {
        setPdfProgress(`Memproses Halaman ${i + 1} dari ${pages.length} (Kualitas Cetak Tajam 350+ DPI)...`);
        const pageEl = pages[i];
        const canvas = await html2canvas(pageEl, {
          scale: 3.5, // Ultra-high resolution (350+ DPI equivalent) for razor-sharp text & calibrated table borders
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            try {
              // 1. Remove screen-only shadows, borders, and margins from page container
              const clonedPages = clonedDoc.querySelectorAll<HTMLElement>('.report-page');
              clonedPages.forEach((p) => {
                p.style.setProperty('box-shadow', 'none', 'important');
                p.style.setProperty('border', 'none', 'important');
                p.style.setProperty('margin', '0', 'important');
                p.style.setProperty('background', '#ffffff', 'important');
                p.style.setProperty('color', '#000000', 'important');
              });

              // 2. Calibrate table borders: solid, uniform 0.75px fine line with solid black (#000000)
              const tableCells = clonedDoc.querySelectorAll<HTMLElement>(
                '.report-table-thin, .report-table-thin th, .report-table-thin td, table th, table td'
              );
              tableCells.forEach((cell) => {
                cell.style.setProperty('border-color', '#000000', 'important');
                cell.style.setProperty('border-style', 'solid', 'important');
                cell.style.setProperty('border-width', '0.75px', 'important');
                cell.style.setProperty('color', '#000000', 'important');
              });

              // 3. Calibrate report section boxes (Kokurikuler, Catatan Wali Kelas, Keputusan Akhir)
              const boxes = clonedDoc.querySelectorAll<HTMLElement>(
                '.border-\\[0\\.5px\\], .border-\\[0\\.75px\\]'
              );
              boxes.forEach((box) => {
                box.style.setProperty('border-color', '#000000', 'important');
                box.style.setProperty('border-style', 'solid', 'important');
                box.style.setProperty('border-width', '0.75px', 'important');
              });

              // 4. Force high-contrast text rendering & anti-aliasing
              const tempCanvas = clonedDoc.createElement('canvas');
              tempCanvas.width = 1;
              tempCanvas.height = 1;
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) {
                const allEls = clonedDoc.querySelectorAll<HTMLElement>('.report-page, .report-page *');
                allEls.forEach((el) => {
                  el.style.setProperty('-webkit-font-smoothing', 'antialiased');
                  el.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
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
              console.warn('DOM styling clone error:', e);
            }
          },
        });

        // Use lossless PNG encoding for zero compression artifacts on text and lines
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) {
          pdf.addPage('a4', 'p');
        }

        // Calculate exact proportional height to prevent any bilinear scaling/blurring in PDF viewers
        const imgWidth = pdfWidth;
        const calculatedHeight = (canvas.height * pdfWidth) / canvas.width;
        // Clamp neatly within standard A4 height
        const imgHeight = Math.min(calculatedHeight, pdfHeight);

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      }

      const cleanName = student.namaLengkap.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Rapor_${data.classInfo.namaKelas.replace(/\s+/g, '_')}_${cleanName}_Sem${data.classInfo.semester}.pdf`;

      try {
        pdf.save(filename);
      } catch {
        // Fallback: create blob URL and trigger download via link element
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

      setPdfProgress('File PDF rapor berhasil diunduh dengan ketajaman tinggi!');
      setTimeout(() => setPdfProgress(null), 3500);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses pembuatan file PDF. Silakan coba kembali.');
      setPdfProgress(null);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct Print Dialog
  const handlePrint = () => {
    // 1. Clean up any conflicting print styles from other modals if present
    document.getElementById('dynamic-leger-landscape-print')?.remove();

    // 2. Inject or update clean dynamic print styles for portrait A4 report
    const styleId = 'dynamic-report-portrait-print';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      @media print {
        @page {
          size: A4 portrait !important;
          margin: 1.25cm 1.25cm 1.25cm 1.25cm !important;
        }
        html, body {
          background: #ffffff !important;
          color: #000000 !important;
          overflow: visible !important;
          height: auto !important;
          min-height: auto !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* Ensure all parents in layout expand naturally for multi-page printing */
        div, main, section {
          overflow: visible !important;
          height: auto !important;
          max-height: none !important;
        }
        header, aside, .print\\:hidden, #btn-print-report, .no-print {
          display: none !important;
          visibility: hidden !important;
        }
        #print-area, #print-area * {
          visibility: visible !important;
        }
        #print-area {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .report-page {
          display: block !important;
          width: 100% !important;
          page-break-after: always !important;
          break-after: page !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 0 20px 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }
        .report-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
          margin-bottom: 0 !important;
        }
      }
    `;

    // 3. Remove style after print dialog closes
    window.addEventListener(
      'afterprint',
      () => {
        styleEl?.remove();
      },
      { once: true }
    );

    // 4. Trigger print
    try {
      setPdfProgress('Membuka dialog cetak printer (Ctrl + P)...');
      setTimeout(() => setPdfProgress(null), 3500);
      window.print();
    } catch (err) {
      console.warn('Browser print dialog was restricted or failed:', err);
      // Fallback: trigger high resolution A4 PDF download
      setPdfProgress('Mempersiapkan dokumen cetak langsung ke format PDF...');
      handleDownloadPdf(currentStudent);
    }
  };

  return (
    <div className="space-y-6">
      {/* Blank Mode Information Banner */}
      {isBlankMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Mode Blangko Rapor Aktif (Data Siswa Belum Diisi)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Tombol <strong>Cetak</strong>, <strong>PDF</strong>, dan <strong>Word</strong> aktif untuk mencetak atau mengunduh format blangko resmi. Anda juga dapat menambahkan data siswa atau memuat contoh siswa untuk uji coba.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onLoadSampleStudent && (
              <button
                onClick={onLoadSampleStudent}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
                title="Muat 1 siswa contoh lengkap dengan nilai untuk uji coba cetak"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Muat Contoh Siswa</span>
              </button>
            )}
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('siswa')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+ Isi Data Siswa</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="space-y-4 print:hidden">
        {/* Title and main buttons */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Pratinjau & Unduh Rapor (PDF / Word .doc)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cetak langsung menggunakan printer atau simpan rapor ke format PDF dan dokumen Microsoft Word (.doc / .docx).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Print Button */}
            <button
              id="btn-print-report"
              onClick={handlePrint}
              disabled={isGeneratingPdf || isGeneratingDoc}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
              title="Buka dialog cetak printer (Ctrl + P)"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rapor</span>
            </button>

            {/* Download PDF Button */}
            <button
              id="btn-download-pdf"
              onClick={() => handleDownloadPdf(currentStudent)}
              disabled={isGeneratingPdf || isGeneratingDoc}
              className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              title={`Download PDF rapor untuk ${currentStudent.namaLengkap}`}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>PDF {isBlankMode ? '(Blangko)' : `(${currentStudent.namaLengkap.split(' ')[0]})`}</span>
            </button>

            {/* Download Word (.doc) Button */}
            <button
              id="btn-download-doc"
              onClick={() => handleDownloadDoc(currentStudent)}
              disabled={isGeneratingPdf || isGeneratingDoc}
              className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              title="Unduh dokumen Microsoft Word (.doc) yang langsung dapat diedit di Word, WPS, dan Google Docs"
            >
              {isGeneratingDoc ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Word .doc</span>
            </button>

            {/* Download Word (.docx) Button */}
            <button
              id="btn-download-docx"
              onClick={() => handleDownloadDocx(currentStudent)}
              disabled={isGeneratingPdf || isGeneratingDoc}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              title="Unduh format Microsoft Word modern (.docx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>.docx</span>
            </button>

            {/* Download All Students Word (.doc) */}
            <button
              id="btn-download-all-doc"
              onClick={handleDownloadAllDoc}
              disabled={isGeneratingPdf || isGeneratingDoc || isBlankMode}
              className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              title="Unduh rapor seluruh siswa dalam satu berkas Word (.doc) lengkap dengan pemisah halaman"
            >
              <Users className="w-4 h-4" />
              <span>Semua Siswa (.doc)</span>
            </button>
          </div>
        </div>

        {pdfProgress && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{pdfProgress}</span>
          </div>
        )}

        {/* Student Selector Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 shrink-0">Pilih Siswa:</span>
            <button
              onClick={handlePrevStudent}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600"
              title="Siswa Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedStudentIndex}
              onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
              disabled={isBlankMode}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 w-full sm:w-72 disabled:opacity-75"
            >
              {activeStudents.length > 0 ? (
                activeStudents.map((s, idx) => (
                  <option key={s.id} value={idx}>
                    {s.noUrut || idx + 1}. {s.namaLengkap} ({s.nisn})
                  </option>
                ))
              ) : (
                <option value={0}>Format Blangko Rapor (Data Kosong)</option>
              )}
            </select>

            <button
              onClick={handleNextStudent}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600"
              title="Siswa Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'academic'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Hal 4-5: Nilai & Capaian (2 Hal)
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'cover'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Hal 1: Cover Depan
            </button>
            <button
              onClick={() => setActiveTab('school')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'school'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Hal 2: Data Sekolah
            </button>
            <button
              onClick={() => setActiveTab('biodata')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'biodata'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Hal 3: Biodata Siswa
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Halaman (Lengkap)
            </button>
          </div>
        </div>

        {/* Info Note & Font Size Selector */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px]">
          <div className="text-slate-700 flex items-center gap-2">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Format A4 Rapor
            </span>
            <span>Nilai & Capaian Intrakurikuler otomatis disesuaikan agar proporsional dan mudah dibaca.</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <span className="text-slate-600 font-semibold">Ukuran Font Tabel:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setTableFontSizeMode('auto')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  tableFontSizeMode === 'auto'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Menyesuaikan otomatis dengan tinggi tabel dan jumlah mapel"
              >
                Otomatis (Optimal)
              </button>
              <button
                type="button"
                onClick={() => setTableFontSizeMode('normal')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  tableFontSizeMode === 'normal'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Ukuran font standar"
              >
                Sedang
              </button>
              <button
                type="button"
                onClick={() => setTableFontSizeMode('large')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  tableFontSizeMode === 'large'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Ukuran font lebih besar dan tebal"
              >
                Besar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* A4 Paper Canvas Container */}
      <div
        ref={printAreaRef}
        id="printable-report-container"
        className="space-y-8 flex flex-col items-center py-4 bg-slate-200/60 rounded-2xl"
      >
        {/* Cover Page */}
        {(activeTab === 'all' || activeTab === 'cover') && (
          <div>
            <CoverPage
              school={data.school}
              student={currentStudent}
              classInfo={data.classInfo}
            />
          </div>
        )}

        {/* School Identity Page */}
        {(activeTab === 'all' || activeTab === 'school') && (
          <div>
            <SchoolIdentityPage school={data.school} />
          </div>
        )}

        {/* Student Biodata Page */}
        {(activeTab === 'all' || activeTab === 'biodata') && (
          <div>
            <StudentBiodataPage
              student={currentStudent}
              school={data.school}
              reportSettings={data.reportSettings}
            />
          </div>
        )}

        {/* Academic Report Page (2 Pages: Nilai Intrakurikuler & Capaian/Pengembangan) */}
        {(activeTab === 'all' || activeTab === 'academic') && (
          <div>
            <AcademicReportPage
              student={currentStudent}
              school={data.school}
              teacher={data.teacher}
              classInfo={data.classInfo}
              reportSettings={data.reportSettings}
              subjects={data.subjects}
              learningScopes={data.learningScopes}
              scores={data.scores}
              cocurricular={data.cocurricular}
              extracurricular={data.extracurricular}
              attendance={data.attendance}
              teacherNotes={data.teacherNotes}
              promotions={data.promotions}
              semester={data.classInfo.semester}
              tableFontSizeMode={tableFontSizeMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};
