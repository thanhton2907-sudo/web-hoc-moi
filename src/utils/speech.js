// Web Speech API Utility for Text-to-Speech and Speech-to-Text

export const isSpeechSynthesisSupported = () => 'speechSynthesis' in window;
export const isSpeechRecognitionSupported = () => 
  'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

// Speak English or Vietnamese text with Web Speech API
export const speakText = (text, options = {}) => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = options.lang || (options.isEnglish ? 'en-US' : 'vi-VN');
  utterance.lang = lang;
  utterance.rate = options.rate || 0.9; // Slightly slower for primary kids
  utterance.pitch = options.pitch || 1.1; // Friendly higher pitch

  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

// Kid-friendly Web Audio sound effects (Ding, Boing, LevelUp)
export const playKidSound = (type = 'correct') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'correct') {
      // Happy cheerful ding-dong chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start(ctx.currentTime + 0.2);
      osc1.stop(ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    } else if (type === 'wrong') {
      // Gentle boing (not harsh, encourages trying again)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'fanfare') {
      // Victory tune
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    }
  } catch (err) {
    console.warn('Audio effect error:', err);
  }
};

// Speech Recognition for pronunciation evaluation (English / Vietnamese)
export const evaluatePronunciation = (targetWord, onResult, onError) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError('Trình duyệt chưa hỗ trợ ghi âm nhận diện giọng nói. Hãy dùng Google Chrome hoặc Edge nhé!');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    const cleanTarget = targetWord.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanUser = transcript.replace(/[^a-z0-9]/g, '');

    // Similarity score algorithm
    let stars = 1;
    let feedback = 'Bé cố gắng phát âm to và rõ hơn nha!';

    if (cleanUser === cleanTarget) {
      stars = 3;
      feedback = 'Xuất sắc! Phát âm chuẩn như người bản xứ!';
    } else if (cleanUser.includes(cleanTarget) || cleanTarget.includes(cleanUser) || levenshteinDistance(cleanUser, cleanTarget) <= 2) {
      stars = 2;
      feedback = 'Khá lắm! Gần đúng rồi, luyện thêm chút nữa nhé!';
    }

    if (onResult) {
      onResult({
        spoken: transcript,
        stars,
        feedback,
        success: stars >= 2
      });
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error === 'not-allowed' ? 'Bé hãy bấm Cho phép (Allow) micro nhé!' : 'Chưa nhận diện được giọng nói, bé thử lại nào!');
  };

  recognition.start();
  return recognition;
};

// Levenshtein distance for fuzzy matching speech
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
