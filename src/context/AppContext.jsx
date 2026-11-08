import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MOCK_STUDENTS, 
  MOCK_LESSONS, 
  MOCK_EXAMS, 
  MOCK_CLASSES, 
  INITIAL_ERROR_NOTEBOOK, 
  MOCK_BADGES,
  INITIAL_USERS,
  SUBJECTS_CONFIG
} from '../data/mockData';
import { playKidSound, speakText } from '../utils/speech';
import confetti from 'canvas-confetti';

const AppContext = createContext();

// Khởi tạo một lần xóa sạch cache dữ liệu cũ của phiên bản trước để trang web hoàn toàn trắng
const DB_VERSION_KEY = 'vuihoc_db_v6_clean_white_state';
if (typeof window !== 'undefined') {
  const currentDbVersion = localStorage.getItem('vuihoc_version');
  if (currentDbVersion !== DB_VERSION_KEY) {
    localStorage.removeItem('vuihoc_users');
    localStorage.removeItem('vuihoc_students');
    localStorage.removeItem('vuihoc_lessons');
    localStorage.removeItem('vuihoc_exams');
    localStorage.removeItem('vuihoc_classes');
    localStorage.removeItem('vuihoc_errors');
    localStorage.removeItem('vuihoc_english_media');
    localStorage.removeItem('vuihoc_current_user');
    localStorage.removeItem('vuihoc_role');
    localStorage.removeItem('vuihoc_student_id');
    localStorage.setItem('vuihoc_version', DB_VERSION_KEY);
  }
}


export const AppProvider = ({ children }) => {
  // 1. Quản lý danh sách tài khoản người dùng
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('vuihoc_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // 2. Người dùng đang đăng nhập hiện tại (Mặc định Giáo Viên để sẵn sàng Quản Lý Web)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vuihoc_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_USERS[0];
  });

  // Role hiện tại
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('vuihoc_role') || 'teacher';
  });

  // Current active student
  const [activeStudentId, setActiveStudentId] = useState(() => {
    return localStorage.getItem('vuihoc_student_id') || '';
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('vuihoc_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_STUDENTS;
      }
    }
    return MOCK_STUDENTS;
  });

  const [lessons, setLessons] = useState(() => {
    const saved = localStorage.getItem('vuihoc_lessons');
    const validSubjects = ['math', 'vietnamese', 'english'];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(l => validSubjects.includes(l.subjectId));
      } catch (e) {
        return MOCK_LESSONS;
      }
    }
    return MOCK_LESSONS;
  });

  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem('vuihoc_exams');
    return saved ? JSON.parse(saved) : MOCK_EXAMS;
  });

  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('vuihoc_classes');
    return saved ? JSON.parse(saved) : MOCK_CLASSES;
  });

  const [errorNotebook, setErrorNotebook] = useState(() => {
    const saved = localStorage.getItem('vuihoc_errors');
    return saved ? JSON.parse(saved) : INITIAL_ERROR_NOTEBOOK;
  });

  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('vuihoc_badges');
    return saved ? JSON.parse(saved) : MOCK_BADGES;
  });

  // Kho bài nghe & video Tiếng Anh do giáo viên tải lên
  const [englishMediaList, setEnglishMediaList] = useState(() => {
    const saved = localStorage.getItem('vuihoc_english_media');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });

  // Danh sách môn học tùy chọn do giáo viên tự tạo thêm (Khoa học, Lịch sử, Tin học...)
  const [customSubjects, setCustomSubjects] = useState(() => {
    const saved = localStorage.getItem('vuihoc_custom_subjects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });

  // Lịch sử kết quả làm bài thi của học sinh (để phục vụ báo cáo phụ huynh)
  const [examResults, setExamResults] = useState(() => {
    const saved = localStorage.getItem('vuihoc_exam_results');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });

  const [selectedGrade, setSelectedGrade] = useState(1);

  // Lưu trữ LocalStorage
  useEffect(() => {
    localStorage.setItem('vuihoc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vuihoc_custom_subjects', JSON.stringify(customSubjects));
  }, [customSubjects]);

  useEffect(() => {
    localStorage.setItem('vuihoc_exam_results', JSON.stringify(examResults));
  }, [examResults]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vuihoc_current_user', JSON.stringify(currentUser));
      localStorage.setItem('vuihoc_role', currentUser.role);
      setCurrentRole(currentUser.role);
    } else {
      localStorage.removeItem('vuihoc_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vuihoc_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('vuihoc_student_id', activeStudentId);
  }, [activeStudentId]);

  useEffect(() => {
    localStorage.setItem('vuihoc_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('vuihoc_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('vuihoc_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('vuihoc_errors', JSON.stringify(errorNotebook));
  }, [errorNotebook]);

  useEffect(() => {
    localStorage.setItem('vuihoc_classes', JSON.stringify(classes));
  }, [classes]);

  // Current active student object
  const currentStudent = students.find(s => s.id === activeStudentId) || students[0] || {
    id: 'guest',
    name: 'Học sinh mới',
    grade: selectedGrade || 1,
    avatar: '🌱',
    stars: 0,
    streak: 0,
    todayMinutes: 0,
    dailyGoalMinutes: 20,
    pet: { name: 'Miu Miu', type: 'cat', level: 1, exp: 0, maxExp: 80 }
  };

  useEffect(() => {
    if (currentStudent) {
      setSelectedGrade(currentStudent.grade);
    }
  }, [activeStudentId]);

  // ==================== CÁC HÀM XÁC THỰC & ĐĂNG NHẬP / ĐĂNG KÝ ====================

  // 1. Đăng nhập học sinh bằng Tài Khoản & Mật Khẩu riêng của bé
  const loginStudentWithAccount = (accountInput, passwordInput) => {
    const cleanAccount = accountInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanAccount) {
      throw new Error('Bé hãy nhập tên tài khoản hoặc mã học sinh nhé!');
    }
    if (!cleanPass) {
      throw new Error('Bé hãy nhập mật khẩu nhé!');
    }

    const studentUser = users.find(u => 
      u.role === 'student' && (
        (u.username && u.username.toLowerCase() === cleanAccount) ||
        (u.studentId && u.studentId.toLowerCase() === cleanAccount) ||
        (u.id && u.id.toLowerCase() === cleanAccount) ||
        (u.name && u.name.toLowerCase() === cleanAccount)
      )
    );

    if (!studentUser) {
      throw new Error('Không tìm thấy tài khoản học sinh này! Bé kiểm tra lại tên đăng nhập nhé.');
    }

    const expectedPass = studentUser.password || studentUser.pin || '123';
    if (cleanPass !== expectedPass) {
      throw new Error('Mật khẩu chưa đúng, bé thử lại lần nữa nhé!');
    }

    setCurrentUser(studentUser);
    setCurrentRole('student');
    setActiveStudentId(studentUser.studentId || studentUser.id);
    setSelectedGrade(studentUser.grade || 1);
    playKidSound('correct');
    return studentUser;
  };

  // 2. Phụ huynh đăng nhập qua Tên của con & ID tài khoản của con
  const loginParentByChild = (childName, childId) => {
    const cleanName = childName.trim().toLowerCase();
    const cleanId = childId.trim().toLowerCase();

    if (!cleanName || !cleanId) {
      throw new Error('Vui lòng nhập đầy đủ Tên của con và ID tài khoản của con!');
    }

    const matchedChild = users.find(u => {
      if (u.role !== 'student') return false;
      const idMatches = (u.studentId && u.studentId.toLowerCase() === cleanId) ||
                        (u.username && u.username.toLowerCase() === cleanId) ||
                        (u.id && u.id.toLowerCase() === cleanId);
      
      const nameMatches = u.name && (
        u.name.toLowerCase().includes(cleanName) ||
        cleanName.includes(u.name.toLowerCase())
      );

      return idMatches && nameMatches;
    });

    if (!matchedChild) {
      throw new Error('Không tìm thấy thông tin con! Vui lòng kiểm tra đúng Tên và ID tài khoản của bé.');
    }

    const parentProfile = {
      id: 'parent-' + matchedChild.id,
      name: `Phụ huynh ${matchedChild.name}`,
      role: 'parent',
      avatar: '👨‍👩‍👧',
      child: matchedChild,
      childStudentId: matchedChild.studentId || matchedChild.id
    };

    setCurrentUser(parentProfile);
    setCurrentRole('parent');
    setActiveStudentId(matchedChild.studentId || matchedChild.id);
    setSelectedGrade(matchedChild.grade || 1);
    playKidSound('correct');
    return parentProfile;
  };

  // Đăng nhập học sinh bằng PIN hoặc chọn Avatar (dự phòng)
  const loginStudent = (studentId, pinInput) => {
    const studentUser = users.find(u => u.studentId === studentId || u.id === studentId);
    if (!studentUser) {
      throw new Error('Không tìm thấy tài khoản học sinh này!');
    }

    if (studentUser.pin && pinInput && studentUser.pin !== pinInput) {
      throw new Error('Mã PIN không chính xác, bé thử lại nhé!');
    }

    setCurrentUser(studentUser);
    setCurrentRole('student');
    setActiveStudentId(studentUser.studentId || 's1');
    playKidSound('correct');
    return studentUser;
  };

  // Đăng nhập giáo viên bằng Email & Password
  const loginWithEmail = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Email này chưa được đăng ký trong hệ thống!');
    }

    if (user.password !== password) {
      throw new Error('Mật khẩu không chính xác. Vui lòng kiểm tra lại!');
    }

    setCurrentUser(user);
    setCurrentRole(user.role);
    playKidSound('correct');
    return user;
  };

  // Đăng ký tài khoản mới (Học sinh / Giáo viên)
  const registerUser = (userData) => {
    const { name, email, password, role, grade, avatar, pin, school, username } = userData;

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
        throw new Error('Email này đã tồn tại! Vui lòng chọn email khác hoặc Đăng nhập.');
      }
    }

    const newUserId = 'u-' + Date.now();
    let newStudentId = null;
    let generatedUsername = username ? username.trim().toLowerCase() : null;

    if (role === 'student') {
      newStudentId = 'HS' + Math.floor(100 + Math.random() * 900);
      if (!generatedUsername) {
        generatedUsername = 'hs_' + newStudentId.toLowerCase();
      }

      const newStudentProfile = {
        id: newStudentId,
        studentId: newStudentId,
        username: generatedUsername,
        password: password || '123',
        name: name || `Học sinh Lớp ${grade || 1}`,
        grade: Number(grade || 1),
        avatar: avatar || '🐱',
        pin: pin || password || '1234',
        stars: 50,
        streak: 1,
        todayMinutes: 0,
        dailyGoalMinutes: 20,
        pet: { name: 'Miu Miu', type: 'cat', level: 1, exp: 0, maxExp: 80 }
      };
      setStudents(prev => [...prev, newStudentProfile]);
    }

    const newUser = {
      id: newUserId,
      name: name || (role === 'student' ? `Học sinh Lớp ${grade || 1}` : 'Người dùng mới'),
      username: generatedUsername || undefined,
      email: email ? email.trim() : undefined,
      password: password || '123',
      role: role || 'student',
      grade: grade ? Number(grade) : undefined,
      avatar: avatar || (role === 'teacher' ? '👩‍🏫' : role === 'parent' ? '👨‍👩‍👧' : '🐱'),
      pin: pin || password || undefined,
      school: school || undefined,
      studentId: newStudentId || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
    if (newStudentId) setActiveStudentId(newStudentId);

    confetti({ particleCount: 90, spread: 70 });
    playKidSound('fanfare');
    return newUser;
  };

  // Đăng xuất
  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('student');
    localStorage.removeItem('vuihoc_current_user');
  };

  // Cập nhật đổi thông tin người dùng (dành cho Giáo viên / Cá nhân tự sửa)
  const updateUser = (userId, updatedFields) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedFields } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }
    // Tự động đồng bộ sang hồ sơ học sinh
    setStudents(prev => prev.map(s => {
      if (s.id === userId || s.studentId === userId || (updatedFields.studentId && s.studentId === updatedFields.studentId)) {
        return {
          ...s,
          name: updatedFields.name !== undefined ? updatedFields.name : s.name,
          grade: updatedFields.grade !== undefined ? Number(updatedFields.grade) : s.grade,
          avatar: updatedFields.avatar !== undefined ? updatedFields.avatar : s.avatar,
          username: updatedFields.username !== undefined ? updatedFields.username : s.username,
          password: updatedFields.password !== undefined ? updatedFields.password : s.password,
          studentId: updatedFields.studentId !== undefined ? updatedFields.studentId : s.studentId
        };
      }
      return s;
    }));
  };

  // Xóa tài khoản người dùng (dành cho Admin / Giáo viên)
  const deleteUser = (userId) => {
    if (currentUser?.id === userId) {
      throw new Error('Không thể xóa tài khoản bạn đang đăng nhập!');
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    setStudents(prev => prev.filter(s => s.id !== userId && s.studentId !== userId));
  };

  // Quản lý lớp học / trường học
  const addClass = (classData) => {
    const newClass = {
      id: 'c-' + Date.now(),
      studentCount: 0,
      assignedExams: [],
      teacherName: currentUser?.name || 'Giáo viên',
      ...classData
    };
    setClasses(prev => [newClass, ...prev]);
    return newClass;
  };

  const removeClass = (classId) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
  };

  // Tạo bài học mới trực tiếp
  const addNewLesson = (lessonData) => {
    const newLesson = {
      id: 'les-' + Date.now(),
      unlocked: true,
      completed: false,
      score: null,
      ...lessonData
    };
    setLessons(prev => [newLesson, ...prev]);
    return newLesson;
  };

  // ==================== CÁC TÍNH NĂNG HỌC TẬP ====================

  const addEnglishMedia = (mediaItem) => {
    const newItem = {
      id: 'em-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      uploader: currentUser?.name || 'Cô Giáo / Admin',
      ...mediaItem
    };
    setEnglishMediaList(prev => {
      const updated = [newItem, ...prev];
      localStorage.setItem('vuihoc_english_media', JSON.stringify(updated));
      return updated;
    });
    return newItem;
  };

  const removeEnglishMedia = (id) => {
    setEnglishMediaList(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem('vuihoc_english_media', JSON.stringify(updated));
      return updated;
    });
  };

  // Thưởng sao & tăng cấp thú cưng
  const rewardStars = (amount = 5) => {
    playKidSound('correct');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    setStudents(prev => prev.map(st => {
      if (st.id === activeStudentId) {
        const newStars = st.stars + amount;
        let pet = { ...st.pet };
        let newExp = pet.exp + amount * 2;
        let newLevel = pet.level;
        let maxExp = pet.maxExp;

        if (newExp >= maxExp) {
          newLevel += 1;
          newExp = newExp - maxExp;
          maxExp = Math.floor(maxExp * 1.3);
          playKidSound('fanfare');
        }

        return { ...st, stars: newStars, pet: { ...pet, level: newLevel, exp: newExp, maxExp } };
      }
      return st;
    }));
  };

  // Đổi thông tin bạn thú cưng (loài thú, tên thú cưng)
  const updatePet = (studentId, newPetData) => {
    setStudents(prev => {
      const exists = prev.some(st => st.id === studentId || st.studentId === studentId);
      if (!exists) {
        const guestOrNew = {
          id: studentId || 'guest',
          name: currentUser?.name || 'Bé Yêu',
          grade: selectedGrade || 1,
          avatar: newPetData.avatar || '🐱',
          stars: 10,
          streak: 1,
          todayMinutes: 0,
          dailyGoalMinutes: 20,
          pet: {
            name: newPetData.name || 'Miu Miu',
            type: newPetData.type || 'cat',
            level: 1,
            exp: 0,
            maxExp: 80
          }
        };
        return [...prev, guestOrNew];
      }
      return prev.map(st => {
        if (st.id === studentId || st.studentId === studentId) {
          return {
            ...st,
            pet: {
              ...(st.pet || {}),
              ...newPetData
            }
          };
        }
        return st;
      });
    });

    if (currentUser && currentUser.role === 'student') {
      setCurrentUser(prev => ({
        ...prev,
        pet: {
          ...(prev?.pet || {}),
          ...newPetData
        }
      }));
    }
  };

  const addToErrorNotebook = (errorItem) => {
    const newItem = {
      id: 'err-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      reviewed: false,
      ...errorItem
    };
    setErrorNotebook(prev => [newItem, ...prev]);
  };

  const markErrorReviewed = (id) => {
    setErrorNotebook(prev => prev.map(item => item.id === id ? { ...item, reviewed: true } : item));
    rewardStars(3);
  };

  const completeLesson = (lessonId, score = 10) => {
    setLessons(prev => {
      const idx = prev.findIndex(l => l.id === lessonId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], completed: true, score };
      if (idx + 1 < updated.length && updated[idx + 1].subjectId === updated[idx].subjectId) {
        updated[idx + 1] = { ...updated[idx + 1], unlocked: true };
      }
      return updated;
    });
    rewardStars(10);
  };

  // Thêm môn học mới do giáo viên thiết lập
  const addCustomSubject = (subjectData) => {
    const id = 'subj-' + Date.now();
    const newSubj = {
      id,
      name: subjectData.name,
      icon: subjectData.icon || '📘',
      color: subjectData.color || 'from-teal-400 to-emerald-500',
      bgBadge: subjectData.bgBadge || 'bg-teal-100 text-teal-800',
      grades: subjectData.grades || [1, 2, 3, 4, 5],
      isCustom: true
    };
    setCustomSubjects(prev => [...prev, newSubj]);
    return newSubj;
  };

  const removeCustomSubject = (subjId) => {
    setCustomSubjects(prev => prev.filter(s => s.id !== subjId));
  };

  // Ghi nhận kết quả làm bài thi của học sinh để phụ huynh theo dõi
  const recordExamResult = (resultData) => {
    const newResult = {
      id: 'res-' + Date.now(),
      submittedAt: new Date().toISOString(),
      studentId: resultData.studentId || activeStudentId || currentStudent?.id || 's1',
      studentName: resultData.studentName || currentStudent?.name || 'Học sinh',
      ...resultData
    };
    setExamResults(prev => [newResult, ...prev]);
    return newResult;
  };

  // Quản lý đề thi Học Vui 2.0
  const addNewExam = (newExam) => {
    const examId = newExam.id || 'exam-' + Date.now();
    const examItem = {
      id: examId,
      title: newExam.title,
      grade: Number(newExam.grade),
      subjectId: newExam.subjectId,
      examType: newExam.examType || 'practice', // 'practice' | 'test' | 'review'
      status: newExam.status || 'published', // 'published' | 'draft' | 'hidden'
      durationMinutes: typeof newExam.durationMinutes === 'number' ? newExam.durationMinutes : 20,
      totalQuestions: newExam.questions?.length || 0,
      maxScore: 10,
      creatorName: newExam.creatorName || currentUser?.name || 'Giáo viên',
      hasAudio: !!newExam.hasAudio,
      originalFile: newExam.originalFile || null, // { name, size, type, uploadedAt }
      tags: newExam.tags || [],
      questions: newExam.questions || [],
      createdAt: newExam.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setExams(prev => [examItem, ...prev.filter(e => e.id !== examId)]);

    // Nếu đề thi ở trạng thái Đã Xuất Bản ('published'), đồng bộ sang danh sách bài học môn đó
    if (examItem.status === 'published') {
      const unitLabel = examItem.examType === 'test'
        ? 'BÀI KIỂM TRA ĐỊNH KỲ'
        : examItem.examType === 'review'
        ? 'ĐỀ ÔN TẬP TỔNG HỢP'
        : 'ĐỀ THI & LUYỆN TẬP';

      const newLessonFromExam = {
        id: 'lesson-' + examItem.id,
        examId: examItem.id,
        subjectId: examItem.subjectId,
        grade: Number(examItem.grade),
        unit: unitLabel,
        title: examItem.title,
        examType: examItem.examType,
        unlocked: true,
        completed: false,
        isExam: true,
        durationMinutes: examItem.durationMinutes,
        theory: `Đề thi môn ${examItem.subjectId} - Lớp ${examItem.grade}.\nLoại đề: ${examItem.examType === 'test' ? 'Kiểm tra' : examItem.examType === 'review' ? 'Ôn tập' : 'Luyện tập'}.\nThời gian: ${examItem.durationMinutes || 'Tự do'} phút.\nTổng số: ${examItem.questions?.length || 0} câu hỏi.`,
        exercises: (examItem.questions || []).map((q, idx) => ({
          id: q.id || `q-ex-${idx}`,
          type: q.type || 'multiple-choice',
          section: q.section,
          question: q.question,
          image: q.image,
          imageSize: q.imageSize,
          options: q.options || [],
          answer: q.answer,
          subQuestions: q.subQuestions,
          points: q.points || 2,
          explanation: q.explanation || 'Đáp án chính xác.',
          audioText: q.audioText
        }))
      };
      setLessons(prev => [newLessonFromExam, ...prev.filter(l => l.examId !== examItem.id)]);
    } else {
      // Nếu là Bản nháp hoặc Ẩn, gỡ khỏi bài học học sinh
      setLessons(prev => prev.filter(l => l.examId !== examItem.id));
    }

    return examItem;
  };

  const updateExam = (examId, patch) => {
    let updatedObj = null;
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        updatedObj = { ...e, ...patch, updatedAt: new Date().toISOString() };
        return updatedObj;
      }
      return e;
    }));

    if (updatedObj) {
      if (updatedObj.status === 'published') {
        const unitLabel = updatedObj.examType === 'test'
          ? 'BÀI KIỂM TRA ĐỊNH KỲ'
          : updatedObj.examType === 'review'
          ? 'ĐỀ ÔN TẬP TỔNG HỢP'
          : 'ĐỀ THI & LUYỆN TẬP';

        setLessons(prev => {
          const filtered = prev.filter(l => l.examId !== examId);
          return [{
            id: 'lesson-' + updatedObj.id,
            examId: updatedObj.id,
            subjectId: updatedObj.subjectId,
            grade: Number(updatedObj.grade),
            unit: unitLabel,
            title: updatedObj.title,
            examType: updatedObj.examType,
            unlocked: true,
            completed: false,
            isExam: true,
            durationMinutes: updatedObj.durationMinutes,
            theory: `Đề thi môn ${updatedObj.subjectId} - Lớp ${updatedObj.grade}.\nThời gian: ${updatedObj.durationMinutes || 'Tự do'} phút.`,
            exercises: (updatedObj.questions || []).map((q, idx) => ({
              id: q.id || `q-ex-${idx}`,
              type: q.type || 'multiple-choice',
              section: q.section,
              question: q.question,
              image: q.image,
              imageSize: q.imageSize,
              options: q.options || [],
              answer: q.answer,
              subQuestions: q.subQuestions,
              points: q.points || 2,
              explanation: q.explanation || 'Đáp án chính xác.',
              audioText: q.audioText
            }))
          }, ...filtered];
        });
      } else {
        setLessons(prev => prev.filter(l => l.examId !== examId));
      }
    }
  };

  const deleteExam = (examId) => {
    setExams(prev => prev.filter(e => e.id !== examId));
    setLessons(prev => prev.filter(l => l.examId !== examId && l.id !== 'lesson-' + examId));
  };

  const duplicateExam = (examId, targetGrade, targetSubjectId) => {
    const src = exams.find(e => e.id === examId);
    if (!src) return null;
    const finalGrade = targetGrade ? Number(targetGrade) : src.grade;
    const finalSubject = targetSubjectId || src.subjectId;
    const copyObj = {
      ...src,
      id: 'exam-' + Date.now(),
      title: `${src.title} (Bản sao Lớp ${finalGrade})`,
      grade: finalGrade,
      subjectId: finalSubject,
      status: 'draft', // mặc định là bản nháp để giáo viên kiểm tra trước khi công khai
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addNewExam(copyObj);
    return copyObj;
  };

  const toggleExamStatus = (examId, newStatus) => {
    updateExam(examId, { status: newStatus });
  };

  const switchStudent = (studentId) => {
    setActiveStudentId(studentId);
    setCurrentRole('student');
    const matchingUser = users.find(u => u.studentId === studentId);
    if (matchingUser) setCurrentUser(matchingUser);
  };

  return (
    <AppContext.Provider value={{
      users,
      currentUser,
      currentRole,
      setCurrentRole,
      loginStudent,
      loginStudentWithAccount,
      loginParentByChild,
      loginWithEmail,
      registerUser,
      logout,
      updateUser,
      deleteUser,
      activeStudentId,
      currentStudent,
      students,
      setStudents,
      switchStudent,
      selectedGrade,
      setSelectedGrade,
      lessons,
      setLessons,
      addNewLesson,
      completeLesson,
      exams,
      addNewExam,
      updateExam,
      deleteExam,
      duplicateExam,
      toggleExamStatus,
      customSubjects,
      addCustomSubject,
      removeCustomSubject,
      allSubjects: [...SUBJECTS_CONFIG, ...customSubjects],
      examResults,
      recordExamResult,
      classes,
      setClasses,
      addClass,
      removeClass,
      errorNotebook,
      addToErrorNotebook,
      markErrorReviewed,
      badges,
      rewardStars,
      updatePet,
      englishMediaList,
      addEnglishMedia,
      removeEnglishMedia
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
