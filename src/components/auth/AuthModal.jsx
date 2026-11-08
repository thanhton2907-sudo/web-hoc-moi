import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  KeyRound, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  User,
  Hash,
  Smile
} from 'lucide-react';

const AVATAR_OPTIONS = ['🐱', '🐶', '🐰', '🦊', '🐼', '🦁', '🐯', '🦄', '🐨', '🐸', '🐧', '🦉'];

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', initialRole = null }) => {
  const { 
    users, 
    currentUser, 
    loginStudentWithAccount,
    loginParentByChild,
    loginWithEmail, 
    registerUser, 
    logout 
  } = useApp();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(initialRole || 'student'); // 'student' | 'parent' | 'teacher'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states cho Học sinh đăng nhập (Tài khoản & Mật khẩu riêng)
  const [studentAccount, setStudentAccount] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Form states cho Phụ huynh đăng nhập (Tên con & ID tài khoản của con)
  const [parentChildName, setParentChildName] = useState('');
  const [parentChildId, setParentChildId] = useState('');

  // Form states cho Giáo viên đăng nhập (Email & Password)
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // Form states cho Đăng ký tài khoản mới
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regGrade, setRegGrade] = useState(1);
  const [regAvatar, setRegAvatar] = useState('🐱');
  const [regSchool, setRegSchool] = useState('');

  // Đồng bộ khi mở modal hoặc thay đổi props
  React.useEffect(() => {
    if (isOpen) {
      if (initialMode) setMode(initialMode);
      if (initialRole) setSelectedRole(initialRole);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setStudentAccount('');
    setStudentPassword('');
    setParentChildName('');
    setParentChildId('');
    setTeacherEmail('');
    setTeacherPassword('');
    setRegName('');
    setRegUsername('');
    setRegPassword('');
    setRegEmail('');
    setRegSchool('');
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Xử lý nộp form đăng nhập
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (selectedRole === 'student') {
        // Học sinh: Đăng nhập bằng Tài khoản & Mật khẩu riêng của bé
        if (!studentAccount.trim() || !studentPassword.trim()) {
          setErrorMsg('Bé vui lòng nhập đầy đủ Tên tài khoản và Mật khẩu nhé!');
          return;
        }
        const user = loginStudentWithAccount(studentAccount, studentPassword);
        setSuccessMsg(`Chào mừng bé ${user.name} đã vào bàn học! Chúc bé học vui!`);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 600);

      } else if (selectedRole === 'parent') {
        // Phụ huynh: Đăng nhập qua Tên của con & ID tài khoản của con
        if (!parentChildName.trim() || !parentChildId.trim()) {
          setErrorMsg('Vui lòng nhập Tên của con và ID tài khoản của con!');
          return;
        }
        const profile = loginParentByChild(parentChildName, parentChildId);
        setSuccessMsg(`Đã kết nối thành công với hồ sơ của ${profile.child?.name}! Đang mở Báo cáo học tập...`);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 600);

      } else if (selectedRole === 'teacher') {
        // Giáo viên: Đăng nhập bằng Email & Mật khẩu
        if (!teacherEmail.trim() || !teacherPassword.trim()) {
          setErrorMsg('Vui lòng nhập Email và Mật khẩu của Giáo viên!');
          return;
        }
        loginWithEmail(teacherEmail, teacherPassword);
        setSuccessMsg('Đăng nhập Giáo viên thành công! Đang chuyển hướng Quản lý web...');
        setTimeout(() => {
          resetForm();
          onClose();
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Đăng nhập không thành công, vui lòng thử lại!');
    }
  };

  // Xử lý nộp form đăng ký
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (!regName.trim()) {
        setErrorMsg('Vui lòng nhập họ và tên!');
        return;
      }

      if (selectedRole === 'student') {
        if (!regUsername.trim()) {
          setErrorMsg('Bé hãy chọn một tên tài khoản (ví dụ: nam2018)!');
          return;
        }
        if (!regPassword.trim() || regPassword.length < 3) {
          setErrorMsg('Mật khẩu của bé tối thiểu 3 ký tự nhé!');
          return;
        }

        const newUser = registerUser({
          name: regName.trim(),
          username: regUsername.trim().toLowerCase(),
          password: regPassword.trim(),
          role: 'student',
          grade: regGrade,
          avatar: regAvatar
        });

        setSuccessMsg(`Tạo tài khoản thành công! Tên bé: ${newUser.name} • ID con: ${newUser.studentId}. Ba mẹ có thể dùng mã ID này để xem báo cáo.`);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1200);

      } else if (selectedRole === 'teacher') {
        if (!regEmail.trim() || !regPassword.trim()) {
          setErrorMsg('Vui lòng nhập Email và Mật khẩu giáo viên!');
          return;
        }
        if (regPassword.length < 4) {
          setErrorMsg('Mật khẩu tối thiểu 4 ký tự!');
          return;
        }

        const newUser = registerUser({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword.trim(),
          role: 'teacher',
          school: regSchool.trim() || 'Trường Tiểu Học'
        });

        setSuccessMsg(`Tạo tài khoản Giáo viên ${newUser.name} thành công! Đã cấp quyền Quản lý web.`);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 900);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Đăng ký không thành công!');
    }
  };

  // 1-Click điền nhanh tài khoản bé mẫu
  const handleFillStudentQuick = (username, pass) => {
    setSelectedRole('student');
    setStudentAccount(username);
    setStudentPassword(pass);
    setErrorMsg('');
  };

  // 1-Click điền nhanh cho phụ huynh theo con
  const handleFillParentQuick = (childName, childId) => {
    setSelectedRole('parent');
    setParentChildName(childName);
    setParentChildId(childId);
    setErrorMsg('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex min-h-screen items-center justify-center p-3 sm:p-6">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative my-auto bg-white w-full max-w-xl rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col max-h-[92vh] text-slate-800 animate-scale-up"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/40">
              {mode === 'login' ? '🔐' : '✨'}
            </div>
            <div>
              <h3 className="font-display font-black text-xl md:text-2xl tracking-tight leading-tight">
                {mode === 'login' ? 'Cổng Đăng Nhập Hệ Thống' : 'Đăng Ký Tài Khoản'}
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Mục riêng cho Học sinh, Phụ huynh (nhập ID con) & Giáo viên
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab chuyển đổi Đăng Nhập / Đăng Ký */}
        <div className="flex border-b border-slate-200 bg-amber-50/70 p-2 gap-2">
          <button
            onClick={() => { setMode('login'); resetForm(); }}
            className={`flex-1 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition ${
              mode === 'login'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-102'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập</span>
          </button>

          <button
            onClick={() => { setMode('register'); resetForm(); }}
            className={`flex-1 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition ${
              mode === 'register'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-102'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Mới</span>
          </button>
        </div>

        {/* Thân Modal */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5">
          {/* Chọn vai trò đăng nhập */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Bạn là ai? Chọn mục đăng nhập:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition text-center ${
                  selectedRole === 'student'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-black shadow-sm ring-2 ring-amber-300'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                }`}
              >
                <span className="text-2xl mb-1">🐱</span>
                <span className="text-xs font-black">Học Sinh</span>
                <span className="text-[10px] text-amber-700 font-bold mt-0.5">Tài khoản & Mật khẩu</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('parent')}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition text-center ${
                  selectedRole === 'parent'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-black shadow-sm ring-2 ring-indigo-300'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                }`}
              >
                <span className="text-2xl mb-1">👨‍👩‍👧</span>
                <span className="text-xs font-black">Phụ Huynh</span>
                <span className="text-[10px] text-indigo-700 font-bold mt-0.5">Nhập Tên & ID con</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition text-center ${
                  selectedRole === 'teacher'
                    ? 'border-teal-500 bg-teal-50 text-teal-900 font-black shadow-sm ring-2 ring-teal-300'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                }`}
              >
                <span className="text-2xl mb-1">👩‍🏫</span>
                <span className="text-xs font-black">Giáo Viên</span>
                <span className="text-[10px] text-teal-700 font-bold mt-0.5">Quản Lý Web</span>
              </button>
            </div>
          </div>

          {/* Thông báo lỗi / thành công */}
          {errorMsg && (
            <div className="bg-rose-50 border-2 border-rose-300 text-rose-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ===================== FORM ĐĂNG NHẬP ===================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* 1. MỤC RIÊNG CHO HỌC SINH: TÀI KHOẢN & MẬT KHẨU RIÊNG */}
              {selectedRole === 'student' && (
                <div className="space-y-3.5 bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-200">
                  <div className="flex items-center space-x-2 text-amber-900 font-black text-xs uppercase tracking-wide">
                    <Smile className="w-4 h-4 text-amber-600" />
                    <span>Mục Đăng Nhập Riêng Dành Cho Bé:</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên Tài Khoản hoặc Mã Học Sinh của bé:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: hocsinh1 (hoặc HS001)"
                        value={studentAccount}
                        onChange={(e) => setStudentAccount(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-amber-300 rounded-2xl text-xs font-extrabold focus:border-amber-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật khẩu của bé:
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Nhập mật khẩu (Mặc định: 123)"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-amber-300 rounded-2xl text-xs font-extrabold focus:border-amber-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl shadow-md transition transform active:scale-98 flex items-center justify-center space-x-2"
                  >
                    <span>🚀 Bé Đăng Nhập Vào Học Ngay</span>
                  </button>

                  {/* Danh sách tài khoản học sinh thực tế trong hệ thống */}
                  <div className="pt-2 border-t border-amber-200">
                    {users.filter(u => u.role === 'student').length > 0 ? (
                      <>
                        <span className="text-[11px] font-bold text-amber-800 block mb-1.5">
                          Tài khoản học sinh hiện có trong hệ thống (bấm để điền nhanh):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {users.filter(u => u.role === 'student').slice(0, 6).map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => handleFillStudentQuick(st.username || st.studentId || st.name, st.password || '123')}
                              className="p-1.5 bg-white border border-amber-300 rounded-xl text-left hover:bg-amber-100 transition"
                            >
                              <div className="text-[11px] font-black text-slate-800 truncate">{st.avatar || '🐱'} {st.name}</div>
                              <div className="text-[9px] text-amber-700 font-bold truncate">TK: {st.username || st.studentId} • Lớp {st.grade}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-2.5 bg-amber-100/70 rounded-xl text-[11px] text-amber-900 font-medium text-center">
                        💡 Web đang ở trạng thái mới trắng. Bé hãy bấm tab <strong>Đăng Ký Mới</strong> ở trên để tạo tài khoản riêng nhé!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. MỤC DÀNH CHO PHỤ HUYNH: ĐĂNG NHẬP QUA TÊN & ID TÀI KHOẢN CỦA CON */}
              {selectedRole === 'parent' && (
                <div className="space-y-3.5 bg-indigo-50/60 p-4 rounded-2xl border-2 border-indigo-200">
                  <div className="flex items-center space-x-2 text-indigo-900 font-black text-xs uppercase tracking-wide">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Đăng Nhập Bằng Tên & ID Tài Khoản Của Con:</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 font-medium">
                    Ba mẹ không cần nhớ mật khẩu phức tạp! Chỉ cần nhập Tên của con và Mã ID tài khoản của con để vào xem Báo cáo học tập.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Họ và Tên của con:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={parentChildName}
                        onChange={(e) => setParentChildName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-indigo-300 rounded-2xl text-xs font-extrabold focus:border-indigo-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Mã ID tài khoản của con:
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: HS101"
                        value={parentChildId}
                        onChange={(e) => setParentChildId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-indigo-300 rounded-2xl text-xs font-extrabold focus:border-indigo-500 focus:outline-none bg-white uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition transform active:scale-98 flex items-center justify-center space-x-2"
                  >
                    <span>👨‍👩‍👧 Phụ Huynh Xem Báo Cáo Của Con</span>
                  </button>

                  {/* Danh sách con hiện có trong hệ thống */}
                  <div className="pt-2 border-t border-indigo-200">
                    {users.filter(u => u.role === 'student').length > 0 ? (
                      <>
                        <span className="text-[11px] font-bold text-indigo-900 block mb-1.5">
                          Hồ sơ con hiện có trong hệ thống (bấm để điền nhanh):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {users.filter(u => u.role === 'student').slice(0, 6).map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => handleFillParentQuick(st.name, st.studentId || st.id)}
                              className="p-1.5 bg-white border border-indigo-300 rounded-xl text-left hover:bg-indigo-100 transition"
                            >
                              <div className="text-[11px] font-black text-slate-800 truncate">{st.avatar || '👦'} {st.name}</div>
                              <div className="text-[9px] text-indigo-700 font-bold truncate">ID: {st.studentId || st.id}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-2.5 bg-indigo-100/70 rounded-xl text-[11px] text-indigo-900 font-medium text-center">
                        💡 Chưa có hồ sơ học sinh. Ba mẹ hoặc Thầy Cô hãy đăng ký tài khoản cho bé trước nhé!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. MỤC DÀNH CHO GIÁO VIÊN: QUẢN LÝ WEB */}
              {selectedRole === 'teacher' && (
                <div className="space-y-3.5 bg-teal-50/60 p-4 rounded-2xl border-2 border-teal-200">
                  <div className="flex items-center space-x-2 text-teal-900 font-black text-xs uppercase tracking-wide">
                    <GraduationCap className="w-4 h-4 text-teal-600" />
                    <span>Đăng Nhập Giáo Viên (Quản Lý Toàn Bộ Web):</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa chỉ Email giáo viên:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="giaovien@vuihoc.vn"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-teal-300 rounded-2xl text-xs font-bold focus:border-teal-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật khẩu:
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Mật khẩu giáo viên..."
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-teal-300 rounded-2xl text-xs font-bold focus:border-teal-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition transform active:scale-98 flex items-center justify-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>👩‍🏫 Giáo Viên Đăng Nhập Quản Lý Web</span>
                  </button>

                  <div className="pt-2 border-t border-teal-200 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherEmail('giaovien@vuihoc.vn');
                        setTeacherPassword('teacher123');
                      }}
                      className="text-xs font-bold text-teal-800 underline hover:text-teal-950"
                    >
                      Bấm vào đây để điền mẫu: giaovien@vuihoc.vn / teacher123
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* ===================== FORM ĐĂNG KÝ TÀI KHOẢN MỚI ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {selectedRole === 'student' ? 'Họ và tên của bé:' : 'Họ và tên giáo viên:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'student' ? 'Ví dụ: Nguyễn Nhật Nam' : 'Ví dụ: Cô Nguyễn Thị Lan'}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              {selectedRole === 'student' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên tài khoản của bé:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: nam2018"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mật khẩu của bé:
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="VD: 123456"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Khối Lớp:
                    </label>
                    <select
                      value={regGrade}
                      onChange={(e) => setRegGrade(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-amber-500 focus:outline-none bg-white"
                    >
                      {[1, 2, 3, 4, 5].map(g => (
                        <option key={g} value={g}>Lớp {g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chọn Avatar Đáng Yêu:
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                      {AVATAR_OPTIONS.map(av => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setRegAvatar(av)}
                          className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition ${
                            regAvatar === av 
                              ? 'bg-amber-400 shadow-md scale-110 border-2 border-amber-600' 
                              : 'hover:bg-amber-100'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                    💡 Sau khi đăng ký, hệ thống sẽ tự động cấp một <strong>Mã ID tài khoản của con</strong> (ví dụ: HS123). Ba mẹ chỉ cần dùng Tên bé và Mã ID này để đăng nhập vào xem báo cáo!
                  </div>
                </>
              ) : selectedRole === 'teacher' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email giáo viên:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="giaovien@truonghoc.edu.vn"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật khẩu khởi tạo:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Tối thiểu 4 ký tự..."
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Trường tiểu học công tác:
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Trường Tiểu học Chu Văn An"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900">
                  Phụ huynh không cần đăng ký tài khoản riêng! Ba mẹ chỉ cần chuyển sang tab <strong>Đăng Nhập</strong> và nhập <strong>Tên của con + ID tài khoản của con</strong> là có thể vào xem báo cáo ngay.
                </div>
              )}

              {selectedRole !== 'parent' && (
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-md transition transform active:scale-98 flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Hoàn Tất Đăng Ký</span>
                </button>
              )}
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Đang đăng nhập: <strong className="text-slate-800">{currentUser?.name || 'Khách'}</strong> ({currentUser?.role || 'Chưa đăng nhập'})
          </div>
          {currentUser && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-rose-600 hover:text-rose-700 font-bold underline text-xs"
            >
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
