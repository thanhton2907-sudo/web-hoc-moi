import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { StudentDashboard } from './components/student/StudentDashboard';
import { SubjectLessonsView } from './components/student/SubjectLessonsView';
import { LessonPlayer } from './components/student/LessonPlayer';
import { EnglishListeningHub } from './components/student/EnglishListeningHub';
import { ErrorNotebook } from './components/student/ErrorNotebook';
import { MiniGames } from './components/student/MiniGames';
import { ExamBankAndTaker } from './components/exam/ExamBankAndTaker';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

export const App = () => {
  const { currentRole } = useApp();
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  // Quick navigation handlers
  const handleSelectSubject = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setActiveLesson(null);
  };

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
  };

  const handleBackToSubjects = () => {
    setSelectedSubjectId(null);
    setActiveLesson(null);
  };

  const handleBackToLessons = () => {
    setActiveLesson(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f8ff] text-slate-800 font-kid selection:bg-amber-300">
      {/* Top Main Navigation Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* TAB: HOME / STUDY CURRICULUM */}
        {currentTab === 'home' && (
          <>
            {activeLesson ? (
              <LessonPlayer
                lesson={activeLesson}
                onBack={handleBackToLessons}
              />
            ) : selectedSubjectId ? (
              <SubjectLessonsView
                subjectId={selectedSubjectId}
                onBack={handleBackToSubjects}
                onSelectLesson={handleSelectLesson}
                onOpenTeacher={() => setCurrentTab('teacher')}
              />
            ) : (
              <StudentDashboard
                onSelectSubject={handleSelectSubject}
                onOpenEnglishListening={() => setCurrentTab('english')}
                onOpenExams={() => setCurrentTab('exams')}
                onOpenErrors={() => setCurrentTab('errors')}
              />
            )}
          </>
        )}

        {/* TAB: ENGLISH LISTENING HUB */}
        {currentTab === 'english' && <EnglishListeningHub />}

        {/* TAB: EXAMS & ASSESSMENTS */}
        {currentTab === 'exams' && <ExamBankAndTaker />}

        {/* TAB: ERROR NOTEBOOK */}
        {currentTab === 'errors' && <ErrorNotebook />}

        {/* TAB: MINI GAMES */}
        {currentTab === 'games' && <MiniGames />}

        {/* TAB: PARENT DASHBOARD */}
        {currentTab === 'parent' && <ParentDashboard />}

        {/* TAB: QUẢN LÝ WEB DÀNH CHO GIÁO VIÊN */}
        {(currentTab === 'admin' || currentTab === 'teacher') && <AdminDashboard />}
      </main>
    </div>
  );
};

export default App;
