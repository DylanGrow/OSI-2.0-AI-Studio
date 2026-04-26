/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  layer?: number; // 1-7
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  status: 'idle' | 'playing' | 'finished';
}
