import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, Check, AlertCircle, Maximize2, X } from 'lucide-react';

export const MultiItemQuestion = ({
  question,
  userAnswers = {},
  onAnswerChange,
  isSubmitted = false,
  disabled = false
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const subQuestions = question.subQuestions || [];
  if (subQuestions.length === 0) return null;

  // Tính kết quả sau khi nộp bài
  let correctCount = 0;
  let earnedScore = 0;
  let totalScore = 0;

  subQuestions.forEach((sub, idx) => {
    const subKey = `${question.id}_${sub.id || idx}`;
    const userVal = String(userAnswers[subKey] || '').trim().toLowerCase();
    const expectedVal = String(sub.answer || '').trim().toLowerCase();
    const p = typeof sub.points === 'number' ? sub.points : (question.points || 2) / subQuestions.length;
    totalScore += p;

    if (userVal && expectedVal && (userVal === expectedVal || userVal.replace(/\s+/g, '') === expectedVal.replace(/\s+/g, ''))) {
      correctCount += 1;
      earnedScore += p;
    }
  });

  return (
    <div className="space-y-4">
      {/* Banner kết quả chi tiết sau khi nộp bài */}
      {isSubmitted && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between border-2 animate-fade-in ${
          correctCount === subQuestions.length
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : correctCount > 0
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center space-x-2">
            {correctCount === subQuestions.length ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : correctCount > 0 ? (
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-black text-xs md:text-sm">
              Kết quả: Đúng {correctCount}/{subQuestions.length} ý
            </span>
          </div>
          <div className="font-extrabold text-xs px-2.5 py-1 bg-white/80 rounded-xl shadow-xs">
            +{Math.round(earnedScore * 100) / 100} / {Math.round(totalScore * 100) / 100} điểm
          </div>
        </div>
      )}

      {/* Hình ảnh minh họa cho câu hỏi nhiều ý */}
      {question.image && (
        <div className="my-2 flex flex-col items-center">
          <div 
            onClick={() => setIsZoomOpen(true)}
            className="relative cursor-pointer group rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/50 p-1 shadow-xs hover:border-amber-400 transition"
            title="Bấm để xem ảnh phóng to sắc nét"
          >
            <img 
              src={question.image} 
              alt="Hình ảnh minh họa" 
              className={`rounded-xl object-contain mx-auto ${
                question.imageSize === 'small' ? 'max-h-36 max-w-xs' : question.imageSize === 'large' ? 'max-h-96 w-full' : 'max-h-60 max-w-md'
              }`}
            />
            <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 backdrop-blur-xs">
              <Maximize2 className="w-3 h-3" />
              <span>Phóng to</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lightbox phóng to ảnh cho các cháu xem rõ */}
      {isZoomOpen && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-auto flex items-center justify-center p-2">
              <img 
                src={question.image} 
                alt="Hình minh họa phóng to" 
                className="max-h-[80vh] w-auto object-contain rounded-2xl"
              />
            </div>
            <div className="text-center text-xs text-slate-500 font-bold py-1">
              Hình ảnh minh họa sắc nét • Bấm bất kỳ đâu để đóng lại
            </div>
          </div>
        </div>
      )}

      {/* Grid danh sách các ý nhỏ (1 cột trên mobile, 2 cột trên máy tính) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {subQuestions.map((sub, idx) => {
          const subKey = `${question.id}_${sub.id || idx}`;
          const currentVal = userAnswers[subKey] || '';
          const userVal = String(currentVal).trim().toLowerCase();
          const expectedVal = String(sub.answer || '').trim().toLowerCase();
          const isItemCorrect = isSubmitted && userVal && expectedVal && (
            userVal === expectedVal || userVal.replace(/\s+/g, '') === expectedVal.replace(/\s+/g, '')
          );
          const isItemWrong = isSubmitted && !isItemCorrect;

          return (
            <div
              key={sub.id || idx}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                isSubmitted
                  ? isItemCorrect
                    ? 'bg-emerald-50/60 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                    : 'bg-rose-50/60 border-rose-400 shadow-xs ring-1 ring-rose-300'
                  : currentVal
                  ? 'bg-amber-50/50 border-amber-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                {/* Nhãn thứ tự ý */}
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                  {sub.label ? `Ý ${sub.label}` : `Ý ${idx + 1}`}
                </span>

                {/* Điểm số của ý này */}
                <span className="text-[10px] font-bold text-slate-400">
                  ({sub.points || Math.round(((question.points || 2) / subQuestions.length) * 100) / 100} đ)
                </span>
              </div>

              {/* Phép tính / Lời dẫn của ý & Ô nhập đáp án */}
              <div className="flex items-center justify-between gap-3 my-1">
                <span className="font-black text-slate-800 text-base md:text-lg tracking-wide shrink-0 font-display">
                  {sub.prompt}
                </span>

                <div className="relative flex-1 max-w-[150px]">
                  <input
                    type="text"
                    disabled={disabled || isSubmitted}
                    tabIndex={idx + 1}
                    value={currentVal}
                    onChange={(e) => onAnswerChange(subKey, e.target.value)}
                    placeholder="Đáp án..."
                    className={`w-full h-11 px-3 text-center text-base md:text-lg font-black rounded-xl border-2 transition focus:outline-none ${
                      isSubmitted
                        ? isItemCorrect
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                          : 'bg-rose-100 border-rose-500 text-rose-950 line-through'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200'
                    }`}
                  />
                  {isSubmitted && isItemCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-2 top-3.5 pointer-events-none" />
                  )}
                  {isSubmitted && isItemWrong && (
                    <XCircle className="w-4 h-4 text-rose-600 absolute right-2 top-3.5 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Lời giải hoặc đáp án đúng hiển thị sau khi nộp bài */}
              {isSubmitted && isItemWrong && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-xs font-bold text-rose-700 flex items-center justify-between">
                  <span>Đáp án đúng:</span>
                  <span className="bg-rose-200/80 px-2 py-0.5 rounded-lg text-rose-950 font-black">
                    {sub.answer || 'Chưa cài đặt'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
