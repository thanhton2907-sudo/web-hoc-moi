// Cấu hình khối lớp và môn học chuẩn Tiểu học (Lớp 1 - Lớp 5)

export const GRADE_LEVELS = [
  { id: 1, name: 'Lớp 1', icon: '🌱', desc: 'Bắt đầu hành trình con chữ và con số' },
  { id: 2, name: 'Lớp 2', icon: '🌿', desc: 'Mở rộng kiến thức, tính toán nhanh nhẹn' },
  { id: 3, name: 'Lớp 3', icon: '🌳', desc: 'Bảng nhân chia, khám phá thế giới xung quanh' },
  { id: 4, name: 'Lớp 4', icon: '🚀', desc: 'Tư duy logic, Khoa học & Lịch sử Địa lí' },
  { id: 5, name: 'Lớp 5', icon: '⭐', desc: 'Vững vàng kiến thức, bứt phá vào cấp 2' },
];

export const SUBJECTS_CONFIG = [
  { id: 'math', name: 'Toán học', icon: '📐', color: 'from-amber-400 to-orange-500', bgBadge: 'bg-amber-100 text-amber-700', grades: [1, 2, 3, 4, 5] },
  { id: 'vietnamese', name: 'Tiếng Việt', icon: '📖', color: 'from-rose-400 to-pink-500', bgBadge: 'bg-rose-100 text-rose-700', grades: [1, 2, 3, 4, 5] },
  { id: 'english', name: 'Tiếng Anh', icon: '🇬🇧', color: 'from-sky-400 to-blue-600', bgBadge: 'bg-sky-100 text-sky-700', grades: [1, 2, 3, 4, 5] },
];

// Dữ liệu học sinh để trống (Web trắng - giáo viên tự tạo và học sinh tự đăng ký)
export const MOCK_STUDENTS = [];

// Huy hiệu học tập chuẩn
export const MOCK_BADGES = [
  { id: 'b1', title: 'Ong Chăm Chỉ', icon: '🐝', desc: 'Học liên tục 5 ngày không nghỉ', unlocked: true },
  { id: 'b2', title: 'Thần Đồng Tính Nhanh', icon: '⚡', desc: 'Đạt điểm 10 môn Toán 3 lần', unlocked: true },
  { id: 'b3', title: 'Đôi Tai Thính', icon: '🎧', desc: 'Hoàn thành 10 bài nghe Tiếng Anh', unlocked: true },
  { id: 'b4', title: 'Nhà Thông Thái', icon: '👑', desc: 'Đạt mốc 300 sao thưởng', unlocked: false },
  { id: 'b5', title: 'Vua Đọc Trơn', icon: '📜', desc: 'Luyện đọc Tiếng Việt diễn cảm', unlocked: false },
];

// Từ điển hình ảnh tiếng Anh kèm phát âm
export const PICTURE_DICTIONARY = [
  { id: 'd1', word: 'Apple', ipa: '/ˈæp.əl/', vi: 'Quả táo', icon: '🍎', category: 'Fruits' },
  { id: 'd2', word: 'Banana', ipa: '/bəˈnæn.ə/', vi: 'Quả chuối', icon: '🍌', category: 'Fruits' },
  { id: 'd3', word: 'Dog', ipa: '/dɒɡ/', vi: 'Con chó', icon: '🐶', category: 'Animals' },
  { id: 'd4', word: 'Cat', ipa: '/kæt/', vi: 'Con mèo', icon: '🐱', category: 'Animals' },
  { id: 'd5', word: 'Elephant', ipa: '/ˈel.ɪ.fənt/', vi: 'Con voi', icon: '🐘', category: 'Animals' },
  { id: 'd6', word: 'School bag', ipa: '/ˈskuːl bæɡ/', vi: 'Cặp sách', icon: '🎒', category: 'School' },
  { id: 'd7', word: 'Pencil', ipa: '/ˈpen.səl/', vi: 'Bút chì', icon: '✏️', category: 'School' },
  { id: 'd8', word: 'Book', ipa: '/bʊk/', vi: 'Quyển sách', icon: '📚', category: 'School' },
  { id: 'd9', word: 'Teacher', ipa: '/ˈtiː.tʃər/', vi: 'Giáo viên', icon: '👩‍🏫', category: 'People' },
  { id: 'd10', word: 'Rainbow', ipa: '/ˈreɪn.bəʊ/', vi: 'Cầu vồng', icon: '🌈', category: 'Nature' },
  { id: 'd11', word: 'Sun', ipa: '/sʌn/', vi: 'Mặt trời', icon: '☀️', category: 'Nature' },
  { id: 'd12', word: 'Bicycle', ipa: '/ˈbaɪ.sɪ.kəl/', vi: 'Xe đạp', icon: '🚲', category: 'Vehicles' }
];

// Danh sách bài học để trống (Web trắng - giáo viên tải đề Word/PDF hoặc tự tạo)
export const MOCK_LESSONS = [];

// Ngân hàng đề thi để trống (Web trắng - giáo viên tự tạo và tải lên)
export const MOCK_EXAMS = [];

// Danh sách trường / lớp học để trống (Web trắng - giáo viên tự thêm lớp)
export const MOCK_CLASSES = [];

// Sổ lỗi sai để trống ban đầu
export const INITIAL_ERROR_NOTEBOOK = [];

// Tài khoản Giáo Viên Quản Trị mặc định để người dùng đăng nhập ngay vào Quản lý web và tự tạo dữ liệu
export const INITIAL_USERS = [
  {
    id: 'u-teacher',
    name: 'Giáo Viên Quản Trị',
    email: 'giaovien@vuihoc.vn',
    password: 'teacher123',
    role: 'teacher',
    school: 'Trường Tiểu Học',
    avatar: '👩‍🏫',
    createdAt: '2026-11-02'
  }
];
