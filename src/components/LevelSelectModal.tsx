import React, { useState } from 'react';
import { X, Check, Lock } from 'lucide-react';
import { CHAPTERS } from '../data/questions/index';
import { ProgressState } from '../game/types';
import { isLevelUnlocked } from '../game/rules';

interface LevelSelectModalProps {
  open: boolean;
  progress: ProgressState;
  onSelectLevel: (id: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  open,
  progress,
  onSelectLevel,
  onClose,
}) => {
  const initialChapter = Math.min(5, Math.max(1, Math.ceil(progress.currentLevel / 50))) as 1 | 2 | 3 | 4 | 5;
  const [activeChapter, setActiveChapter] = useState<1 | 2 | 3 | 4 | 5>(initialChapter);

  if (!open) return null;

  const chapter = CHAPTERS.find((c) => c.id === activeChapter) ?? CHAPTERS[0];
  const [startId, endId] = chapter.range;
  const levelIds = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);
  const solvedSet = new Set(progress.solvedLevels);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-select-title"
    >
      <div className="w-full max-w-2xl bg-white border-2 border-slate-800 rounded-3xl shadow-[0_8px_0_0_#1E293B] flex flex-col max-h-[88vh] overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 id="level-select-title" className="text-xl font-extrabold text-slate-900">
              Chọn Màn Chơi (250 Câu)
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Đã mở khóa tới câu <span className="font-mono-num font-bold text-slate-800">{progress.highestUnlocked}</span> · Đã giải{' '}
              <span className="font-mono-num font-bold text-emerald-600">{progress.solvedLevels.length}</span>/250
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng danh sách màn chơi"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          {CHAPTERS.map((ch) => {
            const isActive = ch.id === activeChapter;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChapter(ch.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {ch.range[0]}–{ch.range[1]}
              </button>
            );
          })}
        </div>

        {/* Chapter Subtitle */}
        <div className="px-5 pt-3 pb-1 text-xs font-bold text-slate-500">
          Chương {chapter.id}: {chapter.title}
        </div>

        {/* 50-Level Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-5 sm:grid-cols-10 gap-2.5">
          {levelIds.map((id) => {
            const unlocked = isLevelUnlocked(progress, id);
            const solved = solvedSet.has(id);
            const isCurrent = id === progress.currentLevel;

            return (
              <button
                key={id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectLevel(id)}
                aria-label={
                  !unlocked
                    ? `Câu ${id} chưa mở khóa`
                    : solved
                    ? `Câu ${id} đã giải`
                    : `Chơi câu ${id}`
                }
                className={`relative h-11 rounded-xl border-2 font-mono-num text-sm font-bold flex items-center justify-center transition-all ${
                  !unlocked
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-blue-600 border-slate-900 text-white shadow-[0_2px_0_0_#1E293B] cursor-pointer'
                    : solved
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                    : 'bg-white border-slate-800 text-slate-800 hover:bg-amber-50 cursor-pointer'
                }`}
              >
                <span>{id}</span>
                {solved && !isCurrent && (
                  <Check className="w-3 h-3 text-emerald-600 absolute top-0.5 right-0.5 stroke-[3]" />
                )}
                {!unlocked && (
                  <Lock className="w-2.5 h-2.5 text-slate-400 absolute bottom-0.5 right-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
