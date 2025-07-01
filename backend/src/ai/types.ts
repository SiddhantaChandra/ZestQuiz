export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

export interface AIQuizResponse {
  quiz: QuizQuestion[];
  description: string;
  tags: string[];
}

export interface GenerateQuizDto {
  topic: string;
  numQuestions: number;
}

export interface ExplainAnswerDto {
  question: string;
  correctAnswer: string;
  userAnswer: string;
}

export interface GenerateQuestionRequest {
  topic: string;
  existingQuestions?: QuizQuestion[];
}

export interface GenerateQuestionResponse {
  question: QuizQuestion;
} 