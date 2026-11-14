export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

export type PuzzleMechanic =
  | 'choice'
  | 'tap-target'
  | 'tap-sequence'
  | 'tap-count'
  | 'drag-to-target'
  | 'drag-away'
  | 'rub'
  | 'hold'
  | 'wait'
  | 'shake'
  | 'keypad'
  | 'word-tap';

export type SpriteKind =
  | 'apple'
  | 'cat'
  | 'dog'
  | 'mouse'
  | 'lion'
  | 'elephant'
  | 'rabbit'
  | 'turtle'
  | 'owl'
  | 'fish'
  | 'duck'
  | 'frog'
  | 'bear'
  | 'monkey'
  | 'bee'
  | 'butterfly'
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'raincloud'
  | 'star'
  | 'fire'
  | 'water'
  | 'ice'
  | 'tree'
  | 'flower'
  | 'rock'
  | 'bush'
  | 'box'
  | 'gift'
  | 'key'
  | 'lock'
  | 'door'
  | 'fridge'
  | 'car'
  | 'bus'
  | 'rocket'
  | 'plane'
  | 'boat'
  | 'balloon'
  | 'egg'
  | 'cake'
  | 'pizza'
  | 'cheese'
  | 'bone'
  | 'carrot'
  | 'banana'
  | 'watermelon'
  | 'coffee'
  | 'cup'
  | 'bottle'
  | 'bulb'
  | 'battery'
  | 'phone'
  | 'clock'
  | 'bomb'
  | 'magnet'
  | 'mirror'
  | 'lamp'
  | 'coin'
  | 'piggybank'
  | 'crown'
  | 'hat'
  | 'glasses'
  | 'umbrella'
  | 'book'
  | 'pencil'
  | 'scissors'
  | 'hammer'
  | 'trash'
  | 'bell'
  | 'drum'
  | 'ghost'
  | 'monster'
  | 'robot'
  | 'snowman'
  | 'house'
  | 'tent'
  | 'mountain'
  | 'bridge'
  | 'traffic-light'
  | 'heart'
  | 'card'
  | 'dice'
  | 'trophy'
  | 'badge'
  | 'shape-circle'
  | 'shape-square'
  | 'shape-triangle'
  | 'shape-diamond'
  | 'text-token';

export interface StageItem {
  id: string;
  sprite: SpriteKind;
  label?: string;
  /** Position in percentage of stage width/height (0..100) */
  x: number;
  y: number;
  /** Size in px (default 72) */
  size?: number;
  color?: string;
  secondaryColor?: string;
  rotation?: number;
  draggable?: boolean;
  /** Hidden underneath another item initially or revealed after action */
  zIndex?: number;
  /** Optional text value shown on shape/token */
  value?: string;
  /** Visual state hint */
  mood?: 'happy' | 'sad' | 'sleeping' | 'angry' | 'dirty' | 'frozen';
  /** If true, clicking this triggers wrong answer feedback */
  isTrap?: boolean;
}

export interface ChoiceOption {
  id: string;
  label: string;
  isCorrect?: boolean;
  /** If true, button dodges pointer once or twice! */
  dodges?: boolean;
}

export interface PuzzleQuestion {
  id: number;
  chapter: 1 | 2 | 3 | 4 | 5;
  category: string;
  mechanic: PuzzleMechanic;
  prompt: string;
  subtext?: string;
  hint: string;
  explanation: string;

  /** Visual items on the interactive canvas/stage */
  items?: StageItem[];

  /** For 'choice' mechanic */
  options?: ChoiceOption[];

  /** For 'tap-target' or 'drag-to-target' target id */
  targetId?: string;
  /** For 'drag-to-target': id of the item that must be dragged onto targetId */
  dragSourceId?: string;
  /** Optional prerequisite action id (e.g., open door before dragging elephant in) */
  prerequisiteTapId?: string;

  /** For 'tap-sequence': exact order of item IDs */
  sequenceIds?: string[];

  /** For 'tap-count' or 'shake': target count */
  requiredCount?: number;

  /** For 'wait': seconds to wait without touching traps */
  waitSeconds?: number;

  /** For 'hold': seconds to hold targetId */
  holdSeconds?: number;

  /** For 'keypad': accepted answers (trimmed lowercase) */
  acceptedAnswers?: string[];
  /** Visual riddle/math display inside stage for keypad */
  visualClue?: string;
  inputPlaceholder?: string;
  keypadMode?: 'numeric' | 'text';

  /** For 'word-tap': exact substring/word index in prompt to tap */
  targetWord?: string;
}

export interface ProgressState {
  currentLevel: number;
  highestUnlocked: number;
  solvedLevels: number[];
  hints: number;
  hintsUsed: number;
  currentStreak: number;
  bestStreak: number;
}
