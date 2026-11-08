import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bookmark, CheckCircle2, RotateCcw, Sparkles, BookOpen, Trash2 } from 'lucide-react';

export const ErrorNotebook = () => {
  const { errorNotebook, markErrorReviewed } = useApp();
  const [selectedItem, setSelectedItem] = useState(null);
  const [userRetryAnswer, setUserRetryAnswer] = useState('');
  const [retryResult, setRetryResult] = useState(null);

  const handleOpenReview = (item) => {
    setSelectedItem(item);
    setUserRetryAnswer('');
    setRetryResult(null);
  };

  const handleCheckRetry = () => {
    if (!selectedItem) return;
    const isCorrect = userRetryAnswer.trim().toLowerCase() === selectedItem.correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      setRetryResult('correct');
      markErrorReviewed(selectedItem.id);
    } else {
      setRetryResult('wrong');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-purple-300 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-inner border-2 border-white/40">
              📖
            </div>
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-block">
                Học từ những sai lầm
              </span>
              <h2 className="text-2xl md:text-4xl font-black font-display mt-1">
                Sổ Lỗi Sai Thông Minh
              </h2>
              <p className="text-purple-100 text-xs md:text-sm font-semibold">
                Tự động lưu những câu bé làm chưa đúng để cùng ôn tập và đạt điểm 10!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal if active */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-4xl max-w-lg w-full p-6 shadow-2xl border-4 border-purple-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-extrabold text-xs text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                Môn: {selectedItem.subject}
              </span>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 font-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="my-4">
              <h4 className="font-black text-slate-800 text-lg mb-2">
                {selectedItem.question}
              </h4>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-4">
                <strong>Câu trả lời trước đây:</strong> {selectedItem.userWrongAnswer}
              </div>

              <label className="block text-xs font-bold text-slate-600 mb-1">
                Bé hãy nhập lại đáp án đúng nào:
              </label>
              <input
                type="text"
                value={userRetryAnswer}
                onChange={(e) => setUserRetryAnswer(e.target.value)}
                placeholder="Nhập đáp án đúng..."
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-slate-800 text-base focus:border-purple-500 focus:outline-none"
              />
            </div>

            {retryResult === 'correct' && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl mb-4">
                🎉 Xuất sắc! Bé đã làm đúng và được cộng thêm 3 ngôi sao thưởng!
              </div>
            )}

            {retryResult === 'wrong' && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium rounded-2xl mb-4">
                <p className="font-bold">Chưa chính xác bé ơi! Đáp án đúng là: {selectedItem.correctAnswer}</p>
                <p className="mt-1 text-[11px]">{selectedItem.explanation}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={handleCheckRetry}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-md btn-kid"
              >
                Kiểm tra lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of Error Items */}
      {errorNotebook.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <p className="text-5xl mb-3">🌟</p>
          <h3 className="font-black text-slate-800 text-xl font-display">Sổ lỗi sai đang trống!</h3>
          <p className="text-slate-500 text-sm mt-1">
            Bé học rất giỏi, chưa ghi nhận câu trả lời sai nào. Hãy tiếp tục phát huy nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {errorNotebook.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-5 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.reviewed
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-purple-200 hover:border-purple-400 cartoon-card'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  item.reviewed ? 'bg-emerald-500 text-white' : 'bg-purple-100 text-purple-700'
                }`}>
                  {item.reviewed ? <CheckCircle2 className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg">
                      {item.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{item.date}</span>
                    {item.reviewed && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Đã ôn lại
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-base mt-1">
                    {item.question}
                  </h4>

                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                    <span className="text-rose-600 font-semibold">Từng chọn: {item.userWrongAnswer}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">Đáp án đúng: {item.correctAnswer}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => handleOpenReview(item)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 ${
                    item.reviewed
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-purple-500 text-white shadow-sm hover:bg-purple-600 btn-kid'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{item.reviewed ? 'Làm lại lần nữa' : 'Ôn tập câu này'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
