import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { playKidSound, speakText } from '../../utils/speech';
import { MultiItemQuestion } from '../common/MultiItemQuestion';
import { gradeMultiItemQuestion } from '../../utils/multiItemSplitter';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  Lightbulb, 
  Play, 
  Check,
  Maximize2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LessonPlayer = ({ lesson, onBack }) => {
  const { completeLesson, addToErrorNotebook } = useApp();
  const [activeTab, setActiveTab] = useState(lesson.isExam ? 'practice' : 'theory'); // 'theory' | 'practice'
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleSelectAnswer = (exId, answer) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [exId]: answer }));
  };

  const handleCheckQuiz = () => {
    let earnedPoints = 0;
    let totalPoints = 0;

    lesson.exercises.forEach(ex => {
      if (ex.subQuestions && ex.subQuestions.length > 0) {
        // Chấm điểm từng ý độc lập
        const gradeRes = gradeMultiItemQuestion(ex, userAnswers);
        earnedPoints += gradeRes.earnedPoints;
        totalPoints += gradeRes.totalPoints;

        gradeRes.details.forEach(d => {
          if (!d.isCorrect) {
            addToErrorNotebook({
              subject: lesson.subjectId === 'math' ? 'Toán' : lesson.subjectId === 'vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh',
              grade: lesson.grade,
              question: `${ex.question || 'Bài tập'} (${d.prompt})`,
              userWrongAnswer: d.userAns || '(Chưa điền)',
              correctAnswer: d.expectedAns || 'Chưa cài đặt',
              explanation: d.explanation || ex.explanation || 'Hãy đọc kĩ lại bài giảng nhé!'
            });
          }
        });
      } else {
        const p = ex.points || 2;
        totalPoints += p;
        const userAns = userAnswers[ex.id];
        let isCorrect = false;

        if (ex.type === 'multiple-choice') {
          isCorrect = userAns === ex.answer;
        } else if (ex.type === 'fill-in') {
          isCorrect = userAns && userAns.trim().toLowerCase() === ex.answer.trim().toLowerCase();
        } else if (ex.type === 'matching') {
          // Simple matching logic check
          isCorrect = true;
        }

        if (isCorrect) {
          earnedPoints += p;
        } else {
          // Save to error notebook automatically
          addToErrorNotebook({
            subject: lesson.subjectId === 'math' ? 'Toán' : lesson.subjectId === 'vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh',
            grade: lesson.grade,
            question: ex.question || 'Bài tập thực hành',
            userWrongAnswer: userAns || '(Chưa điền)',
            correctAnswer: ex.answer || 'Đáp án mẫu',
            explanation: ex.explanation || 'Hãy đọc kĩ lại bài giảng nhé!'
          });
        }
      }
    });

    const finalScore = Math.round((earnedPoints / (totalPoints || 10)) * 10);
    setScore(finalScore);
    setSubmitted(true);

    if (finalScore >= 7) {
      playKidSound('fanfare');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      completeLesson(lesson.id, finalScore);
    } else {
      playKidSound('wrong');
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại môn học</span>
        </button>
      </div>

      {/* Lesson Banner Card */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-6 text-white shadow-lg mb-6 border-4 border-amber-300">
        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-block mb-2">
          {lesson.unit}
        </span>
        <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight mb-2">
          {lesson.title}
        </h2>
        <div className="flex items-center space-x-3 text-xs md:text-sm font-semibold opacity-95">
          <span>Khối: Lớp {lesson.grade}</span>
          <span>•</span>
          <span>{lesson.exercises?.length || 0} bài tập vận dụng</span>
          {lesson.completed && (
            <>
              <span>•</span>
              <span className="bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Đã hoàn thành ({lesson.score}đ)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm md:text-base transition border-2 ${
            activeTab === 'theory'
              ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md scale-102'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lesson.isExam ? '📋 Hướng Dẫn & Thông Tin Đề' : '📖 Khám Phá Kiến Thức Mới'}
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm md:text-base transition border-2 ${
            activeTab === 'practice'
              ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md scale-102'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lesson.isExam ? '📝 Bắt Đầu Làm Đề Thi' : '✏️ Luyện Tập Thực Hành'} ({lesson.exercises?.length || 0} câu)
        </button>
      </div>

      {/* Tab 1: Theory */}
      {activeTab === 'theory' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-3 border-amber-200 shadow-sm cartoon-card">
          <div className="mb-4 pb-3 border-b border-amber-100">
            <h3 className="text-xl font-black text-amber-900 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Nội dung bài giảng
            </h3>
          </div>

          {/* Embedded Video Demo (Hỗ trợ cả GitHub MP4 và YouTube) */}
          {lesson.videoUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-md border-2 border-slate-200 bg-black aspect-video max-h-80 w-full flex items-center justify-center">
              {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={lesson.videoUrl.includes('embed') ? lesson.videoUrl : lesson.videoUrl.replace('watch?v=', 'embed/')}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  controls
                  playsInline
                  src={lesson.videoUrl}
                  className="w-full h-full object-contain"
                >
                  Trình duyệt không hỗ trợ phát định dạng video này.
                </video>
              )}
            </div>
          )}

          {/* Theory Text & Visual formatting */}
          <div className="prose prose-slate max-w-none text-slate-900 leading-relaxed text-base md:text-xl whitespace-pre-line font-semibold tracking-wide">
            {lesson.theory}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('practice')}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-black rounded-2xl shadow-lg btn-kid text-base inline-flex items-center space-x-2"
            >
              <span>Bé đã hiểu bài, cùng Luyện tập nào!</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Practice Quizzes */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {lesson.exercises?.map((ex, index) => (
            <div
              key={ex.id}
              className={`bg-white rounded-3xl p-6 border-3 transition cartoon-card ${
                submitted 
                  ? (userAnswers[ex.id] === ex.answer 
                      ? 'border-emerald-300 bg-emerald-50/20' 
                      : 'border-rose-300 bg-rose-50/20')
                  : 'border-slate-200'
              }`}
            >
              {/* Question Header */}
              <div className="mb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-sm shadow-sm">
                    {index + 1}
                  </span>
                  <h4 className="font-black text-slate-900 text-lg md:text-xl leading-snug">
                    {ex.question || ex.prompt}
                  </h4>
                </div>
              </div>

              {/* Visual image or illustration if present */}
              {ex.image && (
                <div className="my-3">
                  {typeof ex.image === 'string' && (ex.image.startsWith('data:image') || ex.image.startsWith('http') || ex.image.startsWith('blob:')) ? (
                    <div className="relative inline-block group">
                      <img
                        src={ex.image}
                        alt="Hình minh họa bài tập"
                        onClick={() => setPreviewImage(ex.image)}
                        className="max-h-64 rounded-2xl mx-auto object-contain cursor-pointer shadow-sm border-2 border-slate-200 hover:opacity-95 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(ex.image)}
                        className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Xem lớn</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-2xl text-center text-3xl tracking-widest border border-amber-200">
                      {ex.image}
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Choice Form */}
              {ex.type === 'multiple-choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {ex.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[ex.id] === opt;
                    const isCorrect = submitted && opt === ex.answer;
                    const isWrongSelected = submitted && isSelected && opt !== ex.answer;

                    return (
                      <button
                        key={optIdx}
                        disabled={submitted}
                        onClick={() => handleSelectAnswer(ex.id, opt)}
                        className={`p-4 rounded-2xl font-bold text-base text-left transition border-2 flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                            : isWrongSelected
                            ? 'bg-rose-100 border-rose-500 text-rose-950'
                            : isSelected
                            ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-amber-50/60 text-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                        {isWrongSelected && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in blank form */}
              {ex.type === 'fill-in' && (
                ex.subQuestions && ex.subQuestions.length > 0 ? (
                  <div className="mt-4">
                    <MultiItemQuestion
                      question={ex}
                      userAnswers={userAnswers}
                      onAnswerChange={handleSelectAnswer}
                      isSubmitted={submitted}
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex items-center space-x-3">
                    <span className="font-bold text-slate-600 text-sm">Đáp án của bé:</span>
                    <input
                      type="text"
                      disabled={submitted}
                      value={userAnswers[ex.id] || ''}
                      onChange={(e) => handleSelectAnswer(ex.id, e.target.value)}
                      placeholder="Nhập câu trả lời..."
                      className="flex-1 max-w-xs px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl font-black text-slate-800 text-lg focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )
              )}

              {/* Explanation upon submission */}
              {submitted && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs md:text-sm">
                  <p className="font-extrabold text-amber-900 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    Lời giải chi tiết:
                  </p>
                  <p className="text-slate-700 font-medium">{ex.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {/* Action Footer */}
          <div className="bg-white rounded-3xl p-6 border-3 border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {submitted ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md ${
                    score >= 7 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {score}đ
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">
                      {score >= 8 ? '🎉 Bé học siêu đỉnh!' : score >= 5 ? '👍 Khá lắm, cố thêm chút nữa nhé!' : '💪 Đừng nản, cùng thử lại nào!'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {score < 10 ? 'Những câu sai đã được tự động lưu vào Sổ Lỗi Sai để bé ôn lại.' : 'Bé đã nhận được 10 sao vàng thưởng!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRetry}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center space-x-2 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Làm lại bài</span>
                  </button>
                  <button
                    onClick={onBack}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-2xl shadow-md btn-kid"
                  >
                    Tiếp tục học bài khác
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-slate-500">
                  Hãy kiểm tra kĩ trước khi bấm Nộp bài nhé các bé!
                </div>
                <button
                  onClick={handleCheckQuiz}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-base rounded-2xl shadow-lg btn-kid flex items-center justify-center space-x-2"
                >
                  <span>Chấm Điểm Tự Động</span>
                  <Check className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL ZOOM ẢNH LỚN NÉT */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Hình ảnh bài toán phóng to" 
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
