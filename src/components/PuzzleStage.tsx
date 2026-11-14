import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, SkipForward, Smartphone, Sparkles, AlertCircle, PlusCircle } from 'lucide-react';
import { ProgressState, PuzzleQuestion, StageItem } from '../game/types';
import {
  checkDistanceOverlap,
  evaluateKeypadAnswer,
  evaluateSequenceTap,
  isDraggedAway,
  SKIP_COST,
} from '../game/rules';
import { SpriteGraphic, SPRITE_LABELS_VI } from './SpriteGraphic';
import { soundFX } from '../game/sound';

interface PuzzleStageProps {
  question: PuzzleQuestion;
  progress: ProgressState;
  hintVisible: boolean;
  onSolved: () => void;
  onSkip: () => void;
  onRechargeHints: () => void;
}

export const PuzzleStage: React.FC<PuzzleStageProps> = ({
  question,
  progress,
  hintVisible,
  onSolved,
  onSkip,
  onRechargeHints,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Item positions (initialized from question.items)
  const [items, setItems] = useState<StageItem[]>(() => question.items ?? []);
  const [openedIds, setOpenedIds] = useState<Set<string>>(() => new Set());
  const [sequenceProgress, setSequenceProgress] = useState<string[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [rubProgress, setRubProgress] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [waitLeft, setWaitLeft] = useState<number>(question.waitSeconds ?? 0);
  const [keypadValue, setKeypadValue] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  const [dodgedOptionId, setDodgedOptionId] = useState<string | null>(null);

  const solvedRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickIdRef = useRef<string | null>(null);

  // Reset local stage state whenever question.id changes
  useEffect(() => {
    solvedRef.current = false;
    setItems(question.items ?? []);
    setOpenedIds(new Set());
    setSequenceProgress([]);
    setTapCount(0);
    setRubProgress(0);
    setHoldProgress(0);
    setShakeCount(0);
    setIsShaking(false);
    setWaitLeft(question.waitSeconds ?? 0);
    setKeypadValue('');
    setFeedbackError(null);
    setShakeCard(false);
    setDodgedOptionId(null);
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, [question]);

  const triggerSolved = () => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    soundFX.playSuccess();
    onSolved();
  };

  const triggerWrong = (msg = 'Chưa đúng rồi, thử nghĩ mẹo khác xem!') => {
    soundFX.playWrong();
    setFeedbackError(msg);
    setShakeCard(true);
    window.setTimeout(() => setShakeCard(false), 380);
  };

  // Wait timer countdown
  useEffect(() => {
    if (question.mechanic !== 'wait') return;
    if (waitLeft <= 0) {
      triggerSolved();
      return;
    }
    const timer = window.setTimeout(() => {
      setWaitLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.mechanic, waitLeft]);

  // Shake handler
  const handleShakeAction = () => {
    if (solvedRef.current || question.mechanic !== 'shake') return;
    soundFX.playTap();
    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), 420);
    const next = shakeCount + 1;
    setShakeCount(next);
    const req = question.requiredCount ?? 4;
    if (next >= req) {
      triggerSolved();
    }
  };

  // Keyboard shortcut 'S' for shake mechanic
  useEffect(() => {
    if (question.mechanic !== 'shake') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        handleShakeAction();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.mechanic, shakeCount]);

  // Dragging logic
  const handleItemPointerDown = (e: React.PointerEvent<HTMLButtonElement>, item: StageItem) => {
    if (solvedRef.current) return;

    if (question.mechanic === 'hold' && item.id === question.targetId) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const totalMs = (question.holdSeconds ?? 1.4) * 1000;
      const startTime = Date.now();
      if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
        setHoldProgress(pct);
        if (pct >= 100) {
          if (holdTimerRef.current) {
            window.clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
          }
          triggerSolved();
        }
      }, 40);
      return;
    }

    if (!item.draggable) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragStateRef.current = {
      id: item.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: item.x,
      startY: item.y,
      moved: false,
    };
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const dxPx = e.clientX - drag.startClientX;
    const dyPx = e.clientY - drag.startClientY;
    if (Math.hypot(dxPx, dyPx) > 6) {
      drag.moved = true;
    }
    const newX = Math.max(-6, Math.min(106, drag.startX + (dxPx / rect.width) * 100));
    const newY = Math.max(-6, Math.min(106, drag.startY + (dyPx / rect.height) * 100));

    setItems((prev) =>
      prev.map((it) => (it.id === drag.id ? { ...it, x: newX, y: newY } : it))
    );
  };

  const handleStagePointerUp = () => {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
      if (!solvedRef.current) setHoldProgress(0);
    }

    const drag = dragStateRef.current;
    if (!drag) return;
    dragStateRef.current = null;

    if (drag.moved) {
      suppressClickIdRef.current = drag.id;
      window.setTimeout(() => {
        suppressClickIdRef.current = null;
      }, 80);

      const draggedItem = items.find((i) => i.id === drag.id);
      if (!draggedItem) return;

      if (question.mechanic === 'drag-away' && draggedItem.id === question.targetId) {
        if (isDraggedAway({ x: draggedItem.x, y: draggedItem.y })) {
          triggerSolved();
          return;
        }
      }

      if (question.mechanic === 'drag-to-target') {
        const target = items.find((i) => i.id === question.targetId);
        if (target && checkDistanceOverlap(draggedItem, target, 18)) {
          if (draggedItem.isTrap) {
            triggerWrong('Món này không hợp rồi! Thử kéo thứ khác xem.');
            return;
          }
          if (draggedItem.id === question.dragSourceId) {
            if (question.prerequisiteTapId && !openedIds.has(question.prerequisiteTapId)) {
              triggerWrong('Khoan đã! Bạn chưa mở cửa tủ lạnh ra kìa!');
              return;
            }
            triggerSolved();
          }
        }
      }
    }
  };

  const handleItemPointerMoveRub = (item: StageItem) => {
    if (solvedRef.current || question.mechanic !== 'rub' || item.id !== question.targetId) return;
    setRubProgress((prev) => {
      const next = Math.min(100, prev + 8);
      if (next >= 100) {
        triggerSolved();
      }
      return next;
    });
  };

  const handleItemClick = (item: StageItem) => {
    if (solvedRef.current) return;
    if (suppressClickIdRef.current === item.id) return;

    setFeedbackError(null);

    // Wait mechanic traps
    if (question.mechanic === 'wait') {
      setWaitLeft(question.waitSeconds ?? 3);
      triggerWrong('Ôi! Bạn chạm tay mất rồi, đếm lại từ đầu nhé!');
      return;
    }

    // Rub mechanic fallback click for keyboard/tap accessibility
    if (question.mechanic === 'rub' && item.id === question.targetId) {
      soundFX.playTap();
      setRubProgress((prev) => {
        const next = Math.min(100, prev + 25);
        if (next >= 100) triggerSolved();
        return next;
      });
      return;
    }

    // Prerequisite tap (e.g., open fridge door)
    if (question.prerequisiteTapId && item.id === question.prerequisiteTapId) {
      soundFX.playTap();
      setOpenedIds((prev) => new Set(prev).add(item.id));
      return;
    }

    // Tap count mechanic
    if (question.mechanic === 'tap-count') {
      if (item.id === question.targetId) {
        soundFX.playTap();
        const next = tapCount + 1;
        setTapCount(next);
        if (next >= (question.requiredCount ?? 5)) {
          triggerSolved();
        }
      } else if (item.isTrap) {
        triggerWrong();
      }
      return;
    }

    // Tap sequence mechanic
    if (question.mechanic === 'tap-sequence' && question.sequenceIds) {
      const res = evaluateSequenceTap(question.sequenceIds, sequenceProgress, item.id);
      if (res.status === 'wrong') {
        setSequenceProgress([]);
        triggerWrong('Sai thứ tự mất rồi! Bấm lại từ bước 1 nhé.');
      } else if (res.status === 'progress') {
        soundFX.playTap();
        setSequenceProgress(res.nextProgress);
      } else {
        setSequenceProgress(res.nextProgress);
        triggerSolved();
      }
      return;
    }

    // Tap target mechanic
    if (question.mechanic === 'tap-target') {
      if (item.id === question.targetId) {
        triggerSolved();
      } else if (item.isTrap) {
        triggerWrong();
      }
      return;
    }

    // Any trap on other mechanics
    if (item.isTrap) {
      triggerWrong();
    }
  };

  const handleChoiceClick = (isCorrect?: boolean) => {
    if (solvedRef.current) return;
    if (isCorrect) {
      triggerSolved();
    } else {
      triggerWrong('Sai mất rồi! Suy nghĩ theo hướng khác thử xem.');
    }
  };

  const handleKeypadSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (solvedRef.current) return;
    if (!keypadValue.trim()) {
      triggerWrong('Hãy nhập đáp án trước khi kiểm tra nhé!');
      return;
    }
    if (evaluateKeypadAnswer(question, keypadValue)) {
      triggerSolved();
    } else {
      triggerWrong('Chưa chính xác! Đọc kỹ mẹo trong câu hỏi nhé.');
    }
  };

  // Render prompt with inline clickable targetWord when mechanic === 'word-tap'
  const renderPrompt = () => {
    if (question.mechanic === 'word-tap' && question.targetWord) {
      const idx = question.prompt.indexOf(question.targetWord);
      if (idx !== -1) {
        const before = question.prompt.slice(0, idx);
        const word = question.targetWord;
        const after = question.prompt.slice(idx + word.length);
        return (
          <>
            {before}
            <button
              type="button"
              onClick={() => triggerSolved()}
              className="inline font-extrabold text-slate-900 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 rounded px-0.5 cursor-pointer transition-colors"
            >
              {word}
            </button>
            {after}
          </>
        );
      }
    }
    return question.prompt;
  };

  const showInteractiveStage =
    (items && items.length > 0) ||
    question.mechanic === 'wait' ||
    question.mechanic === 'shake' ||
    Boolean(question.visualClue);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 pb-8 flex flex-col gap-4">
      {/* Main Sketchbook Puzzle Card */}
      <section
        className={`bg-white border-2 border-slate-800 rounded-3xl shadow-[0_6px_0_0_#1E293B] p-5 sm:p-7 flex flex-col gap-5 transition-transform ${
          shakeCard ? 'animate-puzzle-shake' : ''
        }`}
      >
        {/* Unboxed Category Metadata + Question Headline */}
        <div className="text-center">
          <div className="text-xs font-bold text-slate-400 tracking-wide">
            {question.category}
          </div>
          <h1 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug text-balance">
            {renderPrompt()}
          </h1>
          {question.subtext && (
            <p className="mt-1 text-sm text-slate-500 font-medium">{question.subtext}</p>
          )}
        </div>

        {/* Interactive Stage Canvas */}
        {showInteractiveStage && (
          <div
            ref={stageRef}
            data-testid="puzzle-stage"
            onPointerMove={handleStagePointerMove}
            onPointerUp={handleStagePointerUp}
            onPointerCancel={handleStagePointerUp}
            className={`relative w-full h-[300px] sm:h-[340px] rounded-2xl bg-[#FAF8F2] border-2 border-dashed border-slate-300 overflow-hidden touch-none select-none ${
              isShaking ? 'animate-stage-shake' : ''
            }`}
          >
            {/* Visual Clue Card for Keypad / Math Riddles */}
            {question.visualClue && (
              <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white border-2 border-slate-800 rounded-2xl px-6 py-5 shadow-[0_4px_0_0_#1E293B] text-center max-w-full">
                  <pre className="font-mono-num text-base sm:text-xl font-bold text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {question.visualClue}
                  </pre>
                </div>
              </div>
            )}

            {/* Wait Timer Banner */}
            {question.mechanic === 'wait' && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold font-mono-num pointer-events-none">
                Chờ {waitLeft}s
              </div>
            )}

            {/* Tap-Count / Shake / Rub / Hold Live Feedback */}
            {question.mechanic === 'tap-count' && (
              <div className="absolute top-3 left-3 text-xs font-bold text-slate-500 font-mono-num pointer-events-none">
                Số lần chạm: {tapCount}/{question.requiredCount}
              </div>
            )}

            {question.mechanic === 'shake' && (
              <div className="absolute top-3 left-3 text-xs font-bold text-slate-500 font-mono-num pointer-events-none">
                Đã lắc: {shakeCount}/{question.requiredCount}
              </div>
            )}

            {question.mechanic === 'rub' && (
              <div className="absolute top-3 left-3 right-3 flex items-center gap-2 pointer-events-none">
                <span className="text-xs font-bold text-slate-600 shrink-0">Độ sạch:</span>
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-100"
                    style={{ width: `${rubProgress}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono-num text-slate-700">{rubProgress}%</span>
              </div>
            )}

            {question.mechanic === 'hold' && (
              <div className="absolute top-3 left-3 right-3 flex items-center gap-2 pointer-events-none">
                <span className="text-xs font-bold text-slate-600 shrink-0">Nạp năng lượng:</span>
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-blue-600 transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono-num text-slate-700">{holdProgress}%</span>
              </div>
            )}

            {/* Interactive Stage Items */}
            {items.map((item) => {
              const seqIdx = sequenceProgress.indexOf(item.id);
              const isSelectedSeq = seqIdx !== -1;
              const progressRatio =
                question.mechanic === 'tap-count' && item.id === question.targetId
                  ? tapCount / (question.requiredCount ?? 5)
                  : question.mechanic === 'rub' && item.id === question.targetId
                  ? rubProgress / 100
                  : question.mechanic === 'hold' && item.id === question.targetId
                  ? holdProgress / 100
                  : 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label || item.value || SPRITE_LABELS_VI[item.sprite]}
                  onPointerDown={(e) => handleItemPointerDown(e, item)}
                  onPointerMove={() => handleItemPointerMoveRub(item)}
                  onClick={() => handleItemClick(item)}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    zIndex: item.zIndex ?? 2,
                    transform: `translate(-50%, -50%) rotate(${item.rotation ?? 0}deg)`,
                  }}
                  className={`absolute group flex flex-col items-center justify-center p-1 rounded-2xl focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    item.draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                  } ${
                    isSelectedSeq ? 'ring-4 ring-emerald-500 bg-emerald-50/70' : ''
                  }`}
                >
                  <SpriteGraphic
                    kind={item.sprite}
                    size={item.size ?? 74}
                    color={item.color}
                    value={item.value}
                    mood={item.mood}
                    isOpen={openedIds.has(item.id)}
                    progressRatio={progressRatio}
                  />
                  {item.label && (
                    <span className="mt-1 text-xs font-bold text-slate-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200 whitespace-nowrap pointer-events-none">
                      {item.label}
                    </span>
                  )}
                  {isSelectedSeq && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-extrabold font-mono-num flex items-center justify-center border-2 border-white">
                      {seqIdx + 1}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Shake Action Button inside stage when mechanic === 'shake' */}
            {question.mechanic === 'shake' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <button
                  type="button"
                  onClick={handleShakeAction}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-slate-800 shadow-[0_3px_0_0_#1E293B] text-slate-900 font-extrabold text-sm cursor-pointer active:translate-y-0.5 transition-all whitespace-nowrap"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Lắc màn hình!</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Choice Options Grid */}
        {question.mechanic === 'choice' && question.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt) => {
              const isDodged = dodgedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onMouseEnter={() => {
                    if (opt.dodges && !isDodged) setDodgedOptionId(opt.id);
                  }}
                  onClick={() => handleChoiceClick(opt.isCorrect)}
                  style={{
                    transform: isDodged ? 'translate(10px, -4px)' : undefined,
                  }}
                  className="min-h-[54px] px-5 py-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border-2 border-slate-800 shadow-[0_3px_0_0_#1E293B] text-slate-900 font-bold text-base text-left transition-all cursor-pointer active:translate-y-0.5"
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Keypad / Text Answer Bar */}
        {question.mechanic === 'keypad' && (
          <form onSubmit={handleKeypadSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <label htmlFor="puzzle-answer-input" className="sr-only">
                Nhập câu trả lời của bạn
              </label>
              <input
                id="puzzle-answer-input"
                type="text"
                inputMode={question.keypadMode === 'numeric' ? 'numeric' : 'text'}
                value={keypadValue}
                onChange={(e) => {
                  setKeypadValue(e.target.value);
                  setFeedbackError(null);
                }}
                placeholder={question.inputPlaceholder || 'Nhập đáp án của bạn...'}
                className="flex-1 h-12 px-4 rounded-xl border-2 border-slate-800 bg-white text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-[0_3px_0_0_#1D4ED8] cursor-pointer active:translate-y-0.5 transition-all whitespace-nowrap"
              >
                Kiểm tra
              </button>
            </div>

            {question.keypadMode === 'numeric' && (
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', 'Xóa'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setFeedbackError(null);
                      if (key === 'Xóa') {
                        setKeypadValue((v) => v.slice(0, -1));
                      } else {
                        setKeypadValue((v) => v + key);
                      }
                    }}
                    className="h-10 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-mono-num font-bold text-sm cursor-pointer active:scale-95 transition-all"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </form>
        )}

        {/* Wrong Feedback Banner */}
        {feedbackError && (
          <div
            role="status"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold animate-pop-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{feedbackError}</span>
          </div>
        )}

        {/* Hint Callout Banner */}
        {hintVisible && (
          <div
            role="note"
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-sm leading-relaxed animate-pop-in"
          >
            <Lightbulb className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">Gợi ý: </span>
              {question.hint}
            </div>
          </div>
        )}
      </section>

      {/* Bottom Utility Strip (Skip or Free Hint Recharge) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Mẹo: Mọi vật thể trên khung vẽ đều có thể kéo, chà hoặc giấu đồ bên dưới!</span>
        </div>

        <div className="flex items-center gap-2">
          {progress.hints === 0 && (
            <button
              type="button"
              onClick={onRechargeHints}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nhận thêm +5 💡</span>
            </button>
          )}

          <button
            type="button"
            disabled={progress.hints < SKIP_COST}
            onClick={onSkip}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-45 disabled:cursor-not-allowed border border-slate-300 text-slate-700 font-bold cursor-pointer transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Bỏ qua (-{SKIP_COST} 💡)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
