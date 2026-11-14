import React from 'react';
import { Grid, Lightbulb, RotateCcw, Volume2, VolumeX, Pause } from 'lucide-react';
import { ProgressState } from '../game/types';
import { TOTAL_LEVELS } from '../game/rules';

interface GameHudProps {
  levelId: number;
  chapterTitle: string;
  progress: ProgressState;
  muted: boolean;
  onOpenLevelSelect: () => void;
  onUseHint: () => void;
  onResetStage: () => void;
  onToggleMute: () => void;
  onPause: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  levelId,
  chapterTitle,
  progress,
  muted,
  onOpenLevelSelect,
  onUseHint,
  onResetStage,
  onToggleMute,
  onPause,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-2 flex items-center justify-between gap-2 sm:gap-3">
      {/* Left: Level Map & Current Level Readout */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpenLevelSelect}
          aria-label="Mở danh sách 250 câu hỏi"
          className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-800 shadow-[0_2px_0_0_#1E293B] text-slate-800 inline-flex items-center gap-1.5 text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer active:translate-y-0.5 transition-all"
        >
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline">Danh sách</span>
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono-num whitespace-nowrap">
              Câu {levelId}
              <span className="text-slate-400 text-xs sm:text-sm font-semibold">/{TOTAL_LEVELS}</span>
            </span>
            <span className="hidden md:inline text-xs font-semibold text-slate-500 truncate">
              · {chapterTitle}
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap truncate">
            Đã giải <span className="font-mono-num text-slate-800 font-bold">{progress.solvedLevels.length}</span>
            {progress.currentStreak > 1 && (
              <span className="hidden sm:inline">
                <span aria-hidden="true"> · </span>
                <span className="text-emerald-700 font-semibold">
                  Chuỗi {progress.currentStreak}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Action & Utility Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onUseHint}
          aria-label={`Dùng gợi ý, hiện có ${progress.hints} bóng đèn`}
          className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-slate-800 shadow-[0_2px_0_0_#1E293B] text-slate-900 inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer active:translate-y-0.5 transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-100" />
          <span className="hidden sm:inline">Gợi ý</span>
          <span className="font-mono-num">({progress.hints})</span>
        </button>

        <button
          type="button"
          onClick={onResetStage}
          aria-label="Làm lại màn này"
          title="Làm lại màn này"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-800 shadow-[0_2px_0_0_#1E293B] text-slate-700 inline-flex items-center justify-center shrink-0 cursor-pointer active:translate-y-0.5 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-800 shadow-[0_2px_0_0_#1E293B] text-slate-700 inline-flex items-center justify-center shrink-0 cursor-pointer active:translate-y-0.5 transition-all"
        >
          {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onPause}
          aria-label="Tạm dừng trò chơi"
          title="Tạm dừng (Esc)"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-800 shadow-[0_2px_0_0_#1E293B] text-slate-700 inline-flex items-center justify-center shrink-0 cursor-pointer active:translate-y-0.5 transition-all"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
