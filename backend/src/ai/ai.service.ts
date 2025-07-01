import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { QuizQuestion, AIQuizResponse } from './types';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const VALID_CATEGORIES = [
  'Technology',
  'Science',
  'History',
  'Geography',
  'Literature',
  'Arts',
  'Sports',
  'Entertainment',
  'General Knowledge'
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiEndpoint: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      this.logger.error('DEEPSEEK_API_KEY is not set in environment variables');
      throw new Error('DEEPSEEK_API_KEY is required');
    }
    this.apiKey = apiKey;
    this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
  }

  async generateQuiz(topic: string, numQuestions: number): Promise<AIQuizResponse> {
    try {
      const prompt = this.generateQuizPrompt(topic, numQuestions);
      const response = await axios.post<DeepSeekResponse>(
        this.apiEndpoint,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a quiz generation assistant. Generate clear, accurate multiple choice questions with descriptions and relevant tags. The first tag must be one of these categories: ${VALID_CATEGORIES.join(', ')}.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const quizResponse = this.parseAiResponse(response.data.choices[0].message.content);
      return this.validateQuizResponse(quizResponse);
    } catch (error) {
      this.logger.error('Error generating quiz:', error);
      throw new HttpException(
        'Failed to generate quiz questions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async explainWrongAnswer(question: string, correctAnswer: string, userAnswer: string): Promise<string> {
    try {
      const prompt = `Explain why this answer is incorrect:
Question: ${question}
Correct answer: ${correctAnswer}
User's answer: ${userAnswer}
Provide a brief, clear explanation of why the user's answer is incorrect and why the correct answer is right.`;

      const response = await axios.post<DeepSeekResponse>(
        this.apiEndpoint,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful tutor. Provide clear, concise explanations for quiz answers.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 150, // Keep explanations concise
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      this.logger.error('Error generating explanation:', error);
      throw new HttpException(
        'Failed to generate explanation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateSingleQuestion(topic: string, existingQuestions?: QuizQuestion[]): Promise<QuizQuestion> {
    if (!topic.trim()) {
      throw new HttpException('Topic is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const prompt = this.generateSingleQuestionPrompt(topic, existingQuestions);
      const response = await axios.post<DeepSeekResponse>(
        this.apiEndpoint,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a quiz question generator. Generate clear, accurate multiple choice questions.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const questionResponse = this.parseSingleQuestionResponse(response.data.choices[0].message.content);
      return this.validateSingleQuestion(questionResponse);
    } catch (error) {
      this.logger.error('Error generating single question:', error);
      throw new HttpException(
        'Failed to generate question',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private generateQuizPrompt(topic: string, numQuestions: number): string {
    return `Generate a quiz with ${numQuestions} multiple choice questions about ${topic}.

Format: JSON object with this structure:
{
  "quiz": [
    {
      "question": "Question text here?",
      "options": [
        {"text": "Option A", "isCorrect": false},
        {"text": "Option B", "isCorrect": true},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ]
    }
  ],
  "description": "A brief description of the quiz content and learning objectives",
  "tags": ["Category", "Topic", "Subtopic"]  // First tag must be a valid category
}

Requirements:
- First tag MUST be one of these categories: ${VALID_CATEGORIES.join(', ')}
- Description should be 2-3 sentences explaining the quiz content and learning objectives
- Include 3-5 relevant tags (first being the category)
- Exactly one correct answer per question
- 4 options per question
- Clear, unambiguous questions
- Questions should test understanding, not just memorization
- Ensure questions are factually accurate
- Avoid subjective or opinion-based questions
- Make sure all options are plausible
- Use proper grammar and punctuation
- Keep questions concise and focused`;
  }

  private parseAiResponse(response: string): AIQuizResponse {
    try {
      // Find the JSON object in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON object found in response');
      }

      const quizResponse = JSON.parse(jsonMatch[0]);
      return quizResponse;
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  private validateQuizResponse(quizResponse: AIQuizResponse): AIQuizResponse {
    // Validate structure
    if (!quizResponse.quiz || !Array.isArray(quizResponse.quiz)) {
      throw new Error('Quiz must be an array of questions');
    }
    if (!quizResponse.description || typeof quizResponse.description !== 'string') {
      throw new Error('Quiz must have a description');
    }
    if (!quizResponse.tags || !Array.isArray(quizResponse.tags) || quizResponse.tags.length < 1) {
      throw new Error('Quiz must have at least one tag');
    }

    // Validate category
    const category = quizResponse.tags[0];
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error(`First tag must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // Validate questions
    quizResponse.quiz.forEach(question => {
      // Ensure exactly 4 options
      if (question.options.length !== 4) {
        throw new Error('Each question must have exactly 4 options');
      }

      // Ensure exactly one correct answer
      const correctAnswers = question.options.filter(opt => opt.isCorrect);
      if (correctAnswers.length !== 1) {
        throw new Error('Each question must have exactly one correct answer');
      }
    });

    return quizResponse;
  }

  private generateSingleQuestionPrompt(topic: string, existingQuestions?: QuizQuestion[]): string {
    let prompt = `Generate a single multiple choice question about ${topic}.`;

    if (existingQuestions?.length) {
      prompt += `\n\nAvoid these existing questions:\n${JSON.stringify(existingQuestions.map(q => q.question))}`;
    }

    prompt += `\n\nFormat: JSON exactly with this structure:
{
  "question": "Question text here?",
  "options": [
    {"text": "Option A", "isCorrect": false},
    {"text": "Option B", "isCorrect": true},
    {"text": "Option C", "isCorrect": false},
    {"text": "Option D", "isCorrect": false}
  ]
}

Requirements:
- Exactly one correct answer
- 4 options per question
- Clear, unambiguous question
- Relevant to the topic: ${topic}
- Use proper grammar and punctuation
- Keep question concise and focused
- All options should be plausible
- Question should test understanding, not just memorization`;

    return prompt;
  }

  private parseSingleQuestionResponse(response: string): QuizQuestion {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON object found in response');
      }

      const questionResponse = JSON.parse(jsonMatch[0]);
      return questionResponse;
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  private validateSingleQuestion(question: QuizQuestion): QuizQuestion {
    // Ensure exactly 4 options
    if (question.options.length !== 4) {
      throw new Error('Question must have exactly 4 options');
    }

    // Ensure exactly one correct answer
    const correctAnswers = question.options.filter(opt => opt.isCorrect);
    if (correctAnswers.length !== 1) {
      throw new Error('Question must have exactly one correct answer');
    }

    // Ensure question text exists
    if (!question.question || typeof question.question !== 'string' || !question.question.trim()) {
      throw new Error('Question must have text');
    }

    // Validate each option
    question.options.forEach(option => {
      if (!option.text || typeof option.text !== 'string' || !option.text.trim()) {
        throw new Error('Each option must have text');
      }
      if (typeof option.isCorrect !== 'boolean') {
        throw new Error('Each option must have isCorrect boolean');
      }
    });

    return question;
  }
} 