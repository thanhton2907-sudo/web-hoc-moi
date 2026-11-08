import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GRADE_LEVELS } from '../../data/mockData';
import { 
  Sparkles, 
  Flame, 
  Star, 
  BookOpen, 
  Headphones, 
  FileText, 
  Bookmark, 
  Gamepad2, 
  LineChart, 
  GraduationCap,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  Edit3
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { ProfileEditModal } from './ProfileEditModal';

export const Header = ({ currentTab, setCurrentTab }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    currentUser,
    currentStudent, 
    selectedGrade, 
    setSelectedGrade,
    logout
  } = useApp();

  const [authConfig, setAuthConfig] = useState({ isOpen: false, mode: 'login', role: null });
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(() => {
    return localStorage.getItem('vuihoc_large_font') === 'true';
  });

  useEffect(() => {
    if (isLargeFont) {
      document.body.classList.add('font-large-mode');
    } else {
      document.body.classList.remove('font-large-mode');
    }
    localStorage.setItem('vuihoc_large_font', isLargeFont);
  }, [isLargeFont]);

  const openLoginModal = (role = null) => {
    setAuthConfig({ isOpen: true, mode: 'login', role });
  };

  const openRegisterModal = (role = null) => {
    setAuthConfig({ isOpen: true, mode: 'register', role });
  };

  const isTeacher = currentRole === 'teacher' || currentUser?.role === 'teacher';
  const isParent = currentRole === 'parent' || currentUser?.role === 'parent';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-sm">
      {/* Top Bar: Brand, Grade Pills, Text Size, Login/Register */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
          <div className="w-11 h-11 bg-gradient-to-tr from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-2xl shadow-md transform hover:rotate-6 transition">
            🎒
          </div>
          <div>
            <h1 className="font-display font-black text-xl md:text-2xl text-slate-800 tracking-tight leading-none">
              Học Vui Cấp 1
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">
              Nền tảng học tập trực quan • Lớp 1 - 5
            </p>
          </div>
        </div>

        {/* Grade Selector Pills */}
        <div className="flex items-center bg-amber-50 border-2 border-amber-200 rounded-2xl p-1 gap-1">
          {GRADE_LEVELS.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGrade(g.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                selectedGrade === g.id
                  ? 'bg-amber-400 text-amber-950 shadow-sm scale-105'
                  : 'text-slate-600 hover:bg-amber-200/50'
              }`}
            >
              <span>{g.icon}</span>
              <span>Lớp {g.id}</span>
            </button>
          ))}
        </div>

        {/* Right Section: Student stats, Font Size Button, Login / Register Buttons */}
        <div className="flex items-center space-x-2">
          {/* Student Stats (Streaks & Stars) */}
          {currentRole === 'student' && currentStudent && (
            <div className="flex items-center space-x-1.5 hidden md:flex">
              <div className="flex items-center space-x-1 bg-orange-100 border border-orange-300 px-2.5 py-1 rounded-2xl text-orange-700 font-extrabold text-xs shadow-xs">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-bounce-soft" />
                <span>{currentStudent.streak} ngày</span>
              </div>
              <div className="flex items-center space-x-1 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-2xl text-amber-800 font-extrabold text-xs shadow-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{currentStudent.stars}</span>
              </div>
            </div>
          )}

          {/* Nút bật/tắt Chữ To & Nét cho các cháu */}
          <button
            onClick={() => setIsLargeFont(!isLargeFont)}
            className={`px-2.5 py-1.5 rounded-2xl border-2 text-xs font-black transition flex items-center space-x-1 ${
              isLargeFont
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
            }`}
            title="Bật/Tắt chế độ chữ to nét dành riêng cho các cháu tiểu học"
          >
            <span className="text-sm font-black">A+</span>
            <span className="hidden lg:inline">{isLargeFont ? 'Chữ Siêu Nét' : 'Chữ To Rõ'}</span>
          </button>

          {/* KHU VỰC NÚT ĐĂNG NHẬP & ĐĂNG KÝ RÕ RÀNG */}
          <div className="flex items-center space-x-1.5">
            {currentUser ? (
              /* Khi đã đăng nhập */
              <div className="flex items-center space-x-1.5 bg-white border-2 border-amber-300 rounded-2xl px-2.5 py-1 shadow-xs">
                <span className="text-xl">{currentUser.avatar || '👤'}</span>
                <div className="text-left hidden sm:block">
                  <div className="font-black text-xs text-slate-900 leading-tight max-w-[120px] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-extrabold text-teal-700">
                    {currentUser.role === 'teacher' ? '👩‍🏫 Giáo Viên' : currentUser.role === 'parent' ? '👨‍👩‍👧 Phụ Huynh' : '🐱 Học Sinh'}
                  </div>
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1"></div>

                <button
                  onClick={() => openLoginModal()}
                  className="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 font-bold text-xs rounded-xl transition"
                  title="Đổi tài khoản"
                >
                  Đổi
                </button>

                <button
                  onClick={logout}
                  className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-xl transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Khi chưa đăng nhập: Nút Đăng Nhập & Đăng Ký nổi bật */
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => openLoginModal()}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-xs rounded-2xl shadow-sm transition flex items-center space-x-1.5 transform hover:scale-102"
                >
                  <LogIn className="w-4 h-4 text-amber-950" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  onClick={() => openRegisterModal()}
                  className="px-3 py-1.5 bg-white hover:bg-amber-50 border-2 border-amber-400 text-amber-900 font-black text-xs rounded-2xl shadow-xs transition flex items-center space-x-1.5 transform hover:scale-102"
                >
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  <span>Đăng Ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="bg-amber-100/60 border-t border-amber-200 px-4 py-1.5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 min-w-max">
          {/* CÁC TAB HỌC TẬP CHO HỌC SINH */}
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-1.5 ${
              currentTab === 'home' ? 'bg-amber-400 text-amber-950 shadow-sm' : 'text-slate-700 hover:bg-white/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Môn Học Cấp 1</span>
          </button>

          <button
            onClick={() => setCurrentTab('english')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-1.5 ${
              currentTab === 'english' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-700 hover:bg-white/80'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Khu Luyện Nghe Tiếng Anh</span>
          </button>

          <button
            onClick={() => setCurrentTab('exams')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-1.5 ${
              currentTab === 'exams' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-700 hover:bg-white/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Làm Đề Thi & Đánh Giá</span>
          </button>

          <button
            onClick={() => setCurrentTab('errors')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-1.5 ${
              currentTab === 'errors' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-700 hover:bg-white/80'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Sổ Lỗi Sai</span>
          </button>

          <button
            onClick={() => setCurrentTab('games')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-1.5 ${
              currentTab === 'games' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-700 hover:bg-white/80'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Góc Trò Chơi</span>
          </button>

          {/* TAB DÀNH CHO PHỤ HUYNH (CHỈ HIỂN THỊ KHI LÀ PHỤ HUYNH) */}
          {isParent && (
            <>
              <div className="h-5 w-px bg-amber-300 mx-1"></div>
              <button
                onClick={() => setCurrentTab('parent')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-1.5 ${
                  currentTab === 'parent' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-900 bg-indigo-100 hover:bg-indigo-200'
                }`}
              >
                <LineChart className="w-4 h-4" />
                <span>Báo Cáo Phụ Huynh</span>
              </button>
            </>
          )}

          {/* TAB QUẢN LÝ WEB DÀNH RIÊNG CHO GIÁO VIÊN (CHỈ HIỂN THỊ KHI LÀ GIÁO VIÊN) */}
          {isTeacher && (
            <>
              <div className="h-5 w-px bg-amber-300 mx-1"></div>
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center space-x-1.5 ${
                  currentTab === 'admin' 
                    ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-400' 
                    : 'text-teal-950 bg-teal-100 hover:bg-teal-200 border border-teal-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-700 group-hover:text-white" />
                <span>Quản Lý Web (Giáo Viên)</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Modal Đăng Nhập & Đăng Ký */}
      <AuthModal 
        isOpen={authConfig.isOpen} 
        onClose={() => setAuthConfig({ ...authConfig, isOpen: false })} 
        initialMode={authConfig.mode}
        initialRole={authConfig.role}
      />
    </header>
  );
};
