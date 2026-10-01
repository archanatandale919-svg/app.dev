import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini on server-side with required User-Agent
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. In AI Studio, ensure secrets are attached. If deployed on Vercel/hosting, add GEMINI_API_KEY in Project Settings > Environment Variables.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface SolveProblemRequest {
  question: string;
  gradeLevel: string;
  subject?: string;
  tone?: string;
  imageBase64?: string;
  imageMimeType?: string;
  highPrecisionMode?: boolean;
}

export interface ExplainConceptRequest {
  concept: string;
  gradeLevel: string;
  domain?: string;
}

// Resilient runner that tries primary model and falls back if unavailable
async function generateWithFallback(ai: GoogleGenAI, params: any) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed with:`, err.message || err);
      lastError = err;
      // Continue to next model fallback
    }
  }

  throw lastError || new Error('All model providers failed to generate content.');
}

function parseJsonSafely(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

export async function solveAcademicProblem(req: SolveProblemRequest) {
  const ai = getGenAIClient();
  const {
    question,
    gradeLevel,
    subject = 'General Academic',
    tone = 'conversational',
    imageBase64,
    imageMimeType,
    highPrecisionMode = true,
  } = req;

  const systemPrompt = `You are OmniStudy AI, a world-class academic tutor and universal scholar capable of explaining any concept in the universe to any student from Elementary to Graduate/Research level.

Target Grade Level: ${gradeLevel}
Academic Discipline: ${subject}
Explanation Tone: ${tone}
High Precision Mode: ${highPrecisionMode ? 'ENABLED (Provide rigorous mathematical derivations, exact units, sanity checks, and LaTeX formatting)' : 'STANDARD'}

Your objective:
1. Provide a dual-layered response:
   a) "simplifiedExplanation": A remarkably clear, intuitive explanation using plain, friendly language and a relatable real-world analogy (The Feynman Technique). No confusing jargon without explanation.
   b) "rigorousSolution": A high-precision, uncompromisingly rigorous academic solution with step-by-step mathematical reasoning, formal definitions, and LaTeX formulas (use $...$ for inline math and $$...$$ for display equations).
2. "steps": An array of concrete sequential steps leading to the answer. Each step must have a title, explanation, optional LaTeX formula, and a sanity check.
3. "formulasUsed": All relevant theorems, equations, or laws used.
4. "keyTakeaways": 2-4 core principles the student should remember.
5. "practiceQuestions": 2-3 interactive multiple-choice check questions with options, correct answer index (0-3), and thorough explanations to reinforce mastery.

Always return clean, valid JSON matching the specified schema.`;

  const contents: any[] = [];

  if (imageBase64 && imageMimeType) {
    contents.push({
      inlineData: {
        data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
        mimeType: imageMimeType,
      },
    });
  }

  contents.push({
    text: `Solve and explain this academic problem for a student at the ${gradeLevel} level:\n\n${question}`,
  });

  const rawText = await generateWithFallback(ai, {
    contents: contents.length === 1 ? contents[0].text : { parts: contents },
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'A succinct, engaging title for this problem/solution',
          },
          subject: {
            type: Type.STRING,
            description: 'The classified academic field',
          },
          simplifiedExplanation: {
            type: Type.STRING,
            description: 'Intuitive everyday explanation with simple analogies',
          },
          rigorousSolution: {
            type: Type.STRING,
            description: 'Rigorous step-by-step solution with LaTeX formulas',
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                mathFormula: { type: Type.STRING },
                sanityCheck: { type: Type.STRING },
              },
              required: ['stepNumber', 'title', 'explanation'],
            },
          },
          formulasUsed: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          practiceQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                hint: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctIndex', 'explanation'],
            },
          },
        },
        required: [
          'title',
          'subject',
          'simplifiedExplanation',
          'rigorousSolution',
          'steps',
          'formulasUsed',
          'keyTakeaways',
        ],
      },
    },
  });

  return parseJsonSafely(rawText);
}

export async function explainUniverseConcept(req: ExplainConceptRequest) {
  const ai = getGenAIClient();
  const { concept, gradeLevel, domain = 'Universal Science & Knowledge' } = req;

  const systemPrompt = `You are OmniStudy AI, possessing universal mastery of all concepts in the cosmos—from elementary phenomena (e.g. why is the sky blue, how plants eat sunlight) to advanced scientific and philosophical principles (e.g. general relativity, RNA transcriptomics, Galois theory, Kantian metaphysics).

Target Grade Level: ${gradeLevel}
Domain: ${domain}

Requirements:
1. "simpleAnalogy": An intuitive, brilliant real-world comparison that demystifies the concept completely.
2. "deepDive": A rigorous, comprehensive, highly precise explanation with exact mechanics, historical discovery, laws, and LaTeX equations.
3. "keyFormulas": Key equations or formal definitions.
4. "tags": 3-5 related cosmic or academic concepts.
5. "quiz": 2 multiple-choice questions to test deep comprehension.

Always return clean, valid JSON matching the specified schema.`;

  const rawText = await generateWithFallback(ai, {
    contents: `Explain the concept: "${concept}" for a ${gradeLevel} student.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          domain: { type: Type.STRING },
          simpleAnalogy: { type: Type.STRING },
          deepDive: { type: Type.STRING },
          keyFormulas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                hint: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctIndex', 'explanation'],
            },
          },
        },
        required: ['title', 'domain', 'simpleAnalogy', 'deepDive', 'tags'],
      },
    },
  });

  return parseJsonSafely(rawText);
}
