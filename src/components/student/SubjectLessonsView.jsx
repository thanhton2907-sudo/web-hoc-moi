import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS_CONFIG } from '../../data/mockData';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Star, 
  FileText, 
  FileUp, 
  Clock, 
  User, 
  CheckSquare
} from 'lucide-react';

export const SubjectLessonsView = ({ subjectId, onBack, onSelectLesson, onOpenTeacher }) => {
  const { lessons, exams, selectedGrade, currentUser, allSubjects } = useApp();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'practice' | 'test' | 'review'

  const subjectsList = allSubjects || SUBJECTS_CONFIG;
  const currentSubject = subjectsList.find(s => s.id === subjectId) || subjectsList[0] || {
    id: subjectId || 'math',
    name: 'Toán học',
    icon: '📐',
    color: 'from-amber-400 to-orange-500'
  };

  // 1. Lọc các bài học chuẩn của môn học và khối lớp
  const subjectLessons = (lessons || []).filter(
    l => l.subjectId === subjectId && Number(l.grade) === Number(selectedGrade)
  );

  // 2. Lấy các đề thi tải lên đã xuất bản của môn này và khối lớp này
  const subjectExams = (exams || []).filter(
    e => e.subjectId === subjectId && Number(e.grade) === Number(selectedGrade) && e.status !== 'draft' && e.status !== 'hidden'
  );

  // 3. Chuyển đổi các đề thi chưa có trong subjectLessons thành bài tập để học sinh bấm vào làm ngay
  const examsAsLessons = subjectExams
    .filter(e => !subjectLessons.some(l => l.examId === e.id || l.id === 'lesson-' + e.id || l.title === e.title))
    .map(e => ({
      id: 'lesson-' + e.id,
      examId: e.id,
      subjectId: e.subjectId,
      grade: e.grade,
      unit: e.examType === 'test' ? 'BÀI KIỂM TRA ĐỊNH KỲ' : e.examType === 'review' ? 'ĐỀ ÔN TẬP TỔNG HỢP' : 'ĐỀ THI & LUYỆN TẬP',
      title: e.title,
      examType: e.examType || 'practice',
      unlocked: true,
      completed: false,
      isExam: true,
      creatorName: e.creatorName || 'Giáo viên',
      durationMinutes: e.durationMinutes || 20,
      theory: `Đề thi môn ${currentSubject?.name || 'môn học'} - Lớp ${e.grade}.\nLoại đề: ${e.examType === 'test' ? 'Kiểm tra' : e.examType === 'review' ? 'Ôn tập' : 'Luyện tập'}.\nThời gian làm bài: ${e.durationMinutes || 20} phút.\nTổng số câu: ${e.questions?.length || 0} câu hỏi.`,
      exercises: (e.questions || []).map((q, idx) => ({
        id: q.id || `q-ex-${idx}`,
        type: q.type || 'multiple-choice',
        section: q.section,
        question: q.question,
        image: q.image,
        imageSize: q.imageSize,
        options: q.options || [],
        answer: q.answer,
        subQuestions: q.subQuestions,
        points: q.points || 2,
        explanation: q.explanation || 'Đáp án chính xác.',
        audioText: q.audioText
      }))
    }));

  // Gộp cả Bài học và Đề thi tải lên vào danh sách duy nhất của môn này
  const allItems = [...subjectLessons, ...examsAsLessons].filter(item => {
    if (filterType === 'all') return true;
    return item.examType === filterType;
  });

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Top Header Buttons */}
      <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tất cả môn học</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenTeacher && (
            <button
              onClick={onOpenTeacher}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-bold transition shadow-sm text-xs md:text-sm"
              title="Tải đề Word/PDF hoặc tạo đề mới cho môn này"
            >
              <FileUp className="w-4 h-4" />
              <span>Tải Đề Cho {currentSubject.name}</span>
            </button>
          )}

          {isTeacher && (
            <div className="hidden sm:flex text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              <span>Mọi đề Word/PDF tải lên sẽ vào thẳng đây!</span>
            </div>
          )}
        </div>
      </div>

      {/* Subject Hero Card */}
      <div className={`rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 bg-gradient-to-r ${currentSubject.color} relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl md:text-5xl border-2 border-white/40 shadow-inner">
              {currentSubject.icon}
            </div>
            <div>
              <span className="bg-black/20 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Lớp {selectedGrade}
              </span>
              <h2 className="text-2xl md:text-4xl font-black font-display tracking-tight mt-1">
                {currentSubject.name}
              </h2>
              <p className="text-white/90 text-xs md:text-sm font-semibold mt-0.5">
                Khám phá bài học trực quan, bài tập tương tác và đề thi luyện tập!
              </p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-white/30 self-stretch md:self-auto">
            <span className="block text-2xl md:text-3xl font-black">{allItems.length}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Bài học & Đề thi có sẵn</span>
          </div>
        </div>
      </div>

      {/* Bộ Lọc Theo Loại Đề: Tất cả | Luyện tập | Kiểm tra | Ôn tập */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 shrink-0">Phân loại:</span>
        {[
          { key: 'all', label: 'Tất cả bài học & đề thi', icon: '📚' },
          { key: 'practice', label: 'Luyện tập', icon: '📝' },
          { key: 'test', label: 'Kiểm tra', icon: '⏱️' },
          { key: 'review', label: 'Ôn tập', icon: '⭐' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shrink-0 ${
              filterType === tab.key
                ? 'bg-amber-400 text-amber-950 shadow-sm scale-102 ring-2 ring-amber-300'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Danh Sách Bài Học & Đề Thi Của Môn Này */}
      <div className="space-y-4">
        {allItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-300">
            <p className="text-4xl mb-2">📚</p>
            <h4 className="font-extrabold text-slate-800 text-lg">Chưa có bài học hoặc đề thi cho {currentSubject.name} - Lớp {selectedGrade}</h4>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Hệ thống đang ở trạng thái mới trắng để Thầy Cô tự do tạo đề. Mọi đề thi Word / PDF / Ảnh tải lên cho môn này sẽ tự động xuất hiện ngay tại đây!
            </p>
            {onOpenTeacher && (
              <button
                onClick={onOpenTeacher}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-black text-sm rounded-2xl shadow-md inline-flex items-center gap-2 btn-kid"
              >
                <FileUp className="w-4 h-4" />
                <span>Tải Đề Word / PDF / Ảnh Ngay</span>
              </button>
            )}
          </div>
        ) : (
          allItems.map((item, idx) => {
            const isLocked = !item.unlocked;
            const isUploadedExam = item.isExam || item.unit?.includes('ĐỀ THI') || item.examId;

            return (
              <div
                key={item.id}
                onClick={() => !isLocked && onSelectLesson(item)}
                className={`rounded-3xl p-5 md:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-3 ${
                  isLocked
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                    : isUploadedExam
                    ? 'bg-gradient-to-r from-amber-50/90 to-orange-50/90 border-amber-300 hover:border-amber-500 cursor-pointer cartoon-card shadow-sm'
                    : 'bg-white border-amber-200 hover:border-amber-400 cursor-pointer cartoon-card'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Status Circle / Number */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm flex-shrink-0 ${
                    item.completed
                      ? 'bg-emerald-500 text-white'
                      : isLocked
                      ? 'bg-slate-200 text-slate-400'
                      : isUploadedExam
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md'
                      : 'bg-amber-400 text-amber-950'
                  }`}>
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : isUploadedExam ? (
                      <FileText className="w-6 h-6" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                        isUploadedExam
                          ? 'bg-orange-100 text-orange-900 border border-orange-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.unit || (isUploadedExam ? 'Đề Thi Tải Lên' : 'Chủ đề bài học')}
                      </span>

                      {isUploadedExam && (
                        <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-300">
                          ✓ Trích xuất từ tài liệu
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-base md:text-lg mt-1">
                      {item.title}
                    </h3>

                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 mt-1 flex-wrap">
                      <span>{item.exercises?.length || 0} bài tập tương tác</span>
                      {item.durationMinutes && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {item.durationMinutes} phút
                          </span>
                        </>
                      )}
                      {item.completed && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-black flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> Điểm: {item.score}/10
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Button */}
                <div className="flex items-center justify-end">
                  {isLocked ? (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-200/80 px-3 py-1.5 rounded-xl">
                      <Lock className="w-3.5 h-3.5" /> Mở khóa khi hoàn thành bài trước
                    </span>
                  ) : (
                    <button className={`px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm shadow-md btn-kid flex items-center space-x-1.5 ${
                      isUploadedExam
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                        : 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950'
                    }`}>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{item.completed ? 'Làm lại' : isUploadedExam ? 'Bắt đầu làm bài' : 'Bắt đầu học'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
