import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AudioPlayer } from '../common/AudioPlayer';
import { MultiItemQuestion } from '../common/MultiItemQuestion';
import { gradeMultiItemQuestion } from '../../utils/multiItemSplitter';
import { playKidSound } from '../../utils/speech';
import { 
  FileText, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight,
  HelpCircle, 
  Headphones, 
  Trophy,
  UploadCloud,
  Check,
  Maximize2,
  X,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExamBankAndTaker = () => {
  const { 
    exams, 
    selectedGrade, 
    addToErrorNotebook, 
    rewardStars, 
    allSubjects, 
    recordExamResult,
    currentStudent 
  } = useApp();

  const [activeExam, setActiveExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Filters for exam bank
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'practice' | 'test' | 'review'

  // Question navigation modes: 'single' (từng câu) | 'all' (toàn bộ đề)
  const [viewMode, setViewMode] = useState('single');
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Modal zoom ảnh lớn
  const [zoomImage, setZoomImage] = useState(null);

  // Modal xác nhận nộp bài khi còn câu chưa làm
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Filter exams by grade, status ('published' only for student view), subject, type
  const availableExams = (exams || []).filter(e => {
    const matchGrade = Number(e.grade) === Number(selectedGrade) || !e.grade;
    const isPublished = e.status !== 'draft' && e.status !== 'hidden';
    const matchSubject = filterSubject === 'all' || e.subjectId === filterSubject;
    const matchType = filterType === 'all' || e.examType === filterType;
    return matchGrade && isPublished && matchSubject && matchType;
  });

  // Timer countdown
  useEffect(() => {
    let timer;
    if (activeExam && !isExamFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeExam && !isExamFinished && activeExam.durationMinutes > 0) {
      handleSubmitExam();
    }
    return () => clearInterval(timer);
  }, [activeExam, isExamFinished, timeLeft]);

  const handleStartExam = (exam) => {
    setActiveExam(exam);
    setUserAnswers({});
    const initialSeconds = (exam.durationMinutes || 20) * 60;
    setTimeLeft(initialSeconds);
    setIsExamFinished(false);
    setExamResult(null);
    setCurrentQIndex(0);
    setViewMode('single');
    setShowSubmitConfirm(false);
  };

  const handleSelectAnswer = (qId, ans) => {
    if (isExamFinished) return;
    setUserAnswers(prev => ({ ...prev, [qId]: ans }));
  };

  // Kiểm tra số câu đã trả lời
  const getAnsweredCount = () => {
    if (!activeExam || !activeExam.questions) return { answered: 0, total: 0 };
    const total = activeExam.questions.length;
    let answered = 0;
    activeExam.questions.forEach(q => {
      if (q.subQuestions && q.subQuestions.length > 0) {
        const hasAnySub = q.subQuestions.some((s, idx) => !!userAnswers[`${q.id}_${s.id || idx}`]);
        if (hasAnySub) answered++;
      } else if (userAnswers[q.id] && String(userAnswers[q.id]).trim().length > 0) {
        answered++;
      }
    });
    return { answered, total };
  };

  const handleCheckBeforeSubmit = () => {
    const { answered, total } = getAnsweredCount();
    if (answered < total) {
      setShowSubmitConfirm(true);
    } else {
      handleSubmitExam();
    }
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;
    setShowSubmitConfirm(false);

    let earnedPoints = 0;
    let totalPoints = 0;
    let correctCount = 0;
    let wrongCount = 0;

    activeExam.questions.forEach(q => {
      if (q.subQuestions && q.subQuestions.length > 0) {
        // Chấm điểm từng ý độc lập cho câu hỏi có nhiều ý nhỏ
        const gradeRes = gradeMultiItemQuestion(q, userAnswers);
        earnedPoints += gradeRes.earnedPoints;
        totalPoints += gradeRes.totalPoints;
        if (gradeRes.isAllCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }

        // Tự động lưu các ý sai vào Sổ Lỗi Sai
        gradeRes.details.forEach(d => {
          if (!d.isCorrect) {
            addToErrorNotebook({
              subject: activeExam.subjectId === 'english' ? 'Tiếng Anh' : activeExam.subjectId === 'vietnamese' ? 'Tiếng Việt' : 'Toán',
              grade: activeExam.grade,
              question: `${q.question} (${d.prompt})`,
              userWrongAnswer: d.userAns || '(Chưa điền)',
              correctAnswer: d.expectedAns || 'Chưa cài đặt',
              explanation: d.explanation || q.explanation || 'Bé hãy đọc kĩ lại bài học và luyện tập thêm nhé!'
            });
          }
        });
      } else {
        const p = q.points || 2;
        totalPoints += p;
        const userAns = userAnswers[q.id];
        let correct = false;

        if (q.type === 'multiple-choice' || q.type === 'listen-choice') {
          correct = userAns === q.answer;
        } else if (q.type === 'fill-in' || q.type === 'listen-dictation') {
          correct = userAns && userAns.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
        } else if (q.type === 'essay') {
          correct = !!userAns && userAns.trim().length > 3;
        }

        if (correct) {
          earnedPoints += p;
          correctCount++;
        } else {
          wrongCount++;
          addToErrorNotebook({
            subject: activeExam.subjectId === 'english' ? 'Tiếng Anh' : activeExam.subjectId === 'vietnamese' ? 'Tiếng Việt' : 'Toán',
            grade: activeExam.grade,
            question: q.question || 'Câu hỏi đề thi',
            userWrongAnswer: userAns || '(Bỏ trống)',
            correctAnswer: q.answer || q.sampleAnswer || 'Đáp án mẫu',
            explanation: q.explanation || 'Xem lại hướng dẫn làm bài.'
          });
        }
      }
    });

    const finalScore = Math.round((earnedPoints / (totalPoints || 10)) * 10 * 10) / 10;
    const timeSpentSeconds = ((activeExam.durationMinutes || 20) * 60) - timeLeft;

    setExamResult({
      score: finalScore,
      earnedPoints: Math.round(earnedPoints * 100) / 100,
      totalPoints: Math.round(totalPoints * 100) / 100,
      correctCount,
      wrongCount,
      totalQuestions: activeExam.questions.length
    });
    setIsExamFinished(true);

    // Ghi nhận kết quả làm bài vào cơ sở dữ liệu để Phụ huynh theo dõi
    if (recordExamResult) {
      recordExamResult({
        examId: activeExam.id,
        examTitle: activeExam.title,
        examType: activeExam.examType || 'practice',
        subjectId: activeExam.subjectId,
        grade: activeExam.grade,
        score: finalScore,
        earnedPoints: Math.round(earnedPoints * 100) / 100,
        totalPoints: Math.round(totalPoints * 100) / 100,
        correctCount,
        wrongCount,
        timeTakenSeconds: Math.max(10, timeSpentSeconds)
      });
    }

    if (finalScore >= 7) {
      playKidSound('fanfare');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      rewardStars(15, 'Hoàn thành xuất sắc bài thi!');
    } else {
      playKidSound('wrong');
    }
  };

  const formatTimer = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Card hiển thị một câu hỏi
  const renderQuestionCard = (q, displayIndex) => {
    const userAns = userAnswers[q.id];
    const isMulti = q.subQuestions && q.subQuestions.length > 0;
    let isCorrect = false;
    let isPartial = false;

    if (isExamFinished) {
      if (isMulti) {
        const gradeRes = gradeMultiItemQuestion(q, userAnswers);
        isCorrect = gradeRes.isAllCorrect;
        isPartial = !isCorrect && gradeRes.correctCount > 0;
      } else if (q.type === 'essay') {
        isCorrect = !!userAns && userAns.trim().length > 3;
      } else {
        isCorrect = userAns && q.answer && userAns.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
      }
    }

    return (
      <div
        key={q.id || displayIndex}
        className={`bg-white rounded-3xl p-5 md:p-6 border-3 transition cartoon-card relative ${
          isExamFinished
            ? isCorrect
              ? 'border-emerald-300 bg-emerald-50/20'
              : isPartial
              ? 'border-amber-300 bg-amber-50/20'
              : 'border-rose-300 bg-rose-50/20'
            : 'border-slate-200 shadow-sm'
        }`}
      >
        {/* Tiêu đề & Thứ tự câu hỏi */}
        <div className="mb-4">
          <div className="flex items-start space-x-3">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
              {displayIndex + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-black text-slate-900 text-lg md:text-xl leading-snug font-display">
                  {q.question}
                </h4>
                {isMulti && (
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                    ⚡ {q.subQuestions.length} ý nhỏ
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-400">
                ({q.points || 2} điểm)
              </span>
            </div>
          </div>
        </div>

        {/* Hình ảnh minh họa câu hỏi sắc nét (có nút phóng to) */}
        {q.image && (
          <div className="my-3 flex flex-col items-center">
            <div 
              onClick={() => setZoomImage(q.image)}
              className="relative cursor-pointer group rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/40 p-1 shadow-xs hover:border-amber-400 transition"
              title="Bấm để xem ảnh phóng to sắc nét"
            >
              <img 
                src={q.image} 
                alt="Hình minh họa" 
                className={`rounded-xl object-contain mx-auto ${
                  q.imageSize === 'small' ? 'max-h-36 max-w-xs' : q.imageSize === 'large' ? 'max-h-96 w-full' : 'max-h-60 max-w-md'
                }`}
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 backdrop-blur-xs">
                <Maximize2 className="w-3 h-3" />
                <span>Phóng to</span>
              </div>
            </div>
          </div>
        )}

        {/* Audio player DÀNH CHO TIẾNG ANH */}
        {activeExam.subjectId === 'english' && q.audioText && (
          <div className="my-3">
            <AudioPlayer speechText={q.audioText} isEnglish={true} title="Nghe đoạn âm thanh tiếng Anh" />
          </div>
        )}

        {/* 1. Dạng câu hỏi có nhiều ý nhỏ (Multi-Item) */}
        {isMulti ? (
          <MultiItemQuestion
            question={q}
            userAnswers={userAnswers}
            onAnswerChange={handleSelectAnswer}
            isSubmitted={isExamFinished}
          />
        ) : (q.type === 'multiple-choice' || q.type === 'listen-choice') ? (
          /* 2. Dạng trắc nghiệm 4 lựa chọn */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {(q.options || []).map((opt, oIdx) => {
              const isSelected = userAns === opt;
              const isCorrectAnswer = isExamFinished && opt === q.answer;
              const isWrongSelected = isExamFinished && isSelected && opt !== q.answer;

              return (
                <button
                  key={oIdx}
                  disabled={isExamFinished}
                  onClick={() => handleSelectAnswer(q.id, opt)}
                  className={`p-4 rounded-2xl font-black text-left transition border-2 flex items-center justify-between text-sm md:text-base ${
                    isCorrectAnswer
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300'
                      : isWrongSelected
                      ? 'bg-rose-100 border-rose-500 text-rose-950'
                      : isSelected
                      ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-sm ring-2 ring-rose-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs flex items-center justify-center font-black">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </span>
                  {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isWrongSelected && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (q.type === 'fill-in' || q.type === 'listen-dictation') ? (
          /* 3. Dạng điền đáp án ngắn đơn */
          <div className="mt-4">
            <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wide">
              Nhập câu trả lời của em:
            </label>
            <input
              type="text"
              disabled={isExamFinished}
              value={userAns || ''}
              onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
              placeholder="Gõ đáp án của em vào đây..."
              className={`w-full max-w-md px-4 py-3 bg-slate-50 border-2 rounded-2xl font-black text-base md:text-lg text-slate-900 focus:outline-none ${
                isExamFinished
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                    : 'border-rose-500 bg-rose-50 text-rose-950'
                  : 'border-slate-300 focus:border-rose-400 focus:bg-white'
              }`}
            />
          </div>
        ) : (
          /* 4. Dạng tự luận viết đoạn văn / giải toán chi tiết */
          <div className="mt-4 space-y-2">
            <label className="block text-xs font-black text-slate-600 mb-1 uppercase tracking-wide">
              Bài giải chi tiết:
            </label>
            <textarea
              rows={4}
              disabled={isExamFinished}
              value={userAns || ''}
              onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
              placeholder="Bé hãy viết lời giải chi tiết hoặc câu trả lời tự luận vào đây..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl font-medium text-slate-800 text-sm md:text-base focus:border-rose-400 focus:outline-none"
            />
          </div>
        )}

        {/* Lời giải & Đáp án đúng sau khi nộp bài */}
        {isExamFinished && !isMulti && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-xs md:text-sm animate-fade-in">
            <p className="font-black text-amber-900 mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Lời giải & Đáp án đúng:
            </p>
            <p className="text-slate-800 font-bold">
              {q.explanation || `Đáp án đúng là: ${q.answer || q.sampleAnswer || 'Chưa cài đặt'}`}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ===================== PHÒNG THI TRỰC TUYẾN =====================
  if (activeExam) {
    const totalQ = activeExam.questions?.length || 0;
    const currentQ = activeExam.questions?.[currentQIndex];
    const { answered } = getAnsweredCount();

    const isMathExam = activeExam.subjectId === 'math';
    const choiceQuestions = (activeExam.questions || []).filter(q => 
      q.section === 'choice' || q.type === 'multiple-choice' || q.type === 'listen-choice'
    );
    const essayQuestions = (activeExam.questions || []).filter(q => 
      !choiceQuestions.includes(q)
    );
    const hasBothSections = isMathExam && choiceQuestions.length > 0 && essayQuestions.length > 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in text-slate-800">
        {/* Sticky Top Navigation */}
        <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm flex items-center justify-between sticky top-20 z-30 gap-2">
          <button
            onClick={() => setActiveExam(null)}
            className="flex items-center space-x-1.5 text-slate-600 font-black text-xs md:text-sm hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát phòng thi</span>
          </button>

          {/* Đồng hồ bấm giờ */}
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-2xl">
            <Timer className="w-5 h-5 text-rose-500 animate-pulse" />
            <span className="font-black text-rose-600 text-sm md:text-base font-mono">
              {formatTimer(timeLeft)}
            </span>
          </div>

          {/* Chế độ xem: Từng câu vs Toàn bộ */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl text-xs font-black">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-xl transition ${
                viewMode === 'single' ? 'bg-white shadow-xs text-rose-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Từng câu
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-xl transition ${
                viewMode === 'all' ? 'bg-white shadow-xs text-rose-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toàn bộ đề
            </button>
          </div>

          {!isExamFinished ? (
            <button
              onClick={handleCheckBeforeSubmit}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs md:text-sm rounded-2xl shadow-md btn-kid flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Nộp Bài ({answered}/{totalQ})</span>
            </button>
          ) : (
            <button
              onClick={() => handleStartExam(activeExam)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs rounded-2xl shadow-sm flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại đề</span>
            </button>
          )}
        </div>

        {/* Thanh chuyển câu hỏi nhanh (1, 2, 3...) */}
        <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-black text-slate-500 shrink-0">Câu:</span>
          {activeExam.questions?.map((q, idx) => {
            const isAnswered = q.subQuestions?.length
              ? q.subQuestions.some((s, sIdx) => !!userAnswers[`${q.id}_${s.id || sIdx}`])
              : !!userAnswers[q.id];
            const isCurrent = viewMode === 'single' && currentQIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentQIndex(idx);
                  setViewMode('single');
                }}
                className={`w-8 h-8 rounded-xl font-black text-xs shrink-0 transition flex items-center justify-center ${
                  isCurrent
                    ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 scale-105'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Header thông tin đề thi */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg border-4 border-rose-300">
          <div className="flex items-center space-x-2 mb-1 flex-wrap">
            <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
              Khối Lớp {activeExam.grade}
            </span>
            <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
              {activeExam.examType === 'test' ? '⏱️ Bài Kiểm Tra' : activeExam.examType === 'review' ? '⭐ Đề Ôn Tập' : '📝 Đề Luyện Tập'}
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black font-display mt-1">
            {activeExam.title}
          </h2>
          <div className="text-xs text-rose-100 font-semibold mt-1">
            Thời gian: {activeExam.durationMinutes || 'Tự do'} phút • Tổng số: {totalQ} câu hỏi
          </div>
        </div>

        {/* Banner kết quả sau khi nộp bài */}
        {isExamFinished && examResult && (
          <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-xl cartoon-card text-center animate-fade-in">
            <div className="text-5xl mb-2">{examResult.score >= 8 ? '🎉' : examResult.score >= 5 ? '⭐' : '💪'}</div>
            <h3 className="text-2xl font-black text-slate-800 font-display">
              {examResult.score >= 8 ? 'Điểm Số Xuất Sắc!' : examResult.score >= 5 ? 'Đã Hoàn Thành Bài Thi!' : 'Cần Cố Gắng Hơn Bé Nhé!'}
            </h3>
            <div className="my-3 inline-block px-8 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 rounded-3xl font-black text-4xl shadow-md border-2 border-white">
              {examResult.score} / 10 Điểm
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs md:text-sm font-black text-slate-600">
              <span className="text-emerald-700">✓ Đúng: {examResult.correctCount} câu</span>
              <span>•</span>
              <span className="text-rose-600">✗ Sai: {examResult.wrongCount} câu</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Các câu sai đã được hệ thống tự động lưu vào <strong>Sổ Lỗi Sai</strong> để bé xem lại!
            </p>
          </div>
        )}

        {/* ================= NỘI DUNG CÂU HỎI ================= */}
        {viewMode === 'single' ? (
          /* Chế độ từng câu: Có nút "Câu trước" & "Câu tiếp theo" */
          <div className="space-y-4">
            {currentQ && renderQuestionCard(currentQ, currentQIndex)}

            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm flex items-center space-x-2 transition ${
                  currentQIndex === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 shadow-xs'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <span className="text-xs font-black text-slate-500">
                Câu {currentQIndex + 1} / {totalQ}
              </span>

              {currentQIndex < totalQ - 1 ? (
                <button
                  onClick={() => setCurrentQIndex(prev => Math.min(totalQ - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md hover:from-rose-600 hover:to-pink-600 flex items-center space-x-2 transition"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCheckBeforeSubmit}
                  className="px-6 py-2.5 rounded-2xl font-black text-xs md:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center space-x-2 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Hoàn Tất & Nộp Bài</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Chế độ xem toàn bộ đề thi */
          <div className="space-y-6">
            {hasBothSections ? (
              <div className="space-y-8">
                {/* PHẦN I: TRẮC NGHIỆM */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-4 rounded-3xl shadow-sm flex items-center space-x-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg font-black">
                      I
                    </div>
                    <div>
                      <h3 className="font-black font-display text-base md:text-lg">
                        PHẦN I: TRẮC NGHIỆM ({choiceQuestions.length} câu)
                      </h3>
                      <p className="text-xs text-sky-100 font-medium">
                        Chọn đáp án đúng A, B, C hoặc D
                      </p>
                    </div>
                  </div>
                  {choiceQuestions.map((q, idx) => renderQuestionCard(q, idx))}
                </div>

                {/* PHẦN II: TỰ LUẬN */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-3xl shadow-sm flex items-center space-x-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg font-black">
                      II
                    </div>
                    <div>
                      <h3 className="font-black font-display text-base md:text-lg">
                        PHẦN II: TỰ LUẬN & ĐIỀN ĐÁP ÁN ({essayQuestions.length} câu)
                      </h3>
                      <p className="text-xs text-amber-100 font-medium">
                        Tính toán, điền đáp án từng ý và trình bày bài giải
                      </p>
                    </div>
                  </div>
                  {essayQuestions.map((q, idx) => renderQuestionCard(q, choiceQuestions.length + idx))}
                </div>
              </div>
            ) : (
              activeExam.questions?.map((q, idx) => renderQuestionCard(q, idx))
            )}
          </div>
        )}

        {/* Modal cảnh báo khi còn câu chưa làm */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                ⚠️
              </div>
              <h3 className="text-xl font-black text-slate-800 font-display">
                Bé Vẫn Còn Câu Chưa Làm!
              </h3>
              <p className="text-xs text-slate-600 mt-2">
                Bé mới trả lời được <strong>{answered}/{totalQ}</strong> câu hỏi. Bé có chắc chắn muốn nộp bài thi ngay bây giờ không?
              </p>
              <div className="flex items-center justify-center space-x-3 mt-6">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs"
                >
                  Làm tiếp
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md"
                >
                  Vẫn nộp bài
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal phóng to ảnh minh họa */}
        {zoomImage && (
          <div 
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col">
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="overflow-auto flex items-center justify-center p-2">
                <img 
                  src={zoomImage} 
                  alt="Ảnh phóng to" 
                  className="max-h-[80vh] w-auto object-contain rounded-2xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================== NGÂN HÀNG ĐỀ THI (HỌC SINH CHỌN ĐỀ) =====================
  const subjectsList = allSubjects || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-rose-300">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-inner border-2 border-white/40">
            📝
          </div>
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-block">
              Hệ Thống Đề Thi Thông Minh Học Vui 2.0 • Khối Lớp {selectedGrade}
            </span>
            <h2 className="text-2xl md:text-4xl font-black font-display mt-1">
              Phòng Luyện Thi & Khảo Sát Năng Lực
            </h2>
            <p className="text-rose-100 text-xs md:text-sm font-semibold">
              Đề thi phân loại chuẩn theo môn học, có hình minh họa và tự động chấm điểm từng ý!
            </p>
          </div>
        </div>
      </div>

      {/* Thanh Lọc Theo Môn Học & Loại Đề */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-xs space-y-3">
        {/* Lọc Môn Học */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-xs font-black text-slate-500 shrink-0">Môn học:</span>
          <button
            onClick={() => setFilterSubject('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition shrink-0 ${
              filterSubject === 'all'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất cả các môn
          </button>
          {subjectsList.map(s => (
            <button
              key={s.id}
              onClick={() => setFilterSubject(s.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1 shrink-0 ${
                filterSubject === s.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        {/* Lọc Loại Đề Thi */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-xs font-black text-slate-500 shrink-0">Loại đề:</span>
          {[
            { key: 'all', label: 'Tất cả loại đề' },
            { key: 'practice', label: '📝 Luyện tập' },
            { key: 'test', label: '⏱️ Kiểm tra' },
            { key: 'review', label: '⭐ Ôn tập' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition shrink-0 ${
                filterType === t.key
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách đề thi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availableExams.length === 0 ? (
          <div className="col-span-full bg-white rounded-4xl p-12 text-center border-3 border-dashed border-rose-200">
            <p className="text-5xl mb-3">📝</p>
            <h4 className="font-black text-slate-800 text-xl font-display">
              Chưa có đề thi nào phù hợp cho Lớp {selectedGrade}
            </h4>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Quý Thầy Cô hãy vào mục <strong>Quản Lý Web</strong> để upload file Word/PDF/Ảnh hoặc soạn đề thi mới cho các em học sinh nhé!
            </p>
          </div>
        ) : (
          availableExams.map(exam => {
            const subj = subjectsList.find(s => s.id === exam.subjectId);
            const typeLabel = exam.examType === 'test'
              ? 'Kiểm tra'
              : exam.examType === 'review'
              ? 'Ôn tập'
              : 'Luyện tập';

            return (
              <div
                key={exam.id}
                className="bg-white rounded-4xl p-6 border-3 border-amber-200 hover:border-rose-400 shadow-sm cartoon-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
                    <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                      Lớp {exam.grade} • {subj ? `${subj.icon} ${subj.name}` : exam.subjectId}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {typeLabel}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-800 text-lg md:text-xl font-display mb-2">
                    {exam.title}
                  </h3>

                  <div className="flex items-center space-x-3 text-xs font-bold text-slate-500 mb-3 flex-wrap">
                    <span>⏱️ {exam.durationMinutes || 'Tự do'} phút</span>
                    <span>•</span>
                    <span>📋 {exam.questions?.length || 0} câu hỏi</span>
                    <span>•</span>
                    <span>Tạo bởi: {exam.creatorName || 'Giáo viên'}</span>
                  </div>

                  {exam.originalFile && (
                    <div className="text-[11px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl mb-3 border border-teal-200 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate">Tải từ file: {exam.originalFile.name}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleStartExam(exam)}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black rounded-2xl shadow-md btn-kid text-sm flex items-center justify-center space-x-2 transition"
                >
                  <span>Bắt Đầu Làm Bài</span>
                  <Timer className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
