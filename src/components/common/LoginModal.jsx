import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Lock, X, Check, Sparkles, School } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { students, switchStudent, setCurrentRole, currentRole } = useApp();
  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 's1');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (student) => {
    // Direct switch or check PIN
    if (student.pin && pin && pin !== student.pin) {
      setErrorMsg('Mã PIN không đúng bé ơi!');
      return;
    }
    switchStudent(student.id);
    onClose();
  };

  const handleParentTeacherLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }
    // Mock authentication
    setCurrentRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-4xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative overflow-hidden">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-amber-100 rounded-3xl text-3xl mb-2">
            🎒
          </div>
          <h3 className="text-2xl font-black text-slate-800 font-display">Chọn Vai Trò Đăng Nhập</h3>
          <p className="text-sm text-slate-500">Dễ dàng, bảo mật và an toàn cho bé</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            onClick={() => { setSelectedRole('student'); setErrorMsg(''); }}
            className={`py-2 px-3 rounded-xl font-bold text-xs md:text-sm transition flex flex-col items-center gap-1 ${
              selectedRole === 'student' ? 'bg-amber-400 text-amber-950 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>👦</span>
            <span>Học sinh</span>
          </button>
          <button
            onClick={() => { setSelectedRole('parent'); setErrorMsg(''); }}
            className={`py-2 px-3 rounded-xl font-bold text-xs md:text-sm transition flex flex-col items-center gap-1 ${
              selectedRole === 'parent' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>👨‍👩‍👧</span>
            <span>Phụ huynh</span>
          </button>
          <button
            onClick={() => { setSelectedRole('teacher'); setErrorMsg(''); }}
            className={`py-2 px-3 rounded-xl font-bold text-xs md:text-sm transition flex flex-col items-center gap-1 ${
              selectedRole === 'teacher' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>👩‍🏫</span>
            <span>Giáo viên</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Role Content */}
        {selectedRole === 'student' ? (
          <div>
            <p className="text-xs font-bold text-slate-600 mb-3 text-center">
              Chọn tài khoản hoặc nhập mã PIN 4 số để vào học:
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {students.map(st => (
                <div
                  key={st.id}
                  onClick={() => handleStudentLogin(st)}
                  className="cursor-pointer bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-400 rounded-2xl p-3 text-center transition group cartoon-card"
                >
                  <div className="text-4xl mb-1 group-hover:scale-110 transition-transform">
                    {st.avatar}
                  </div>
                  <div className="font-bold text-xs text-slate-800">Khối Lớp {st.grade}</div>
                  <div className="text-[10px] text-amber-700 font-bold bg-amber-200/70 rounded-full px-2 py-0.5 mt-1 inline-block">
                    {st.stars} ⭐
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-600 mb-1">Mã PIN bảo mật (tùy chọn):</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ví dụ: 1234"
                className="w-full text-center tracking-widest font-black text-xl px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleParentTeacherLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email đăng nhập:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'parent' ? 'phuhuynh@gmail.com' : 'giaovien@school.edu.vn'}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-400 focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Mật khẩu:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-400 focus:outline-none font-medium"
              />
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl text-[11px] text-blue-700 font-medium">
              💡 Demo: Bạn có thể nhập email/mật khẩu bất kỳ để trải nghiệm ngay quyền Phụ huynh hoặc Giáo viên.
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black rounded-2xl shadow-md btn-kid text-base"
            >
              Đăng nhập ngay
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
