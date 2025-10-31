// Quiz/Game types for multiple choice quiz functionality

import type { PackageItem, Images } from './package';

export interface QuizRange {
  start: number;
  end: number;
  attr: string | null;
}

export interface QuizResult {
  itemName: string;
  question: string; // The question that was asked
  answer: string; // The correct answer
  input: string | null; // The answer that the user gave
  correct: boolean;
}

export interface InitializeGamePayload {
  packageName: string;
  question: string;
  questionType: string;
  answer: string;
  answerType: string;
  division: string | null;
  divisionOption: string | null;
  range: QuizRange | null;
  filteredItems: PackageItem[];
  images: Images | null;
  imageHeight: string;
  timeLimit: number;
  totalQuestions: number;
}

export interface SubmitAnswerPayload {
  input: string;
  idx: number;
  isCorrect: boolean;
}

export interface SetImagesPayload {
  images: Images;
  imageHeight: string;
}

