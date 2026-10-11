import { Response } from "express";

import Assessment from "../models/Assessment";
import User from "../models/User";
import Skill from "../models/Skill";
import {
  generateAssessmentQuestions,
  AssessmentGenerationError,
} from "../services/geminiService";

const QUESTIONS_PER_ASSESSMENT = 8;
const TIME_LIMIT_SECONDS = 600; // 10 minutes
const PASS_THRESHOLD_PERCENT = 70; // easy to tune later
const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours between attempts on the same skill

const safeQuestion = (q: { questionText: string; options: string[] }) => ({
  questionText: q.questionText,
  options: q.options,
});

const findOfferedSkill = (user: any, skillId: string) =>
  user.skillsOffered.find((s: any) => s.skill.toString() === skillId);

/* =====================================
   GENERATE (or resume) AN ASSESSMENT
===================================== */

export const generateAssessment = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();
    const { skillId } = req.body;

    if (!skillId) {
      return res.status(400).json({ message: "skillId is required" });
    }

    const user = await User.findById(userId);
    const offered = user && findOfferedSkill(user, skillId);

    if (!user || !offered) {
      return res.status(404).json({
        message: "You don't currently offer this skill",
      });
    }

    // Resume an unexpired in-progress attempt instead of starting a new one.
    const existing = await Assessment.findOne({
      user: userId,
      skill: skillId,
      status: "in_progress",
    }).sort({ createdAt: -1 });

    if (existing && existing.expiresAt.getTime() > Date.now()) {
      return res.status(200).json({
        assessmentId: existing._id,
        proficiency: existing.proficiencyClaimed,
        attemptNumber: existing.attemptNumber,
        timeLimitSeconds: existing.timeLimitSeconds,
        expiresAt: existing.expiresAt,
        questions: existing.questions.map(safeQuestion),
        resumed: true,
      });
    }

    // Cooldown — based on the most recently *submitted* attempt for this skill.
    const lastSubmitted = await Assessment.findOne({
      user: userId,
      skill: skillId,
      status: { $in: ["submitted", "expired"] },
    }).sort({ submittedAt: -1 });

    if (lastSubmitted?.submittedAt) {
      const elapsed = Date.now() - lastSubmitted.submittedAt.getTime();

      if (elapsed < COOLDOWN_MS) {
        const minutesLeft = Math.ceil((COOLDOWN_MS - elapsed) / 60000);

        return res.status(429).json({
          message: `You can retake this assessment in about ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
          cooldownMs: COOLDOWN_MS - elapsed,
        });
      }
    }

    const skill = await Skill.findById(skillId);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    let questions;

    try {
      questions = await generateAssessmentQuestions(
        skill.name,
        offered.proficiency,
        QUESTIONS_PER_ASSESSMENT
      );
    } catch (error) {
      if (error instanceof AssessmentGenerationError) {
        return res.status(502).json({ message: error.message });
      }
      throw error;
    }

    const attemptNumber =
      (await Assessment.countDocuments({ user: userId, skill: skillId })) + 1;

    const now = new Date();

    const assessment = await Assessment.create({
      user: userId,
      skill: skillId,
      proficiencyClaimed: offered.proficiency,
      attemptNumber,
      questions,
      totalQuestions: questions.length,
      timeLimitSeconds: TIME_LIMIT_SECONDS,
      startedAt: now,
      expiresAt: new Date(now.getTime() + TIME_LIMIT_SECONDS * 1000),
    });

    return res.status(201).json({
      assessmentId: assessment._id,
      proficiency: assessment.proficiencyClaimed,
      attemptNumber: assessment.attemptNumber,
      timeLimitSeconds: assessment.timeLimitSeconds,
      expiresAt: assessment.expiresAt,
      questions: assessment.questions.map(safeQuestion),
      resumed: false,
    });
  } catch (error) {
    console.error("Generate Assessment Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   SUBMIT AN ASSESSMENT
===================================== */

export const submitAssessment = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();
    const { id } = req.params;
    const { answers } = req.body;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    if (assessment.user.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized for this assessment",
      });
    }

    if (assessment.status !== "in_progress") {
      return res.status(400).json({
        message: "This assessment has already been submitted",
      });
    }

    const expired = Date.now() > assessment.expiresAt.getTime();

    const cleanAnswers: { questionIndex: number; selectedIndex: number }[] =
      Array.isArray(answers)
        ? answers.filter(
            (a: any) =>
              Number.isInteger(a?.questionIndex) &&
              Number.isInteger(a?.selectedIndex) &&
              a.questionIndex >= 0 &&
              a.questionIndex < assessment.questions.length
          )
        : [];

    let correctCount = 0;

    const answerMap = new Map(
      cleanAnswers.map((a) => [a.questionIndex, a.selectedIndex])
    );

    assessment.questions.forEach((q, i) => {
      if (answerMap.get(i) === q.correctIndex) correctCount++;
    });

    const percentage = Math.round(
      (correctCount / assessment.questions.length) * 100
    );

    const passed = !expired && percentage >= PASS_THRESHOLD_PERCENT;

    assessment.answers = cleanAnswers;
    assessment.correctCount = correctCount;
    assessment.percentage = percentage;
    assessment.passed = passed;
    assessment.status = expired ? "expired" : "submitted";
    assessment.submittedAt = new Date();
    assessment.timeTakenSeconds = Math.round(
      (assessment.submittedAt.getTime() - assessment.startedAt.getTime()) / 1000
    );

    await assessment.save();

    // Reflect the outcome on the user's offered-skill entry.
    const user = await User.findById(userId);
    const offered = user && findOfferedSkill(user, assessment.skill.toString());

    if (user && offered) {
      offered.assessmentStatus = passed ? "assessed" : "failed";
      offered.assessmentScore = percentage;
      offered.lastAssessmentId = assessment._id;
      offered.lastAssessedAt = assessment.submittedAt;
      await user.save();
    }

    return res.json({
      assessmentId: assessment._id,
      totalQuestions: assessment.totalQuestions,
      correctCount: assessment.correctCount,
      percentage: assessment.percentage,
      passed: assessment.passed,
      expired,
      timeTakenSeconds: assessment.timeTakenSeconds,
      passThreshold: PASS_THRESHOLD_PERCENT,
      questions: assessment.questions.map((q, i) => ({
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        selectedIndex: answerMap.get(i) ?? null,
      })),
    });
  } catch (error) {
    console.error("Submit Assessment Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   ACTIVE (RESUMABLE) ASSESSMENT FOR A SKILL
===================================== */

export const getActiveForSkill = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();
    const { skillId } = req.params;

    const existing = await Assessment.findOne({
      user: userId,
      skill: skillId,
      status: "in_progress",
    }).sort({ createdAt: -1 });

    if (!existing || existing.expiresAt.getTime() <= Date.now()) {
      return res.json({ active: null });
    }

    return res.json({
      active: {
        assessmentId: existing._id,
        proficiency: existing.proficiencyClaimed,
        attemptNumber: existing.attemptNumber,
        timeLimitSeconds: existing.timeLimitSeconds,
        expiresAt: existing.expiresAt,
        questions: existing.questions.map(safeQuestion),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   ASSESSMENT HISTORY FOR A SKILL
===================================== */

export const getAssessmentHistory = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();
    const { skillId } = req.params;

    const history = await Assessment.find({
      user: userId,
      skill: skillId,
      status: { $in: ["submitted", "expired"] },
    })
      .sort({ attemptNumber: -1 })
      .select(
        "attemptNumber percentage passed status submittedAt timeTakenSeconds totalQuestions correctCount"
      )
      .lean();

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   GET ONE ASSESSMENT (full detail, owner only)
===================================== */

export const getAssessmentById = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user._id.toString();
    const { id } = req.params;

    const assessment = await Assessment.findById(id).lean();

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    if (assessment.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const isSubmitted = assessment.status !== "in_progress";

    const answerMap = new Map(
      assessment.answers.map((a) => [a.questionIndex, a.selectedIndex])
    );

    return res.json({
      assessmentId: assessment._id,
      status: assessment.status,
      proficiency: assessment.proficiencyClaimed,
      attemptNumber: assessment.attemptNumber,
      totalQuestions: assessment.totalQuestions,
      correctCount: assessment.correctCount,
      percentage: assessment.percentage,
      passed: assessment.passed,
      timeTakenSeconds: assessment.timeTakenSeconds,
      submittedAt: assessment.submittedAt,
      questions: assessment.questions.map((q, i) => ({
        questionText: q.questionText,
        options: q.options,
        selectedIndex: answerMap.get(i) ?? null,
        ...(isSubmitted
          ? { correctIndex: q.correctIndex, explanation: q.explanation }
          : {}),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
