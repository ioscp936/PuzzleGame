import { CHAPTER_1_QUESTIONS } from './chapter1';
import { CHAPTER_2_QUESTIONS } from './chapter2';
import { CHAPTER_3_QUESTIONS } from './chapter3';
import { CHAPTER_4_QUESTIONS } from './chapter4';
import { CHAPTER_5_QUESTIONS } from './chapter5';
import { PuzzleQuestion } from '../../game/types';

export interface ChapterInfo {
  id: 1 | 2 | 3 | 4 | 5;
  title: string;
  range: [number, number];
}

export const CHAPTERS: ChapterInfo[] = [
  { id: 1, title: 'Khởi Động Tư Duy', range: [1, 50] },
  { id: 2, title: 'Ảo Giác & Mẹo Vặt', range: [51, 100] },
  { id: 3, title: 'Thử Thách Logic Ngược', range: [101, 150] },
  { id: 4, title: 'Bậc Thầy Quan Sát', range: [151, 200] },
  { id: 5, title: 'Siêu Hack Não', range: [201, 250] },
];

export const QUESTIONS: PuzzleQuestion[] = [
  ...CHAPTER_1_QUESTIONS,
  ...CHAPTER_2_QUESTIONS,
  ...CHAPTER_3_QUESTIONS,
  ...CHAPTER_4_QUESTIONS,
  ...CHAPTER_5_QUESTIONS,
];

export function getQuestionById(id: number): PuzzleQuestion {
  return QUESTIONS.find((q) => q.id === id) ?? QUESTIONS[0];
}
