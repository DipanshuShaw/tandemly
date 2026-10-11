"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, History } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { API_URL } from "@/lib/api";

interface HistoryEntry {
  _id: string;
  attemptNumber: number;
  percentage: number;
  passed: boolean;
  status: string;
  submittedAt: string;
  totalQuestions: number;
  correctCount: number;
}

interface AssessmentHistoryDialogProps {
  skillId: string;
  skillName: string;
  open: boolean;
  onClose: () => void;
}

export default function AssessmentHistoryDialog({
  skillId,
  skillName,
  open,
  onClose,
}: AssessmentHistoryDialogProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    setLoading(true);

    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/assessments/skill/${skillId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [open, skillId]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <History className="size-5 text-primary" />
            {skillName} — Assessment History
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Loading history...
          </p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No completed attempts yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <div className="flex items-center gap-2.5">
                  {entry.passed ? (
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                  ) : (
                    <XCircle className="size-4 text-red-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      Attempt {entry.attemptNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.submittedAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" }
                      )}{" "}
                      · {entry.correctCount}/{entry.totalQuestions} correct
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    entry.passed
                      ? "bg-primary/10 text-primary"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {entry.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
