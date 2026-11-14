import { ProgressState, PuzzleQuestion } from './types';

export const TOTAL_LEVELS = 250;
export const INITIAL_HINTS = 10;
export const HINT_COST = 1;
export const SKIP_COST = 2;
export const STORAGE_KEY = 'hack_nao_250_progress_v1';

export function createInitialProgress(): ProgressState {
  return {
    currentLevel: 1,
    highestUnlocked: 1,
    solvedLevels: [],
    hints: INITIAL_HINTS,
    hintsUsed: 0,
    currentStreak: 0,
    bestStreak: 0,
  };
}

export function sanitizeProgress(raw: unknown): ProgressState {
  const base = createInitialProgress();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Record<string, unknown>;

  const solvedLevels = Array.isArray(obj.solvedLevels)
    ? Array.from(
        new Set(
          obj.solvedLevels.filter(
            (n): n is number =>
              typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= TOTAL_LEVELS
          )
        )
      ).sort((a, b) => a - b)
    : [];

  const highestUnlockedRaw =
    typeof obj.highestUnlocked === 'number' && Number.isInteger(obj.highestUnlocked)
      ? obj.highestUnlocked
      : 1;
  const maxSolvedNext = solvedLevels.length > 0 ? Math.min(TOTAL_LEVELS, Math.max(...solvedLevels) + 1) : 1;
  const highestUnlocked = Math.max(1, Math.min(TOTAL_LEVELS, Math.max(highestUnlockedRaw, maxSolvedNext)));

  const currentLevelRaw =
    typeof obj.currentLevel === 'number' && Number.isInteger(obj.currentLevel)
      ? obj.currentLevel
      : highestUnlocked;
  const currentLevel = Math.max(1, Math.min(highestUnlocked, currentLevelRaw));

  const hints =
    typeof obj.hints === 'number' && Number.isFinite(obj.hints) && obj.hints >= 0
      ? Math.floor(obj.hints)
      : INITIAL_HINTS;

  const hintsUsed =
    typeof obj.hintsUsed === 'number' && Number.isFinite(obj.hintsUsed) && obj.hintsUsed >= 0
      ? Math.floor(obj.hintsUsed)
      : 0;

  const currentStreak =
    typeof obj.currentStreak === 'number' && Number.isFinite(obj.currentStreak) && obj.currentStreak >= 0
      ? Math.floor(obj.currentStreak)
      : 0;

  const bestStreak =
    typeof obj.bestStreak === 'number' && Number.isFinite(obj.bestStreak) && obj.bestStreak >= 0
      ? Math.max(currentStreak, Math.floor(obj.bestStreak))
      : currentStreak;

  return {
    currentLevel,
    highestUnlocked,
    solvedLevels,
    hints,
    hintsUsed,
    currentStreak,
    bestStreak,
  };
}

export function isLevelUnlocked(progress: ProgressState, levelId: number): boolean {
  return levelId >= 1 && levelId <= progress.highestUnlocked;
}

export function solveLevel(progress: ProgressState, levelId: number): ProgressState {
  const alreadySolved = progress.solvedLevels.includes(levelId);
  const solvedLevels = alreadySolved
    ? progress.solvedLevels
    : [...progress.solvedLevels, levelId].sort((a, b) => a - b);

  const highestUnlocked = Math.min(
    TOTAL_LEVELS,
    Math.max(progress.highestUnlocked, levelId + 1)
  );
  const currentStreak = alreadySolved ? progress.currentStreak : progress.currentStreak + 1;
  const bestStreak = Math.max(progress.bestStreak, currentStreak);
  const hints = alreadySolved ? progress.hints : progress.hints + 1;

  return {
    ...progress,
    solvedLevels,
    highestUnlocked,
    currentStreak,
    bestStreak,
    hints,
  };
}

export function spendHint(progress: ProgressState): { next: ProgressState; ok: boolean } {
  if (progress.hints < HINT_COST) {
    return { next: progress, ok: false };
  }
  return {
    ok: true,
    next: {
      ...progress,
      hints: progress.hints - HINT_COST,
      hintsUsed: progress.hintsUsed + 1,
    },
  };
}

export function skipLevelProgress(progress: ProgressState, levelId: number): { next: ProgressState; ok: boolean } {
  if (progress.hints < SKIP_COST) {
    return { next: progress, ok: false };
  }
  const nextLevel = Math.min(TOTAL_LEVELS, levelId + 1);
  const highestUnlocked = Math.max(progress.highestUnlocked, nextLevel);
  return {
    ok: true,
    next: {
      ...progress,
      hints: progress.hints - SKIP_COST,
      currentStreak: 0,
      highestUnlocked,
      currentLevel: nextLevel,
    },
  };
}

export function rechargeHints(progress: ProgressState, amount = 5): ProgressState {
  return {
    ...progress,
    hints: progress.hints + amount,
  };
}

export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ');
}

export function evaluateKeypadAnswer(question: PuzzleQuestion, input: string): boolean {
  if (!question.acceptedAnswers || question.acceptedAnswers.length === 0) return false;
  const normalized = normalizeAnswer(input);
  if (!normalized) return false;
  return question.acceptedAnswers.some((ans) => normalizeAnswer(ans) === normalized);
}

export function evaluateSequenceTap(
  sequenceIds: string[],
  currentTapProgress: string[],
  tappedId: string
): { status: 'progress' | 'complete' | 'wrong'; nextProgress: string[] } {
  const expectedId = sequenceIds[currentTapProgress.length];
  if (tappedId !== expectedId) {
    return { status: 'wrong', nextProgress: [] };
  }
  const nextProgress = [...currentTapProgress, tappedId];
  if (nextProgress.length >= sequenceIds.length) {
    return { status: 'complete', nextProgress };
  }
  return { status: 'progress', nextProgress };
}

export function checkDistanceOverlap(
  a: { x: number; y: number },
  b: { x: number; y: number },
  thresholdPercent = 14
): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) <= thresholdPercent;
}

export function isDraggedAway(pos: { x: number; y: number }): boolean {
  return pos.x < 10 || pos.x > 90 || pos.y < 10 || pos.y > 90;
}

export function calculateCompletionPercent(solvedCount: number): number {
  if (TOTAL_LEVELS <= 0) return 0;
  return Math.round((Math.min(TOTAL_LEVELS, Math.max(0, solvedCount)) / TOTAL_LEVELS) * 100);
}
