"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { API_URL } from "@/lib/api";

interface SafeQuestion {
  questionText: string;
  options: string[];
}

interface GradedQuestion extends SafeQuestion {
  correctIndex: number;
  explanation: string;
  selectedIndex: number | null;
}

interface AssessmentModalProps {
  skillId: string;
  skillName: string;
  proficiency: string;
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type Stage = "intro" | "loading" | "active" | "confirm" | "result" | "error";

const PASS_THRESHOLD_DEFAULT = 70;

export default function AssessmentModal({
  skillId,
  skillName,
  proficiency,
  open,
  onClose,
  onComplete,
}: AssessmentModalProps) {
  const [stage, setStage] = useState<Stage>("intro");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SafeQuestion[]>([]);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(600);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState<{
    percentage: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    timeTakenSeconds: number;
    passThreshold: number;
    questions: GradedQuestion[];
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitRef = useRef<() => void>(() => {});

  // Reset to a clean intro screen whenever a different skill is opened.
  useEffect(() => {
    if (!open) return;

    setStage("intro");
    setErrorMessage(null);
    setAssessmentId(null);
    setQuestions([]);
    setCurrent(0);
    setSelections({});
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, skillId]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const startTimer = (expiresAtMs: number) => {
    clearTimer();

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((expiresAtMs - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearTimer();
        toast("Time's up — submitting your answers.");
        submitRef.current();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  const beginAssessment = async () => {
    try {
      setStage("loading");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/assessments/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skillId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.message || "Couldn't generate an assessment right now."
        );
        setStage("error");
        return;
      }

      setAssessmentId(data.assessmentId);
      setQuestions(data.questions || []);
      setTimeLimitSeconds(data.timeLimitSeconds);

      const expiresAtMs = new Date(data.expiresAt).getTime();
      setExpiresAt(expiresAtMs);
      startTimer(expiresAtMs);

      setStage("active");
    } catch (error) {
      console.error(error);
      setErrorMessage("Couldn't generate an assessment right now.");
      setStage("error");
    }
  };

  const handleSubmit = async () => {
    if (!assessmentId || submitting) return;

    try {
      setSubmitting(true);
      clearTimer();

      const token = localStorage.getItem("token");

      const answers = Object.entries(selections).map(
        ([questionIndex, selectedIndex]) => ({
          questionIndex: Number(questionIndex),
          selectedIndex,
        })
      );

      const res = await fetch(
        `${API_URL}/api/assessments/${assessmentId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to submit assessment");
        setSubmitting(false);
        return;
      }

      setResult(data);
      setStage("result");
      onComplete?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  submitRef.current = handleSubmit;

  const answeredCount = Object.keys(selections).length;
  const isLastQuestion = current === questions.length - 1;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeLow = secondsLeft <= 60;

  const handleClose = () => {
    clearTimer();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border p-0">
        <DialogHeader className="border-b p-4 space-y-0">
          <DialogTitle className="flex items-center justify-between gap-2 font-display">
            <span className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              {skillName} Assessment
            </span>

            {stage === "active" && (
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  timeLow
                    ? "bg-red-500/10 text-red-500"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Clock className="size-3.5" />
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {stage === "intro" && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-7" />
              </div>

              <div>
                <p className="font-semibold text-lg">
                  Verify your {skillName} skill
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll get 8 AI-generated questions tailored to{" "}
                  <span className="font-medium text-foreground">
                    {proficiency}
                  </span>{" "}
                  level, with 10 minutes to complete them. Score{" "}
                  {PASS_THRESHOLD_DEFAULT}% or higher to have this skill
                  marked as Assessed on your profile.
                </p>
              </div>

              <div className="rounded-xl bg-muted p-3 text-left text-xs text-muted-foreground space-y-1.5">
                <p>• A passing score shows others you demonstrated real knowledge — not a guarantee of expertise.</p>
                <p>• If you don't pass, you can retake it after a short cooldown.</p>
                <p>• Once you start, the timer won't pause.</p>
              </div>

              <Button
                onClick={beginAssessment}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Assessment
              </Button>
            </div>
          )}

          {stage === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Generating your {proficiency.toLowerCase()}-level questions...
              </p>
            </div>
          )}

          {stage === "error" && (
            <div className="space-y-4 text-center py-8">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <AlertTriangle className="size-6" />
              </div>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button variant="outline" onClick={() => setStage("intro")}>
                Try Again
              </Button>
            </div>
          )}

          {stage === "active" && questions[current] && (
            <div className="space-y-4">
              {/* Progress dots */}
              <div className="flex flex-wrap gap-1.5">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      i === current
                        ? "bg-primary text-primary-foreground"
                        : selections[i] !== undefined
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Question {current + 1} of {questions.length} ·{" "}
                {answeredCount} answered
              </p>

              <p className="font-medium leading-relaxed">
                {questions[current].questionText}
              </p>

              <div className="space-y-2">
                {questions[current].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setSelections((prev) => ({ ...prev, [current]: i }))
                    }
                    className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${
                      selections[current] === i
                        ? "border-primary bg-primary/10 font-medium"
                        : "hover:bg-accent"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Previous
                </Button>

                {isLastQuestion ? (
                  <Button
                    size="sm"
                    onClick={() => setStage("confirm")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Review & Submit
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() =>
                      setCurrent((c) => Math.min(questions.length - 1, c + 1))
                    }
                  >
                    Next
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {stage === "confirm" && (
            <div className="space-y-4 text-center py-6">
              <p className="font-semibold">
                You've answered {answeredCount} of {questions.length}{" "}
                questions.
              </p>
              {answeredCount < questions.length && (
                <p className="text-sm text-red-500">
                  Unanswered questions will be marked incorrect.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Once submitted, you can't change your answers.
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStage("active")}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitting ? "Submitting..." : "Submit Assessment"}
                </Button>
              </div>
            </div>
          )}

          {stage === "result" && result && (
            <div className="space-y-5">
              <div
                className={`rounded-2xl p-5 text-center ${
                  result.passed
                    ? "bg-primary/10"
                    : "bg-red-500/10"
                }`}
              >
                {result.passed ? (
                  <CheckCircle2 className="mx-auto size-10 text-primary" />
                ) : (
                  <XCircle className="mx-auto size-10 text-red-500" />
                )}

                <p className="mt-2 text-3xl font-bold font-display">
                  {result.percentage}%
                </p>

                <p
                  className={`font-semibold ${
                    result.passed ? "text-primary" : "text-red-500"
                  }`}
                >
                  {result.passed ? "Assessed — Passed!" : "Not Passed"}
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  {result.correctCount} of {result.totalQuestions} correct ·{" "}
                  {Math.floor(result.timeTakenSeconds / 60)}m{" "}
                  {result.timeTakenSeconds % 60}s
                </p>

                <p className="text-xs text-muted-foreground mt-2">
                  {result.passed
                    ? `This shows other users you demonstrated real ${skillName} knowledge through Tandemly's assessment.`
                    : `You need ${result.passThreshold}% to pass. You can retake this after a short cooldown.`}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Question review</p>

                {result.questions.map((q, i) => {
                  const isCorrect = q.selectedIndex === q.correctIndex;

                  return (
                    <div
                      key={i}
                      className="rounded-xl border p-3 text-sm space-y-1.5"
                    >
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                        )}
                        <p className="font-medium">{q.questionText}</p>
                      </div>

                      <p className="text-xs text-muted-foreground pl-6">
                        Correct answer: {q.options[q.correctIndex]}
                      </p>

                      {!isCorrect && q.selectedIndex !== null && (
                        <p className="text-xs text-red-500 pl-6">
                          Your answer: {q.options[q.selectedIndex]}
                        </p>
                      )}

                      {q.explanation && (
                        <p className="text-xs text-muted-foreground pl-6 italic">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
