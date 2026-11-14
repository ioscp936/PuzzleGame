import React from 'react';
import { SpriteKind } from '../game/types';

interface SpriteGraphicProps {
  kind: SpriteKind;
  size?: number;
  color?: string;
  value?: string;
  mood?: 'happy' | 'sad' | 'sleeping' | 'angry' | 'dirty' | 'frozen';
  isOpen?: boolean;
  progressRatio?: number;
}

const EMOJI_MAP: Partial<Record<SpriteKind, string>> = {
  apple: '🍎',
  cat: '🐱',
  dog: '🐶',
  mouse: '🐭',
  lion: '🦁',
  elephant: '🐘',
  rabbit: '🐰',
  turtle: '🐢',
  owl: '🦉',
  fish: '🐟',
  duck: '🦆',
  frog: '🐸',
  bear: '🐻',
  monkey: '🐵',
  bee: '🐝',
  butterfly: '🦋',
  sun: '☀️',
  moon: '🌙',
  cloud: '☁️',
  raincloud: '🌧️',
  star: '⭐',
  fire: '🔥',
  water: '💧',
  ice: '🧊',
  tree: '🌳',
  flower: '🌸',
  rock: '🪨',
  bush: '🌿',
  box: '📦',
  gift: '🎁',
  key: '🔑',
  lock: '🔒',
  door: '🚪',
  fridge: '🧊',
  car: '🚗',
  bus: '🚌',
  rocket: '🚀',
  plane: '✈️',
  boat: '⛵',
  balloon: '🎈',
  egg: '🥚',
  cake: '🍰',
  pizza: '🍕',
  cheese: '🧀',
  bone: '🦴',
  carrot: '🥕',
  banana: '🍌',
  watermelon: '🍉',
  coffee: '☕',
  cup: '🥤',
  bottle: '🧪',
  bulb: '💡',
  battery: '🔋',
  phone: '📱',
  clock: '⏰',
  bomb: '💣',
  magnet: '🧲',
  mirror: '🪞',
  lamp: '🪔',
  coin: '🪙',
  piggybank: '🐷',
  crown: '👑',
  hat: '🎩',
  glasses: '👓',
  umbrella: '☂️',
  book: '📖',
  pencil: '✏️',
  scissors: '✂️',
  hammer: '🔨',
  trash: '🗑️',
  bell: '🔔',
  drum: '🥁',
  ghost: '👻',
  monster: '👾',
  robot: '🤖',
  snowman: '⛄',
  house: '🏠',
  tent: '⛺',
  mountain: '⛰️',
  bridge: '🌉',
  'traffic-light': '🚦',
  heart: '❤️',
  card: '🎫',
  dice: '🎲',
  trophy: '🏆',
  badge: '🏅',
};

export const SPRITE_LABELS_VI: Record<SpriteKind, string> = {
  apple: 'Quả táo',
  cat: 'Con mèo',
  dog: 'Con chó',
  mouse: 'Con chuột',
  lion: 'Sư tử',
  elephant: 'Con voi',
  rabbit: 'Con thỏ',
  turtle: 'Con rùa',
  owl: 'Cú mèo',
  fish: 'Con cá',
  duck: 'Con vịt',
  frog: 'Con ếch',
  bear: 'Con gấu',
  monkey: 'Con khỉ',
  bee: 'Con ong',
  butterfly: 'Con bướm',
  sun: 'Mặt trời',
  moon: 'Mặt trăng',
  cloud: 'Đám mây',
  raincloud: 'Mây mưa',
  star: 'Ngôi sao',
  fire: 'Ngọn lửa',
  water: 'Giọt nước',
  ice: 'Viên băng',
  tree: 'Cây xanh',
  flower: 'Bông hoa',
  rock: 'Tảng đá',
  bush: 'Bụi cỏ',
  box: 'Chiếc hộp',
  gift: 'Hộp quà',
  key: 'Chìa khóa',
  lock: 'Ổ khóa',
  door: 'Cánh cửa',
  fridge: 'Tủ lạnh',
  car: 'Ô tô',
  bus: 'Xe buýt',
  rocket: 'Tên lửa',
  plane: 'Máy bay',
  boat: 'Thuyền buồm',
  balloon: 'Bóng bay',
  egg: 'Quả trứng',
  cake: 'Bánh kem',
  pizza: 'Bánh pizza',
  cheese: 'Phô mai',
  bone: 'Khúc xương',
  carrot: 'Củ cà rốt',
  banana: 'Quả chuối',
  watermelon: 'Dưa hấu',
  coffee: 'Cà phê',
  cup: 'Chiếc cốc',
  bottle: 'Cái chai',
  bulb: 'Bóng đèn',
  battery: 'Cục pin',
  phone: 'Điện thoại',
  clock: 'Đồng hồ',
  bomb: 'Quả bom',
  magnet: 'Nam châm',
  mirror: 'Chiếc gương',
  lamp: 'Đèn thần',
  coin: 'Đồng xu',
  piggybank: 'Heo đất',
  crown: 'Vương miện',
  hat: 'Chiếc mũ',
  glasses: 'Cặp kính',
  umbrella: 'Chiếc ô',
  book: 'Quyển sách',
  pencil: 'Bút chì',
  scissors: 'Cây kéo',
  hammer: 'Cái búa',
  trash: 'Thùng rác',
  bell: 'Cái chuông',
  drum: 'Cái trống',
  ghost: 'Con ma',
  monster: 'Quái vật',
  robot: 'Người máy',
  snowman: 'Người tuyết',
  house: 'Ngôi nhà',
  tent: 'Cái lều',
  mountain: 'Ngọn núi',
  bridge: 'Cây cầu',
  'traffic-light': 'Đèn giao thông',
  heart: 'Trái tim',
  card: 'Tấm thẻ',
  dice: 'Xúc xắc',
  trophy: 'Chiếc cúp',
  badge: 'Huy chương',
  'shape-circle': 'Hình tròn',
  'shape-square': 'Hình vuông',
  'shape-triangle': 'Hình tam giác',
  'shape-diamond': 'Hình thoi',
  'text-token': 'Nhãn chữ',
};

export const SpriteGraphic: React.FC<SpriteGraphicProps> = ({
  kind,
  size = 72,
  color,
  value,
  mood,
  isOpen = false,
  progressRatio = 0,
}) => {
  // Custom interactive SVG for fridge (closed vs open)
  if (kind === 'fridge') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm select-none"
      >
        <rect
          x="16"
          y="8"
          width="48"
          height="64"
          rx="8"
          fill={isOpen ? '#E0F2FE' : '#F8FAFC'}
          stroke="#1E293B"
          strokeWidth="3"
        />
        {isOpen ? (
          <>
            <rect x="20" y="12" width="40" height="56" rx="4" fill="#BAE6FD" />
            <line x1="20" y1="34" x2="60" y2="34" stroke="#0284C7" strokeWidth="2" />
            <line x1="20" y1="50" x2="60" y2="50" stroke="#0284C7" strokeWidth="2" />
            <path
              d="M64 8 L76 14 V66 L64 72 Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="2.5"
            />
          </>
        ) : (
          <>
            <line x1="16" y1="32" x2="64" y2="32" stroke="#1E293B" strokeWidth="2.5" />
            <line x1="25" y1="18" x2="25" y2="26" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <line x1="25" y1="40" x2="25" y2="56" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </svg>
    );
  }

  // Custom geometric shapes
  if (kind === 'shape-circle') {
    return (
      <div
        className="rounded-full border-[3px] border-slate-800 flex items-center justify-center font-extrabold text-slate-900 shadow-sm select-none"
        style={{
          width: size,
          height: size,
          backgroundColor: color || '#DBEAFE',
          fontSize: Math.max(18, Math.round(size * 0.34)),
        }}
      >
        {value ?? ''}
      </div>
    );
  }

  if (kind === 'shape-square') {
    return (
      <div
        className="rounded-xl border-[3px] border-slate-800 flex items-center justify-center font-extrabold text-slate-900 shadow-sm select-none"
        style={{
          width: size,
          height: size,
          backgroundColor: color || '#FEF3C7',
          fontSize: Math.max(16, Math.round(size * 0.3)),
        }}
      >
        {value ?? ''}
      </div>
    );
  }

  if (kind === 'shape-triangle') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        className="drop-shadow-sm select-none"
      >
        <polygon
          points="40,8 74,70 6,70"
          fill={color || '#FDE68A'}
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {value && (
          <text
            x="40"
            y="56"
            textAnchor="middle"
            className="font-bold fill-slate-900"
            fontSize="16"
          >
            {value}
          </text>
        )}
      </svg>
    );
  }

  if (kind === 'shape-diamond') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        className="drop-shadow-sm select-none"
      >
        <polygon
          points="40,6 74,40 40,74 6,40"
          fill={color || '#38BDF8'}
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === 'bulb' && color) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        className="drop-shadow-sm select-none"
      >
        <circle
          cx="40"
          cy="34"
          r="22"
          fill={color}
          stroke="#1E293B"
          strokeWidth="3"
        />
        <path d="M31 54 H49 L46 66 H34 Z" fill="#94A3B8" stroke="#1E293B" strokeWidth="2.5" />
        <line x1="36" y1="69" x2="44" y2="69" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  const emoji = EMOJI_MAP[kind] ?? '✨';
  const scaleFactor =
    kind === 'balloon' ? 1 + progressRatio * 0.45 : 1;

  return (
    <div
      className="relative flex items-center justify-center select-none transition-transform duration-150"
      style={{
        width: size,
        height: size,
        transform: `scale(${scaleFactor})`,
      }}
    >
      <span
        style={{
          fontSize: Math.round(size * 0.72),
          lineHeight: 1,
          filter:
            mood === 'dirty'
              ? `sepia(${Math.max(0, 1 - progressRatio)}) brightness(${0.75 + progressRatio * 0.25})`
              : mood === 'frozen'
              ? `hue-rotate(170deg) saturate(${Math.max(0.4, 1 - progressRatio * 0.5)})`
              : undefined,
        }}
        role="img"
        aria-hidden="true"
      >
        {emoji}
      </span>

      {/* Mood overlays */}
      {mood === 'sleeping' && (
        <span className="absolute -top-2 -right-1 text-xs font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md border border-indigo-300">
          Zzz
        </span>
      )}

      {mood === 'dirty' && progressRatio < 0.95 && (
        <div
          className="absolute inset-1 rounded-full bg-amber-900/50 border-2 border-dashed border-amber-950/40 pointer-events-none transition-opacity duration-150"
          style={{ opacity: Math.max(0, 1 - progressRatio) }}
        />
      )}

      {mood === 'frozen' && progressRatio < 0.95 && (
        <div
          className="absolute inset-0 rounded-2xl bg-sky-200/60 border-2 border-sky-400 pointer-events-none transition-opacity duration-150"
          style={{ opacity: Math.max(0, 1 - progressRatio) }}
        />
      )}

      {kind === 'egg' && progressRatio > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          viewBox="0 0 80 80"
        >
          <path
            d="M36 22 L43 32 L34 42 L44 52"
            fill="none"
            stroke="#1E293B"
            strokeWidth={1.5 + progressRatio * 2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
