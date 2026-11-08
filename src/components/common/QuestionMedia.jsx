import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward, Film, Video, Music, Maximize2, ExternalLink } from 'lucide-react';
import { speakText, stopSpeech } from '../../utils/speech';

export const QuestionMedia = ({ 
  audioUrl, 
  videoUrl, 
  audioText, 
  subjectId = 'english',
  title = '',
  compact = false
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(0.85); // Tốc độ nghe chuẩn cho học sinh tiểu học
  const [audioProgress, setAudioProgress] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const hasAudio = !!(audioUrl || audioText);
  const hasVideo = !!videoUrl;

  if (!hasAudio && !hasVideo) return null;

  // Xử lý bật/tắt Audio MP3 hoặc Text-to-Speech
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      if (audioUrl && audioRef.current) {
        audioRef.current.pause();
      } else {
        stopSpeech();
      }
      setIsPlayingAudio(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    } else {
      setIsPlayingAudio(true);
      setAudioProgress(0);

      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.playbackRate = audioSpeed;
          audioRef.current.play().catch(e => console.log('Audio play error:', e));
        }
      } else if (audioText) {
        speakText(audioText, {
          lang: subjectId === 'english' ? 'en-US' : 'vi-VN',
          rate: audioSpeed,
          onEnd: () => {
            setIsPlayingAudio(false);
            setAudioProgress(100);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          }
        });

        const estDuration = Math.max(1500, (audioText.length / 10) * 1000 / audioSpeed);
        const startTime = Date.now();
        progressIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.round((elapsed / estDuration) * 100));
          setAudioProgress(pct);
          if (pct >= 100) clearInterval(progressIntervalRef.current);
        }, 100);
      }
    }
  };

  const handleReplayAudio = () => {
    stopSpeech();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setTimeout(() => {
      handleToggleAudio();
    }, 150);
  };

  const handleSpeedChange = (newSpeed) => {
    setAudioSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
    if (isPlayingAudio) {
      handleReplayAudio();
    }
  };

  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

  return (
    <div className="my-3 space-y-3">
      {/* 1. KHU VỰC PHÁT VIDEO MP4 NẾU CÓ */}
      {hasVideo && (
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border-3 border-teal-300 relative group">
          <div className="aspect-video max-h-72 w-full flex items-center justify-center bg-black">
            {isYouTube ? (
              <iframe
                src={videoUrl.includes('embed') ? videoUrl : videoUrl.replace('watch?v=', 'embed/')}
                title={title || "Video bài làm"}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                controls
                playsInline
                src={videoUrl}
                className="w-full h-full object-contain"
              >
                Trình duyệt không hỗ trợ phát file video này.
              </video>
            )}
          </div>
          <div className="bg-slate-800/90 px-4 py-2 flex items-center justify-between text-xs font-bold text-teal-200">
            <span className="flex items-center gap-1.5">
              <Film className="w-4 h-4 text-teal-400" />
              <span>{title || "Xem đoạn video MP4 và trả lời câu hỏi bên dưới:"}</span>
            </span>
            <span className="text-[10px] bg-teal-900/80 text-teal-300 px-2 py-0.5 rounded-full border border-teal-700">
              {isYouTube ? 'YouTube' : 'Video MP4'}
            </span>
          </div>
        </div>
      )}

      {/* 2. KHU VỰC PHÁT ÂM THANH MP3 HOẶC BÀI ĐỌC TIẾNG ANH NẾU CÓ */}
      {hasAudio && (
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-2 border-sky-300 rounded-2xl p-3.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5">
              <div className={`p-2.5 rounded-xl text-white shadow-sm transition-all ${
                isPlayingAudio ? 'bg-amber-500 animate-pulse ring-4 ring-amber-200' : 'bg-sky-500'
              }`}>
                {isPlayingAudio ? <Volume2 className="w-5 h-5" /> : <Music className="w-5 h-5" />}
              </div>
              <div>
                <h5 className="font-black text-slate-800 text-xs md:text-sm">
                  {title || (audioUrl ? "Bài Nghe Audio MP3:" : "Nghe Đoạn Âm Thanh Tiếng Anh:")}
                </h5>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {audioUrl ? "Tệp âm thanh MP3 đính kèm câu hỏi" : "Giọng phát âm bản xứ (Web Speech API US)"}
                </p>
              </div>
            </div>

            {/* Điều chỉnh tốc độ nghe cho bé (0.7x chậm, 0.85x vừa, 1.0x chuẩn) */}
            <div className="flex items-center self-start sm:self-auto bg-white border border-sky-200 rounded-xl p-0.5 text-[11px] font-black">
              {[
                { speed: 0.7, label: '0.7x Chậm' },
                { speed: 0.85, label: '0.85x Vừa' },
                { speed: 1.0, label: '1.0x Chuẩn' }
              ].map(item => (
                <button
                  key={item.speed}
                  type="button"
                  onClick={() => handleSpeedChange(item.speed)}
                  className={`px-2 py-1 rounded-lg transition ${
                    audioSpeed === item.speed ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sóng âm / Thanh tiến trình */}
          <div className="w-full bg-sky-100 rounded-full h-2 my-2.5 overflow-hidden border border-sky-200">
            <div 
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-150" 
              style={{ width: `${audioProgress}%` }}
            ></div>
          </div>

          {/* Các nút điều khiển Play/Pause/Replay */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold text-slate-500">
              {isPlayingAudio ? '🔊 Đang phát âm thanh...' : '💡 Bấm nút để nghe đoạn hội thoại'}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReplayAudio}
                className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded-lg transition"
                title="Nghe lại từ đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleAudio}
                className={`px-4 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1.5 transition shadow-sm ${
                  isPlayingAudio
                    ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 ring-2 ring-amber-300'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Bấm để nghe</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hidden native audio element if audioUrl is provided */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => {
                setIsPlayingAudio(false);
                setAudioProgress(100);
              }}
              onTimeUpdate={() => {
                if (audioRef.current && audioRef.current.duration) {
                  const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                  setAudioProgress(pct || 0);
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
