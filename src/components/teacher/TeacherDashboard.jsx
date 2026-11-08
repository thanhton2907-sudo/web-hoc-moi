import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GraduationCap, 
  Users, 
  PlusCircle, 
  FileUp, 
  CheckSquare, 
  Download, 
  Trash2, 
  Headphones, 
  Sparkles,
  BookOpen,
  Loader2,
  AlertTriangle,
  Video,
  Music,
  Play,
  Pause,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Film,
  Eye,
  Copy,
  Image as ImageIcon,
  Maximize2,
  X,
  RefreshCw,
  Layers,
  Clock,
  ShieldCheck,
  Tag,
  Filter,
  Check,
  FolderPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseExamText } from '../../utils/examParser';
import { splitMultiItemQuestion } from '../../utils/multiItemSplitter';
import { MultiItemQuestion } from '../common/MultiItemQuestion';
import { extractTextFromFile, readImageAsDataUrl } from '../../utils/docExtract';

const SUPPORTED_ACCEPT = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,.bmp';

export const TeacherDashboard = () => {
  const { 
    classes, 
    addClass, 
    removeClass, 
    exams, 
    addNewExam, 
    updateExam,
    deleteExam,
    duplicateExam,
    toggleExamStatus,
    allSubjects,
    addCustomSubject,
    students, 
    englishMediaList, 
    addEnglishMedia, 
    removeEnglishMedia,
    currentUser
  } = useApp();

  // Active navigation tab in Teacher Dashboard
  const [activeTab, setActiveTab] = useState('manage-exams'); // 'manage-exams' | 'create-exam' | 'classes' | 'upload-media'
  
  // Filters for Exam Management Tab
  const [mgmtGrade, setMgmtGrade] = useState('all');
  const [mgmtSubject, setMgmtSubject] = useState('all');
  const [mgmtType, setMgmtType] = useState('all'); // 'all' | 'practice' | 'test' | 'review'
  const [mgmtStatus, setMgmtStatus] = useState('all'); // 'all' | 'published' | 'draft' | 'hidden'

  // Modals state
  const [previewExam, setPreviewExam] = useState(null);
  const [duplicateTarget, setDuplicateTarget] = useState(null); // exam to duplicate
  const [targetGrade, setTargetGrade] = useState(1);
  const [targetSubject, setTargetSubject] = useState('math');
  const [deleteConfirmExam, setDeleteConfirmExam] = useState(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectData, setNewSubjectData] = useState({
    name: '',
    icon: '🔬',
    color: 'from-emerald-400 to-teal-500',
    grades: [1, 2, 3, 4, 5]
  });

  // State for Add Class
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassData, setNewClassData] = useState({
    name: '',
    grade: 1,
    teacherName: currentUser?.name || 'Cô Hoàng Mai',
    studentCount: 30
  });

  // State for Create / Edit Exam Form
  const [editingExamId, setEditingExamId] = useState(null);
  const [examTitle, setExamTitle] = useState('');
  const [examGrade, setExamGrade] = useState(1);
  const [examSubject, setExamSubject] = useState('math');
  const [examType, setExamType] = useState('practice'); // 'practice' | 'test' | 'review'
  const [examDuration, setExamDuration] = useState(20);
  const [examStatus, setExamStatus] = useState('published'); // 'published' | 'draft'
  const [originalFileInfo, setOriginalFileInfo] = useState(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioScript, setAudioScript] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: 'q-new-1',
      type: 'multiple-choice',
      section: 'choice',
      question: 'Phép tính nào sau đây có kết quả bằng 10?',
      options: ['5 + 5', '4 + 5', '6 + 3', '2 + 7'],
      answer: '5 + 5',
      points: 2.5,
      explanation: '5 cộng 5 bằng 10.'
    }
  ]);

  // Trạng thái đọc tài liệu tự động (PDF, Word, OCR)
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [importError, setImportError] = useState('');
  const [importWarnings, setImportWarnings] = useState([]);
  const [rawText, setRawText] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  // State cho Tải Lên Bài Nghe / Video Tiếng Anh
  const [mediaSourceType, setMediaSourceType] = useState('github'); // 'github' | 'youtube' | 'file'
  const [mediaType, setMediaType] = useState('video'); // 'video' | 'audio'
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaGrade, setMediaGrade] = useState(1);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  const [mediaFileName, setMediaFileName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [githubVideoUrl, setGithubVideoUrl] = useState('');
  const [mediaTranscript, setMediaTranscript] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // 1. Quản lý Lớp Học
  const handleCreateClass = (e) => {
    e.preventDefault();
    if (!newClassData.name.trim()) return;
    addClass({
      name: newClassData.name.trim(),
      grade: Number(newClassData.grade),
      teacherName: newClassData.teacherName.trim() || 'Giáo viên',
      studentCount: Number(newClassData.studentCount) || 0
    });
    setNewClassData({ name: '', grade: 1, teacherName: currentUser?.name || 'Cô Hoàng Mai', studentCount: 30 });
    setIsAddClassOpen(false);
    confetti({ particleCount: 60, spread: 50 });
  };

  // 2. Thêm môn học mới
  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!newSubjectData.name.trim()) return;
    addCustomSubject(newSubjectData);
    setNewSubjectData({ name: '', icon: '🔬', color: 'from-emerald-400 to-teal-500', grades: [1, 2, 3, 4, 5] });
    setIsAddSubjectOpen(false);
    confetti({ particleCount: 70, spread: 60 });
  };

  // 3. Tải file đề thi (Word / PDF / Ảnh)
  const handleImportFile = async (file) => {
    if (!file) return;

    // Validate kích thước tệp (tối đa 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setImportError('Dung lượng tệp vượt quá 15MB. Vui lòng chọn tệp nhỏ hơn 15MB!');
      return;
    }

    setImportError('');
    setImportWarnings([]);
    setIsImporting(true);
    setImportStatus('Đang đọc tài liệu & bóc tách nội dung, hình ảnh...');

    try {
      const text = await extractTextFromFile(file, setImportStatus);
      setRawText(text);

      const result = parseExamText(text);
      setImportWarnings(result.warnings || []);

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        if (result.questions.some(q => q.audioText)) setHasAudio(true);
      }

      const defaultTitle = file.name.replace(/\.[^/.]+$/, '');
      setExamTitle(result.title || defaultTitle || examTitle);
      if (result.meta?.grade) setExamGrade(result.meta.grade);
      if (result.meta?.subjectId) setExamSubject(result.meta.subjectId);

      setOriginalFileInfo({
        name: file.name,
        size: Math.round(file.size / 1024) + ' KB',
        type: file.type || file.name.split('.').pop().toUpperCase(),
        uploadedAt: new Date().toISOString()
      });

      setImportStatus(
        result.questions?.length
          ? `✓ Đã nhận dạng ${result.questions.length} câu hỏi kèm hình ảnh (nếu có). Quý Thầy Cô hãy kiểm tra bên dưới trước khi lưu.`
          : 'Đọc được văn bản nhưng chưa phân tách được câu hỏi. Mời mở "Văn bản đã đọc" để xem và bấm Tách lại.'
      );

      if (!result.questions?.length) setShowRaw(true);
    } catch (err) {
      console.error(err);
      setImportError(err.message || 'Không thể trích xuất nội dung từ tệp này.');
      setImportStatus('');
    } finally {
      setIsImporting(false);
    }
  };

  // 4. Quản lý câu hỏi trong đề thi
  const updateQuestion = (id, patch) =>
    setQuestions(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));

  const changeQuestionType = (q, type) => {
    const isChoice = type === 'multiple-choice' || type === 'listen-choice';
    const options = isChoice ? (q.options?.length >= 2 ? q.options : ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D']) : undefined;
    updateQuestion(q.id, { 
      type, 
      options, 
      answer: isChoice ? (options.includes(q.answer) ? q.answer : '') : q.answer || '' 
    });
  };

  const handleAddQuestion = (targetSection = 'choice') => {
    setQuestions(prev => [
      ...prev,
      {
        id: 'q-new-' + (prev.length + 1),
        type: targetSection === 'essay' ? 'fill-in' : 'multiple-choice',
        section: targetSection,
        question: targetSection === 'essay' ? 'Tính nhẩm các phép tính sau:' : ('Câu hỏi số ' + (prev.length + 1)),
        options: targetSection === 'essay' ? [] : ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
        answer: targetSection === 'essay' ? '' : 'Lựa chọn A',
        points: 2.0,
        explanation: 'Lời giải chi tiết cho học sinh.'
      }
    ]);
  };

  // Upload ảnh đính kèm cho từng câu hỏi
  const handleQuestionImageUpload = async (qId, file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 15MB!');
      return;
    }
    try {
      const dataUrl = await readImageAsDataUrl(file);
      updateQuestion(qId, { image: dataUrl, imageSize: 'medium' });
    } catch (err) {
      alert('Lỗi tải ảnh: ' + err.message);
    }
  };

  const handleQuestionImagePrompt = (qId) => {
    const url = prompt('Dán đường link hình ảnh (URL):');
    if (url && url.trim()) {
      updateQuestion(qId, { image: url.trim(), imageSize: 'medium' });
    }
  };

  const handleRemoveQuestionImage = (qId) => {
    updateQuestion(qId, { image: undefined, imageSize: undefined });
  };

  // Tự động tách câu hỏi thành các ý nhỏ
  const handleAutoSplitQuestion = (qId) => {
    const q = questions.find(item => item.id === qId);
    if (!q) return;
    const splitRes = splitMultiItemQuestion(q.question, q.points);
    if (splitRes && splitRes.items.length >= 2) {
      updateQuestion(qId, {
        question: splitRes.title,
        subQuestions: splitRes.items,
        type: 'fill-in',
        section: 'essay',
        answer: splitRes.items.map(it => it.answer).join(', ')
      });
      confetti({ particleCount: 50, spread: 50 });
    }
  };

  const handleAddSubItem = (qId) => {
    const q = questions.find(item => item.id === qId);
    if (!q) return;
    const currentSubs = q.subQuestions || [];
    const newSub = {
      id: `sub-${Date.now()}`,
      label: String(currentSubs.length + 1),
      prompt: 'Phép tính mới =',
      answer: '',
      points: Math.round(((q.points || 2) / (currentSubs.length + 1)) * 100) / 100,
      explanation: ''
    };
    updateQuestion(qId, {
      subQuestions: [...currentSubs, newSub]
    });
  };

  const handleUpdateSubItem = (qId, subId, fields) => {
    const q = questions.find(item => item.id === qId);
    if (!q || !q.subQuestions) return;
    const updatedSubs = q.subQuestions.map(s => s.id === subId ? { ...s, ...fields } : s);
    updateQuestion(qId, {
      subQuestions: updatedSubs,
      answer: updatedSubs.map(s => s.answer).filter(Boolean).join(', ')
    });
  };

  const handleRemoveSubItem = (qId, subId) => {
    const q = questions.find(item => item.id === qId);
    if (!q || !q.subQuestions) return;
    const updatedSubs = q.subQuestions.filter(s => s.id !== subId);
    updateQuestion(qId, {
      subQuestions: updatedSubs.length > 0 ? updatedSubs : undefined,
      answer: updatedSubs.map(s => s.answer).filter(Boolean).join(', ')
    });
  };

  const handleMergeSubItems = (qId) => {
    const q = questions.find(item => item.id === qId);
    if (!q || !q.subQuestions) return;
    const originalText = `${q.question} ${q.subQuestions.map(s => `${s.prompt} .....`).join(' ')}`;
    updateQuestion(qId, {
      question: originalText,
      subQuestions: undefined
    });
  };

  // 5. Lưu hoặc Xuất bản đề thi
  const handleSaveExam = (e, forcedStatus = null) => {
    if (e) e.preventDefault();

    if (!examTitle.trim()) {
      alert('Vui lòng nhập tên đề thi!');
      return;
    }

    const finalStatus = forcedStatus || examStatus;

    if (finalStatus === 'published') {
      const problems = questions
        .map((q, i) => {
          const isChoice = q.type === 'multiple-choice' || q.type === 'listen-choice';
          if (!q.question.trim()) return `Câu ${i + 1}: chưa có nội dung.`;
          if (isChoice && !(q.options || []).includes(q.answer)) return `Câu ${i + 1}: chưa chọn đáp án đúng.`;
          if (q.subQuestions && q.subQuestions.length > 0) {
            const hasEmpty = q.subQuestions.some(s => !String(s.answer).trim());
            if (hasEmpty) return `Câu ${i + 1}: có ý nhỏ chưa điền đáp án đúng.`;
          } else if ((q.type === 'fill-in' || q.type === 'listen-dictation') && !String(q.answer).trim()) {
            return `Câu ${i + 1}: chưa có đáp án.`;
          }
          return null;
        })
        .filter(Boolean);

      if (problems.length) {
        alert('Vui lòng hoàn thiện các câu sau trước khi xuất bản:\n' + problems.join('\n'));
        return;
      }
    }

    const examData = {
      title: examTitle.trim(),
      grade: Number(examGrade),
      subjectId: examSubject,
      examType: examType,
      status: finalStatus,
      durationMinutes: Number(examDuration),
      creatorName: currentUser?.name || 'Giáo viên',
      hasAudio: hasAudio,
      originalFile: originalFileInfo,
      tags: [
        examType === 'test' ? 'Kiểm tra' : examType === 'review' ? 'Ôn tập' : 'Luyện tập',
        `Lớp ${examGrade}`,
        examSubject
      ],
      questions: questions.map(q => ({
        ...q,
        audioText: q.audioText || (hasAudio ? (audioScript || q.question) : undefined)
      }))
    };

    if (editingExamId) {
      updateExam(editingExamId, examData);
      alert('✓ Đã cập nhật đề thi thành công!');
    } else {
      addNewExam(examData);
      alert(finalStatus === 'published' ? '🎉 Đề thi đã được xuất bản cho học sinh làm bài!' : '💾 Đã lưu bản nháp đề thi thành công!');
    }

    confetti({ particleCount: 70, spread: 60 });
    resetExamForm();
    setActiveTab('manage-exams');
  };

  const resetExamForm = () => {
    setEditingExamId(null);
    setExamTitle('');
    setExamGrade(1);
    setExamSubject('math');
    setExamType('practice');
    setExamDuration(20);
    setExamStatus('published');
    setOriginalFileInfo(null);
    setHasAudio(false);
    setAudioScript('');
    setRawText('');
    setShowRaw(false);
    setImportStatus('');
    setImportError('');
    setImportWarnings([]);
    setQuestions([
      {
        id: 'q-new-1',
        type: 'multiple-choice',
        section: 'choice',
        question: 'Phép tính nào sau đây có kết quả bằng 10?',
        options: ['5 + 5', '4 + 5', '6 + 3', '2 + 7'],
        answer: '5 + 5',
        points: 2.5,
        explanation: '5 cộng 5 bằng 10.'
      }
    ]);
  };

  const handleEditExam = (exam) => {
    setEditingExamId(exam.id);
    setExamTitle(exam.title);
    setExamGrade(exam.grade);
    setExamSubject(exam.subjectId);
    setExamType(exam.examType || 'practice');
    setExamDuration(exam.durationMinutes || 20);
    setExamStatus(exam.status || 'published');
    setOriginalFileInfo(exam.originalFile || null);
    setHasAudio(!!exam.hasAudio);
    setAudioScript(exam.audioScript || '');
    setQuestions(exam.questions || []);
    setActiveTab('create-exam');
  };

  const handleDuplicateConfirm = () => {
    if (!duplicateTarget) return;
    duplicateExam(duplicateTarget.id, targetGrade, targetSubject);
    setDuplicateTarget(null);
    alert('✓ Đã sao chép đề thi sang lớp/môn mới dưới dạng bản nháp!');
  };

  // Lọc danh sách đề thi trong Quản Lý Đề Thi
  const filteredMgmtExams = (exams || []).filter(e => {
    const matchGrade = mgmtGrade === 'all' || Number(e.grade) === Number(mgmtGrade);
    const matchSubject = mgmtSubject === 'all' || e.subjectId === mgmtSubject;
    const matchType = mgmtType === 'all' || e.examType === mgmtType;
    const matchStatus = mgmtStatus === 'all' || e.status === mgmtStatus;
    return matchGrade && matchSubject && matchType && matchStatus;
  });

  // Tải lên media tiếng Anh
  const handleMediaFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreviewUrl(url);
    setMediaFileName(file.name);
    if (!mediaTitle) {
      setMediaTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Chuẩn hóa link video GitHub (tự động đổi blob thành raw nếu cần)
  const normalizeGithubVideo = (rawUrl = '') => {
    let url = (rawUrl || '').trim();
    if (!url) return '';
    const blobMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
    if (blobMatch) {
      return `https://raw.githubusercontent.com/${blobMatch[1]}/${blobMatch[2]}/${blobMatch[3]}/${blobMatch[4]}`;
    }
    return url;
  };

  const handleSaveMedia = (e) => {
    e.preventDefault();
    if (!mediaTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài nghe hoặc video!');
      return;
    }
    let finalUrl = '';
    let isEmbed = false;
    let finalType = mediaType;

    if (mediaSourceType === 'github') {
      if (!githubVideoUrl.trim()) {
        alert('Vui lòng nhập đường link Video GitHub của bạn!');
        return;
      }
      finalUrl = normalizeGithubVideo(githubVideoUrl);
      isEmbed = false;
      finalType = 'video';
    } else if (mediaSourceType === 'youtube') {
      if (!youtubeUrl.trim()) {
        alert('Vui lòng nhập đường link YouTube!');
        return;
      }
      finalUrl = youtubeUrl.includes('embed') ? youtubeUrl : youtubeUrl.replace('watch?v=', 'embed/');
      isEmbed = true;
      finalType = 'video';
    } else {
      if (!mediaPreviewUrl) {
        alert('Vui lòng chọn một tệp MP3 hoặc MP4 từ máy tính!');
        return;
      }
      finalUrl = mediaPreviewUrl;
      isEmbed = false;
    }

    addEnglishMedia({
      title: mediaTitle.trim(),
      type: finalType,
      grade: Number(mediaGrade),
      mediaUrl: finalUrl,
      isEmbed,
      fileName: mediaFileName || (mediaSourceType === 'github' ? 'GitHub Video' : mediaSourceType === 'youtube' ? 'YouTube' : 'media_file'),
      transcript: mediaTranscript
    });
    confetti({ particleCount: 70, spread: 60 });
    setUploadSuccessMsg(`Tải lên thành công: ${mediaTitle}`);
    setMediaTitle('');
    setMediaPreviewUrl('');
    setYoutubeUrl('');
    setGithubVideoUrl('');
    setMediaTranscript('');
  };

  const subjectsList = allSubjects || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* Banner Giáo Viên */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-teal-400">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-inner border-2 border-white/40">
              👩‍🏫
            </div>
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-block">
                Hệ Thống Quản Lý Giáo Dục Học Vui 2.0
              </span>
              <h2 className="text-2xl md:text-4xl font-black font-display mt-1">
                Bàn Làm Việc Của Giáo Viên
              </h2>
              <p className="text-teal-100 text-xs md:text-sm font-semibold">
                Quản lý đề thi theo lớp & môn học, upload tài liệu PDF/Word/Ảnh và theo dõi học sinh!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { resetExamForm(); setActiveTab('create-exam'); }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs md:text-sm rounded-2xl shadow-md btn-kid flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Upload / Soạn Đề Mới</span>
            </button>
            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-2xl border border-white/30 flex items-center space-x-1"
              title="Thêm môn học mới cho các khối lớp"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Môn Mới</span>
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-white/20 overflow-x-auto">
          <button
            onClick={() => setActiveTab('manage-exams')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'manage-exams' ? 'bg-white text-teal-900 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <FileUp className="w-4 h-4 text-teal-700" />
            <span>Quản Lý Đề Thi ({(exams || []).length})</span>
          </button>

          <button
            onClick={() => { resetExamForm(); setActiveTab('create-exam'); }}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'create-exam' ? 'bg-white text-teal-900 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>{editingExamId ? 'Chỉnh Sửa Đề Thi' : 'Soạn & Upload Đề Mới'}</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'classes' ? 'bg-white text-teal-900 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>Danh Sách Lớp & Học Sinh ({(classes || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload-media')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'upload-media' ? 'bg-white text-teal-900 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Video className="w-4 h-4 text-amber-300" />
            <span>Bài Nghe & Video Tiếng Anh</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: QUẢN LÝ ĐỀ THI ================= */}
      {activeTab === 'manage-exams' && (
        <div className="space-y-5 animate-fade-in">
          {/* Bộ lọc đề thi */}
          <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-700">
                <Filter className="w-4 h-4 text-teal-600" />
                <span>Bộ Lọc Phân Loại Đề Thi:</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Hiển thị {filteredMgmtExams.length} / {(exams || []).length} đề thi
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Lọc Khối Lớp */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1">Khối Lớp:</label>
                <select
                  value={mgmtGrade}
                  onChange={(e) => setMgmtGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="all">Tất cả các lớp (1 - 5)</option>
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Khối Lớp {g}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Môn Học */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1">Môn Học:</label>
                <select
                  value={mgmtSubject}
                  onChange={(e) => setMgmtSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="all">Tất cả các môn</option>
                  {subjectsList.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Loại Đề */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1">Loại Đề:</label>
                <select
                  value={mgmtType}
                  onChange={(e) => setMgmtType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="all">Tất cả các loại</option>
                  <option value="practice">📝 Luyện tập</option>
                  <option value="test">⏱️ Kiểm tra</option>
                  <option value="review">⭐ Ôn tập</option>
                </select>
              </div>

              {/* Lọc Trạng Thái */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1">Trạng Thái:</label>
                <select
                  value={mgmtStatus}
                  onChange={(e) => setMgmtStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="published">🟢 Đã xuất bản (Học sinh thấy)</option>
                  <option value="draft">🟡 Bản nháp</option>
                  <option value="hidden">⚪ Đã ẩn</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid danh sách đề thi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMgmtExams.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-4xl border-3 border-dashed border-slate-200">
                <span className="text-4xl block mb-2">📁</span>
                <h4 className="font-black text-slate-800 text-lg">Chưa có đề thi nào phù hợp bộ lọc</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Quý Thầy Cô hãy bấm nút <strong>Upload / Soạn Đề Mới</strong> ở trên để tạo đề kiểm tra hoặc luyện tập cho các em!
                </p>
              </div>
            ) : (
              filteredMgmtExams.map(exam => {
                const subj = subjectsList.find(s => s.id === exam.subjectId);
                const isPublished = exam.status === 'published';
                const isDraft = exam.status === 'draft';

                return (
                  <div
                    key={exam.id}
                    className="p-5 bg-white rounded-3xl border-2 border-slate-200 hover:border-teal-400 shadow-xs transition flex flex-col justify-between cartoon-card"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border">
                            Lớp {exam.grade}
                          </span>
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                            {subj ? `${subj.icon} ${subj.name}` : exam.subjectId}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {exam.examType === 'test' ? '⏱️ Kiểm tra' : exam.examType === 'review' ? '⭐ Ôn tập' : '📝 Luyện tập'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isDraft
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 border'
                        }`}>
                          <span>{isPublished ? '● Xuất bản' : isDraft ? '● Bản nháp' : '○ Đã ẩn'}</span>
                        </span>
                      </div>

                      <h4 className="font-black text-slate-900 text-base mb-1.5 line-clamp-2">
                        {exam.title}
                      </h4>

                      <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 mb-2 flex-wrap">
                        <span>⏱️ {exam.durationMinutes || 'Tự do'} phút</span>
                        <span>•</span>
                        <span>📋 {exam.questions?.length || 0} câu</span>
                        <span>•</span>
                        <span>Tác giả: {exam.creatorName || 'Giáo viên'}</span>
                      </div>

                      {exam.originalFile && (
                        <div className="text-[10px] text-teal-700 bg-teal-50 px-2 py-1 rounded-lg mb-3 truncate flex items-center space-x-1">
                          <FileUp className="w-3 h-3 shrink-0" />
                          <span className="truncate">Tệp gốc: {exam.originalFile.name} ({exam.originalFile.size})</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Toolbar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center space-x-1">
                        {/* Xem trước */}
                        <button
                          onClick={() => setPreviewExam(exam)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 transition"
                          title="Xem trước giao diện học sinh"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Xem</span>
                        </button>

                        {/* Chỉnh sửa */}
                        <button
                          onClick={() => handleEditExam(exam)}
                          className="px-2.5 py-1 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-lg text-xs font-bold flex items-center space-x-1 transition"
                          title="Chỉnh sửa câu hỏi, đáp án, điểm số"
                        >
                          <span>Sửa</span>
                        </button>

                        {/* Sao chép sang lớp/môn khác */}
                        <button
                          onClick={() => {
                            setDuplicateTarget(exam);
                            setTargetGrade(exam.grade);
                            setTargetSubject(exam.subjectId);
                          }}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center space-x-1 transition"
                          title="Sao chép và chuyển sang lớp hoặc môn khác"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Chuyển</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        {/* Đổi trạng thái nhanh */}
                        <button
                          onClick={() => toggleExamStatus(exam.id, isPublished ? 'hidden' : 'published')}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                            isPublished
                              ? 'text-slate-600 hover:bg-slate-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
                          }`}
                          title={isPublished ? 'Ẩn đề khỏi học sinh' : 'Xuất bản đề cho học sinh'}
                        >
                          {isPublished ? 'Ẩn' : 'Xuất bản'}
                        </button>

                        {/* Xóa đề */}
                        <button
                          onClick={() => setDeleteConfirmExam(exam)}
                          className="p-1 hover:bg-rose-100 text-rose-500 rounded-lg transition"
                          title="Xóa đề thi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: SOẠN & UPLOAD ĐỀ THI MỚI ================= */}
      {activeTab === 'create-exam' && (
        <form onSubmit={handleSaveExam} className="bg-white rounded-4xl p-6 md:p-8 border-3 border-teal-200 shadow-sm cartoon-card space-y-6 animate-fade-in">
          {/* Header Form */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-2">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 font-display flex items-center gap-2">
                <span>{editingExamId ? '✏️ Chỉnh Sửa Đề Thi' : '✨ Soạn Thảo & Tải Đề Thi Mới'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload tệp PDF / Word (.docx) / Ảnh chụp hoặc tạo câu hỏi trực tiếp kèm hình minh họa
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleSaveExam(null, 'draft')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition"
              >
                💾 Lưu Bản Nháp
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-md btn-kid"
              >
                🚀 Xuất Bản Đề Thi
              </button>
            </div>
          </div>

          {/* VÙNG TẢI FILE TÀI LIỆU (PDF, Word, Ảnh) */}
          <div className="p-5 bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-dashed border-sky-300 rounded-3xl text-center">
            {isImporting ? (
              <Loader2 className="w-10 h-10 text-sky-600 mx-auto mb-2 animate-spin" />
            ) : (
              <FileUp className="w-10 h-10 text-sky-600 mx-auto mb-2 animate-bounce-soft" />
            )}
            <h4 className="font-black text-slate-800 text-base">
              Upload Tệp Đề Thi Có Sẵn (File PDF, Word .docx, hoặc Ảnh scan/chụp)
            </h4>
            <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1 mb-3">
              Hệ thống tự động đọc đề bài, bóc tách hình ảnh minh họa, nhận diện phân mục Trắc nghiệm / Tự luận và tự động tách các câu hỏi nhiều phép tính!
            </p>

            <input
              type="file"
              id="file-upload-input"
              accept={SUPPORTED_ACCEPT}
              className="hidden"
              disabled={isImporting}
              onChange={(e) => {
                handleImportFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <label
              htmlFor="file-upload-input"
              className={`inline-flex items-center space-x-2 px-6 py-2.5 text-white font-black text-xs rounded-2xl shadow-sm transition ${
                isImporting ? 'bg-slate-400 cursor-wait' : 'cursor-pointer bg-sky-500 hover:bg-sky-600 active:scale-98'
              }`}
            >
              <span>{isImporting ? 'Đang trích xuất nội dung...' : '📁 Chọn tệp PDF / Word / Ảnh (< 15MB)'}</span>
            </label>

            {importStatus && (
              <p className="mt-3 text-xs font-bold text-sky-800 bg-white/80 rounded-xl px-4 py-2 inline-block shadow-xs border border-sky-200">
                {importStatus}
              </p>
            )}
            {importError && (
              <p className="mt-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 inline-block">
                ⚠️ {importError}
              </p>
            )}

            {/* Xem văn bản trích xuất thô nếu cần */}
            <div className="mt-3 text-left max-w-2xl mx-auto">
              <button 
                type="button" 
                onClick={() => setShowRaw(v => !v)} 
                className="text-xs font-bold text-sky-700 underline block text-center"
              >
                {showRaw ? 'Ẩn khung văn bản thô' : 'Hoặc dán trực tiếp nội dung đề thi vào đây'}
              </button>
              {showRaw && (
                <div className="mt-2 space-y-2">
                  <textarea
                    rows={8}
                    placeholder={'Dán nội dung đề thi vào đây...\nCâu 1. 4 x 9 = .....\nCâu 2. [IMAGE:link_ảnh] Có bao nhiêu quả táo?'}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const res = parseExamText(rawText);
                      if (res.questions?.length) setQuestions(res.questions);
                    }}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl"
                  >
                    Phân tích lại câu hỏi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CÁC THUỘC TÍNH BẮT BUỘC KHI UPLOAD ĐỀ (Lớp, Môn, Loại đề, Tên đề, Thời gian) */}
          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Thông Tin Bắt Buộc Của Đề Thi:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Chọn Khối Lớp */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  1. Khối Lớp <span className="text-rose-500">*</span>:
                </label>
                <select
                  value={examGrade}
                  onChange={(e) => setExamGrade(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-xs text-slate-800 focus:border-teal-400 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Khối Lớp {g}</option>
                  ))}
                </select>
              </div>

              {/* 2. Chọn Môn Học */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  2. Môn Học <span className="text-rose-500">*</span>:
                </label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-xs text-slate-800 focus:border-teal-400 focus:outline-none"
                >
                  {subjectsList.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Loại Đề Thi */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  3. Loại Đề Thi <span className="text-rose-500">*</span>:
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-xs text-slate-800 focus:border-teal-400 focus:outline-none"
                >
                  <option value="practice">📝 Luyện tập hàng ngày</option>
                  <option value="test">⏱️ Bài kiểm tra định kỳ</option>
                  <option value="review">⭐ Ôn tập tổng hợp</option>
                </select>
              </div>

              {/* 4. Thời Gian Làm Bài */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  4. Thời Gian Làm Bài:
                </label>
                <select
                  value={examDuration}
                  onChange={(e) => setExamDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-xs text-slate-800 focus:border-teal-400 focus:outline-none"
                >
                  <option value={15}>15 phút</option>
                  <option value={20}>20 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={45}>45 phút</option>
                  <option value={60}>60 phút</option>
                  <option value={0}>Không giới hạn thời gian</option>
                </select>
              </div>
            </div>

            {/* Tên đề thi */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                5. Tên Đề Thi <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Ví dụ: Đề Kiểm Tra Cuối Học Kỳ 1 - Môn Toán Lớp 3"
                className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-sm text-slate-800 focus:border-teal-400 focus:outline-none"
              />
            </div>
          </div>

          {/* DANH SÁCH CÂU HỎI & CHỈNH SỬA HÌNH ẢNH */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-slate-800 text-base">
                  Danh Sách Câu Hỏi Trong Đề ({questions.length} câu)
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Mỗi câu hỏi có thể đính kèm ảnh minh họa, đổi kích thước ảnh hoặc tách thành từng ý nhỏ
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {examSubject === 'math' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('choice')}
                      className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-black text-xs rounded-xl flex items-center space-x-1 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-sky-600" />
                      <span>+ Thêm Trắc Nghiệm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('essay')}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl flex items-center space-x-1 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>+ Thêm Tự Luận</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('choice')}
                    className="px-4 py-2 bg-teal-100 hover:bg-teal-200 text-teal-900 font-black text-xs rounded-xl flex items-center space-x-1 transition"
                  >
                    <PlusCircle className="w-4 h-4 text-teal-700" />
                    <span>+ Thêm Câu Hỏi Mới</span>
                  </button>
                )}
              </div>
            </div>

            {questions.map((q, idx) => {
              const isChoice = q.type === 'multiple-choice' || q.type === 'listen-choice';
              const isFill = q.type === 'fill-in' || q.type === 'listen-dictation';
              const isMulti = q.subQuestions && q.subQuestions.length > 0;
              const detectedSplit = !isMulti ? splitMultiItemQuestion(q.question, q.points) : null;

              return (
                <div key={q.id || idx} className="p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
                  {/* Header Câu Hỏi */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-lg border border-teal-200">
                        Câu {idx + 1}
                      </span>
                      <span className={`font-black text-[11px] px-2 py-0.5 rounded-full ${
                        isChoice ? 'bg-sky-100 text-sky-800' : isFill ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {isChoice ? '🔘 Trắc nghiệm' : isFill ? '⌨️ Điền đáp án' : '✍️ Tự luận'}
                      </span>
                      {isMulti && (
                        <span className="font-black text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ⚡ Đã tách {q.subQuestions.length} ý
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Phân mục Toán: Phần I (Trắc nghiệm) vs Phần II (Tự luận) */}
                      {examSubject === 'math' && (
                        <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => updateQuestion(q.id, { section: 'choice', type: isChoice ? q.type : 'multiple-choice' })}
                            className={`px-2 py-0.5 rounded ${q.section === 'choice' || isChoice ? 'bg-sky-600 text-white font-black' : 'text-slate-600 hover:bg-slate-100'}`}
                          >
                            Phần I (TN)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateQuestion(q.id, { section: 'essay', type: isChoice ? 'fill-in' : q.type })}
                            className={`px-2 py-0.5 rounded ${q.section === 'essay' || !isChoice ? 'bg-amber-500 text-white font-black' : 'text-slate-600 hover:bg-slate-100'}`}
                          >
                            Phần II (TL)
                          </button>
                        </div>
                      )}

                      <select
                        value={q.type}
                        onChange={(e) => changeQuestionType(q, e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      >
                        <option value="multiple-choice">Trắc nghiệm</option>
                        <option value="fill-in">Điền đáp án</option>
                        <option value="essay">Tự luận</option>
                      </select>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuestions(questions.filter(item => item.id !== q.id))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Xóa câu này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nội dung câu hỏi */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      {isMulti ? 'Lời dẫn đề bài:' : 'Nội dung câu hỏi:'}
                    </label>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* KHU VỰC QUẢN LÝ HÌNH ẢNH MINH HỌA CỦA CÂU HỎI */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-teal-600" />
                        <span>Hình ảnh minh họa cho câu hỏi (Tùy chọn):</span>
                      </span>

                      <div className="flex items-center space-x-1">
                        <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition">
                          <span>+ Tải ảnh lên</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleQuestionImageUpload(q.id, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleQuestionImagePrompt(q.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition"
                        >
                          Link ảnh URL
                        </button>
                      </div>
                    </div>

                    {q.image && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={q.image} 
                            alt="Minh họa" 
                            className={`rounded-lg object-contain border bg-white ${
                              q.imageSize === 'small' ? 'h-16 w-20' : q.imageSize === 'large' ? 'h-24 w-36' : 'h-20 w-28'
                            }`}
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">Kích thước ảnh:</span>
                            <div className="flex items-center space-x-1 mt-1">
                              {['small', 'medium', 'large'].map(sz => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => updateQuestion(q.id, { imageSize: sz })}
                                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    (q.imageSize || 'medium') === sz
                                      ? 'bg-teal-600 text-white'
                                      : 'bg-white border text-slate-600'
                                  }`}
                                >
                                  {sz === 'small' ? 'Nhỏ' : sz === 'medium' ? 'Vừa' : 'Lớn'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionImage(q.id)}
                          className="text-xs font-black text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
                        >
                          ✕ Xóa ảnh
                        </button>
                      </div>
                    )}
                  </div>

                  {/* TỰ ĐỘNG TÁCH Ý NHỎ NẾU PHÁT HIỆN NHIỀU PHÉP TÍNH */}
                  {detectedSplit && detectedSplit.items.length >= 2 && (
                    <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-amber-950">
                        ⚡ Phát hiện <strong>{detectedSplit.items.length} phép tính / chỗ trống</strong>. Bấm nút để tách riêng thành từng ý!
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutoSplitQuestion(q.id)}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs rounded-xl shadow-xs shrink-0"
                      >
                        ⚡ Tách Ngay
                      </button>
                    </div>
                  )}

                  {/* TRÌNH CHỈNH SỬA CÁC Ý NHỎ MULTI-ITEM */}
                  {isMulti && (
                    <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                        <span className="text-xs font-black text-amber-950">
                          Các ý nhỏ được tách độc lập ({q.subQuestions.length} ý):
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddSubItem(q.id)}
                            className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-200"
                          >
                            + Thêm ý
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMergeSubItems(q.id)}
                            className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
                          >
                            Gộp lại
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {q.subQuestions.map((sub, sIdx) => (
                          <div key={sub.id || sIdx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={sub.label || `${sIdx + 1}`}
                                onChange={(e) => handleUpdateSubItem(q.id, sub.id, { label: e.target.value })}
                                placeholder="Ý"
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-center font-bold"
                              />
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={sub.prompt}
                                onChange={(e) => handleUpdateSubItem(q.id, sub.id, { prompt: e.target.value })}
                                placeholder="4 × 9 ="
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={sub.answer || ''}
                                onChange={(e) => handleUpdateSubItem(q.id, sub.id, { answer: e.target.value })}
                                placeholder="Đáp án"
                                className="w-full px-2 py-1 bg-emerald-50 border border-emerald-400 text-emerald-900 rounded font-black text-center"
                              />
                            </div>
                            <div className="col-span-2 flex items-center justify-end space-x-1">
                              <input
                                type="number"
                                step="0.25"
                                value={sub.points || 0.25}
                                onChange={(e) => handleUpdateSubItem(q.id, sub.id, { points: Number(e.target.value) })}
                                className="w-12 px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs font-bold"
                              />
                              {q.subQuestions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubItem(q.id, sub.id)}
                                  className="text-rose-500 font-bold px-1"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LỰA CHỌN ĐÁP ÁN CHO CÂU TRẮC NGHIỆM */}
                  {isChoice && (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-black text-slate-700">
                        Các lựa chọn (Tích tròn vào đáp án đúng):
                      </label>
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.answer === opt && opt !== ''}
                            onChange={() => updateQuestion(q.id, { answer: opt })}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <span className="text-xs font-black text-slate-500 w-4">{String.fromCharCode(65 + oi)}</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const val = e.target.value;
                              const options = q.options.map((o, i) => (i === oi ? val : o));
                              updateQuestion(q.id, { options, answer: q.answer === opt ? val : q.answer });
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ĐÁP ÁN & ĐIỂM SỐ */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {isFill && !isMulti && (
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">Đáp án đúng:</label>
                        <input
                          type="text"
                          value={q.answer || ''}
                          onChange={(e) => updateQuestion(q.id, { answer: e.target.value })}
                          placeholder="Đáp án đúng..."
                          className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">Điểm số câu này:</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={q.points || 2}
                        onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Lời giải cho học sinh */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Lời giải chi tiết (Hiện sau khi nộp bài):</label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                      placeholder="Lời giải thích cho học sinh hiểu..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Save Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleSaveExam(null, 'draft')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition"
            >
              💾 Lưu Bản Nháp
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-black text-sm rounded-xl shadow-md btn-kid"
            >
              🚀 Xuất Bản Đề Thi Cho Học Sinh
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 3: DANH SÁCH LỚP HỌC ================= */}
      {activeTab === 'classes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-teal-200 shadow-xs">
            <div>
              <h3 className="font-black text-slate-800 text-base md:text-lg font-display">
                Quản Lý Trường & Lớp Học ({(classes || []).length})
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Tạo lớp và phân công quản lý học sinh theo từng khối
              </p>
            </div>
            <button
              onClick={() => setIsAddClassOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Thêm Lớp Học Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(classes || []).length === 0 ? (
              <div className="col-span-full p-10 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <span className="text-4xl block mb-2">🏫</span>
                <p className="text-sm font-black text-slate-700">Chưa có lớp học nào</p>
                <p className="text-xs text-slate-400 mt-1">Bấm nút "+ Thêm Lớp Học Mới" ở trên để tạo lớp cho trường của bạn nhé!</p>
              </div>
            ) : (
              (classes || []).map(c => (
                <div key={c.id} className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-xs cartoon-card flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      Khối Lớp {c.grade}
                    </span>
                    <h4 className="font-black text-slate-900 text-lg mt-1">{c.name}</h4>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">GVCN: {c.teacherName}</p>
                    <p className="text-xs text-slate-400 font-medium">Sĩ số: {c.studentCount} học sinh</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => removeClass(c.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-black"
                    >
                      Xóa lớp
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: BÀI NGHE & VIDEO TIẾNG ANH ================= */}
      {activeTab === 'upload-media' && (
        <div className="bg-white rounded-4xl p-6 md:p-8 border-3 border-teal-200 shadow-sm cartoon-card space-y-6 animate-fade-in">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-xl md:text-2xl font-black text-slate-800 font-display flex items-center gap-2">
              <Video className="w-6 h-6 text-teal-600" />
              Tải Lên Bài Nghe & Video Tiếng Anh
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đính kèm bài nghe MP3 hoặc video YouTube vào kho tài liệu cho học sinh luyện tập
            </p>
          </div>

          {uploadSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold">
              ✓ {uploadSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveMedia} className="space-y-5 max-w-2xl">
            {/* Lựa chọn nguồn video / audio */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">
                Chọn nguồn Video / Bài nghe:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMediaSourceType('github')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition ${
                    mediaSourceType === 'github'
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-black ring-2 ring-teal-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl mb-1">🐱</span>
                  <span className="text-xs font-black">Video GitHub</span>
                  <span className="text-[10px] text-teal-700 font-bold">Khuyên dùng (tới 2GB)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaSourceType('youtube')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition ${
                    mediaSourceType === 'youtube'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 font-black ring-2 ring-rose-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl mb-1">▶️</span>
                  <span className="text-xs font-black">YouTube</span>
                  <span className="text-[10px] text-rose-700 font-bold">Dán link YouTube</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaSourceType('file')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition ${
                    mediaSourceType === 'file'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-black ring-2 ring-indigo-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl mb-1">📁</span>
                  <span className="text-xs font-black">Tải Tệp Lên</span>
                  <span className="text-[10px] text-indigo-700 font-bold">MP3 / MP4 từ máy tính</span>
                </button>
              </div>
            </div>

            {/* Tiêu đề & Khối Lớp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 mb-1">Tiêu đề bài nghe / video:</label>
                <input
                  type="text"
                  required
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="Ví dụ: Unit 1 - At the Zoo (Hoạt hình phát âm)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Khối Lớp:</label>
                <select
                  value={mediaGrade}
                  onChange={(e) => setMediaGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* NGUỒN 1: GITHUB VIDEO */}
            {mediaSourceType === 'github' && (
              <div className="space-y-3 bg-teal-50/70 p-4 rounded-3xl border-2 border-teal-200">
                <div>
                  <label className="block text-xs font-black text-teal-900 mb-1 flex items-center justify-between">
                    <span>Dán đường link Video GitHub (.mp4):</span>
                    <span className="text-[10px] text-teal-700 font-normal">Hỗ trợ Link Release, Raw hoặc Issues</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={githubVideoUrl}
                    onChange={(e) => setGithubVideoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo/releases/download/v1.0/video.mp4"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-teal-300 rounded-2xl text-xs font-bold focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Video Preview nếu có link */}
                {githubVideoUrl.trim() && (
                  <div className="mt-3">
                    <span className="text-[11px] font-black text-teal-900 block mb-1">Xem thử video trước khi lưu:</span>
                    <div className="aspect-video max-h-60 rounded-2xl overflow-hidden bg-black shadow-md border border-teal-300">
                      <video
                        controls
                        playsInline
                        src={normalizeGithubVideo(githubVideoUrl)}
                        className="w-full h-full object-contain"
                      >
                        Trình duyệt không hỗ trợ xem video.
                      </video>
                    </div>
                  </div>
                )}

                {/* Hướng dẫn từng bước up video lên GitHub */}
                <div className="p-3 bg-white rounded-2xl border border-teal-200 text-slate-700 text-[11px] space-y-2">
                  <div className="font-black text-teal-900 flex items-center gap-1.5 text-xs">
                    <span>💡</span>
                    <span>2 Cách Upload Video Lên GitHub Cực Kỳ Nhanh & Miễn Phí:</span>
                  </div>
                  
                  <div className="pl-2 border-l-2 border-teal-400 space-y-1">
                    <p className="font-extrabold text-teal-800">Cách 1: Dùng GitHub Releases (Khuyên dùng - File lên đến 2GB!)</p>
                    <p>1. Vào Repository GitHub của bạn ➔ Bấm <strong>Releases</strong> ➔ Bấm <strong>Draft a new release</strong>.</p>
                    <p>2. Đặt tag (VD: <code className="bg-slate-100 px-1 rounded">v1.0</code>) ➔ Kéo thả file video <code className="bg-slate-100 px-1 rounded">.mp4</code> vào ô <em>Attach binaries by dropping them here</em>.</p>
                    <p>3. Bấm <strong>Publish release</strong> ➔ Chuột phải vào tên video chọn <strong>Sao chép địa chỉ liên kết (Copy link address)</strong> rồi dán vào ô trên!</p>
                  </div>

                  <div className="pl-2 border-l-2 border-amber-400 space-y-1">
                    <p className="font-extrabold text-amber-900">Cách 2: Kéo thả nhanh vào GitHub Issue / Discussion (File dưới 100MB)</p>
                    <p>Mở một Issue hoặc Discussion bất kỳ trên GitHub ➔ Kéo thả video vào ô viết chữ ➔ GitHub sẽ tự động upload và tạo đường link dạng <code className="bg-slate-100 px-1 rounded">https://github.com/user-attachments/assets/...</code> ➔ Copy dán vào đây!</p>
                  </div>
                </div>
              </div>
            )}

            {/* NGUỒN 2: YOUTUBE */}
            {mediaSourceType === 'youtube' && (
              <div className="space-y-3 bg-rose-50/70 p-4 rounded-3xl border-2 border-rose-200">
                <div>
                  <label className="block text-xs font-black text-rose-900 mb-1">Đường link YouTube:</label>
                  <input
                    type="url"
                    required
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-rose-300 rounded-2xl text-xs font-bold focus:border-rose-500 focus:outline-none"
                  />
                </div>
                {youtubeUrl.trim() && (
                  <div className="aspect-video max-h-60 rounded-2xl overflow-hidden bg-black shadow-md border border-rose-300">
                    <iframe
                      src={youtubeUrl.includes('embed') ? youtubeUrl : youtubeUrl.replace('watch?v=', 'embed/')}
                      title="Xem trước YouTube"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            {/* NGUỒN 3: FILE MÁY TÍNH */}
            {mediaSourceType === 'file' && (
              <div className="space-y-3 bg-indigo-50/70 p-4 rounded-3xl border-2 border-indigo-200">
                <label className="block text-xs font-black text-indigo-900 mb-1">Chọn tệp MP3 / MP4 từ máy tính:</label>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleMediaFileChange}
                  className="w-full text-xs font-medium"
                />
                {mediaPreviewUrl && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-indigo-200">
                    <video controls src={mediaPreviewUrl} className="max-h-48 mx-auto rounded-lg" />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-md btn-kid flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Lưu Video / Bài Nghe Vào Hệ Thống</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL XEM TRƯỚC ĐỀ THI (PREVIEW) ================= */}
      {previewExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] p-6 shadow-2xl border-4 border-teal-300 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Lớp {previewExam.grade} • {previewExam.subjectId}
                </span>
                <h3 className="font-black text-lg text-slate-800 mt-1">{previewExam.title}</h3>
              </div>
              <button onClick={() => setPreviewExam(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {previewExam.questions?.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-black text-slate-900 text-sm">
                    Câu {idx + 1}: {q.question} ({q.points} điểm)
                  </div>
                  {q.image && (
                    <img src={q.image} alt="Minh họa" className="max-h-48 object-contain mx-auto rounded-lg" />
                  )}
                  {q.subQuestions?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {q.subQuestions.map((s, si) => (
                        <div key={si} className="p-2 bg-white rounded-lg border flex items-center justify-between">
                          <span className="font-bold">{s.prompt}</span>
                          <span className="text-emerald-700 font-black">[Ô điền]</span>
                        </div>
                      ))}
                    </div>
                  ) : q.options?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`p-2 rounded-lg border font-bold ${opt === q.answer ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white'}`}>
                          {String.fromCharCode(65 + oi)}. {opt} {opt === q.answer && '✓ (Đáp án đúng)'}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 bg-white rounded-lg border text-slate-500 italic">
                      Đáp án đúng: {q.answer || q.sampleAnswer || 'Tự luận'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setPreviewExam(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 font-black text-xs rounded-xl">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL SAO CHÉP & CHUYỂN LỚP/MÔN ================= */}
      {duplicateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 space-y-4">
            <h3 className="text-lg font-black text-slate-800 font-display">
              Sao Chép & Chuyển Đề Sang Lớp / Môn Khác
            </h3>
            <p className="text-xs text-slate-600">
              Đề thi gốc: <strong>{duplicateTarget.title}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chuyển sang Khối Lớp:</label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chuyển sang Môn Học:</label>
                <select
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  {subjectsList.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button onClick={() => setDuplicateTarget(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">
                Hủy
              </button>
              <button onClick={handleDuplicateConfirm} className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs rounded-xl shadow-sm">
                Xác Nhận Tạo Bản Sao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA ĐỀ THI ================= */}
      {deleteConfirmExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-400 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-xl">
              🗑️
            </div>
            <h3 className="text-lg font-black text-slate-800">Xác Nhận Xóa Đề Thi?</h3>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa đề thi <strong>"{deleteConfirmExam.title}"</strong> không? Thao tác này không làm mất điểm thi đã lưu của học sinh.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button onClick={() => setDeleteConfirmExam(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  deleteExam(deleteConfirmExam.id);
                  setDeleteConfirmExam(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM MÔN HỌC MỚI ================= */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-teal-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-lg font-black text-slate-800">Thêm Môn Học Mới Vào Hệ Thống</h3>
              <button onClick={() => setIsAddSubjectOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">Tên môn học:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khoa Học & Đời Sống"
                  value={newSubjectData.name}
                  onChange={(e) => setNewSubjectData({ ...newSubjectData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Biểu tượng Icon (Emoji):</label>
                <input
                  type="text"
                  value={newSubjectData.icon}
                  onChange={(e) => setNewSubjectData({ ...newSubjectData, icon: e.target.value })}
                  placeholder="🔬"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddSubjectOpen(false)} className="px-4 py-2 font-bold text-slate-500">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl">Thêm Môn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM LỚP MỚI ================= */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-teal-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h4 className="font-black text-slate-800 text-lg">Thêm Lớp Học Mới</h4>
              <button onClick={() => setIsAddClassOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">Tên lớp:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp 3A1"
                  value={newClassData.name}
                  onChange={(e) => setNewClassData({ ...newClassData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-black text-slate-700 mb-1">Khối Lớp:</label>
                <select
                  value={newClassData.grade}
                  onChange={(e) => setNewClassData({ ...newClassData, grade: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddClassOpen(false)} className="px-4 py-2 font-bold text-slate-500">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl">Tạo Lớp</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
