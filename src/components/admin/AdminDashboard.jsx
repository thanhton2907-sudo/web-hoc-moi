import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { TeacherDashboard } from '../teacher/TeacherDashboard';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  FileText, 
  Headphones, 
  Database, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Download, 
  Upload, 
  RefreshCw, 
  KeyRound, 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  AlertTriangle,
  Play,
  FileUp,
  LogIn
} from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    users, 
    currentUser, 
    currentRole,
    loginWithEmail,
    registerUser, 
    updateUser, 
    deleteUser, 
    exams, 
    englishMediaList, 
    removeEnglishMedia 
  } = useApp();

  const [activeTab, setActiveTab] = useState('exam-builder'); // 'exam-builder' | 'users' | 'exams' | 'media' | 'backup'
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'teacher' | 'parent' | 'admin'

  // Modal State for Edit User
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Modal State for Add User
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    grade: 1,
    avatar: '🐱',
    pin: '1234',
    school: ''
  });

  const [notification, setNotification] = useState({ type: '', text: '' });

  const showNotify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification({ type: '', text: '' }), 3500);
  };

  // Stats
  const totalUsers = (users || []).length;
  const studentCount = (users || []).filter(u => u.role === 'student').length;
  const teacherCount = (users || []).filter(u => u.role === 'teacher').length;
  const parentCount = (users || []).filter(u => u.role === 'parent').length;
  const adminCount = (users || []).filter(u => u.role === 'admin').length;
  const totalExams = (exams || []).length;
  const totalMedia = (englishMediaList || []).length;

  // Filtered Users
  const filteredUsers = (users || []).filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Handle Edit User
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      username: user.username || '',
      studentId: user.studentId || '',
      email: user.email || '',
      password: user.password || user.pin || '123',
      role: user.role || 'student',
      grade: user.grade || 1,
      avatar: user.avatar || '🐱',
      pin: user.pin || user.password || '1234',
      school: user.school || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      updateUser(editingUser.id, editFormData);
      showNotify('success', `Đã cập nhật thông tin tài khoản "${editFormData.name}" thành công!`);
      setEditingUser(null);
    } catch (err) {
      showNotify('error', err.message || 'Cập nhật thất bại!');
    }
  };

  // Handle Delete User
  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      showNotify('error', 'Bạn không thể tự xóa tài khoản Quản trị viên đang đăng nhập!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (${user.role}) khỏi hệ thống?`)) {
      try {
        deleteUser(user.id);
        showNotify('success', `Đã xóa tài khoản "${user.name}" thành công.`);
      } catch (err) {
        showNotify('error', err.message || 'Xóa thất bại!');
      }
    }
  };

  // Handle Create User
  const handleCreateUser = (e) => {
    e.preventDefault();
    try {
      if (!newUserData.name.trim()) {
        showNotify('error', 'Vui lòng nhập tên người dùng!');
        return;
      }
      registerUser(newUserData);
      showNotify('success', `Đã tạo tài khoản mới "${newUserData.name}" thành công!`);
      setIsAddUserOpen(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        grade: 1,
        avatar: '🐱',
        pin: '1234',
        school: ''
      });
    } catch (err) {
      showNotify('error', err.message || 'Không thể tạo tài khoản!');
    }
  };

  // Export system backup to JSON file
  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        users,
        exams,
        englishMediaList
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vuihoc_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showNotify('success', 'Đã tải xuống tệp sao lưu dữ liệu toàn bộ hệ thống!');
    } catch (err) {
      showNotify('error', 'Lỗi khi trích xuất sao lưu!');
    }
  };

  // Import backup from JSON file
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.users && Array.isArray(data.users)) {
          localStorage.setItem('vuihoc_users', JSON.stringify(data.users));
        }
        if (data.exams && Array.isArray(data.exams)) {
          localStorage.setItem('vuihoc_exams', JSON.stringify(data.exams));
        }
        if (data.englishMediaList && Array.isArray(data.englishMediaList)) {
          localStorage.setItem('vuihoc_english_media', JSON.stringify(data.englishMediaList));
        }
        showNotify('success', 'Khôi phục dữ liệu sao lưu thành công! Đang làm mới hệ thống...');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        showNotify('error', 'Tệp sao lưu không đúng định dạng JSON hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  // Reset database to default
  const handleResetSystem = () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ đặt lại toàn bộ hệ thống về trang web trắng ban đầu (chỉ giữ tài khoản Giáo viên Quản trị). Bạn có chắc không?')) {
      localStorage.removeItem('vuihoc_users');
      localStorage.removeItem('vuihoc_exams');
      localStorage.removeItem('vuihoc_english_media');
      localStorage.removeItem('vuihoc_lessons');
      localStorage.removeItem('vuihoc_classes');
      localStorage.removeItem('vuihoc_students');
      localStorage.removeItem('vuihoc_errors');
      localStorage.removeItem('vuihoc_current_user');
      localStorage.removeItem('vuihoc_role');
      localStorage.removeItem('vuihoc_student_id');
      showNotify('success', 'Đang thiết lập lại web trắng...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Kiểm tra quyền: Chỉ Giáo viên mới được quản lý web
  const isTeacher = currentUser?.role === 'teacher' || currentRole === 'teacher' || currentUser?.role === 'admin';

  if (!isTeacher) {
    return (
      <div className="bg-white rounded-4xl p-8 md:p-12 border-3 border-teal-200 shadow-xl text-center max-w-xl mx-auto my-12 space-y-4">
        <div className="w-20 h-20 bg-teal-100 text-teal-800 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner border-2 border-teal-300">
          👩‍🏫
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 font-display">
          Chỉ Có Giáo Viên Mới Được Quản Lý Web
        </h2>
        <p className="text-sm font-semibold text-slate-600 leading-relaxed">
          Khu vực Quản Lý Web được thiết kế bảo mật dành riêng cho quý Thầy Cô để tạo đề thi, bóc tách tài liệu Word/PDF, tải bài nghe Tiếng Anh, quản lý học sinh và sao lưu hệ thống.
        </p>
        <div className="pt-3">
          <button
            onClick={() => loginWithEmail('giaovien@vuihoc.vn', 'teacher123')}
            className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center space-x-2 mx-auto"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập Tài Khoản Giáo Viên Ngay</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner: Teacher Admin Header & Overview */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-teal-500/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-500/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl md:text-5xl border-2 border-teal-400/50 shadow-inner">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-teal-500/40 text-teal-200 border border-teal-400/50 px-3 py-0.5 rounded-full text-xs font-black tracking-wider uppercase inline-block">
                  Cổng Quản Lý Web Giáo Viên
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  ● Đang hoạt động
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black font-display tracking-tight mt-1 text-white">
                Bảng Quản Lý Web Dành Cho Giáo Viên
              </h2>
              <p className="text-teal-200 text-xs md:text-sm font-medium">
                Giáo viên quản trị: <strong className="text-white">{currentUser?.name || 'Cô Hoàng Mai'}</strong> ({currentUser?.school || 'Trường Tiểu Học Chu Văn An'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Tài Khoản</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs rounded-2xl transition flex items-center space-x-1.5"
              title="Tải tệp JSON sao lưu"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Sao Lưu</span>
            </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-teal-500/30">
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-teal-300 font-bold">Tổng Tài Khoản</div>
            <div className="text-2xl font-black font-display text-white mt-1">{totalUsers}</div>
            <div className="text-[10px] text-slate-300">Trên hệ thống</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-amber-300 font-bold">Học Sinh</div>
            <div className="text-2xl font-black font-display text-amber-400 mt-1">{studentCount}</div>
            <div className="text-[10px] text-slate-300">Khối Lớp 1 - 5</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-teal-300 font-bold">Giáo Viên</div>
            <div className="text-2xl font-black font-display text-teal-400 mt-1">{teacherCount}</div>
            <div className="text-[10px] text-slate-300">Quản lý web</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-indigo-300 font-bold">Phụ Huynh</div>
            <div className="text-2xl font-black font-display text-indigo-300 mt-1">{parentCount}</div>
            <div className="text-[10px] text-slate-300">Xem tiến độ</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-rose-300 font-bold">Kho Đề Thi</div>
            <div className="text-2xl font-black font-display text-rose-400 mt-1">{totalExams}</div>
            <div className="text-[10px] text-slate-300">3 Môn cơ bản</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-sky-300 font-bold">Bài Nghe Tiếng Anh</div>
            <div className="text-2xl font-black font-display text-sky-400 mt-1">{totalMedia}</div>
            <div className="text-[10px] text-slate-300">Audio & Video</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 border-2 ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex border-b border-slate-300 gap-2 bg-white p-2 rounded-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('exam-builder')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center space-x-2 transition shrink-0 ${
            activeTab === 'exam-builder'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileUp className="w-4 h-4" />
          <span>Tạo Đề Từ Word / PDF & Lớp Học</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center space-x-2 transition shrink-0 ${
            activeTab === 'users'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý Học Sinh & Tài Khoản ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center space-x-2 transition shrink-0 ${
            activeTab === 'media'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Kho Nghe Tiếng Anh ({englishMediaList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center space-x-2 transition shrink-0 ${
            activeTab === 'backup'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Sao Lưu Dữ Liệu Web</span>
        </button>
      </div>

      {/* TAB: EXAM BUILDER (TEACHER DASHBOARD INTEGRATED) */}
      {activeTab === 'exam-builder' && (
        <TeacherDashboard />
      )}

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border-3 border-slate-200 shadow-sm space-y-5">
          {/* Controls: Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 mr-1">Lọc:</span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'student', label: 'Học sinh' },
                { id: 'teacher', label: 'Giáo viên' },
                { id: 'parent', label: 'Phụ huynh' },
                { id: 'admin', label: 'Quản trị' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setRoleFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                    roleFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tài khoản & Tên</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Thông tin đăng nhập (TK / ID con / MK)</th>
                  <th className="py-3 px-4">Khối Lớp / Đơn vị</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                      Không tìm thấy tài khoản nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{u.avatar || '👤'}</span>
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm">{u.name}</div>
                            <div className="text-[10px] text-slate-400">ID hệ thống: {u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : u.role === 'teacher'
                            ? 'bg-teal-100 text-teal-800 border border-teal-300'
                            : u.role === 'parent'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {u.role === 'admin' && '🛡️ Quản trị'}
                          {u.role === 'teacher' && '👩‍🏫 Giáo viên'}
                          {u.role === 'parent' && '👨‍👩‍👧 Phụ huynh'}
                          {u.role === 'student' && '🐱 Học sinh'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {u.role === 'student' ? (
                          <div className="space-y-0.5 text-xs">
                            <div>TK bé: <strong className="text-amber-900">{u.username || 'hocsinh' + (u.grade || 1)}</strong></div>
                            <div>ID con: <span className="font-mono bg-indigo-50 text-indigo-900 border border-indigo-200 px-1.5 py-0.2 rounded font-black">{u.studentId || u.id}</span></div>
                            <div className="text-[10px] text-slate-500">MK: <strong>{u.password || u.pin || '123'}</strong></div>
                          </div>
                        ) : u.email ? (
                          <div className="space-y-0.5 text-xs">
                            <div className="font-semibold text-slate-800">{u.email}</div>
                            <div className="text-[10px] text-slate-500">MK: {u.password || '••••'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa cài đặt</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.role === 'student' && (
                          <span className="font-bold text-amber-700">Lớp {u.grade || 1}</span>
                        )}
                        {u.role === 'teacher' && (
                          <span className="text-slate-600">{u.school || 'Tiểu học chuẩn'}</span>
                        )}
                        {u.role === 'parent' && (
                          <span className="text-slate-500">Phụ huynh học sinh</span>
                        )}
                        {u.role === 'admin' && (
                          <span className="text-rose-600 font-bold">Toàn quyền hệ thống</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 rounded-lg transition"
                            title="Sửa tài khoản"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            className={`p-1.5 rounded-lg transition ${
                              u.id === currentUser?.id
                                ? 'opacity-30 cursor-not-allowed text-slate-400'
                                : 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600'
                            }`}
                            disabled={u.id === currentUser?.id}
                            title={u.id === currentUser?.id ? 'Không thể xóa tài khoản của bạn' : 'Xóa tài khoản'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXAM MANAGEMENT */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-3xl p-6 border-3 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-slate-800">
              Danh Sách Đề Thi Trên Hệ Thống ({exams.length} đề)
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Được đồng bộ từ ngân hàng đề và giáo viên tải lên
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map(exam => (
              <div key={exam.id} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      Lớp {exam.grade || 1} • {exam.subjectId === 'math' ? 'Toán học' : exam.subjectId === 'vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {exam.durationMinutes || 20} phút
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Tác giả: <strong>{exam.creatorName || 'Giáo viên'}</strong> • {exam.questions?.length || exam.totalQuestions || 0} câu hỏi
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-400">
                    Điểm tối đa: {exam.maxScore || 10}đ
                  </div>
                  <span className="text-xs text-emerald-600 font-bold">
                    ✓ Sẵn sàng làm bài
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ENGLISH MEDIA MANAGEMENT */}
      {activeTab === 'media' && (
        <div className="bg-white rounded-3xl p-6 border-3 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-slate-800">
              Kho Video & Bài Nghe Tiếng Anh ({englishMediaList.length} tệp)
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Phục vụ học sinh luyện nghe và xem video trực quan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {englishMediaList.map(item => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      item.type === 'youtube'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : item.type === 'video'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-sky-100 text-sky-800 border border-sky-300'
                    }`}>
                      {item.type === 'youtube' ? '▶ YouTube' : item.type === 'video' ? '🎬 Video MP4' : '🎧 Audio MP3'}
                    </span>
                    <span className="text-xs font-bold text-indigo-700">
                      Lớp {item.grade || 1}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.description || 'Bài luyện nghe chuẩn'}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Đăng bởi: {item.uploadedBy || 'Giáo viên'}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn muốn xóa bài nghe "${item.title}"?`)) {
                        removeEnglishMedia(item.id);
                        showNotify('success', 'Đã gỡ bài nghe khỏi kho!');
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                    title="Xóa bài này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & MAINTENANCE */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-3xl p-6 border-3 border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-display font-black text-lg text-slate-800">
              Quản Trị Cơ Sở Dữ Liệu & Sao Lưu Hệ Thống
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Đảm bảo an toàn dữ liệu, cho phép tải về bản snapshot đầy đủ hoặc khôi phục khi cần thiết
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Export Card */}
            <div className="p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-indigo-950">
                1. Sao Lưu Toàn Diện (Export JSON)
              </h4>
              <p className="text-xs text-indigo-800">
                Tải xuống tệp JSON bao gồm toàn bộ danh sách tài khoản, đề thi, kho bài nghe và cài đặt.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm"
              >
                Tải Về Bản Sao Lưu
              </button>
            </div>

            {/* Import Card */}
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-emerald-950">
                2. Phục Hồi Dữ Liệu (Import JSON)
              </h4>
              <p className="text-xs text-emerald-800">
                Nạp lại dữ liệu từ tệp sao lưu JSON đã lưu trên máy tính để khôi phục cấu hình hệ thống.
              </p>
              <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm text-center block cursor-pointer">
                <span>Chọn Tệp JSON Để Nạp</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            {/* Factory Reset Card */}
            <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-rose-950">
                3. Đặt Lại Dữ Liệu Mẫu
              </h4>
              <p className="text-xs text-rose-800">
                Xóa sạch bộ nhớ tạm LocalStorage và đặt lại dữ liệu nguyên bản của hệ thống.
              </p>
              <button
                onClick={handleResetSystem}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm"
              >
                Khôi Phục Gốc (Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editingUser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative m-auto bg-white w-full max-w-md rounded-3xl shadow-2xl border-4 border-indigo-400 overflow-hidden"
          >
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">Chỉnh Sửa Tài Khoản: {editingUser.name}</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên:</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vai trò:</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold bg-white"
                >
                  <option value="student">Học sinh</option>
                  <option value="parent">Phụ huynh</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              {editFormData.role === 'student' ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tên tài khoản (Username):</label>
                      <input
                        type="text"
                        required
                        value={editFormData.username}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                        placeholder="VD: hocsinh1"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mã ID con (cho phụ huynh):</label>
                      <input
                        type="text"
                        required
                        value={editFormData.studentId}
                        onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold uppercase"
                        placeholder="VD: HS001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Khối Lớp:</label>
                      <select
                        value={editFormData.grade}
                        onChange={(e) => setEditFormData({ ...editFormData, grade: Number(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold bg-white"
                      >
                        {[1, 2, 3, 4, 5].map(g => (
                          <option key={g} value={g}>Lớp {g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mật khẩu của bé:</label>
                      <input
                        type="text"
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                        placeholder="VD: 123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Avatar con vật:</label>
                    <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-50 border rounded-xl">
                      {['🐱', '🐶', '🐰', '🦊', '🐼', '🦁', '🐯', '🦄', '🐨', '🐸'].map(av => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, avatar: av })}
                          className={`w-7 h-7 rounded-lg text-lg flex items-center justify-center transition ${
                            editFormData.avatar === av ? 'bg-amber-400 scale-110 shadow-sm' : 'hover:bg-slate-200'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email:</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mật khẩu:</label>
                    <input
                      type="text"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-sm"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: ADD NEW USER */}
      {isAddUserOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative m-auto bg-white w-full max-w-md rounded-3xl shadow-2xl border-4 border-emerald-400 overflow-hidden"
          >
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">Thêm Tài Khoản Mới Vào Hệ Thống</h3>
              </div>
              <button 
                onClick={() => setIsAddUserOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bé Nhật Nam"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vai trò:</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold bg-white"
                >
                  <option value="student">Học sinh</option>
                  <option value="parent">Phụ huynh</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              {newUserData.role === 'student' ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khối Lớp:</label>
                    <select
                      value={newUserData.grade}
                      onChange={(e) => setNewUserData({ ...newUserData, grade: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold bg-white"
                    >
                      {[1, 2, 3, 4, 5].map(g => (
                        <option key={g} value={g}>Lớp {g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mã PIN:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newUserData.pin}
                      onChange={(e) => setNewUserData({ ...newUserData, pin: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email:</label>
                    <input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mật khẩu:</label>
                    <input
                      type="password"
                      required
                      placeholder="Ít nhất 4 ký tự"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-sm"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
