import { useCallback, useEffect, useState } from 'react';
import { CHAPTERS, getQuestionById } from './data/questions/index';
import { GamePhase, ProgressState } from './game/types';
import {
  createInitialProgress,
  rechargeHints,
  sanitizeProgress,
  skipLevelProgress,
  solveLevel,
  spendHint,
  STORAGE_KEY,
  TOTAL_LEVELS,
} from './game/rules';
import { soundFX } from './game/sound';
import { TitleScreen } from './components/TitleScreen';
import { GameHud } from './components/GameHud';
import { PuzzleStage } from './components/PuzzleStage';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PauseModal, SolvedModal, VictoryAllModal } from './components/StatusModals';

function loadSavedProgress(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    return sanitizeProgress(JSON.parse(raw));
  } catch {
    return createInitialProgress();
  }
}

export default function App() {
  const [progress, setProgress] = useState<ProgressState>(loadSavedProgress);
  const [phase, setPhase] = useState<GamePhase>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1' ? 'playing' : 'title';
  });

  const [levelSelectOpen, setLevelSelectOpen] = useState(false);
  const [solvedModalOpen, setSolvedModalOpen] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [stageResetKey, setStageResetKey] = useState(0);
  const [muted, setMuted] = useState(false);

  const currentQuestion = getQuestionById(progress.currentLevel);
  const currentChapter =
    CHAPTERS.find((c) => c.id === currentQuestion.chapter) ?? CHAPTERS[0];

  // Mirror game state to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = phase;
  }, [phase]);

  // Persist progress to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const handleStartGame = useCallback((targetLevel?: number) => {
    soundFX.playTap();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (typeof targetLevel === 'number') {
      setProgress((prev) => ({
        ...prev,
        currentLevel: Math.max(1, Math.min(prev.highestUnlocked, targetLevel)),
      }));
    }
    setSolvedModalOpen(false);
    setHintRevealed(false);
    setLevelSelectOpen(false);
    setPhase('playing');
  }, []);

  // Keyboard shortcuts: Enter/Space on title -> start; Escape/P while playing -> pause
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase === 'title' && !levelSelectOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartGame(progress.currentLevel);
        }
      } else if (phase === 'playing' && !solvedModalOpen && !levelSelectOpen) {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          if (document.activeElement?.tagName === 'INPUT' && e.key !== 'Escape') return;
          e.preventDefault();
          setPhase('paused');
        }
      } else if (phase === 'paused') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setPhase('playing');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, levelSelectOpen, solvedModalOpen, handleStartGame, progress.currentLevel]);

  const handleLevelSolved = () => {
    setProgress((prev) => solveLevel(prev, currentQuestion.id));
    setSolvedModalOpen(true);
  };

  const handleAdvanceNext = () => {
    soundFX.playTap();
    setSolvedModalOpen(false);
    setHintRevealed(false);
    if (currentQuestion.id >= TOTAL_LEVELS) {
      setPhase('gameover');
      return;
    }
    setProgress((prev) => ({
      ...prev,
      currentLevel: currentQuestion.id + 1,
    }));
  };

  const handleUseHint = () => {
    if (hintRevealed) return;
    const res = spendHint(progress);
    if (!res.ok) {
      // Auto recharge if empty? No, let user see notice or recharge button; actually if hints === 0 we can recharge +5 or show notice
      setProgress((prev) => rechargeHints(prev, 5));
      soundFX.playHint();
      return;
    }
    soundFX.playHint();
    setProgress(res.next);
    setHintRevealed(true);
  };

  const handleSkipLevel = () => {
    const res = skipLevelProgress(progress, currentQuestion.id);
    if (!res.ok) return;
    soundFX.playTap();
    setHintRevealed(false);
    setSolvedModalOpen(false);
    setProgress(res.next);
    if (currentQuestion.id >= TOTAL_LEVELS) {
      setPhase('gameover');
    }
  };

  const handleResetStage = () => {
    soundFX.playTap();
    setStageResetKey((k) => k + 1);
  };

  const handleToggleMute = () => {
    const nextMuted = !muted;
    soundFX.muted = nextMuted;
    setMuted(nextMuted);
  };

  const handleSelectLevelFromMap = (id: number) => {
    soundFX.playTap();
    setLevelSelectOpen(false);
    setSolvedModalOpen(false);
    setHintRevealed(false);
    setProgress((prev) => ({ ...prev, currentLevel: id }));
    setPhase('playing');
  };

  const handleResetAllProgress = () => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    setHintRevealed(false);
    setSolvedModalOpen(false);
    setStageResetKey((k) => k + 1);
  };

  const handlePlayAgainFromVictory = () => {
    soundFX.playTap();
    setProgress((prev) => ({
      ...prev,
      currentLevel: 1,
    }));
    setHintRevealed(false);
    setSolvedModalOpen(false);
    setPhase('playing');
  };

  return (
    <div className="min-h-screen w-full sketch-grid-bg text-slate-900 flex flex-col">
      {phase === 'title' && (
        <TitleScreen
          progress={progress}
          onStart={handleStartGame}
          onOpenLevelSelect={() => setLevelSelectOpen(true)}
          onResetAll={handleResetAllProgress}
        />
      )}

      {(phase === 'playing' || phase === 'paused' || phase === 'gameover') && (
        <div className="flex-1 flex flex-col">
          <GameHud
            levelId={currentQuestion.id}
            chapterTitle={currentChapter.title}
            progress={progress}
            muted={muted}
            onOpenLevelSelect={() => setLevelSelectOpen(true)}
            onUseHint={handleUseHint}
            onResetStage={handleResetStage}
            onToggleMute={handleToggleMute}
            onPause={() => setPhase('paused')}
          />

          <main className="flex-1 flex items-start sm:items-center justify-center pt-2 sm:pt-4">
            <PuzzleStage
              key={`${currentQuestion.id}-${stageResetKey}`}
              question={currentQuestion}
              progress={progress}
              hintVisible={hintRevealed}
              onSolved={handleLevelSolved}
              onSkip={handleSkipLevel}
              onRechargeHints={() => {
                soundFX.playHint();
                setProgress((prev) => rechargeHints(prev, 5));
              }}
            />
          </main>
        </div>
      )}

      {solvedModalOpen && phase === 'playing' && (
        <SolvedModal question={currentQuestion} onNext={handleAdvanceNext} />
      )}

      {phase === 'paused' && (
        <PauseModal
          progress={progress}
          onResume={() => setPhase('playing')}
          onRestartStage={() => {
            handleResetStage();
            setPhase('playing');
          }}
          onBackToTitle={() => setPhase('title')}
        />
      )}

      {phase === 'gameover' && (
        <VictoryAllModal
          progress={progress}
          onPlayAgain={handlePlayAgainFromVictory}
          onBackToTitle={() => setPhase('title')}
        />
      )}

      <LevelSelectModal
        open={levelSelectOpen}
        progress={progress}
        onSelectLevel={handleSelectLevelFromMap}
        onClose={() => setLevelSelectOpen(false)}
      />
    </div>
  );
}
