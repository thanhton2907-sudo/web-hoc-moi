import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { speakText } from '../../utils/speech';

export const VoiceGuideButton = ({ text, tooltip = "Bấm để nghe cô đọc hướng dẫn", className = "" }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!text) return;
    setSpeaking(true);
    speakText(text, {
      lang: 'vi-VN',
      rate: 0.85,
      pitch: 1.1,
      onEnd: () => setSpeaking(false)
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-bold text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 border-2 border-amber-300 transition-all shadow-sm ${className}`}
    >
      {speaking ? (
        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
      ) : (
        <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
      )}
      <span>Đọc hướng dẫn</span>
    </button>
  );
};
