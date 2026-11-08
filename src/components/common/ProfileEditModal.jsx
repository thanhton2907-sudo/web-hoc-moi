import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { X, Edit3, Check, KeyRound, User, Lock, Smile, Sparkles } from 'lucide-react';

const AVATAR_LIST = ['🐱', '🐶', '🐰', '🦊', '🐼', '🦁', '🐯', '🦄', '🐨', '🐸', '🐧', '🦉', '👩‍🏫', '👨‍🏫', '👨‍👩‍👧'];

export const ProfileEditModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUser } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [studentId, setStudentId] = useState(currentUser?.studentId || '');
  const [password, setPassword] = useState(currentUser?.password || currentUser?.pin || '123');
  const [grade, setGrade] = useState(currentUser?.grade || 1);
  const [avatar, setAvatar] = useState(currentUser?.avatar || '🐱');
  const [school, setSchool] = useState(currentUser?.school || '');
  const [notifyMsg, setNotifyMsg] = useState('');

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || '');
      setStudentId(currentUser.studentId || '');
      setPassword(currentUser.password || currentUser.pin || '123');
      setGrade(currentUser.grade || 1);
      setAvatar(currentUser.avatar || '🐱');
      setSchool(currentUser.school || '');
      setNotifyMsg('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateUser(currentUser.id, {
      name: name.trim(),
      username: username ? username.trim().toLowerCase() : undefined,
      studentId: studentId ? studentId.trim().toUpperCase() : undefined,
      password: password.trim(),
      grade: Number(grade),
      avatar,
      school: school.trim()
    });

    setNotifyMsg('✨ Đã cập nhật và đổi thông tin thành công!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative m-auto bg-white w-full max-w-md rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden text-slate-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{avatar}</span>
            <div>
              <h3 className="font-black text-sm md:text-base leading-tight">Đổi Thông Tin & Mật Khẩu</h3>
              <p className="text-[10px] text-amber-100 font-medium">Cập nhật hồ sơ tài khoản của bạn</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {notifyMsg && (
          <div className="m-4 p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{notifyMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
          {/* Đổi Họ và tên */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Họ và Tên:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>

          {currentUser.role === 'student' ? (
            <>
              {/* Đổi Tên tài khoản & Mã ID của con */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên tài khoản (đăng nhập):</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold focus:border-amber-500 focus:outline-none"
                    placeholder="VD: hocsinh1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã ID con (cho phụ huynh):</label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold focus:border-amber-500 focus:outline-none uppercase"
                    placeholder="VD: HS001"
                  />
                </div>
              </div>

              {/* Đổi Mật khẩu & Khối lớp */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mật khẩu của bé:</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối Lớp:</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold focus:border-amber-500 focus:outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Lớp {g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Đổi Mật khẩu giáo viên / phụ huynh */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật khẩu mới:</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              {currentUser.role === 'teacher' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trường học công tác:</label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}
            </>
          )}

          {/* Chọn Đổi Avatar */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Đổi Avatar hình đại diện:</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-2xl">
              {AVATAR_LIST.map(av => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center transition ${
                    avatar === av 
                      ? 'bg-amber-400 border-2 border-amber-600 scale-110 shadow-sm' 
                      : 'hover:bg-slate-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl shadow-md transition"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
