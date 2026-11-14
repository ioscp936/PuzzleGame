import React, { useState } from 'react';
import { Play, Grid, RotateCcw } from 'lucide-react';
import { ProgressState } from '../game/types';
import { TOTAL_LEVELS, calculateCompletionPercent } from '../game/rules';

interface TitleScreenProps {
  progress: ProgressState;
  onStart: (levelId?: number) => void;
  onOpenLevelSelect: () => void;
  onResetAll: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  progress,
  onStart,
  onOpenLevelSelect,
  onResetAll,
}) => {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const hasProgress = progress.solvedLevels.length > 0 || progress.currentLevel > 1;
  const pct = calculateCompletionPercent(progress.solvedLevels.length);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    setEyeOffset({ x: nx, y: ny });
  };

  return (
    <main
      onPointerMove={handlePointerMove}
      className="min-h-screen w-full sketch-grid-bg flex flex-col items-center justify-between px-4 py-8 sm:py-12 select-none"
    >
      <div aria-hidden="true" className="h-2" />

      <section className="w-full max-w-2xl flex flex-col items-center text-center gap-7 animate-pop-in">
        {/* Interactive Hero Mascot & Custom SVG Title Emblem */}
        <div className="relative flex flex-col items-center">
          <div className="animate-float-gentle mb-2">
            <svg
              width="148"
              height="128"
              viewBox="0 0 148 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Lightbulb glow ray */}
              <line x1="74" y1="6" x2="74" y2="16" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
              <line x1="46" y1="14" x2="53" y2="22" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
              <line x1="102" y1="14" x2="95" y2="22" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />

              {/* Sketchbook Brain Body */}
              <path
                d="M36 74 C22 74, 18 54, 30 44 C26 28, 46 18, 60 26 C68 16, 86 18, 92 28 C108 22, 124 34, 118 48 C130 56, 126 76, 110 78 C110 92, 94 102, 74 100 C54 102, 36 92, 36 74 Z"
                fill="#FCA5A5"
                stroke="#1E293B"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Brain Squiggles */}
              <path
                d="M52 36 C56 44, 46 48, 50 56"
                stroke="#1E293B"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M96 36 C92 44, 102 48, 96 56"
                stroke="#1E293B"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Eyes following cursor */}
              <circle cx="58" cy="60" r="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
              <circle cx="90" cy="60" r="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
              <circle
                cx={58 + eyeOffset.x * 0.5}
                cy={60 + eyeOffset.y * 0.5}
                r="4.5"
                fill="#1E293B"
              />
              <circle
                cx={90 + eyeOffset.x * 0.5}
                cy={60 + eyeOffset.y * 0.5}
                r="4.5"
                fill="#1E293B"
              />
              {/* Cheeky Smile */}
              <path
                d="M62 77 Q74 87 86 77"
                stroke="#1E293B"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Cheek blush */}
              <ellipse cx="44" cy="70" rx="5" ry="3" fill="#FB7185" opacity="0.7" />
              <ellipse cx="104" cy="70" rx="5" ry="3" fill="#FB7185" opacity="0.7" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight text-balance">
            Hack Não <span className="text-blue-600 font-mono-num">250</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-md leading-relaxed">
            250 câu hỏi đố mẹo tương tác đầy bất ngờ. Kéo, chạm, chà, lắc và tư duy ngược để phá đảo mọi thử thách.
          </p>
        </div>

        {/* Clean Unboxed Progress Readout if returning player */}
        {hasProgress && (
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-600">
            <span>
              Đã giải <strong className="text-slate-900 font-mono-num">{progress.solvedLevels.length}/{TOTAL_LEVELS}</strong> câu
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Hoàn thành <strong className="text-emerald-600 font-mono-num">{pct}%</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Gợi ý: <strong className="text-amber-600 font-mono-num">{progress.hints}</strong>
            </span>
          </div>
        )}

        {/* Primary Menu CTAs (<= 3 actions) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <button
            type="button"
            data-start="true"
            onClick={() => onStart(progress.currentLevel)}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base shadow-[0_4px_0_0_#1D4ED8] transition-all whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{hasProgress ? `Tiếp tục câu ${progress.currentLevel}` : 'Bắt đầu chơi'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenLevelSelect}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-bold text-base border-2 border-slate-800 shadow-[0_4px_0_0_#1E293B] transition-all whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"
          >
            <Grid className="w-5 h-5" />
            <span>Chọn màn (250)</span>
          </button>
        </div>

        {hasProgress && (
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại toàn bộ tiến trình</span>
          </button>
        )}
      </section>

      {/* Single flat borderless control hint in bottom safe margin */}
      <p className="text-xs font-medium text-slate-500 tracking-wide">
        Enter / Space Bắt đầu · Chuột / Chạm Tương tác · Esc Tạm dừng
      </p>
    </main>
  );
};
