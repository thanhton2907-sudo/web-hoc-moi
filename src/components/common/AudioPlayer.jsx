import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { speakText, stopSpeech } from '../../utils/speech';

export const AudioPlayer = ({ 
  audioUrl, 
  speechText, 
  isEnglish = true, 
  title = "Nghe âm thanh", 
  onFinished,
  compact = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.85); // primary school friendly default
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handlePlayToggle = () => {
    if (isPlaying) {
      if (audioUrl && audioRef.current) {
        audioRef.current.pause();
      } else {
        stopSpeech();
      }
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    } else {
      setIsPlaying(true);
      setProgress(0);

      if (audioUrl) {
        // Native audio element
        if (audioRef.current) {
          audioRef.current.playbackRate = speed;
          audioRef.current.play();
        }
      } else if (speechText) {
        // Web Speech API synthesis
        speakText(speechText, {
          lang: isEnglish ? 'en-US' : 'vi-VN',
          rate: speed,
          onEnd: () => {
            setIsPlaying(false);
            setProgress(100);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (onFinished) onFinished();
          }
        });

        // Simulate progress bar based on estimated length
        const estDuration = Math.max(1500, (speechText.length / 10) * 1000 / speed);
        const startTime = Date.now();
        progressIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.round((elapsed / estDuration) * 100));
          setProgress(pct);
          if (pct >= 100) clearInterval(progressIntervalRef.current);
        }, 100);
      }
    }
  };

  const handleReplay = () => {
    stopSpeech();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setTimeout(() => {
      handlePlayToggle();
    }, 150);
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
    if (isPlaying) {
      // restart with new speed
      handleReplay();
    }
  };

  if (compact) {
    return (
      <button 
        onClick={handlePlayToggle}
        title="Nghe phát âm"
        className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
          isPlaying 
            ? 'bg-amber-400 text-amber-900 shadow-md animate-pulse ring-4 ring-amber-200' 
            : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
        }`}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-sky-500 text-white rounded-xl shadow-sm">
            <Volume2 className="w-5 h-5" />
          </span>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
            <p className="text-xs text-slate-500">
              {isEnglish ? 'Web Speech API (Giọng bản xứ US)' : 'Giọng đọc Tiếng Việt'}
            </p>
          </div>
        </div>

        {/* Speed toggle */}
        <div className="flex items-center bg-white border border-sky-200 rounded-xl p-1 text-xs font-bold">
          <button 
            onClick={() => changeSpeed(0.7)}
            className={`px-2 py-1 rounded-lg ${speed === 0.7 ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            0.7x Chậm
          </button>
          <button 
            onClick={() => changeSpeed(0.9)}
            className={`px-2 py-1 rounded-lg ${speed === 0.9 ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Chuẩn
          </button>
          <button 
            onClick={() => changeSpeed(1.1)}
            className={`px-2 py-1 rounded-lg ${speed === 1.1 ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            1.1x Nhanh
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-sky-100 rounded-full h-2.5 my-3 overflow-hidden">
        <div 
          className="bg-sky-500 h-2.5 rounded-full transition-all duration-150" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button 
          onClick={handleReplay}
          className="p-2.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded-xl transition"
          title="Nghe lại từ đầu"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button 
          onClick={handlePlayToggle}
          className={`px-6 py-2.5 rounded-2xl font-bold flex items-center space-x-2 transition shadow-md btn-kid ${
            isPlaying 
              ? 'bg-amber-400 hover:bg-amber-500 text-amber-950' 
              : 'bg-sky-500 hover:bg-sky-600 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Tạm dừng</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Nghe bài đọc</span>
            </>
          )}
        </button>
      </div>

      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => {
            setIsPlaying(false);
            setProgress(100);
            if (onFinished) onFinished();
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
              setProgress(pct || 0);
            }
          }}
        />
      )}
    </div>
  );
};
