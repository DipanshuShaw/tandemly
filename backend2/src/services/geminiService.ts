import { IAssessmentQuestion } from "../models/Assessment";

/* =========================================
   GEMINI-BACKED ASSESSMENT GENERATION

   Isolated behind generateAssessmentQuestions() so
   the AI provider could be swapped out later without
   touching the controller that calls it. Everything
   Gemini-specific (endpoint, prompt shape, response
   parsing) lives only in this file.
========================================= */

// gemini-2.0-flash was shut down by Google on June 1, 2026; Google's release
// notes name gemini-3.5-flash (or gemini-3.1-flash-lite) as the replacement.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const REQUEST_TIMEOUT_MS = 45000;

export class AssessmentGenerationError extends Error {}

const buildPrompt = (
  skillName: string,
  proficiency: string,
  count: number
) => `You are writing a skill assessment for a peer-to-peer learning platform. Generate ${count} multiple-choice questions that test REAL understanding of "${skillName}" at a "${proficiency}" proficiency level — not trivial definitions.

Mix question types across: conceptual understanding, practical application, scenario-based reasoning, debugging/problem-solving, and best practices. Calibrate difficulty strictly to the "${proficiency}" level:
- Beginner: fundamentals a competent newcomer should know, but still requiring real understanding, not just terminology recall.
- Intermediate: applied, practical questions a working practitioner would face.
- Advanced: nuanced, architecture/performance/edge-case questions that only an experienced practitioner would reliably get right.

Respond with ONLY a JSON array (no markdown, no commentary, no code fences) of exactly ${count} objects, each shaped exactly like:
{"questionText": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "explanation": "one short sentence on why the correct answer is right"}

Rules:
- Exactly 4 options per question, plausible distractors, only one clearly correct.
- correctIndex is the 0-based index of the correct option.
- Do not repeat the same question twice.
- Output valid JSON only.`;

interface RawQuestion {
  questionText?: unknown;
  options?: unknown;
  correctIndex?: unknown;
  explanation?: unknown;
}

const isValidQuestion = (q: RawQuestion): q is {
  questionText: string; options: string[]; correctIndex: number; explanation?: string;
} => {
  return (
    typeof q.questionText === "string" &&
    q.questionText.trim().length > 0 &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every((o) => typeof o === "string" && o.trim().length > 0) &&
    typeof q.correctIndex === "number" &&
    Number.isInteger(q.correctIndex) &&
    q.correctIndex >= 0 &&
    q.correctIndex <= 3
  );
};

const extractJsonArray = (text: string): unknown => {
  // Gemini sometimes wraps output in ```json fences despite instructions —
  // strip those before parsing rather than failing outright.
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1 || end < start) {
    throw new AssessmentGenerationError(
      "Assessment generator returned an unrecognized format"
    );
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new AssessmentGenerationError(
      "Assessment generator returned malformed data"
    );
  }
};

export const generateAssessmentQuestions = async (
  skillName: string,
  proficiency: string,
  count = 8
): Promise<IAssessmentQuestion[]> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AssessmentGenerationError(
      "Assessment generation isn't configured on the server yet"
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(skillName, proficiency, count) }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new AssessmentGenerationError(
        "Assessment generation timed out — please try again"
      );
    }
    throw new AssessmentGenerationError(
      "Could not reach the assessment generator"
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) {
    throw new AssessmentGenerationError(
      "Assessment generator is busy right now — please try again shortly"
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(
      `[Gemini] ${GEMINI_MODEL} request failed (${response.status}):`,
      body.slice(0, 500)
    );
    throw new AssessmentGenerationError(
      `Assessment generator request failed (${response.status}) — check the server log and GEMINI_MODEL / GEMINI_API_KEY`
    );
  }

  const data = await response.json().catch(() => null);

  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  const text: string | undefined =
    parts
      .filter((p) => typeof p?.text === "string" && !p?.thought)
      .map((p) => p.text)
      .join("") || undefined;

  if (!text) {
    throw new AssessmentGenerationError(
      "Assessment generator returned an empty response"
    );
  }

  const parsed = extractJsonArray(text);

  if (!Array.isArray(parsed)) {
    throw new AssessmentGenerationError(
      "Assessment generator did not return a list of questions"
    );
  }

  const valid = (parsed as RawQuestion[]).filter(isValidQuestion);

  if (valid.length < Math.min(5, count)) {
    throw new AssessmentGenerationError(
      "Assessment generator did not return enough usable questions"
    );
  }

  return valid.slice(0, count).map((q) => ({
    questionText: q.questionText.trim(),
    options: q.options.map((o) => o.trim()),
    correctIndex: q.correctIndex,
    explanation:
      typeof q.explanation === "string" ? q.explanation.trim() : "",
  }));
};
