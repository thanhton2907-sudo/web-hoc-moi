import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PICTURE_DICTIONARY } from '../../data/mockData';
import { AudioPlayer } from '../common/AudioPlayer';
import { VoiceGuideButton } from '../common/VoiceGuideButton';
import { speakText, evaluatePronunciation, playKidSound } from '../../utils/speech';
import { 
  Headphones, 
  BookA, 
  Mic, 
  MicOff, 
  Volume2, 
  Star, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles,
  HelpCircle,
  Play,
  Video,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EnglishListeningHub = () => {
  const { rewardStars, addToErrorNotebook, voiceGuideEnabled, englishMediaList } = useApp();

  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'dictionary' | 'teacher-media'
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);

  // States for 6 Listening Exercise Types
  const [selectedImageOpt, setSelectedImageOpt] = useState(null);
  const [selectedChoiceOpt, setSelectedChoiceOpt] = useState(null);
  const [dictationInput, setDictationInput] = useState('');
  const [reorderedWords, setReorderedWords] = useState([]);
  const [selectedDialogueAns, setSelectedDialogueAns] = useState(null);

  // Microphone state for Speak & Repeat
  const [isRecording, setIsRecording] = useState(false);
  const [micResult, setMicResult] = useState(null);
  const [micError, setMicError] = useState(null);

  // Submission & Result state for the current exercise
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [listenCount, setListenCount] = useState(1);

  // 6 Listening Exercises Data
  const listeningExercises = [
    // a) Nghe và chọn hình đúng
    {
      id: 'l-type-a',
      type: 'listen-image',
      typeName: 'Dạng 1: Nghe và Chọn Hình Đúng',
      audioText: 'Dog',
      prompt: 'Bé hãy lắng nghe âm thanh và chọn đúng con vật nhé!',
      options: [
        { id: 'opt1', word: 'Cat', nameVi: 'Con mèo', icon: '🐱', isCorrect: false },
        { id: 'opt2', word: 'Dog', nameVi: 'Con chó', icon: '🐶', isCorrect: true },
        { id: 'opt3', word: 'Bird', nameVi: 'Con chim', icon: '🐦', isCorrect: false },
        { id: 'opt4', word: 'Elephant', nameVi: 'Con voi', icon: '🐘', isCorrect: false }
      ],
      explanation: 'Từ phát âm là "Dog" có nghĩa là con chó 🐶.'
    },

    // b) Nghe và chọn đáp án trắc nghiệm
    {
      id: 'l-type-b',
      type: 'listen-choice',
      typeName: 'Dạng 2: Nghe và Chọn Đáp Án (Trắc nghiệm)',
      audioText: 'Good morning, teacher! Nice to meet you.',
      question: 'Bé vừa nghe thấy lời chào lịch sự nào sau đây?',
      options: [
        'Good night, baby!',
        'Good morning, teacher!',
        'Goodbye, see you tomorrow!',
        'Hello, my brother!'
      ],
      correctAnswer: 'Good morning, teacher!',
      explanation: '"Good morning, teacher!" nghĩa là: Chào buổi sáng cô giáo ạ!'
    },

    // c) Nghe và điền từ còn thiếu (Dictation)
    {
      id: 'l-type-c',
      type: 'listen-dictation',
      typeName: 'Dạng 3: Nghe và Điền Từ Còn Thiếu (Dictation)',
      audioText: 'banana',
      prompt: 'Nghe phát âm và điền từ tiếng Anh chỉ loại quả vào ô trống:',
      sentenceTemplate: 'Monkeys love eating yellow ___ in the forest.',
      correctAnswer: 'banana',
      hint: 'Gợi ý: Quả chuối màu vàng, bắt đầu bằng chữ "b"',
      explanation: 'Từ cần điền là "banana" (quả chuối).'
    },

    // d) Nghe và sắp xếp từ thành câu
    {
      id: 'l-type-d',
      type: 'listen-reorder',
      typeName: 'Dạng 4: Nghe và Sắp Xếp Từ Thành Câu Hoàn Chỉnh',
      audioText: 'I like my school',
      prompt: 'Bé bấm vào các từ bên dưới theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
      wordsPool: ['my', 'like', 'school', 'I'],
      correctOrder: ['I', 'like', 'my', 'school'],
      explanation: 'Câu hoàn chỉnh: "I like my school" (Tớ yêu thích trường học của tớ).'
    },

    // e) Nghe và nhắc lại (Microphone + chấm sao phát âm)
    {
      id: 'l-type-e',
      type: 'listen-repeat',
      typeName: 'Dạng 5: Nghe và Nhắc Lại (Chấm điểm phát âm bằng Micro)',
      audioText: 'Elephant',
      targetWord: 'Elephant',
      meaningVi: 'Con voi to lớn 🐘',
      ipa: '/ˈel.ɪ.fənt/',
      prompt: 'Bé hãy bấm loa nghe phát âm chuẩn, sau đó bấm Micro và đọc to từ này để nhận sao nhé!',
      explanation: 'Phát âm nhấn trọng âm vào âm tiết đầu tiên /ˈel.ɪ.fənt/.'
    },

    // f) Nghe hội thoại ngắn rồi trả lời câu hỏi
    {
      id: 'l-type-f',
      type: 'listen-dialogue',
      typeName: 'Dạng 6: Nghe Hội Thoại Ngắn và Trả Lời Câu Hỏi',
      audioText: 'Hi Lucy! Do you like reading books? Yes, Peter! I love reading fairy tales every evening.',
      dialogueScript: [
        { speaker: 'Peter', text: 'Hi Lucy! Do you like reading books?' },
        { speaker: 'Lucy', text: 'Yes, Peter! I love reading fairy tales every evening.' }
      ],
      question: 'Bạn Lucy thích đọc thể loại sách nào vào mỗi buổi tối?',
      options: [
        'Truyện cổ tích (Fairy tales)',
        'Sách nấu ăn',
        'Sách toán học',
        'Báo tin tức'
      ],
      correctAnswer: 'Truyện cổ tích (Fairy tales)',
      explanation: 'Lucy nói: "I love reading fairy tales" nghĩa là bạn ấy yêu thích truyện cổ tích!'
    }
  ];

  const currentEx = listeningExercises[currentExerciseIdx];

  // Reset exercise state when switching exercises
  const resetExerciseState = () => {
    setSelectedImageOpt(null);
    setSelectedChoiceOpt(null);
    setDictationInput('');
    setReorderedWords([]);
    setSelectedDialogueAns(null);
    setIsRecording(false);
    setMicResult(null);
    setMicError(null);
    setExerciseSubmitted(false);
    setIsCorrect(false);
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
  };

  const nextExercise = () => {
    if (currentExerciseIdx < listeningExercises.length - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
      resetExerciseState();
      setListenCount(1);
    }
  };

  const prevExercise = () => {
    if (currentExerciseIdx > 0) {
      setCurrentExerciseIdx(prev => prev - 1);
      resetExerciseState();
      setListenCount(1);
    }
  };

  // Submit and verify current exercise
  const handleSubmitExercise = () => {
    let correct = false;

    if (currentEx.type === 'listen-image') {
      correct = selectedImageOpt?.isCorrect === true;
    } else if (currentEx.type === 'listen-choice') {
      correct = selectedChoiceOpt === currentEx.correctAnswer;
    } else if (currentEx.type === 'listen-dictation') {
      correct = dictationInput.trim().toLowerCase() === currentEx.correctAnswer.toLowerCase();
    } else if (currentEx.type === 'listen-reorder') {
      correct = JSON.stringify(reorderedWords) === JSON.stringify(currentEx.correctOrder);
    } else if (currentEx.type === 'listen-repeat') {
      correct = micResult && micResult.stars >= 2;
    } else if (currentEx.type === 'listen-dialogue') {
      correct = selectedDialogueAns === currentEx.correctAnswer;
    }

    setIsCorrect(correct);
    setExerciseSubmitted(true);

    if (correct) {
      rewardStars(5, 'Đúng rồi, đôi tai của bé thính quá!');
    } else {
      playKidSound('wrong');
      // Save mistake to error notebook
      addToErrorNotebook({
        subject: 'Tiếng Anh (Nghe)',
        grade: 1,
        question: currentEx.prompt || currentEx.question,
        userWrongAnswer: dictationInput || selectedChoiceOpt || selectedImageOpt?.word || 'Chưa chính xác',
        correctAnswer: currentEx.correctAnswer || currentEx.audioText,
        explanation: currentEx.explanation
      });
    }
  };

  // Handle Speech Recognition for Pronunciation (Type e)
  const handleStartRecording = () => {
    setMicError(null);
    setIsRecording(true);
    evaluatePronunciation(
      currentEx.targetWord,
      (result) => {
        setIsRecording(false);
        setMicResult(result);
        if (result.stars >= 2) {
          playKidSound('correct');
        } else {
          playKidSound('wrong');
        }
      },
      (err) => {
        setIsRecording(false);
        setMicError(err);
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-sky-300 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-inner border-2 border-white/40">
              🎧
            </div>
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-block">
                Tiêu điểm Kĩ Năng Nghe Tiếng Anh Tiểu Học
              </span>
              <h2 className="text-2xl md:text-4xl font-black font-display mt-1">
                Khu Luyện Nghe Tiếng Anh Chuyên Sâu
              </h2>
              <p className="text-sky-100 text-xs md:text-sm font-semibold">
                Phát âm chuẩn bản xứ (Web Speech API) • Đa tốc độ • 6 Dạng bài luyện tập
              </p>
            </div>
          </div>

          <VoiceGuideButton 
            text="Chào bé! Đây là khu luyện nghe tiếng Anh. Bé hãy bấm vào nút phát âm thanh để lắng nghe và trả lời nhé!" 
            className="bg-white text-slate-800 border-none"
          />
        </div>

        {/* Tab switchers */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-white/20">
          <button
            onClick={() => handleSelectTab('exercises')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition flex items-center space-x-2 ${
              activeTab === 'exercises'
                ? 'bg-white text-sky-900 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>6 Dạng Bài Nghe Trọng Tâm</span>
          </button>
          <button
            onClick={() => handleSelectTab('dictionary')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition flex items-center space-x-2 ${
              activeTab === 'dictionary'
                ? 'bg-white text-sky-900 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <BookA className="w-4 h-4" />
            <span>Từ Điển Hình Ảnh Phát Âm</span>
          </button>
          <button
            onClick={() => handleSelectTab('teacher-media')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black transition flex items-center space-x-2 ${
              activeTab === 'teacher-media'
                ? 'bg-white text-sky-900 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Video className="w-4 h-4 text-amber-300" />
            <span>Bài Nghe & Video Của Giáo Viên ({englishMediaList?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 6 DẠNG BÀI NGHE */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {/* Progress / Step Navigator */}
          <div className="bg-white rounded-3xl p-4 border-2 border-sky-100 shadow-sm flex items-center justify-between">
            <span className="text-xs md:text-sm font-black text-sky-800 bg-sky-100 px-3 py-1.5 rounded-xl">
              {currentEx.typeName}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">
                Câu {currentExerciseIdx + 1} / {listeningExercises.length}
              </span>
              <div className="flex space-x-1">
                {listeningExercises.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => { setCurrentExerciseIdx(i); resetExerciseState(); }}
                    className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                      i === currentExerciseIdx 
                        ? 'bg-sky-500 scale-125' 
                        : 'bg-slate-200 hover:bg-sky-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Main Card */}
          <div className="bg-white rounded-4xl p-6 md:p-8 border-3 border-sky-200 shadow-sm cartoon-card">
            {/* Audio Player for this exercise */}
            <div className="mb-6">
              <AudioPlayer
                title="Bấm để nghe âm thanh bài tập"
                speechText={currentEx.audioText}
                isEnglish={true}
                onFinished={() => setListenCount(prev => prev + 1)}
              />
            </div>

            {/* Prompt */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 font-display">
                  {currentEx.prompt || currentEx.question}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Số lần bé đã nghe: {listenCount} lần
                </p>
              </div>
              <VoiceGuideButton text={currentEx.prompt || currentEx.question} />
            </div>

            {/* TYPE A: Nghe và chọn hình đúng */}
            {currentEx.type === 'listen-image' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {currentEx.options.map(opt => {
                  const isSelected = selectedImageOpt?.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => !exerciseSubmitted && setSelectedImageOpt(opt)}
                      className={`cursor-pointer rounded-3xl p-5 text-center border-3 transition-all cartoon-card ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-200 scale-105'
                          : 'border-slate-200 bg-slate-50 hover:bg-sky-50/50'
                      }`}
                    >
                      <div className="text-6xl mb-2">{opt.icon}</div>
                      <div className="font-black text-slate-800 text-lg">{opt.word}</div>
                      <div className="text-xs font-bold text-slate-500">{opt.nameVi}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TYPE B: Nghe và chọn trắc nghiệm */}
            {currentEx.type === 'listen-choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentEx.options.map((opt, i) => (
                  <button
                    key={i}
                    disabled={exerciseSubmitted}
                    onClick={() => setSelectedChoiceOpt(opt)}
                    className={`p-4 rounded-2xl font-bold text-base text-left transition border-2 flex items-center justify-between ${
                      selectedChoiceOpt === opt
                        ? 'bg-sky-100 border-sky-500 text-sky-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-sky-50 text-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedChoiceOpt === opt && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
                  </button>
                ))}
              </div>
            )}

            {/* TYPE C: Dictation điền từ */}
            {currentEx.type === 'listen-dictation' && (
              <div className="space-y-4">
                <div className="p-4 bg-sky-50 rounded-2xl border-2 border-dashed border-sky-200 text-base md:text-lg font-bold text-slate-700">
                  {currentEx.sentenceTemplate.replace('___', '______')}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="font-bold text-slate-600 text-sm">Từ còn thiếu là:</span>
                  <input
                    type="text"
                    disabled={exerciseSubmitted}
                    value={dictationInput}
                    onChange={(e) => setDictationInput(e.target.value)}
                    placeholder="Gõ từ tiếng Anh..."
                    className="flex-1 max-w-sm px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-slate-800 text-lg focus:border-sky-500 focus:outline-none"
                  />
                </div>
                {currentEx.hint && (
                  <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    💡 {currentEx.hint}
                  </p>
                )}
              </div>
            )}

            {/* TYPE D: Sắp xếp từ thành câu */}
            {currentEx.type === 'listen-reorder' && (
              <div className="space-y-5">
                {/* Assembled sentence drop zone */}
                <div className="min-h-16 p-4 bg-sky-50 border-2 border-sky-300 rounded-2xl flex flex-wrap items-center gap-2">
                  {reorderedWords.length === 0 ? (
                    <span className="text-slate-400 font-bold text-sm">
                      Bấm vào các từ bên dưới để ghép câu vào đây...
                    </span>
                  ) : (
                    reorderedWords.map((word, wIdx) => (
                      <span
                        key={wIdx}
                        onClick={() => {
                          if (!exerciseSubmitted) {
                            setReorderedWords(reorderedWords.filter((_, idx) => idx !== wIdx));
                          }
                        }}
                        className="cursor-pointer px-4 py-2 bg-sky-500 text-white font-black text-base rounded-xl shadow-sm hover:bg-sky-600 transition"
                      >
                        {word} ✕
                      </span>
                    ))
                  )}
                </div>

                {/* Available words bank */}
                <div className="flex flex-wrap gap-2">
                  {currentEx.wordsPool.map((word, wIdx) => {
                    const isUsed = reorderedWords.includes(word);
                    return (
                      <button
                        key={wIdx}
                        disabled={isUsed || exerciseSubmitted}
                        onClick={() => setReorderedWords([...reorderedWords, word])}
                        className={`px-4 py-2.5 rounded-xl font-black text-base transition border-2 ${
                          isUsed
                            ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'bg-white border-amber-300 hover:border-amber-500 text-slate-800 shadow-sm hover:scale-105'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TYPE E: Nghe và nhắc lại (Microphone + chấm sao phát âm) */}
            {currentEx.type === 'listen-repeat' && (
              <div className="text-center py-4 space-y-4">
                <div className="inline-block p-6 bg-sky-50 rounded-3xl border-2 border-sky-200">
                  <h4 className="text-4xl font-black text-slate-800 tracking-wide font-display">
                    {currentEx.targetWord}
                  </h4>
                  <p className="text-sm font-semibold text-sky-700 mt-1">{currentEx.ipa}</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">{currentEx.meaningVi}</p>
                </div>

                {/* Microphone Recording Button */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <button
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                      isRecording
                        ? 'bg-rose-500 animate-ping ring-8 ring-rose-200'
                        : 'bg-gradient-to-tr from-sky-400 to-blue-600 hover:scale-105 btn-kid'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                  <span className="text-xs font-bold text-slate-600 mt-2">
                    {isRecording ? 'Đang lắng nghe... Bé hãy đọc to rõ nhé!' : 'Bấm Micro để bắt đầu đọc'}
                  </span>
                </div>

                {/* Pronunciation Feedback */}
                {micResult && (
                  <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 max-w-md mx-auto animate-fade-in">
                    <div className="flex justify-center space-x-1 mb-2">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-7 h-7 ${
                            star <= micResult.stars
                              ? 'text-amber-500 fill-amber-400 animate-bounce'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="font-black text-slate-800 text-sm">{micResult.feedback}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Máy nghe được bé nói: <span className="font-bold text-sky-700">"{micResult.spoken}"</span>
                    </p>
                  </div>
                )}

                {micError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl max-w-md mx-auto">
                    {micError}
                  </div>
                )}
              </div>
            )}

            {/* TYPE F: Nghe đoạn hội thoại */}
            {currentEx.type === 'listen-dialogue' && (
              <div className="space-y-5">
                {/* Dialogue Visual transcript box */}
                <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 space-y-2">
                  {currentEx.dialogueScript.map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start space-x-2 text-sm">
                      <span className="font-black text-sky-800 min-w-16">{line.speaker}:</span>
                      <span className="font-semibold text-slate-700">{line.text}</span>
                    </div>
                  ))}
                </div>

                <div className="font-extrabold text-slate-800 text-base">
                  Câu hỏi: {currentEx.question}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentEx.options.map((opt, i) => (
                    <button
                      key={i}
                      disabled={exerciseSubmitted}
                      onClick={() => setSelectedDialogueAns(opt)}
                      className={`p-4 rounded-2xl font-bold text-base text-left transition border-2 flex items-center justify-between ${
                        selectedDialogueAns === opt
                          ? 'bg-sky-100 border-sky-500 text-sky-950 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:bg-sky-50 text-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedDialogueAns === opt && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit & Explanation Section */}
            <div className="mt-8 pt-4 border-t border-slate-100">
              {exerciseSubmitted ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border-2 flex items-center space-x-3 ${
                    isCorrect 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="font-black text-base">
                        {isCorrect ? 'Tuyệt vời! Bé đã làm chính xác!' : 'Chưa đúng rồi! Bé thử nghe lại nhé!'}
                      </h4>
                      <p className="text-xs mt-0.5 opacity-90">{currentEx.explanation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={resetExerciseState}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center space-x-2 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Thử làm lại câu này</span>
                    </button>

                    <button
                      onClick={nextExercise}
                      disabled={currentExerciseIdx >= listeningExercises.length - 1}
                      className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-black rounded-2xl shadow-md btn-kid disabled:opacity-50"
                    >
                      Sang câu nghe tiếp theo &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevExercise}
                    disabled={currentExerciseIdx === 0}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 disabled:opacity-30"
                  >
                    &larr; Câu trước
                  </button>

                  <button
                    onClick={handleSubmitExercise}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black rounded-2xl shadow-md btn-kid text-base"
                  >
                    Kiểm Tra Kết Quả
                  </button>

                  <button
                    onClick={nextExercise}
                    disabled={currentExerciseIdx >= listeningExercises.length - 1}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 disabled:opacity-30"
                  >
                    Câu sau &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TỪ ĐIỂN HÌNH ẢNH CÓ ÂM THANH */}
      {activeTab === 'dictionary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 border-2 border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800">Từ Điển Hình Ảnh Sinh Động (Picture Dictionary)</h3>
              <p className="text-xs text-slate-500">Bấm vào bất kỳ từ nào để nghe giọng phát âm chuẩn nhé bé!</p>
            </div>
            <VoiceGuideButton text="Bé hãy bấm vào các ô từ vựng để nghe cô phát âm tiếng Anh chuẩn nhé!" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PICTURE_DICTIONARY.map(item => (
              <div
                key={item.id}
                onClick={() => speakText(item.word, { lang: 'en-US', rate: 0.85 })}
                className="cursor-pointer bg-white rounded-3xl p-5 text-center border-3 border-amber-200 hover:border-sky-400 shadow-sm cartoon-card group"
              >
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="flex items-center justify-center space-x-1.5">
                  <h4 className="font-black text-slate-800 text-lg group-hover:text-sky-600 transition-colors">
                    {item.word}
                  </h4>
                  <Volume2 className="w-4 h-4 text-sky-500 animate-pulse" />
                </div>
                <div className="text-xs font-semibold text-slate-400">{item.ipa}</div>
                <div className="text-xs font-bold text-amber-700 bg-amber-100 rounded-lg py-0.5 px-2 mt-1 inline-block">
                  {item.vi}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BÀI NGHE & VIDEO DO GIÁO VIÊN TẢI LÊN */}
      {activeTab === 'teacher-media' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 border-2 border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800">Bài Nghe Audio & Video Bài Giảng Của Thầy Cô</h3>
              <p className="text-xs text-slate-500">Xem video hoạt hình tiếng Anh và nghe file audio do thầy cô tải lên để rèn luyện kỹ năng nghe!</p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
              {englishMediaList?.length || 0} bài giảng
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {englishMediaList?.map(item => (
              <div key={item.id} className="bg-white rounded-4xl p-6 border-3 border-sky-200 shadow-sm cartoon-card space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {item.type === 'video' ? '🎬 Video Bài Học' : '🎧 Audio Luyện Nghe'} • Lớp {item.grade}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Đăng bởi: {item.uploader}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-800 text-base md:text-lg mb-3">
                    {item.title}
                  </h4>

                  {/* Video Player */}
                  {item.type === 'video' && (
                    <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200 mb-3">
                      {item.isEmbed ? (
                        <iframe
                          src={item.mediaUrl}
                          title={item.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video controls src={item.mediaUrl} className="w-full h-full" />
                      )}
                    </div>
                  )}

                  {/* Audio Player */}
                  {item.type === 'audio' && (
                    <div className="my-3">
                      {item.speechText ? (
                        <AudioPlayer speechText={item.speechText} isEnglish={true} title={item.title} />
                      ) : (
                        <audio controls src={item.mediaUrl} className="w-full rounded-2xl" />
                      )}
                    </div>
                  )}

                  {/* Transcript */}
                  {item.transcript && (
                    <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-100 text-xs text-slate-700">
                      <span className="font-extrabold text-sky-800 block mb-1">📝 Lời thoại (Transcript):</span>
                      <p className="leading-relaxed">{item.transcript}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold">Ngày đăng: {item.createdAt}</span>
                  <button
                    onClick={() => {
                      rewardStars(5);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black text-xs rounded-xl shadow-xs transition btn-kid"
                  >
                    ⭐ Bé đã nghe xong (+5 sao)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
