import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Gamepad2, Timer, Zap, Trophy, RotateCcw, Volume2, CheckCircle2 } from 'lucide-react';
import { playKidSound, speakText } from '../../utils/speech';
import confetti from 'canvas-confetti';

export const MiniGames = () => {
  const { rewardStars, selectedGrade } = useApp();
  const [activeGame, setActiveGame] = useState('math'); // 'math' | 'vietnamese' | 'english'

  // MATH GAME STATE
  const [mathScore, setMathScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isMathPlaying, setIsMathPlaying] = useState(false);
  const [mathProblem, setMathProblem] = useState(null);

  // Generate math question according to grade
  const generateMathProblem = () => {
    let num1, num2, op, ans;
    if (selectedGrade <= 2) {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      op = Math.random() > 0.4 ? '+' : '-';
      if (op === '-' && num1 < num2) [num1, num2] = [num2, num1];
      ans = op === '+' ? num1 + num2 : num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 8) + 2;
      num2 = Math.floor(Math.random() * 9) + 2;
      op = 'x';
      ans = num1 * num2;
    }

    // Generate 4 options
    const options = [ans];
    while (options.length < 4) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      const wrong = Math.max(0, ans + offset);
      if (!options.includes(wrong)) options.push(wrong);
    }
    // Shuffle
    options.sort(() => Math.random() - 0.5);

    return { num1, num2, op, ans, options };
  };

  const startMathGame = () => {
    setMathScore(0);
    setTimeLeft(30);
    setIsMathPlaying(true);
    setMathProblem(generateMathProblem());
  };

  useEffect(() => {
    let timer;
    if (isMathPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isMathPlaying) {
      setIsMathPlaying(false);
      playKidSound('fanfare');
      rewardStars(Math.max(5, Math.floor(mathScore / 2)), 'Hoàn thành đấu trường Tính Nhanh!');
    }
    return () => clearInterval(timer);
  }, [isMathPlaying, timeLeft]);

  const handleSelectMathAnswer = (opt) => {
    if (!isMathPlaying || !mathProblem) return;
    if (opt === mathProblem.ans) {
      playKidSound('correct');
      setMathScore(prev => prev + 10);
      setMathProblem(generateMathProblem());
    } else {
      playKidSound('wrong');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-emerald-300">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-inner border-2 border-white/40">
            🎮
          </div>
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-block">
              Vừa Chơi Vừa Luyện Trí Tuệ
            </span>
            <h2 className="text-2xl md:text-4xl font-black font-display mt-1">
              Đấu Trường Trò Chơi Mini
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm font-semibold">
              Rèn phản xạ tính toán, mở rộng vốn từ tiếng Việt và tiếng Anh!
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-white/20">
          <button
            onClick={() => setActiveGame('math')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition flex items-center space-x-1.5 ${
              activeGame === 'math' ? 'bg-white text-emerald-900 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Tính Nhanh Siêu Tốc</span>
          </button>
        </div>
      </div>

      {/* MATH GAME CONTAINER */}
      {activeGame === 'math' && (
        <div className="bg-white rounded-4xl p-6 md:p-10 border-3 border-emerald-200 shadow-sm cartoon-card text-center max-w-2xl mx-auto">
          {!isMathPlaying && timeLeft === 30 && (
            <div className="space-y-4 py-8">
              <div className="text-6xl animate-bounce">⚡</div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 font-display">
                Đấu Trường Tính Nhanh 30 Giây
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Bé có 30 giây để giải càng nhiều phép tính càng tốt. Mỗi câu đúng sẽ nhận điểm và sao thưởng!
              </p>
              <button
                onClick={startMathGame}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-lg rounded-2xl shadow-lg btn-kid"
              >
                Bắt đầu chơi ngay!
              </button>
            </div>
          )}

          {isMathPlaying && mathProblem && (
            <div className="space-y-6">
              {/* Game Status Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2 font-black text-lg text-emerald-600">
                  <Trophy className="w-6 h-6" />
                  <span>Điểm: {mathScore}</span>
                </div>
                <div className="flex items-center space-x-2 font-black text-lg text-rose-500 bg-rose-50 px-3 py-1 rounded-xl">
                  <Timer className="w-5 h-5 animate-spin" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Big Equation */}
              <div className="my-8">
                <span className="text-5xl md:text-6xl font-black text-slate-800 tracking-wider font-display">
                  {mathProblem.num1} {mathProblem.op} {mathProblem.num2} = ?
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {mathProblem.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectMathAnswer(opt)}
                    className="py-5 text-3xl font-black text-slate-800 bg-slate-50 border-3 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-3xl shadow-sm transition transform hover:scale-102 active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isMathPlaying && timeLeft === 0 && (
            <div className="space-y-4 py-6">
              <div className="text-6xl">🏆</div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 font-display">
                Hết Giờ Rồi Bé Ơi!
              </h3>
              <p className="text-xl font-black text-emerald-600">
                Tổng điểm của bé: {mathScore} điểm!
              </p>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={startMathGame}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-md btn-kid flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại lần nữa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
