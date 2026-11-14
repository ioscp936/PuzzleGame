import React from 'react';
import { ArrowRight, CheckCircle2, Play, RotateCcw, Home, Trophy } from 'lucide-react';
import { ProgressState, PuzzleQuestion } from '../game/types';
import { TOTAL_LEVELS } from '../game/rules';

interface SolvedModalProps {
  question: PuzzleQuestion;
  onNext: () => void;
}

export const SolvedModal: React.FC<SolvedModalProps> = ({ question, onNext }) => {
  const isFinal = question.id >= TOTAL_LEVELS;

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/55 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="solved-title"
    >
      <div className="w-full max-w-md bg-white border-2 border-slate-800 rounded-3xl shadow-[0_8px_0_0_#1E293B] p-6 text-center animate-pop-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center text-emerald-600 mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 id="solved-title" className="text-2xl font-extrabold text-slate-900">
          Chuẩn không cần chỉnh!
        </h2>
        <p className="text-xs font-bold text-emerald-700 mt-1">
          Hoàn thành Câu {question.id}/{TOTAL_LEVELS} · +1 Bóng đèn gợi ý
        </p>

        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-slate-800 leading-relaxed text-left">
          <span className="font-bold text-amber-900">Giải thích mẹo: </span>
          {question.explanation}
        </div>

        <button
          type="button"
          autoFocus
          onClick={onNext}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-[0_4px_0_0_#047857] cursor-pointer active:translate-y-0.5 transition-all"
        >
          <span>{isFinal ? 'Xem cúp tổng kết' : `Sang câu ${question.id + 1}`}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface PauseModalProps {
  progress: ProgressState;
  onResume: () => void;
  onRestartStage: () => void;
  onBackToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  progress,
  onResume,
  onRestartStage,
  onBackToTitle,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-sm bg-white border-2 border-slate-800 rounded-3xl shadow-[0_8px_0_0_#1E293B] p-6 text-center animate-pop-in">
        <h2 id="pause-title" className="text-2xl font-extrabold text-slate-900">
          Tạm dừng
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500">Đã giải</div>
            <div className="text-lg font-extrabold text-slate-900 font-mono-num">
              {progress.solvedLevels.length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500">Chuỗi</div>
            <div className="text-lg font-extrabold text-emerald-600 font-mono-num">
              {progress.currentStreak}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500">Gợi ý</div>
            <div className="text-lg font-extrabold text-amber-600 font-mono-num">
              {progress.hints}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_3px_0_0_#1D4ED8] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Tiếp tục chơi</span>
          </button>

          <button
            type="button"
            onClick={onRestartStage}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-800 font-bold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại màn này</span>
          </button>

          <button
            type="button"
            onClick={onBackToTitle}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Về màn hình chính</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryAllModalProps {
  progress: ProgressState;
  onPlayAgain: () => void;
  onBackToTitle: () => void;
}

export const VictoryAllModal: React.FC<VictoryAllModalProps> = ({
  progress,
  onPlayAgain,
  onBackToTitle,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-all-title"
    >
      <div className="w-full max-w-md bg-white border-2 border-slate-800 rounded-3xl shadow-[0_8px_0_0_#1E293B] p-6 text-center animate-pop-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-amber-600 mb-3">
          <Trophy className="w-9 h-9" />
        </div>

        <h2 id="victory-all-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Phá Đảo 250 Câu Hỏi!
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Trí tuệ siêu phàm! Bạn đã vượt qua toàn bộ thử thách hóc búa nhất của Hack Não 250.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-700">Hoàn thành</div>
            <div className="text-lg font-extrabold text-emerald-900 font-mono-num">
              {progress.solvedLevels.length}/250
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-[11px] font-bold text-amber-700">Gợi ý dùng</div>
            <div className="text-lg font-extrabold text-amber-900 font-mono-num">
              {progress.hintsUsed}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="text-[11px] font-bold text-blue-700">Chuỗi max</div>
            <div className="text-lg font-extrabold text-blue-900 font-mono-num">
              {progress.bestStreak}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_4px_0_0_#1D4ED8] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại từ Câu 1</span>
          </button>

          <button
            type="button"
            onClick={onBackToTitle}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Về màn hình chính</span>
          </button>
        </div>
      </div>
    </div>
  );
};
