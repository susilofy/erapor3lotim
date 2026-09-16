import { FullAppDatabase, Student } from '../types';
import { TUT_WURI_LOGO_PNG } from '../data/logoBase64';
import { getSystemDefaultLogo } from '../data/defaultData';
import { formatScoreDisplay } from './competencyGenerator';
import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
} from 'docx';

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

/**
 * Generates an HTML-based Microsoft Word document (.doc)
 * Fully compatible with Microsoft Word (all versions), Google Docs, LibreOffice, and WPS Office.
 */
export function generateStudentReportDocHtml(
  db: FullAppDatabase,
  student: Student,
  semester: 1 | 2,
  includeCover = true
): string {
  const { school, teacher, classInfo, reportSettings, subjects, scores, cocurricular, extracurricular, attendance, teacherNotes, promotions } = db;
  const activeSubjects = subjects.filter((s) => s.isActive);
  const currentSemesterScores = scores[semester]?.[student.id] || {};
  const currentProject = cocurricular[semester];
  const studentCocurricularDesc = currentProject?.capaianSiswa?.[student.id];
  const studentExtracurriculars = extracurricular[semester]?.[student.id] || [];
  const studentAttendance = attendance[semester]?.[student.id] || { sakit: 0, izin: 0, alpa: 0 };
  const studentNote = teacherNotes[semester]?.[student.id] || '';
  const statusItem = promotions[student.id];
  const isKelas6 = classInfo.tingkat === 6 || classInfo.namaKelas.includes('VI');

  const formattedDate = formatDateIndo(reportSettings.tanggalRapor);
  const logoSrc = school.logoSekolah || getSystemDefaultLogo();

  let html = '';

  // 1. Cover Page
  if (includeCover) {
    html += `
      <div class="page-cover" style="text-align: center; padding-top: 40px; padding-bottom: 40px;">
        <div style="margin-bottom: 25px;">
          <img src="${logoSrc}" width="120" height="120" alt="Logo Sekolah" style="display: block; margin: 0 auto;" />
        </div>
        <div style="font-family: 'Times New Roman', serif; margin-bottom: 40px;">
          <h1 style="font-size: 20pt; font-weight: bold; margin: 5px 0; letter-spacing: 1px;">RAPOR PESERTA DIDIK</h1>
          <h2 style="font-size: 16pt; font-weight: bold; margin: 5px 0; letter-spacing: 1px;">SEKOLAH DASAR (SD)</h2>
          <p style="font-size: 12pt; font-weight: bold; margin: 5px 0; font-family: Arial, sans-serif;">KURIKULUM MERDEKA</p>
        </div>

        <div style="margin: 50px auto 40px auto; max-width: 450px; font-family: Arial, sans-serif;">
          <p style="font-size: 10pt; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">Nama Peserta Didik</p>
          <div style="border: 2px solid #000; padding: 10px 15px; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 20px;">
            ${student.namaLengkap}
          </div>

          <p style="font-size: 10pt; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">NIS / NISN</p>
          <div style="border: 1px solid #000; padding: 8px 15px; font-size: 11pt; font-weight: bold; letter-spacing: 1px; font-family: 'Courier New', monospace;">
            ${student.nis || '-'} / ${student.nisn || '-'}
          </div>
        </div>

        <div style="margin-top: 60px; font-family: Arial, sans-serif;">
          <p style="font-size: 10pt; text-transform: uppercase; margin-bottom: 4px;">KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</p>
          <h3 style="font-size: 14pt; font-weight: bold; margin: 5px 0; text-transform: uppercase;">${school.namaSekolah}</h3>
          <p style="font-size: 10pt; margin: 4px 0;">${school.alamat}, ${school.kecamatan}, ${school.kabupaten}</p>
          <p style="font-size: 10pt; font-weight: bold; margin-top: 10px;">Tahun Ajaran ${classInfo.tahunAjaran}</p>
        </div>
      </div>
      <br clear="all" style="page-break-before:always; mso-break-type:section-break" />
    `;
  }

  // 2. Academic Report - Page 1 (Identitas & Tabel Intrakurikuler)
  html += `
    <div class="report-page">
      <!-- Kop Header Identitas Siswa -->
      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 9.5pt; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="width: 18%; font-weight: bold;">Nama Peserta Didik</td>
          <td style="width: 2%;">:</td>
          <td style="width: 38%; font-weight: bold; text-transform: uppercase;">${student.namaLengkap}</td>
          <td style="width: 16%; font-weight: bold;">Kelas</td>
          <td style="width: 2%;">:</td>
          <td style="width: 24%; font-weight: bold;">${classInfo.namaKelas}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">NIS / NISN</td>
          <td>:</td>
          <td style="font-family: 'Courier New', monospace;">${student.nis || '-'} / ${student.nisn || '-'}</td>
          <td style="font-weight: bold;">Fase</td>
          <td>:</td>
          <td>${classInfo.fase || 'Fase C'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Nama Sekolah</td>
          <td>:</td>
          <td>${school.namaSekolah}</td>
          <td style="font-weight: bold;">Semester</td>
          <td>:</td>
          <td>${semester} (${semester === 1 ? 'Satu / Ganjil' : 'Dua / Genap'})</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Alamat Sekolah</td>
          <td>:</td>
          <td>${school.alamat}</td>
          <td style="font-weight: bold;">Tahun Ajaran</td>
          <td>:</td>
          <td>${classInfo.tahunAjaran}</td>
        </tr>
      </table>

      <!-- Judul Bagian A -->
      <div style="font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 2px;">
        LAPORAN HASIL BELAJAR (INTRAKURIKULER)
      </div>

      <!-- Tabel Nilai & Capaian Belajar -->
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 9pt; margin-bottom: 15px; border: 0.50pt solid #000;" border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold; color: #000000;">
            <th style="width: 5%; border: 0.50pt solid #000; padding: 6px;">No</th>
            <th style="width: 28%; border: 0.50pt solid #000; padding: 6px; text-align: left;">Mata Pelajaran</th>
            <th style="width: 10%; border: 0.50pt solid #000; padding: 6px;">Nilai Akhir</th>
            <th style="width: 57%; border: 0.50pt solid #000; padding: 6px; text-align: left;">Capaian Kompetensi</th>
          </tr>
        </thead>
        <tbody>
          ${activeSubjects.map((sub, idx) => {
            const sc = currentSemesterScores[sub.id];
            const nilaiDisplay = sc ? formatScoreDisplay(sc.nilaiAkhir, reportSettings.formatNilai) : '-';
            const desc = sc ? sc.capaianKompetensi : 'Belum ada deskripsi capaian pembelajaran.';
            return `
              <tr>
                <td style="border: 0.50pt solid #000; text-align: center; vertical-align: top; padding: 6px; font-weight: bold; color: #000000;">${idx + 1}</td>
                <td style="border: 0.50pt solid #000; vertical-align: top; padding: 6px; font-weight: bold; color: #000000;">${sub.nama}</td>
                <td style="border: 0.50pt solid #000; text-align: center; vertical-align: top; padding: 6px; font-weight: bold; font-size: 9.5pt; color: #000000;">${nilaiDisplay}</td>
                <td style="border: 0.50pt solid #000; vertical-align: top; padding: 6px; text-align: justify; line-height: 1.4; color: #000000; font-size: 9.5pt; font-weight: normal;">${desc}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Footer Page 1 -->
      <div style="font-family: Arial, sans-serif; font-size: 8pt; border-top: 0.50pt solid #000; padding-top: 4px; display: flex; justify-content: space-between;">
        <span>${school.namaSekolah} | ${classInfo.namaKelas} | <b>${student.namaLengkap}</b></span>
        <span style="float: right;">Halaman 1 dari 2</span>
      </div>
    </div>

    <br clear="all" style="page-break-before:always; mso-break-type:section-break" />

    <!-- 3. Academic Report - Page 2 (Kokurikuler, Ekstra, Ketidakhadiran, Catatan, Tanda Tangan) -->
    <div class="report-page">
      <!-- Kop Singkat Header Siswa Hal 2 -->
      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 9pt; margin-bottom: 10px; border-bottom: 0.50pt solid #000; padding-bottom: 4px;">
        <tr>
          <td style="width: 18%; font-weight: bold;">Nama Siswa</td>
          <td style="width: 2%;">:</td>
          <td style="width: 40%; font-weight: bold; text-transform: uppercase;">${student.namaLengkap}</td>
          <td style="width: 15%; font-weight: bold;">Kelas / Sem.</td>
          <td style="width: 2%;">:</td>
          <td style="width: 23%; font-weight: bold;">${classInfo.namaKelas} / Sem. ${semester}</td>
        </tr>
      </table>

      <!-- Bagian B: Kokurikuler P5 / PPA -->
      <div style="margin-bottom: 12px; font-family: Arial, sans-serif;">
        <div style="font-family: 'Times New Roman', serif; font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">
          B. Projek Penguatan Profil Pelajar Pancasila (Kokurikuler)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; border: 0.50pt solid #000;" border="1" cellpadding="5" cellspacing="0">
          <tr style="background-color: #f8fafc; font-weight: bold;">
            <th style="width: 30%; border: 0.50pt solid #000; padding: 5px; text-align: left;">Projek Pembelajaran</th>
            <th style="width: 70%; border: 0.50pt solid #000; padding: 5px; text-align: left;">Capaian Karakter & Catatan Perkembangan</th>
          </tr>
          <tr>
            <td style="border: 0.50pt solid #000; vertical-align: top; padding: 6px; font-weight: bold;">
              ${currentProject?.tema || 'Gaya Hidup Berkelanjutan: Mengolah Sampah Plastik Menjadi Karya Seni'}
            </td>
            <td style="border: 0.50pt solid #000; vertical-align: top; padding: 6px; text-align: justify; line-height: 1.35;">
              ${studentCocurricularDesc || currentProject?.deskripsi || 'Ananda berpartisipasi aktif dalam kegiatan projek dan menunjukkan pembiasaan profil pelajar pancasila dengan baik.'}
            </td>
          </tr>
        </table>
      </div>

      <!-- Bagian C: Ekstrakurikuler -->
      <div style="margin-bottom: 12px; font-family: Arial, sans-serif;">
        <div style="font-family: 'Times New Roman', serif; font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">
          C. Ekstrakurikuler
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; border: 0.50pt solid #000;" border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr style="background-color: #f8fafc; text-align: center; font-weight: bold;">
              <th style="width: 8%; border: 0.50pt solid #000; padding: 5px;">No</th>
              <th style="width: 42%; border: 0.50pt solid #000; padding: 5px; text-align: left;">Kegiatan Ekstrakurikuler</th>
              <th style="width: 50%; border: 0.50pt solid #000; padding: 5px; text-align: left;">Keterangan / Predikat</th>
            </tr>
          </thead>
          <tbody>
            ${
              studentExtracurriculars.length > 0
                ? studentExtracurriculars.map((ex, idx) => `
                    <tr>
                      <td style="border: 0.50pt solid #000; text-align: center; padding: 5px;">${idx + 1}</td>
                      <td style="border: 0.50pt solid #000; padding: 5px; font-weight: bold;">${ex.namaEkskul}</td>
                      <td style="border: 0.50pt solid #000; padding: 5px;">${ex.keterangan || 'Baik'}</td>
                    </tr>
                  `).join('')
                : `
                    <tr>
                      <td style="border: 0.50pt solid #000; text-align: center; padding: 5px;">1</td>
                      <td style="border: 0.50pt solid #000; padding: 5px; font-weight: bold;">Pramuka (Wajib)</td>
                      <td style="border: 0.50pt solid #000; padding: 5px;">Sangat Baik, aktif dan disiplin mengikuti kegiatan kepanduan.</td>
                    </tr>
                  `
            }
          </tbody>
        </table>
      </div>

      <!-- Bagian D: Ketidakhadiran -->
      <div style="margin-bottom: 12px; font-family: Arial, sans-serif;">
        <div style="font-family: 'Times New Roman', serif; font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">
          D. Ketidakhadiran
        </div>
        <table style="width: 50%; border-collapse: collapse; font-size: 8.5pt; border: 0.50pt solid #000;" border="1" cellpadding="5" cellspacing="0">
          <tr>
            <td style="border: 0.50pt solid #000; width: 60%; padding: 4px 8px;">Sakit</td>
            <td style="border: 0.50pt solid #000; width: 10%; text-align: center;">:</td>
            <td style="border: 0.50pt solid #000; width: 30%; text-align: center; font-weight: bold;">${studentAttendance.sakit || 0} hari</td>
          </tr>
          <tr>
            <td style="border: 0.50pt solid #000; padding: 4px 8px;">Izin</td>
            <td style="border: 0.50pt solid #000; text-align: center;">:</td>
            <td style="border: 0.50pt solid #000; text-align: center; font-weight: bold;">${studentAttendance.izin || 0} hari</td>
          </tr>
          <tr>
            <td style="border: 0.50pt solid #000; padding: 4px 8px;">Tanpa Keterangan (Alpa)</td>
            <td style="border: 0.50pt solid #000; text-align: center;">:</td>
            <td style="border: 0.50pt solid #000; text-align: center; font-weight: bold;">${studentAttendance.alpa || 0} hari</td>
          </tr>
        </table>
      </div>

      <!-- Bagian E: Catatan Wali Kelas -->
      <div style="margin-bottom: 12px; font-family: Arial, sans-serif;">
        <div style="font-family: 'Times New Roman', serif; font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">
          E. Catatan Wali Kelas
        </div>
        <div style="border: 0.50pt solid #000; padding: 8px; font-size: 9pt; font-style: italic; line-height: 1.4; background-color: #fafafa;">
          ${studentNote || 'Pertahankan prestasimu, tingkatkan terus semangat belajar, dan selalu bersikap santun kepada sesama.'}
        </div>
      </div>

      ${
        semester === 2
          ? `
            <!-- Bagian F: Keputusan Akhir Tahun (Semester 2) -->
            <div style="margin-bottom: 12px; font-family: Arial, sans-serif;">
              <div style="font-family: 'Times New Roman', serif; font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">
                F. Keputusan Akhir Tahun
              </div>
              <div style="border: 0.50pt solid #000; padding: 8px; font-size: 9pt; line-height: 1.4; background-color: #fafafa;">
                <div>Berdasarkan pencapaian seluruh kompetensi, peserta didik dinyatakan:</div>
                <div style="font-weight: bold; font-size: 9.5pt; margin-top: 4px; text-decoration: underline;">
                  ${statusItem?.keterangan || (isKelas6 ? 'Dinyatakan LULUS dari Satuan Pendidikan SD' : `Naik ke Kelas ${classInfo.tingkat + 1}`)}
                </div>
              </div>
            </div>
          `
          : ''
      }

      <!-- Bagian Tanggapan Orang Tua / Wali Murid -->
      <div style="margin-bottom: 15px; font-family: Arial, sans-serif;">
        <div style="font-family: 'Times New Roman', serif; font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">
          ${semester === 2 ? 'G. Tanggapan Orang Tua / Wali Murid' : 'F. Tanggapan Orang Tua / Wali Murid'}
        </div>
        <div style="border: 0.50pt solid #000; min-height: 70px; padding: 6px 8px;">
          <div style="border-bottom: 1px dotted #888; height: 16px;"></div>
          <div style="border-bottom: 1px dotted #888; height: 16px;"></div>
          <div style="border-bottom: 1px dotted #888; height: 16px;"></div>
          <div style="border-bottom: 1px dotted #888; height: 16px;"></div>
        </div>
      </div>

      <!-- Titimangsa & Tanda Tangan 3 Pihak -->
      <div style="font-family: Arial, sans-serif; font-size: 9pt; margin-top: 15px;">
        <div style="text-align: right; margin-bottom: 10px;">
          ${reportSettings.tempatRapor}, ${formattedDate}
        </div>

        <table style="width: 100%; text-align: center; border-collapse: collapse;">
          <tr>
            <td style="width: 33%; vertical-align: top;">
              <div>Orang Tua / Wali Murid,</div>
              <div style="height: 55px;"></div>
              <div style="border-bottom: 1px solid #000; width: 140px; margin: 0 auto;"></div>
              <div style="font-size: 8pt; margin-top: 3px;">(........................................)</div>
            </td>
            <td style="width: 34%; vertical-align: top;">
              <div>Guru Kelas / Wali Kelas,</div>
              <div style="height: 55px;"></div>
              <div style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">
                ${teacher.namaGuru || '........................................'}
              </div>
              <div style="font-size: 8pt; font-family: 'Courier New', monospace;">
                NIP. ${teacher.nip || '-'}
              </div>
            </td>
            <td style="width: 33%; vertical-align: top;">
              <div>Mengetahui,<br />Kepala Sekolah,</div>
              <div style="height: 42px;"></div>
              <div style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">
                ${school.namaKepalaSekolah || '........................................'}
              </div>
              <div style="font-size: 8pt; font-family: 'Courier New', monospace;">
                NIP. ${school.nipKepalaSekolah || '-'}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer Page 2 -->
      <div style="font-family: Arial, sans-serif; font-size: 8pt; border-top: 1px solid #000; padding-top: 4px; margin-top: 25px;">
        <span>${school.namaSekolah} | ${classInfo.namaKelas} | <b>${student.namaLengkap}</b></span>
        <span style="float: right;">Halaman 2 dari 2</span>
      </div>
    </div>
  `;

  return html;
}

/**
 * Wraps generated HTML inside a full Word document (.doc) envelope
 */
export function buildWordDocEnvelope(bodyHtml: string, title: string): Blob {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 210mm 297mm; /* A4 Paper */
          margin: 15mm 15mm 15mm 15mm;
          mso-header-margin: 10mm;
          mso-footer-margin: 10mm;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #000000;
          line-height: 1.3;
        }
        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        td, th {
          font-size: 9pt;
        }
        .page-break {
          page-break-before: always;
          mso-break-type: section-break;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${bodyHtml}
      </div>
    </body>
    </html>
  `;

  return new Blob(['\ufeff' + content], {
    type: 'application/msword;charset=utf-8',
  });
}

/**
 * Download a single student's report card as .doc
 */
export function exportStudentReportToDoc(
  db: FullAppDatabase,
  student: Student,
  semester: 1 | 2
): void {
  const bodyHtml = generateStudentReportDocHtml(db, student, semester, true);
  const cleanStudentName = sanitizeFileName(student.namaLengkap);
  const cleanClass = sanitizeFileName(db.classInfo.namaKelas);
  const fileName = `Rapor_${cleanStudentName}_${cleanClass}_Sem${semester}.doc`;

  const blob = buildWordDocEnvelope(bodyHtml, `Rapor - ${student.namaLengkap}`);
  saveAs(blob, fileName);
}

/**
 * Download all active students' report cards into a single combined .doc file
 */
export function exportAllStudentsReportToDoc(
  db: FullAppDatabase,
  semester: 1 | 2
): void {
  const activeStudents = db.students.filter((s) => s.status === 'Aktif');
  if (activeStudents.length === 0) {
    alert('Belum ada data siswa aktif yang dapat diekspor.');
    return;
  }

  let fullHtml = '';
  activeStudents.forEach((student, index) => {
    fullHtml += generateStudentReportDocHtml(db, student, semester, true);
    if (index < activeStudents.length - 1) {
      fullHtml += '<br clear="all" style="page-break-before:always; mso-break-type:section-break" />';
    }
  });

  const cleanClass = sanitizeFileName(db.classInfo.namaKelas);
  const fileName = `Rapor_Semua_Siswa_${cleanClass}_Sem${semester}.doc`;
  const blob = buildWordDocEnvelope(fullHtml, `Rapor Kolektif Kelas ${cleanClass}`);
  saveAs(blob, fileName);
}

/**
 * Exports single student report to modern .docx format using the docx library
 */
export async function exportStudentReportToDocx(
  db: FullAppDatabase,
  student: Student,
  semester: 1 | 2
): Promise<void> {
  const { school, teacher, classInfo, reportSettings, subjects, scores, cocurricular, extracurricular, attendance, teacherNotes, promotions } = db;
  const activeSubjects = subjects.filter((s) => s.isActive);
  const currentSemesterScores = scores[semester]?.[student.id] || {};
  const currentProject = cocurricular[semester];
  const studentCocurricularDesc = currentProject?.capaianSiswa?.[student.id];
  const studentExtracurriculars = extracurricular[semester]?.[student.id] || [];
  const studentAttendance = attendance[semester]?.[student.id] || { sakit: 0, izin: 0, alpa: 0 };
  const studentNote = teacherNotes[semester]?.[student.id] || '';
  const statusItem = promotions[student.id];
  const isKelas6 = classInfo.tingkat === 6 || classInfo.namaKelas.includes('VI');
  const formattedDate = formatDateIndo(reportSettings.tanggalRapor);

  // Table Intrakurikuler Rows
  const subjectRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, size: 18 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Mata Pelajaran', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Nilai Akhir', bold: true, size: 18 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Capaian Kompetensi', bold: true, size: 18 })] })],
        }),
      ],
    }),
    ...activeSubjects.map((sub, idx) => {
      const sc = currentSemesterScores[sub.id];
      const nilaiDisplay = sc ? formatScoreDisplay(sc.nilaiAkhir, reportSettings.formatNilai) : '-';
      const desc = sc ? sc.capaianKompetensi : 'Belum ada deskripsi capaian pembelajaran.';
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}`, size: 18 })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: sub.nama, bold: true, size: 18 })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: nilaiDisplay, bold: true, size: 18 })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: desc, size: 17 })] })],
          }),
        ],
      });
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch margins
          },
        },
        children: [
          // Header Judul
          new Paragraph({
            text: 'LAPORAN HASIL BELAJAR (RAPOR)',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${school.namaSekolah}`,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),

          // Identitas Siswa
          new Paragraph({
            children: [
              new TextRun({ text: 'Nama Peserta Didik: ', bold: true, size: 19 }),
              new TextRun({ text: `${student.namaLengkap}    `, size: 19 }),
              new TextRun({ text: 'Kelas: ', bold: true, size: 19 }),
              new TextRun({ text: `${classInfo.namaKelas}`, size: 19 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'NIS / NISN: ', bold: true, size: 19 }),
              new TextRun({ text: `${student.nis || '-'} / ${student.nisn || '-'}    `, size: 19 }),
              new TextRun({ text: 'Semester: ', bold: true, size: 19 }),
              new TextRun({ text: `${semester} (${semester === 1 ? 'Ganjil' : 'Genap'})    `, size: 19 }),
              new TextRun({ text: 'Tahun Ajaran: ', bold: true, size: 19 }),
              new TextRun({ text: `${classInfo.tahunAjaran}`, size: 19 }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Subjudul A
          new Paragraph({
            children: [new TextRun({ text: 'A. NILAI INTRAKURIKULER & CAPAIAN BELAJAR', bold: true, size: 20 })],
          }),
          new Paragraph({ text: '' }),

          // Tabel Intrakurikuler
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: subjectRows,
          }),
          new Paragraph({ text: '' }),

          // Subjudul B
          new Paragraph({
            children: [new TextRun({ text: 'B. PROJEK PENGUATAN PROFIL PELAJAR PANCASILA', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${currentProject?.tema || 'Gaya Hidup Berkelanjutan'}: `,
                bold: true,
                size: 18,
              }),
              new TextRun({
                text: studentCocurricularDesc || currentProject?.deskripsi || 'Berpartisipasi aktif dalam kegiatan projek pembelajaran.',
                size: 18,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Subjudul C & D (Ekstra & Absensi)
          new Paragraph({
            children: [new TextRun({ text: 'C. EKSTRAKURIKULER & D. KETIDAKHADIRAN', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Ekstrakurikuler: ${studentExtracurriculars.map((e) => `${e.namaEkskul} (${e.keterangan})`).join(', ') || 'Pramuka (Sangat Baik)'}\n`,
                size: 18,
              }),
              new TextRun({
                text: `Ketidakhadiran: Sakit: ${studentAttendance.sakit || 0} hari, Izin: ${studentAttendance.izin || 0} hari, Alpa: ${studentAttendance.alpa || 0} hari`,
                size: 18,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Catatan Wali Kelas
          new Paragraph({
            children: [new TextRun({ text: 'E. CATATAN WALI KELAS', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: studentNote || 'Pertahankan semangat belajar dan terus kembangkan potensimu.',
                italics: true,
                size: 18,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Titimangsa & Tanda Tangan
          new Paragraph({
            text: `${reportSettings.tempatRapor}, ${formattedDate}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Guru Kelas / Wali Kelas                                      Kepala Sekolah\n\n\n\n', size: 18 }),
              new TextRun({ text: `${teacher.namaGuru || '.........................'}                      ${school.namaKepalaSekolah || '.........................'}\n`, bold: true, size: 18 }),
              new TextRun({ text: `NIP. ${teacher.nip || '-'}                                NIP. ${school.nipKepalaSekolah || '-'}`, size: 16 }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanStudentName = sanitizeFileName(student.namaLengkap);
  const cleanClass = sanitizeFileName(classInfo.namaKelas);
  const fileName = `Rapor_${cleanStudentName}_${cleanClass}_Sem${semester}.docx`;
  saveAs(blob, fileName);
}
