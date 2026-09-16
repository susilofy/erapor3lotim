import React, { useState, useEffect } from 'react';
import {
  FullAppDatabase,
  ActiveTab,
  Student,
  Subject,
  LingkupMateri,
  ScoresDatabase,
  CocurricularDatabase,
  ExtracurricularDatabase,
  AttendanceDatabase,
  TeacherNotesDatabase,
  PromotionDatabase,
  ExtracurricularItem,
  SchoolInfo,
  TeacherInfo,
  ClassInfo,
  ReportSettings,
} from './types';
import {
  loadDatabase,
  saveDatabase,
  exportBackupJson,
  restoreBackupFromJson,
  resetDatabase,
  clearTeacherStudentLearningScopeData,
} from './utils/storageHelper';
import { checkReportCompleteness } from './utils/validationHelper';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SchoolDataView } from './components/SchoolDataView';
import { TeacherDataView } from './components/TeacherDataView';
import { ClassSettingsView } from './components/ClassSettingsView';
import { StudentDataView } from './components/StudentDataView';
import { SubjectsView } from './components/SubjectsView';
import { LearningScopeView } from './components/LearningScopeView';
import { ScoresInputView } from './components/ScoresInputView';
import { CompetencyView } from './components/CompetencyView';
import { CocurricularView } from './components/CocurricularView';
import { ExtracurricularView } from './components/ExtracurricularView';
import { AttendanceView } from './components/AttendanceView';
import { TeacherNotesView } from './components/TeacherNotesView';
import { StudentStatusView } from './components/StudentStatusView';
import { ScoreRecapView } from './components/ScoreRecapView';
import { ReportPreviewView } from './components/ReportPreviewView';
import { DatabaseBackupView } from './components/DatabaseBackupView';

export default function App() {
  const [data, setData] = useState<FullAppDatabase>(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    saveDatabase(data);
  }, [data]);

  const completeness = checkReportCompleteness(data, data.classInfo.semester);

  // State update handlers
  const handleUpdateSchool = (school: SchoolInfo) => {
    setData((prev) => ({ ...prev, school }));
  };

  const handleUpdateTeacher = (teacher: TeacherInfo) => {
    setData((prev) => ({ ...prev, teacher }));
  };

  const handleUpdateClass = (classInfo: ClassInfo) => {
    setData((prev) => ({ ...prev, classInfo }));
  };

  const handleUpdateSettings = (reportSettings: ReportSettings) => {
    setData((prev) => ({ ...prev, reportSettings }));
  };

  const handleSemesterChange = (semester: 1 | 2) => {
    setData((prev) => ({
      ...prev,
      classInfo: { ...prev.classInfo, semester },
    }));
  };

  // Student CRUD
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
    }));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)),
    }));
  };

  const handleDeleteStudent = (studentId: string) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));
  };

  const handleBatchAddStudents = (newStudents: Partial<Student>[]) => {
    const startNo =
      data.students.length > 0
        ? Math.max(...data.students.map((s) => s.noUrut || 0)) + 1
        : 1;

    const mapped: Student[] = newStudents.map((item, idx) => ({
      id: `std-${Date.now()}-${idx}`,
      noUrut: item.noUrut || startNo + idx,
      namaLengkap: item.namaLengkap || 'Nama Siswa',
      nis: item.nis || `${1000 + startNo + idx}`,
      nisn: item.nisn || `00${startNo + idx}123456`,
      jenisKelamin: item.jenisKelamin || 'L',
      tempatLahir: item.tempatLahir || 'Jakarta',
      tanggalLahir: item.tanggalLahir || '2014-01-01',
      agama: item.agama || 'Islam',
      alamat: item.alamat || 'Jl. Pendidikan No. 1',
      namaAyah: item.namaAyah || 'Ayah',
      namaIbu: item.namaIbu || 'Ibu',
      namaWali: item.namaWali || '-',
      noKK: item.noKK || '',
      nik: item.nik || '',
      status: item.status || 'Aktif',
    }));

    setData((prev) => ({
      ...prev,
      students: [...prev.students, ...mapped],
    }));
  };

  // Quick load 1 sample student for testing print & preview
  const handleLoadSampleStudent = () => {
    const sampleStudent: Student = {
      id: `std-sample-${Date.now()}`,
      noUrut: 1,
      namaLengkap: 'Ahmad Fauzi Pratama',
      nis: '202401',
      nisn: '0123456789',
      jenisKelamin: 'L',
      tempatLahir: 'Jakarta',
      tanggalLahir: '2014-05-12',
      agama: 'Islam',
      alamat: 'Jl. Melati No. 12, Kel. Loloan Timur',
      namaAyah: 'Bambang Pratama',
      namaIbu: 'Siti Aminah',
      namaWali: '-',
      noKK: '5101011234567890',
      nik: '5101011234560001',
      status: 'Aktif',
    };

    // Give sample scores for each subject so the academic report displays realistic scores
    const sampleScores: Record<string, any> = {};
    data.subjects.forEach((sub, idx) => {
      const na = 82 + (idx % 10);
      sampleScores[sub.id] = {
        studentId: sampleStudent.id,
        subjectId: sub.id,
        sumatifMateri: { 'lm-sample': na },
        sumatifAkhirSemester: na,
        nilaiAkhir: na,
        capaianKompetensi: `Menunjukkan penguasaan yang sangat baik dalam memahami materi ${sub.nama}. Perlu pendampingan berkala dalam penerapan lanjutan.`,
      };
    });

    setData((prev) => ({
      ...prev,
      students: [...prev.students.filter((s) => s.id !== sampleStudent.id), sampleStudent],
      scores: {
        ...prev.scores,
        [prev.classInfo.semester]: {
          ...(prev.scores[prev.classInfo.semester] || {}),
          [sampleStudent.id]: sampleScores,
        },
      },
    }));
  };

  // Subjects & Learning Scopes
  const handleUpdateSubjects = (subjects: Subject[]) => {
    setData((prev) => ({ ...prev, subjects }));
  };

  const handleUpdateScopes = (learningScopes: LingkupMateri[]) => {
    setData((prev) => ({ ...prev, learningScopes }));
  };

  // Scores
  const handleUpdateScores = (scores: ScoresDatabase) => {
    setData((prev) => ({ ...prev, scores }));
  };

  // Cocurricular P5
  const handleUpdateCocurricular = (cocurricular: CocurricularDatabase) => {
    setData((prev) => ({ ...prev, cocurricular }));
  };

  // Extracurricular
  const handleUpdateExtracurricularList = (extracurricularList: ExtracurricularItem[]) => {
    setData((prev) => ({ ...prev, extracurricularList }));
  };

  const handleUpdateExtracurricular = (extracurricular: ExtracurricularDatabase) => {
    setData((prev) => ({ ...prev, extracurricular }));
  };

  // Attendance
  const handleUpdateAttendance = (attendance: AttendanceDatabase) => {
    setData((prev) => ({ ...prev, attendance }));
  };

  // Teacher Notes
  const handleUpdateTeacherNotes = (teacherNotes: TeacherNotesDatabase) => {
    setData((prev) => ({ ...prev, teacherNotes }));
  };

  // Promotions
  const handleUpdatePromotions = (promotions: PromotionDatabase) => {
    setData((prev) => ({ ...prev, promotions }));
  };

  // Backup & Restore
  const handleExportBackup = () => {
    exportBackupJson(data);
  };

  const handleRestoreBackup = (file: File) => {
    restoreBackupFromJson(
      file,
      (restored) => {
        setData(restored);
        alert('Data berhasil dipulihkan dari file cadangan!');
      },
      (error) => {
        alert(`Gagal memulihkan cadangan: ${error}`);
      }
    );
  };

  const handleResetData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mereset seluruh data kembali ke contoh awal? Semua perubahan akan digantikan data standar.'
      )
    ) {
      const reset = resetDatabase();
      setData(reset);
      alert('Data telah dikembalikan ke contoh awal bawaan.');
    }
  };

  const handleClearTeacherStudentScopes = () => {
    setData((prev) => clearTeacherStudentLearningScopeData(prev));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800">
      {/* Top Header (Hidden on print) */}
      <Header
        db={data}
        semester={data.classInfo.semester}
        setSemester={handleSemesterChange}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        isSidebarOpen={isSidebarOpen}
        completenessPercent={completeness.percent}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (Hidden on print) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          semester={data.classInfo.semester}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto ${
            isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
          } transition-[margin] duration-300 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:ml-0 print:overflow-visible`}
        >
          {activeTab === 'dashboard' && (
            <Dashboard
              db={data}
              semester={data.classInfo.semester}
              setActiveTab={setActiveTab}
              completeness={completeness}
            />
          )}

          {activeTab === 'sekolah' && (
            <SchoolDataView school={data.school} onUpdate={handleUpdateSchool} />
          )}

          {activeTab === 'guru' && (
            <TeacherDataView teacher={data.teacher} onUpdate={handleUpdateTeacher} />
          )}

          {activeTab === 'kelas' && (
            <ClassSettingsView
              classInfo={data.classInfo}
              reportSettings={data.reportSettings}
              teacherName={data.teacher.namaGuru}
              onUpdateClass={handleUpdateClass}
              onUpdateSettings={handleUpdateSettings}
              onSemesterChange={handleSemesterChange}
            />
          )}

          {activeTab === 'siswa' && (
            <StudentDataView
              students={data.students}
              className={data.classInfo.namaKelas}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBatchAddStudents={handleBatchAddStudents}
            />
          )}

          {activeTab === 'mapel' && (
            <SubjectsView
              subjects={data.subjects}
              onUpdateSubjects={handleUpdateSubjects}
            />
          )}

          {activeTab === 'lingkup_materi' && (
            <LearningScopeView
              subjects={data.subjects}
              learningScopes={data.learningScopes}
              semester={data.classInfo.semester}
              onUpdateScopes={handleUpdateScopes}
            />
          )}

          {activeTab === 'nilai' && (
            <ScoresInputView
              students={data.students}
              subjects={data.subjects}
              learningScopes={data.learningScopes}
              scores={data.scores}
              semester={data.classInfo.semester}
              className={data.classInfo.namaKelas}
              reportSettings={data.reportSettings}
              onUpdateScores={handleUpdateScores}
              onUpdateReportSettings={handleUpdateSettings}
            />
          )}

          {activeTab === 'capaian' && (
            <CompetencyView
              students={data.students}
              subjects={data.subjects}
              learningScopes={data.learningScopes}
              scores={data.scores}
              semester={data.classInfo.semester}
              reportSettings={data.reportSettings}
              onUpdateScores={handleUpdateScores}
            />
          )}

          {activeTab === 'kokurikuler' && (
            <CocurricularView
              students={data.students}
              cocurricular={data.cocurricular}
              semester={data.classInfo.semester}
              onUpdateCocurricular={handleUpdateCocurricular}
            />
          )}

          {activeTab === 'ekstrakurikuler' && (
            <ExtracurricularView
              students={data.students}
              extracurricularList={data.extracurricularList}
              extracurricular={data.extracurricular}
              semester={data.classInfo.semester}
              onUpdateList={handleUpdateExtracurricularList}
              onUpdateExtracurricular={handleUpdateExtracurricular}
            />
          )}

          {activeTab === 'absensi' && (
            <AttendanceView
              students={data.students}
              attendance={data.attendance}
              semester={data.classInfo.semester}
              onUpdateAttendance={handleUpdateAttendance}
            />
          )}

          {activeTab === 'catatan' && (
            <TeacherNotesView
              students={data.students}
              teacherNotes={data.teacherNotes}
              semester={data.classInfo.semester}
              onUpdateNotes={handleUpdateTeacherNotes}
            />
          )}

          {activeTab === 'status_siswa' && (
            <StudentStatusView
              students={data.students}
              promotions={data.promotions}
              classInfo={data.classInfo}
              semester={data.classInfo.semester}
              onUpdatePromotions={handleUpdatePromotions}
            />
          )}

          {activeTab === 'rekap_nilai' && (
            <ScoreRecapView
              students={data.students}
              subjects={data.subjects}
              scores={data.scores}
              semester={data.classInfo.semester}
              school={data.school}
              teacher={data.teacher}
              classInfo={data.classInfo}
              reportSettings={data.reportSettings}
            />
          )}

          {activeTab === 'preview_rapor' && (
            <ReportPreviewView
              data={data}
              onNavigateTab={setActiveTab}
              onLoadSampleStudent={handleLoadSampleStudent}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseBackupView
              db={data}
              onExportBackup={handleExportBackup}
              onRestoreBackup={handleRestoreBackup}
              onResetData={handleResetData}
              onClearTeacherStudentScopes={handleClearTeacherStudentScopes}
            />
          )}
        </main>
      </div>
    </div>
  );
}
