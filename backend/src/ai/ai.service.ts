import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { QuizQuestion, AIQuizResponse, QuizContext } from './types';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const VALID_CATEGORIES = [
  'Art & Literature',
  'Entertainment',
  'Geography',
  'History',
  'Languages',
  'Science',
  'Sports',
  'Trivia'
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiEndpoint: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not defined in environment variables');
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
      return this.validateQuizResponse(quizResponse, topic);
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
          max_tokens: 150,
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

  async generateResponse(message: string, context: QuizContext): Promise<string> {
    try {
      const { quiz, userAnswers, score, question } = context;
      
      const isRelevant = await this.checkMessageRelevance(message, quiz);
      if (!isRelevant) {
        return "I notice your question might not be directly related to the quiz. To help you better, please ask questions about the quiz content, your answers, or specific concepts covered in the questions. Feel free to ask about any question from the quiz or concepts you'd like me to explain further.";
      }

      let prompt = `As a helpful AI tutor, I'm here to assist with your quiz questions. `;
      
      if (question) {
        const questionData = quiz.questions[question - 1];
        const userAnswer = userAnswers.find(a => a.questionId === questionData.id);
        const correctOption = questionData.options.find(o => o.isCorrect);
        
        if (questionData && userAnswer && correctOption) {
          prompt += `Regarding Question ${question}: "${questionData.text}"\n`;
          prompt += `You selected: "${userAnswer.selectedOption.text}"\n`;
          prompt += `The correct answer was: "${correctOption.text}"\n`;
        }
      }
      
      prompt += `Your overall score was ${score}%.\n\n`;
      prompt += `User question: ${message}\n`;
      prompt += `Please provide a helpful, encouraging response that explains the concept and helps the user understand ${question ? 'this question' : 'the quiz material'} better.`;

      const response = await axios.post<DeepSeekResponse>(
        this.apiEndpoint,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.7,
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
      throw new Error('Failed to generate AI response');
    }
  }

  async checkMessageRelevance(message: string, quiz: any): Promise<boolean> {
    try {
      const quizContent = quiz.questions.map(q => {
        const questionText = q.text;
        const options = q.options.map(o => o.text).join(' ');
        return `${questionText} ${options}`;
      }).join(' ');

      const prompt = `Given the following quiz content and user message, determine if the message is relevant to the quiz. Respond with only "true" or "false".

Quiz content: ${quizContent}

User message: ${message}

Is this message relevant to the quiz content, asking about the questions, answers, or directly related concepts?`;

      const response = await axios.post<DeepSeekResponse>(
        this.apiEndpoint,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 10,
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data.choices[0].message.content.trim().toLowerCase();
      return result === 'true';
    } catch (error) {
      throw new Error('Failed to check message relevance');
    }
  }

  private generateQuizPrompt(topic: string, numQuestions: number): string {
    return `Generate a quiz with ${numQuestions} multiple choice questions about ${topic}.

Format: JSON object with this structure:
{
  "title": "Create an engaging, creative title that captures interest. Use wordplay, alliteration, or clever phrases. For example, instead of 'Quiz about World Capitals' use 'Capital Conquest: Around the World in 10 Questions' or instead of 'Quiz about Harry Potter' use 'Hogwarts & Beyond: A Magical Knowledge Challenge'",
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
  "tags": ["Category", "Topic", "Subtopic", "Additional Tag"]  // Exactly 4 tags, first must be a valid category
}

Requirements:
- Title should be creative and engaging, using techniques like:
  * Wordplay or puns
  * Alliteration
  * Clever phrases
  * Pop culture references when relevant
  * Intriguing questions
  * Avoid generic titles like "Quiz about X" or "Test your knowledge of X"
- First tag MUST be one of these categories: ${VALID_CATEGORIES.join(', ')}
- Description should be 2-3 sentences explaining the quiz content and learning objectives
- Include EXACTLY 4 tags (first being the category)
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

  private validateQuizResponse(quizResponse: AIQuizResponse, topic: string): AIQuizResponse {
    if (!quizResponse.quiz || !Array.isArray(quizResponse.quiz)) {
      throw new HttpException('Invalid quiz format', HttpStatus.BAD_REQUEST);
    }

    if (!quizResponse.description) {
      throw new HttpException('Quiz description is required', HttpStatus.BAD_REQUEST);
    }

    if (!quizResponse.tags || !Array.isArray(quizResponse.tags)) {
      throw new HttpException('Quiz tags are required', HttpStatus.BAD_REQUEST);
    }

    if (quizResponse.tags.length !== 4) {
      throw new Error('Quiz must have exactly 4 tags');
    }

    const category = quizResponse.tags[0];
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error(`First tag must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    quizResponse.quiz.forEach(question => {
      if (question.options.length !== 4) {
        throw new Error('Each question must have exactly 4 options');
      }

      const correctAnswers = question.options.filter(opt => opt.isCorrect);
      if (correctAnswers.length !== 1) {
        throw new Error('Each question must have exactly one correct answer');
      }
    });

    return {
      ...quizResponse,
      topic: topic,
    };
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
    if (question.options.length !== 4) {
      throw new Error('Question must have exactly 4 options');
    }

    const correctAnswers = question.options.filter(opt => opt.isCorrect);
    if (correctAnswers.length !== 1) {
      throw new Error('Question must have exactly one correct answer');
    }

    if (!question.question || typeof question.question !== 'string' || !question.question.trim()) {
      throw new Error('Question must have text');
    }

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