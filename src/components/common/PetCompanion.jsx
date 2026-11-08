import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Sparkles, Heart, RefreshCw, X, Check, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PET_CATALOG = {
  cat: {
    id: 'cat',
    avatar: '🐱',
    defaultName: 'Miu Miu',
    stages: ['Bé Mèo Con', 'Mèo Đi Hài', 'Đại Hiệp Mèo'],
    quotes: ['Meo meo! Hôm nay bé học chăm chỉ quá!', 'Cố lên bé ơi, bạn là giỏi nhất!', 'Học vui mỗi ngày cùng Miu nhé!'],
    description: 'Bé mèo lanh lợi, đáng yêu và thích được khen ngợi.'
  },
  dog: {
    id: 'dog',
    avatar: '🐶',
    defaultName: 'Lu Lu',
    stages: ['Cún Con', 'Cún Trinh Sát', 'Thần Khuyển'],
    quotes: ['Gâu gâu! Chúng ta lại cùng nhau học bài rồi!', 'Bé làm đúng bài này chắc chắn được 10 điểm!', 'Cố lên bạn ơi, tôi luôn bên bạn!'],
    description: 'Chú cún con trung thành, luôn tràn đầy năng lượng tích cực.'
  },
  rabbit: {
    id: 'rabbit',
    avatar: '🐰',
    defaultName: 'Bim Bim',
    stages: ['Thỏ Nhí', 'Thỏ Siêu Tốc', 'Thỏ Tiên Thông Thái'],
    quotes: ['Nhảy nhót cùng kiến thức mới nào!', 'Bé giải toán nhanh như thỏ chạy luôn!', 'Thông minh và nhanh nhẹn tuyệt vời!'],
    description: 'Thỏ ngọc xinh xắn, nhanh trí và thích khám phá điều mới.'
  },
  lion: {
    id: 'lion',
    avatar: '🦁',
    defaultName: 'Leo Leo',
    stages: ['Sư Tử Tí Hon', 'Sư Tử Dũng Mãnh', 'Vua Sư Tử'],
    quotes: ['Gầm! Chúng ta cùng chinh phục điểm 10 nào!', 'Bài này không làm khó được bạn đâu!', 'Tuyệt vời lắm bạn dũng cảm của tôi!'],
    description: 'Sư tử vàng dũng mãnh, giúp bé tự tin vượt qua bài toán khó.'
  },
  panda: {
    id: 'panda',
    avatar: '🐼',
    defaultName: 'Panda Bo',
    stages: ['Gấu Trúc Con', 'Gấu Trúc Trúc Diệp', 'Đại Hiệp Gấu Trúc'],
    quotes: ['Ăn xong lá trúc rồi, cùng luyện tập thôi!', 'Bình tĩnh suy nghĩ là ra đáp án ngay!', 'Bé giỏi quá đi mất thôi!'],
    description: 'Gấu trúc tròn xoe hiền lành, dạy bé tính kiên nhẫn và cẩn thận.'
  },
  fox: {
    id: 'fox',
    avatar: '🦊',
    defaultName: 'Foxy',
    stages: ['Cáo Nhỏ', 'Cáo Nhanh Trí', 'Hồ Ly Thông Thái'],
    quotes: ['Mẹo hay đây rồi, để mình chỉ cho bé nhé!', 'Tư duy logic của bạn đỉnh thật đấy!', 'Cùng khám phá bài học thú vị nào!'],
    description: 'Chú cáo thông minh, khéo léo với tư duy suy luận cực bén.'
  },
  dragon: {
    id: 'dragon',
    avatar: '🐲',
    defaultName: 'Draki',
    stages: ['Rồng Nhí', 'Rồng Bay Lượn', 'Thần Rồng Thông Thái'],
    quotes: ['Phù! Trí tuệ của bé đang tỏa sáng rực rỡ!', 'Bay cao cùng tri thức nhé!', 'Một bài học nữa là sắp tiến hóa rồi!'],
    description: 'Rồng thần kỳ diệu mang lại may mắn và sức mạnh học tập.'
  },
  unicorn: {
    id: 'unicorn',
    avatar: '🦄',
    defaultName: 'Uni Cầu Vồng',
    stages: ['Kỳ Lân Nhỏ', 'Kỳ Lân Ánh Sáng', 'Bạch Mã Hoàng Gia'],
    quotes: ['Phép màu của tri thức đang ở đây!', 'Bé học giỏi và tỏa sáng như cầu vồng!', 'Chúc bé ngày càng tiến bộ nhé!'],
    description: 'Kỳ lân lấp lánh mang phép màu niềm vui đến mỗi bài học.'
  },
  penguin: {
    id: 'penguin',
    avatar: '🐧',
    defaultName: 'Pingo',
    stages: ['Cánh Cụt Nhí', 'Tay Lướt Tuyết', 'Vua Băng Giá'],
    quotes: ['Trượt băng vèo vèo qua từng câu hỏi!', 'Lạnh nhưng lòng tràn đầy quyết tâm học!', 'Hay lắm, tiếp tục phát huy nhé!'],
    description: 'Chim cánh cụt ngộ nghĩnh bước đi lắc lư cực kỳ vui vẻ.'
  }
};

export const PetCompanion = ({ pet }) => {
  const { currentStudent, activeStudentId, updatePet } = useApp();

  const [showQuote, setShowQuote] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);

  // Active pet data
  const currentPetData = pet || currentStudent?.pet || { type: 'cat', name: 'Miu Miu', level: 1, exp: 0, maxExp: 80 };
  const petInfo = PET_CATALOG[currentPetData.type] || PET_CATALOG.cat;
  const stageName = petInfo.stages[Math.min(currentPetData.level - 1, petInfo.stages.length - 1)] || 'Bạn Đồng Hành';

  // Form states cho Modal Đổi Thú Cưng
  const [selectedType, setSelectedType] = useState(currentPetData.type || 'cat');
  const [petCustomName, setPetCustomName] = useState(currentPetData.name || petInfo.defaultName);

  const handlePetClick = () => {
    setShowQuote(true);
    setQuoteIndex((prev) => (prev + 1) % petInfo.quotes.length);
    setTimeout(() => {
      setShowQuote(false);
    }, 4000);
  };

  const handleOpenModal = (e) => {
    e.stopPropagation();
    setSelectedType(currentPetData.type || 'cat');
    setPetCustomName(currentPetData.name || petInfo.defaultName);
    setIsChangeModalOpen(true);
  };

  const handleSelectAnimal = (typeKey) => {
    setSelectedType(typeKey);
    // Nếu chưa đổi tên riêng thì gợi ý tên mặc định của loài đó
    const newAnimal = PET_CATALOG[typeKey];
    if (newAnimal) {
      setPetCustomName(newAnimal.defaultName);
    }
  };

  const handleSavePet = (e) => {
    e.preventDefault();
    const finalName = petCustomName.trim() || PET_CATALOG[selectedType]?.defaultName || 'Bạn Thú';

    if (updatePet) {
      const studentIdToUpdate = currentStudent?.id || activeStudentId || 's1';
      updatePet(studentIdToUpdate, {
        type: selectedType,
        name: finalName
      });
    }

    confetti({ particleCount: 70, spread: 60 });
    setIsChangeModalOpen(false);
  };

  return (
    <>
      <div 
        onClick={handleOpenModal}
        className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-3 border-amber-300 hover:border-amber-400 rounded-3xl p-4 shadow-sm cartoon-card cursor-pointer transition group"
        title="Bấm vào để đổi loài thú cưng hoặc đặt tên cho bé thú!"
      >
        {/* Nút Đổi Thú Cưng ở góc trên thẻ */}
        <button
          onClick={handleOpenModal}
          type="button"
          className="absolute -top-2.5 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-[11px] px-3 py-1 rounded-full border-2 border-white shadow-md flex items-center space-x-1.5 transition transform group-hover:scale-105 active:scale-95 z-10"
          title="Bấm để đổi bạn thú cưng và đổi tên bạn thú!"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-amber-950" />
          <span>Đổi Thú & Tên 🐾</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Pet Avatar with interactive bounce & click to talk */}
          <div 
            onClick={(e) => { e.stopPropagation(); handlePetClick(); }}
            className="relative cursor-pointer group/avatar shrink-0"
            title="Bấm vào để trò chuyện cùng bạn thú cưng!"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-inner border-2 border-amber-200 group-hover/avatar:scale-110 transition-transform">
              {petInfo.avatar}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-xs">
              Lv.{currentPetData.level || 1}
            </span>
          </div>

          {/* Pet Info & Exp */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider block truncate">
                  {stageName}
                </span>
                <h4 
                  className="font-black text-slate-900 text-base flex items-center gap-1 truncate group-hover:text-amber-700 transition"
                >
                  <span className="truncate">{currentPetData.name}</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                </h4>
              </div>
              <span className="text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
                {currentPetData.exp || 0}/{currentPetData.maxExp || 80} EXP
              </span>
            </div>

            {/* Exp Bar */}
            <div className="w-full bg-amber-100 rounded-full h-2.5 mt-1.5 overflow-hidden border border-amber-200">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(((currentPetData.exp || 0) / (currentPetData.maxExp || 80)) * 100))}%` }}
              ></div>
            </div>

            <div className="text-[10px] text-amber-800/80 font-bold mt-1 flex items-center gap-1">
              <span>✏️ Chạm để đổi tên & chọn thú cưng</span>
            </div>
          </div>
        </div>

        {/* Speech Bubble when pet is clicked */}
        {showQuote && (
          <div className="absolute -top-14 left-4 right-4 bg-white border-2 border-amber-400 rounded-2xl px-3 py-2 shadow-xl text-xs font-black text-amber-950 animate-bounce z-20 text-center">
            {petInfo.quotes[quoteIndex]}
            <div className="absolute -bottom-2 left-8 w-3 h-3 bg-white border-b-2 border-r-2 border-amber-400 transform rotate-45"></div>
          </div>
        )}
      </div>

      {/* MODAL: CHỌN & ĐỔI BẠN THÚ CƯNG (CĂN GIỮA MÀN HÌNH) */}
      {isChangeModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex min-h-screen items-center justify-center p-3 sm:p-6">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative my-auto bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden text-slate-800 animate-scale-up"
          >
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🐾</span>
                <div>
                  <h3 className="font-display font-black text-base md:text-lg leading-tight">
                    Chọn & Đổi Bạn Thú Cưng Của Bé
                  </h3>
                  <p className="text-[11px] text-amber-100 font-medium">
                    Chọn người bạn đồng hành và đặt tên theo sở thích của bé!
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsChangeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form chọn thú cưng */}
            <form onSubmit={handleSavePet} className="p-5 space-y-4">
              {/* Danh sách 9 bạn thú cưng */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                  1. Chọn bạn thú cưng yêu thích của bé:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {Object.values(PET_CATALOG).map(animal => {
                    const isSelected = selectedType === animal.id;
                    return (
                      <div
                        key={animal.id}
                        onClick={() => handleSelectAnimal(animal.id)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition text-center flex flex-col items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-300 scale-102'
                            : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-3xl mb-1 transform group-hover:scale-110 transition">
                          {animal.avatar}
                        </div>
                        <div className="font-black text-xs text-slate-800 leading-tight">
                          {animal.stages[0]}
                        </div>
                        <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                          Tên: {animal.defaultName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ô đặt tên cho bạn thú cưng */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                <label className="block text-xs font-black text-amber-950">
                  2. Đặt tên riêng cho bạn thú cưng của bé:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Miu Miu, Cún Bắp, Bé Đậu Đậu..."
                    value={petCustomName}
                    onChange={(e) => setPetCustomName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border-2 border-amber-300 rounded-xl text-xs font-black focus:border-amber-500 focus:outline-none bg-white shadow-inner"
                  />
                </div>
                <div className="text-[10px] text-amber-800 font-medium italic">
                  💡 Lời nhắn từ {petCustomName || 'bạn thú'}: "{PET_CATALOG[selectedType]?.quotes[0]}"
                </div>
              </div>

              {/* Nút lưu */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsChangeModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Để Sau
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl text-xs shadow-md transition transform active:scale-95 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Chọn Bạn Này Làm Bạn Đồng Hành!</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
