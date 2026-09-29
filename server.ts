import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  generateFallbackQA,
  generateFallbackExplain,
  generateFallbackQuiz,
  generateFallbackSummary,
  generateFallbackLearningPath,
} from './fallbackEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

// System prompt common to EduGenie
const SYSTEM_EDU_INSTRUCTION = `You are EduGenie, an expert educational mentor and learning assistant for students.
Your core teaching philosophy:
1. Prioritize absolute factual and scientific accuracy.
2. Explain concepts with crystal clarity, warmth, and encouragement.
3. Adapt appropriately to student level without patronizing or overcomplicating.
4. Always provide intuitive real-world examples, mental models, or analogies.
5. Emphasize deep conceptual understanding over rote memorization.
6. When uncertain, explicitly state nuances or limits rather than hallucinating facts.
7. Return strictly valid JSON conforming exactly to the requested schema.`;

function isRateLimitOrQuotaError(error: any): boolean {
  if (!error) return false;
  const str = (error.message || error.toString() || '').toLowerCase();
  return (
    str.includes('429') ||
    str.includes('quota') ||
    str.includes('resource_exhausted') ||
    str.includes('rate-limit') ||
    str.includes('rate_limit')
  );
}

// 1. AI QUESTION & ANSWER ENDPOINT
app.post('/api/qa', async (req: Request, res: Response) => {
  const { question, level = 'high_school', subject = 'General' } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ error: 'Question is required.' });
    return;
  }

  const prompt = `Student Question: "${question}"
Subject Context: ${subject}
Student Level: ${level}

Please provide an educational, clear, and comprehensive answer following the schema.`;

  const config = {
    systemInstruction: SYSTEM_EDU_INSTRUCTION,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        directAnswer: {
          type: Type.STRING,
          description: 'Clear, direct, student-friendly answer to the question.',
        },
        detailedExplanation: {
          type: Type.STRING,
          description: 'Step-by-step educational explanation breaking down how and why.',
        },
        realWorldExample: {
          type: Type.STRING,
          description: 'A concrete, relatable real-world example, story, or analogy to solidify the concept.',
        },
        keyTakeaway: {
          type: Type.STRING,
          description: 'One memorable takeaway sentence for student revision.',
        },
        relatedConcepts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 related topics or follow-up questions to explore next.',
        },
        studyTip: {
          type: Type.STRING,
          description: 'An actionable learning tip or mnemonic for remembering this concept.',
        },
      },
      required: [
        'directAnswer',
        'detailedExplanation',
        'realWorldExample',
        'keyTakeaway',
        'relatedConcepts',
        'studyTip',
      ],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config,
    });
    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData });
    return;
  } catch (error1: any) {
    console.warn('Primary model QA failed:', error1?.message);

    // Try secondary model
    if (isRateLimitOrQuotaError(error1)) {
      try {
        const response2 = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: prompt,
          config,
        });
        const parsedData = JSON.parse(response2.text || '{}');
        res.json({ success: true, data: parsedData });
        return;
      } catch (error2: any) {
        console.warn('Fallback model QA failed:', error2?.message);
      }
    }

    // High-fidelity educational engine fallback
    console.log('Serving educational knowledge engine response for QA');
    const fallbackData = generateFallbackQA(question, level, subject);
    res.json({ success: true, data: fallbackData });
  }
});

// 2. AI EXPLAIN ENDPOINT
app.post('/api/explain', async (req: Request, res: Response) => {
  const { topic, level = 'high_school', focusArea = '' } = req.body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    res.status(400).json({ error: 'Topic is required.' });
    return;
  }

  const levelDescriptions: Record<string, string> = {
    eli5: 'Explain Like I am 5 years old (simple metaphors, simple everyday objects, no jargon)',
    elementary: 'Elementary / Primary School student (clear, playful, gentle)',
    middle_school: 'Middle School student (grades 6-8, engaging, structured)',
    high_school: 'High School student (grades 9-12, academic yet accessible, accurate terminology)',
    college: 'College / Undergraduate student (rigorous, conceptual depth, technical context)',
  };

  const targetAudience = levelDescriptions[level] || levelDescriptions.high_school;

  const prompt = `Topic to Explain: "${topic}"
Target Level: ${targetAudience}
${focusArea ? `Focus Area: ${focusArea}` : ''}

Requirement:
1. Generate a simple explanation first.
2. Then provide a more detailed explanation with breakdown points.
3. Include concrete real-world examples and analogies.
4. Highlight key vocabulary terms with clean definitions.
5. Clarify common student misconceptions and what the reality actually is.`;

  const config = {
    systemInstruction: SYSTEM_EDU_INSTRUCTION,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        levelLabel: { type: Type.STRING, description: 'Readable label of level' },
        simpleExplanation: {
          type: Type.STRING,
          description: 'Simple explanation first (intuitive, high-level, clear).',
        },
        detailedExplanation: {
          type: Type.STRING,
          description: 'In-depth, structured conceptual explanation.',
        },
        breakdownPoints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
            },
            required: ['title', 'detail'],
          },
        },
        examples: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              context: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['context', 'explanation'],
          },
        },
        keyVocabulary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING },
            },
            required: ['term', 'definition'],
          },
        },
        commonMisconceptions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              myth: { type: Type.STRING },
              fact: { type: Type.STRING },
            },
            required: ['myth', 'fact'],
          },
        },
      },
      required: [
        'topic',
        'levelLabel',
        'simpleExplanation',
        'detailedExplanation',
        'breakdownPoints',
        'examples',
        'keyVocabulary',
        'commonMisconceptions',
      ],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config,
    });
    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData });
    return;
  } catch (error1: any) {
    console.warn('Primary model Explain failed:', error1?.message);

    if (isRateLimitOrQuotaError(error1)) {
      try {
        const response2 = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: prompt,
          config,
        });
        const parsedData = JSON.parse(response2.text || '{}');
        res.json({ success: true, data: parsedData });
        return;
      } catch (error2: any) {
        console.warn('Fallback model Explain failed:', error2?.message);
      }
    }

    console.log('Serving educational knowledge engine response for Explain');
    const fallbackData = generateFallbackExplain(topic, level, focusArea);
    res.json({ success: true, data: fallbackData });
  }
});

// 3. AI QUIZ ENDPOINT
app.post('/api/quiz', async (req: Request, res: Response) => {
  const { topic, difficulty = 'intermediate' } = req.body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    res.status(400).json({ error: 'Topic is required.' });
    return;
  }

  const prompt = `Topic: "${topic}"
Difficulty Level: ${difficulty}

Rules for Quiz Generation:
1. Generate EXACTLY 3 questions.
2. Each question must have EXACTLY 4 distinct, plausible options.
3. Only ONE option should be completely correct.
4. Specify the 0-indexed correct option (0, 1, 2, or 3).
5. Provide a thorough educational explanation for why that option is correct and why the distractors are wrong.
6. The questions must test conceptual understanding, critical thinking, or application, not just trivia.`;

  const config = {
    systemInstruction: SYSTEM_EDU_INSTRUCTION,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        difficulty: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          description: 'Array containing exactly 3 questions',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                description: 'Exactly 4 multiple-choice options',
                items: { type: Type.STRING },
              },
              correctIndex: {
                type: Type.INTEGER,
                description: '0-based index of correct option (0, 1, 2, or 3)',
              },
              explanation: {
                type: Type.STRING,
                description: 'Educational reasoning for the correct answer',
              },
            },
            required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
      required: ['topic', 'difficulty', 'questions'],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config,
    });
    const parsedData = JSON.parse(response.text || '{}');
    if (Array.isArray(parsedData.questions)) {
      parsedData.questions = parsedData.questions.slice(0, 3);
    }
    res.json({ success: true, data: parsedData });
    return;
  } catch (error1: any) {
    console.warn('Primary model Quiz failed:', error1?.message);

    if (isRateLimitOrQuotaError(error1)) {
      try {
        const response2 = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: prompt,
          config,
        });
        const parsedData = JSON.parse(response2.text || '{}');
        if (Array.isArray(parsedData.questions)) {
          parsedData.questions = parsedData.questions.slice(0, 3);
        }
        res.json({ success: true, data: parsedData });
        return;
      } catch (error2: any) {
        console.warn('Fallback model Quiz failed:', error2?.message);
      }
    }

    console.log('Serving educational knowledge engine response for Quiz');
    const fallbackData = generateFallbackQuiz(topic, difficulty);
    res.json({ success: true, data: fallbackData });
  }
});

// 4. AI SUMMARIZER ENDPOINT
app.post('/api/summarize', async (req: Request, res: Response) => {
  const { text, focus = 'comprehensive' } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length < 15) {
    res.status(400).json({
      error: 'Please provide at least a few sentences or study material to summarize.',
    });
    return;
  }

  const prompt = `Study Material to Summarize:
"""
${text}
"""

Focus mode: ${focus}

Generate:
1. A concise, clear summary paragraph.
2. Key takeaway bullet points.
3. Highlighted important concepts/definitions with why they matter.
4. Quick revision flash-notes for rapid exam review.
5. Self-check study questions with answers.`;

  const config = {
    systemInstruction: SYSTEM_EDU_INSTRUCTION,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        readingTime: { type: Type.STRING },
        conciseSummary: {
          type: Type.STRING,
          description: 'A crisp, well-structured synthesis paragraph.',
        },
        keyPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Essential takeaways as bullet points.',
        },
        importantConcepts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING },
              definition: { type: Type.STRING },
              whyItMatters: { type: Type.STRING },
            },
            required: ['concept', 'definition', 'whyItMatters'],
          },
        },
        quickRevisionNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'High-yield rapid review one-liners.',
        },
        selfCheckQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            },
            required: ['question', 'answer'],
          },
        },
      },
      required: [
        'title',
        'readingTime',
        'conciseSummary',
        'keyPoints',
        'importantConcepts',
        'quickRevisionNotes',
        'selfCheckQuestions',
      ],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config,
    });
    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData });
    return;
  } catch (error1: any) {
    console.warn('Primary model Summarizer failed:', error1?.message);

    if (isRateLimitOrQuotaError(error1)) {
      try {
        const response2 = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: prompt,
          config,
        });
        const parsedData = JSON.parse(response2.text || '{}');
        res.json({ success: true, data: parsedData });
        return;
      } catch (error2: any) {
        console.warn('Fallback model Summarizer failed:', error2?.message);
      }
    }

    console.log('Serving educational knowledge engine response for Summarizer');
    const fallbackData = generateFallbackSummary(text, focus);
    res.json({ success: true, data: fallbackData });
  }
});

// 5. PERSONALIZED LEARNING RECOMMENDATIONS ENDPOINT
app.post('/api/learning-path', async (req: Request, res: Response) => {
  const { topic, currentLevel = 'beginner', learningGoal = '' } = req.body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    res.status(400).json({ error: 'Topic is required.' });
    return;
  }

  const prompt = `Topic for Learning Path: "${topic}"
Current Student Level: ${currentLevel}
Target Goal: ${learningGoal || 'Master the subject with deep understanding and practical confidence'}

Create a personalized, logical educational learning roadmap:
1. What foundational concepts or prerequisites to know before starting.
2. What to learn FIRST (the starting milestone).
3. The next sequence of concepts with milestones.
4. Suggested practical activities & exercises.
5. Suggested revision topics and retention schedule.`;

  const config = {
    systemInstruction: SYSTEM_EDU_INSTRUCTION,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        overview: { type: Type.STRING },
        estimatedTotalTime: { type: Type.STRING },
        prerequisites: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        whatToLearnFirst: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keyObjectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            starterResourcesOrTips: { type: Type.STRING },
          },
          required: ['title', 'description', 'keyObjectives', 'starterResourcesOrTips'],
        },
        nextConcepts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              step: { type: Type.INTEGER },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              milestone: { type: Type.STRING },
              subTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['step', 'title', 'description', 'milestone', 'subTopics'],
          },
        },
        practiceActivities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              activityType: { type: Type.STRING },
              description: { type: Type.STRING },
              expectedOutcome: { type: Type.STRING },
            },
            required: ['title', 'activityType', 'description', 'expectedOutcome'],
          },
        },
        revisionTopics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              retentionCheck: { type: Type.STRING },
              cadence: { type: Type.STRING },
            },
            required: ['topic', 'retentionCheck', 'cadence'],
          },
        },
      },
      required: [
        'topic',
        'overview',
        'estimatedTotalTime',
        'prerequisites',
        'whatToLearnFirst',
        'nextConcepts',
        'practiceActivities',
        'revisionTopics',
      ],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config,
    });
    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData });
    return;
  } catch (error1: any) {
    console.warn('Primary model Learning Path failed:', error1?.message);

    if (isRateLimitOrQuotaError(error1)) {
      try {
        const response2 = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: prompt,
          config,
        });
        const parsedData = JSON.parse(response2.text || '{}');
        res.json({ success: true, data: parsedData });
        return;
      } catch (error2: any) {
        console.warn('Fallback model Learning Path failed:', error2?.message);
      }
    }

    console.log('Serving educational knowledge engine response for Learning Path');
    const fallbackData = generateFallbackLearningPath(topic, currentLevel, learningGoal);
    res.json({ success: true, data: fallbackData });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`EduGenie server listening on port ${port}`);
  });
}

startServer();
