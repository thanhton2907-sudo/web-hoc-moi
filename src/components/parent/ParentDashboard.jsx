import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LineChart, 
  Users, 
  Clock, 
  ShieldCheck, 
  FileDown, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';

export const ParentDashboard = () => {
  const { students, activeStudentId, switchStudent, setStudents, examResults, errorNotebook, allSubjects } = useApp();
  
  const currentChild = students.find(s => s.id === activeStudentId) || students[0] || {
    id: 'guest',
    name: 'Bé yêu',
    grade: 1,
    avatar: '👦',
    stars: 0,
    streak: 0,
    todayMinutes: 0,
    dailyGoalMinutes: 20
  };

  // Lọc kết quả làm bài thi của con
  const childExamResults = (examResults || []).filter(
    r => r.studentId === currentChild.id || r.studentName === currentChild.name
  );

  // Lọc lỗi sai của con cần ôn tập
  const childErrors = (errorNotebook || []).filter(
    err => !err.reviewed && (Number(err.grade) === Number(currentChild.grade) || !err.grade)
  );
  const [dailyGoal, setDailyGoal] = useState(currentChild?.dailyGoalMinutes || 20);
  const [screenLimit, setScreenLimit] = useState(45); // Max 45 minutes screen time
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildGrade, setNewChildGrade] = useState(1);
  const [newChildPin, setNewChildPin] = useState('1111');

  // Handle update daily goal
  const handleSaveSettings = () => {
    setStudents(prev => prev.map(st => {
      if (st.id === currentChild.id) {
        return { ...st, dailyGoalMinutes: Number(dailyGoal) };
      }
      return st;
    }));
    alert('Đã lưu mục tiêu học tập và giới hạn thời gian màn hình thành công!');
  };

  // Add new child profile
  const handleAddChild = (e) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    const newChild = {
      id: 's-' + Date.now(),
      name: newChildName,
      grade: Number(newChildGrade),
      avatar: ['🐰', '🐶', '🐼', '🦊', '🐻'][Math.floor(Math.random() * 5)],
      pin: newChildPin || '1234',
      stars: 50,
      streak: 1,
      todayMinutes: 0,
      dailyGoalMinutes: 20,
      pet: { name: 'Thú Nhỏ', type: 'cat', level: 1, exp: 0, maxExp: 80 },
      parentId: 'p1'
    };

    setStudents(prev => [...prev, newChild]);
    setShowAddChild(false);
    setNewChildName('');
    switchStudent(newChild.id);
    alert(`Đã thêm thành công hồ sơ cho bé ${newChild.name}!`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in print:p-0">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-indigo-400 print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-inner border-2 border-white/40">
              👨‍👩‍👧
            </div>
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-block">
                Đồng Hành Cùng Sự Tiến Bộ Của Con
              </span>
              <h2 className="text-2xl md:text-4xl font-black font-display mt-1">
                Góc Phụ Huynh Thông Thái
              </h2>
              <p className="text-indigo-100 text-xs md:text-sm font-semibold">
                Theo dõi tiến độ học tập, đặt mục tiêu mỗi ngày, quản lý thời gian sử dụng an toàn!
              </p>
            </div>
          </div>

          <button
            onClick={handlePrintReport}
            className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-black text-xs md:text-sm rounded-2xl shadow-md btn-kid flex items-center space-x-2"
          >
            <FileDown className="w-4 h-4 text-indigo-600" />
            <span>Xuất Phiếu Báo Cáo (PDF / In)</span>
          </button>
        </div>

        {/* Child Selector Tabs */}
        <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-white/20 overflow-x-auto">
          <span className="text-xs font-bold text-indigo-200">Chọn hồ sơ con:</span>
          {students.map(ch => (
            <button
              key={ch.id}
              onClick={() => switchStudent(ch.id)}
              className={`px-4 py-2 rounded-2xl font-bold text-xs md:text-sm transition flex items-center space-x-2 ${
                ch.id === currentChild.id
                  ? 'bg-white text-indigo-950 shadow-md scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span className="text-lg">{ch.avatar}</span>
              <span>{ch.name} (Lớp {ch.grade})</span>
            </button>
          ))}

          <button
            onClick={() => setShowAddChild(true)}
            className="px-3 py-1.5 rounded-2xl bg-indigo-500/60 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 border border-white/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm con</span>
          </button>
        </div>
      </div>

      {/* Modal Add Child Profile */}
      {showAddChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-4xl max-w-md w-full p-6 shadow-2xl border-4 border-indigo-300">
            <h3 className="text-xl font-black text-slate-800 font-display mb-4">
              Thêm Hồ Sơ Con Mới
            </h3>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên của bé:</label>
                <input
                  type="text"
                  required
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="Ví dụ: Bé Bảo Vy"
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Khối Lớp:</label>
                <select
                  value={newChildGrade}
                  onChange={(e) => setNewChildGrade(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-400 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mã PIN 4 số đăng nhập:</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newChildPin}
                  onChange={(e) => setNewChildPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-center tracking-widest focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChild(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md btn-kid"
                >
                  Tạo hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border-3 border-indigo-100 shadow-sm cartoon-card">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Thời lượng hôm nay</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            {currentChild.todayMinutes} / {currentChild.dailyGoalMinutes} Phút
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            Đạt {Math.round((currentChild.todayMinutes / currentChild.dailyGoalMinutes) * 100)}% chỉ tiêu ngày
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-3 border-indigo-100 shadow-sm cartoon-card">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Sao tích lũy</span>
            <span className="text-amber-500 text-base">⭐</span>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {currentChild.stars} Ngôi sao
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            Top 5 học sinh năng nổ nhất
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-3 border-indigo-100 shadow-sm cartoon-card">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Chuỗi ngày học</span>
            <span className="text-orange-500 text-base">🔥</span>
          </div>
          <div className="text-2xl font-black text-orange-600">
            {currentChild.streak} Ngày liên tiếp
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            Duy trì thói quen học tập rất tốt
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-3 border-indigo-100 shadow-sm cartoon-card">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Thú cưng học tập</span>
            <span className="text-base">{currentChild.avatar}</span>
          </div>
          <div className="text-2xl font-black text-indigo-700">
            Cấp độ {currentChild.pet?.level}
          </div>
          <p className="text-[11px] text-indigo-600 font-bold mt-1">
            {currentChild.pet?.name} đang rất hào hứng
          </p>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Learning Chart (Mock Visual) */}
        <div className="lg:col-span-2 bg-white rounded-4xl p-6 border-3 border-indigo-200 shadow-sm cartoon-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Thời Gian Học Tập Trong Tuần Của Bé
              </h3>
              <p className="text-xs text-slate-500">Thống kê số phút tự học mỗi ngày từ Thứ Hai đến Chủ Nhật</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
              Tuần hiện tại
            </span>
          </div>

          {/* Bar Chart Simulation */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4 border-b border-slate-100">
            {[
              { day: 'T2', mins: 25 },
              { day: 'T3', mins: 15 },
              { day: 'T4', mins: 30 },
              { day: 'T5', mins: 20 },
              { day: 'T6', mins: 28 },
              { day: 'T7', mins: 35 },
              { day: 'CN', mins: currentChild.todayMinutes || 18 }
            ].map((col, idx) => {
              const heightPct = Math.min(100, (col.mins / 40) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{col.mins}p</span>
                  <div className="w-full max-w-[36px] bg-indigo-100 rounded-t-xl h-36 flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-xl transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-black text-slate-700">{col.day}</span>
                </div>
              );
            })}
          </div>

          {/* Subject Completion Progress */}
          <div className="mt-6 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
              Tỉ lệ hoàn thành theo môn học:
            </h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Toán học</span>
                  <span className="text-amber-600">80%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full w-4/5"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Tiếng Việt</span>
                  <span className="text-rose-600">70%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-rose-400 h-2 rounded-full w-7/10"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Tiếng Anh (Kỹ năng nghe)</span>
                  <span className="text-sky-600">90%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full w-9/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations & Daily Control Panel */}
        <div className="space-y-6">
          {/* AI Pedagogical Insights */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-3 border-amber-300 rounded-4xl p-6 shadow-sm cartoon-card">
            <div className="flex items-center space-x-2 text-amber-900 font-display font-black text-base mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Nhận Xét Sư Phạm Tự Động</span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="p-3 bg-white/80 rounded-2xl border border-amber-200">
                <span className="font-bold text-emerald-700 block mb-0.5">🌟 Điểm mạnh:</span>
                Học sinh phản xạ nghe Tiếng Anh rất nhạy bén, nhận diện từ vựng con vật và số đếm chính xác 100%.
              </div>

              <div className="p-3 bg-white/80 rounded-2xl border border-amber-200">
                <span className="font-bold text-amber-700 block mb-0.5">💡 Cần lưu ý bồi dưỡng:</span>
                Phép tính cộng trừ phạm vi 10 còn hơi chậm một chút. Phụ huynh nên cùng con luyện thêm 5 phút tính nhẩm trong Góc Trò Chơi nhé!
              </div>
            </div>
          </div>

          {/* Parental Screen Time & Daily Goal Settings */}
          <div className="bg-white rounded-4xl p-6 border-3 border-indigo-200 shadow-sm cartoon-card space-y-4">
            <div className="flex items-center space-x-2 text-indigo-900 font-display font-black text-base">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Cài Đặt An Toàn & Mục Tiêu</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mục tiêu học mỗi ngày của bé:
              </label>
              <div className="flex items-center space-x-2">
                {[15, 20, 30, 45].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDailyGoal(mins)}
                    className={`flex-1 py-1.5 rounded-xl font-black text-xs transition border ${
                      dailyGoal === mins
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins}p
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giới hạn màn hình mỗi ngày (Bảo vệ mắt bé):
              </label>
              <select
                value={screenLimit}
                onChange={(e) => setScreenLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value={30}>Tối đa 30 phút / ngày</option>
                <option value={45}>Tối đa 45 phút / ngày (Khuyên dùng)</option>
                <option value={60}>Tối đa 60 phút / ngày</option>
              </select>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-md btn-kid"
            >
              Lưu Cài Đặt Cho Bé
            </button>
          </div>
        </div>
      </div>

      {/* ================= KHU VỰC KẾT QUẢ ĐỀ THI & KIẾN THỨC CỦA CON ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Danh sách đề thi con đã làm */}
        <div className="bg-white rounded-4xl p-6 border-3 border-indigo-200 shadow-sm cartoon-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 font-display flex items-center gap-2">
                <span>📝</span>
                <span>Kết Quả Các Đề Thi Con Đã Làm</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Theo dõi điểm số, số câu đúng/sai và thời gian làm bài của con
              </p>
            </div>
            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
              {childExamResults.length} bài đã nộp
            </span>
          </div>

          <div className="space-y-3">
            {childExamResults.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <span className="text-3xl block mb-2">📋</span>
                <p className="text-xs font-black text-slate-700">Con chưa làm bài thi nào</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Khi con hoàn thành các đề thi hoặc bài kiểm tra, điểm số và chi tiết đúng/sai sẽ hiển thị tại đây!
                </p>
              </div>
            ) : (
              childExamResults.map(res => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 bg-slate-50/50 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        Lớp {res.grade} • {res.subjectId === 'math' ? 'Toán' : res.subjectId === 'vietnamese' ? 'Tiếng Việt' : res.subjectId === 'english' ? 'Tiếng Anh' : res.subjectId}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(res.submittedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm truncate">
                      {res.examTitle}
                    </h4>
                    <div className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center space-x-2">
                      <span className="text-emerald-700">✓ Đúng: {res.correctCount || 0} câu</span>
                      <span>•</span>
                      <span className="text-rose-600">✗ Sai: {res.wrongCount || 0} câu</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`px-3 py-1.5 rounded-2xl font-black text-base md:text-lg shadow-xs ${
                      res.score >= 8
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                        : res.score >= 5
                        ? 'bg-amber-100 text-amber-950 border border-amber-300'
                        : 'bg-rose-100 text-rose-950 border border-rose-300'
                    }`}>
                      {res.score}/10 đ
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kiến thức cần ôn tập (Trích xuất từ Sổ Lỗi Sai) */}
        <div className="bg-white rounded-4xl p-6 border-3 border-rose-200 shadow-sm cartoon-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 font-display flex items-center gap-2">
                <span>🎯</span>
                <span>Kiến Thức Cần Cùng Con Ôn Tập</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tổng hợp từ những câu con làm sai trong bài kiểm tra và bài học
              </p>
            </div>
            <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl">
              {childErrors.length} điểm cần lưu ý
            </span>
          </div>

          <div className="space-y-3">
            {childErrors.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-3xl border-2 border-dashed border-emerald-200">
                <span className="text-3xl block mb-2">🎉</span>
                <p className="text-xs font-black text-emerald-800">Con đang học rất tốt!</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Chưa ghi nhận lỗi sai nào chưa khắc phục. Ba mẹ hãy tiếp tục động viên con nhé!
                </p>
              </div>
            ) : (
              childErrors.slice(0, 5).map(err => (
                <div
                  key={err.id}
                  className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-black text-rose-700">
                    <span>{err.subject} • Lớp {err.grade}</span>
                    <span>Cần củng cố</span>
                  </div>
                  <p className="font-extrabold text-slate-800 text-xs leading-snug">
                    {err.question}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-rose-600 line-through">Con đã điền: {err.userWrongAnswer}</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Đáp án đúng: {err.correctAnswer}</span>
                  </div>
                  {err.explanation && (
                    <p className="text-[10px] text-slate-500 italic pt-0.5">
                      💡 {err.explanation}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
