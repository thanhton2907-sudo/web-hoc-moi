import React from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS_CONFIG } from '../../data/mockData';
import { PetCompanion } from '../common/PetCompanion';
import { 
  Flame, 
  Star, 
  Clock, 
  Trophy, 
  Headphones, 
  Bookmark, 
  Sparkles, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const StudentDashboard = ({ onSelectSubject, onOpenEnglishListening, onOpenExams, onOpenErrors }) => {
  const { currentStudent, selectedGrade, badges, voiceGuideEnabled, allSubjects } = useApp();

  // Filter subjects applicable to the selected grade (kể cả môn giáo viên mới thêm)
  const subjectsList = allSubjects || SUBJECTS_CONFIG;
  const subjectsForGrade = subjectsList.filter(s => (s.grades || [1,2,3,4,5]).includes(selectedGrade));

  const progressPercent = Math.min(100, Math.round(((currentStudent?.todayMinutes || 0) / (currentStudent?.dailyGoalMinutes || 20)) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner & Companion Pet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Greeting */}
        <div className="lg:col-span-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-4xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between border-4 border-amber-300">
          <div>
            <div className="mb-3">
              <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Chào ngày mới ngập tràn niềm vui
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-black font-display tracking-tight leading-tight">
              Chào bạn nhỏ! 👋
            </h2>
            <p className="text-white/90 text-sm md:text-base font-semibold mt-1">
              Hôm nay em muốn khám phá môn học nào trước tiên?
            </p>
          </div>

          {/* Daily Goal & Progress Stats */}
          <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-amber-100 mb-1">
                <Clock className="w-4 h-4" />
                <span>Mục tiêu ngày</span>
              </div>
              <div className="text-lg md:text-xl font-black">
                {currentStudent?.todayMinutes || 0} / {currentStudent?.dailyGoalMinutes || 20}p
              </div>
              <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-white h-1.5 rounded-full transition-all" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-amber-100 mb-1">
                <Flame className="w-4 h-4 text-orange-200 fill-orange-200" />
                <span>Chuỗi ngày học</span>
              </div>
              <div className="text-lg md:text-xl font-black">
                {currentStudent?.streak || 0} Ngày liên tục 🔥
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-amber-100 mb-1">
                <Star className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                <span>Tổng sao vàng</span>
              </div>
              <div className="text-lg md:text-xl font-black">
                {currentStudent?.stars || 0} ⭐
              </div>
            </div>
          </div>
        </div>

        {/* Pet Companion Widget */}
        <div className="lg:col-span-1 flex flex-col justify-center">
          <PetCompanion pet={currentStudent?.pet || { type: 'cat', name: 'Miu Miu', level: 1, exp: 20, maxExp: 100 }} />
        </div>
      </div>

      {/* Featured Fast Hub Banners: Tiếng Anh Nghe & Sổ Lỗi Sai */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fast English Listening Hub Card */}
        <div 
          onClick={onOpenEnglishListening}
          className="cursor-pointer bg-gradient-to-r from-sky-400 to-blue-600 rounded-3xl p-5 text-white shadow-md flex items-center justify-between border-3 border-sky-300 cartoon-card group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
              🎧
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Luyện Nghe Trực Quan
              </span>
              <h3 className="text-lg md:text-xl font-black font-display mt-0.5">
                Khu Luyện Nghe Tiếng Anh Chuyên Sâu
              </h3>
              <p className="text-xs text-sky-100 font-medium">
                6 Dạng bài nghe máy chấm sao + Từ điển âm thanh
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
        </div>

        {/* Fast Error Notebook Card */}
        <div 
          onClick={onOpenErrors}
          className="cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-5 text-white shadow-md flex items-center justify-between border-3 border-purple-300 cartoon-card group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
              📖
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Bí quyết đạt điểm 10
              </span>
              <h3 className="text-lg md:text-xl font-black font-display mt-0.5">
                Sổ Lỗi Sai Thông Minh
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                Ôn lại ngay các câu từng làm sai để không lặp lại
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
        </div>
      </div>

      {/* Main Subjects Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Môn Học Lớp {selectedGrade}
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Bấm vào môn để xem các bài học và bắt đầu luyện tập
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {subjectsForGrade.map(sub => (
            <div
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className="cursor-pointer bg-white rounded-3xl p-5 border-3 border-amber-200 hover:border-amber-400 shadow-sm cartoon-card flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-inner bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform">
                  {sub.icon}
                </div>
                <h4 className="font-black text-slate-800 text-base md:text-lg mb-1 group-hover:text-amber-600 transition-colors">
                  {sub.name}
                </h4>
                <p className="text-slate-500 text-xs line-clamp-2">
                  Lý thuyết trực quan, bài tập và đề thi
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                  Lớp {selectedGrade}
                </span>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Vào học &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-4xl p-6 border-3 border-amber-200 shadow-sm cartoon-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg md:text-xl font-black text-slate-800 font-display">
              Bảng Huy Hiệu Vinh Danh
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {badges.filter(b => b.unlocked).length}/{badges.length} Đã mở khóa
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badges.map(b => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl text-center border-2 transition ${
                b.unlocked 
                  ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-300 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl mb-1">{b.icon}</div>
              <div className="font-extrabold text-xs text-slate-800">{b.title}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
