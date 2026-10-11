"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, Star, CheckCircle2, Coins } from "lucide-react";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader, Pill, EmptyState, SkeletonGrid, staggerContainer, fadeUp } from "./ui-kit";

interface Match {
  _id: string;

  learner: {
    _id: string;
    name: string;
    email: string;
  };

  teacher: {
    _id: string;
    name: string;
    email: string;
  };

  learningSkill: {
    _id: string;
    name: string;
    category: string;
  };

  teachingSkill: {
    _id: string;
    name: string;
    category: string;
  };

  status: string;

  startedAt: string;

  endedAt: string;

  tokensTransferred: number;

  learnerRated: boolean;

  teacherRated: boolean;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
        >
          <Star
            className={`size-6 transition-colors ${
              n <= value
                ? "fill-amber-gold text-amber-gold"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function MatchHistory() {
  const [matches, setMatches] =
    useState<Match[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [rating, setRating] =
    useState<Record<string, number>>(
      {}
    );

  const [comment, setComment] =
    useState<Record<string, string>>(
      {}
    );

  const [submitting, setSubmitting] =
    useState<string | null>(null);

  const fetchHistory =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res = await fetch(
          `${API_URL}/api/matches/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await res.json();

        setMatches(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  const handleReview = async (
    matchId: string,
    revieweeId: string
  ) => {
    try {
      setSubmitting(matchId);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/reviews`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            matchId,
            revieweeId,

            rating:
              rating[matchId] || 5,

            comment:
              comment[matchId] || "",
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(
        "Review submitted successfully"
      );

      fetchHistory();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(null);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);


  const currentUserId =
    typeof window !==
      "undefined"
      ? JSON.parse(
        atob(
          localStorage
            .getItem("token")
            ?.split(".")[1] || ""
        )
      ).id
      : "";

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader icon={History} eyebrow="Completed" title="Match History" subtitle="Loading your past skill exchanges..." />
        <SkeletonGrid count={3} className="h-56" cols="" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={History}
        eyebrow="Completed"
        title="Match History"
        subtitle="Your completed skill exchange sessions, and the reviews that came out of them."
      />

      {matches.length === 0 ? (
        <EmptyState
          icon={History}
          title="No match history yet"
          subtitle="Complete an active match to see it show up here."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-5"
        >
          {matches.map((match) => {
            const hasReviewed =
              currentUserId ===
                match.learner._id
                ? match.learnerRated
                : match.teacherRated;

            const other =
              currentUserId === match.learner._id
                ? match.teacher
                : match.learner;

            return (
              <motion.div
                variants={fadeUp}
                key={match._id}
                className="overflow-hidden rounded-3xl border bg-card shadow-sm"
              >
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-ink to-amber-gold font-bold text-white">
                      {other.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold font-display leading-tight">
                        {currentUserId === match.learner._id
                          ? `Learned ${match.learningSkill?.name} from ${match.teacher?.name}`
                          : `Taught ${match.learningSkill?.name} to ${match.learner?.name}`}
                      </h2>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Pill tone="primary">
                          Learned: {match.learningSkill?.name}
                        </Pill>
                        <Pill tone="amber">
                          Taught: {match.teachingSkill?.name}
                        </Pill>
                        <Pill icon={Coins}>
                          {match.tokensTransferred} tokens
                        </Pill>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(match.startedAt).toLocaleDateString()} –{" "}
                        {new Date(match.endedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t bg-muted/30 px-6 py-4">
                  {hasReviewed ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <CheckCircle2 className="size-4" />
                      Review submitted
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">
                        Leave a review for {other.name}
                      </p>

                      <StarPicker
                        value={rating[match._id] || 5}
                        onChange={(v) =>
                          setRating({ ...rating, [match._id]: v })
                        }
                      />

                      <textarea
                        value={comment[match._id] || ""}
                        onChange={(e) =>
                          setComment({
                            ...comment,
                            [match._id]: e.target.value,
                          })
                        }
                        placeholder="How was the session?"
                        rows={2}
                        className="w-full rounded-xl border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                      />

                      <button
                        onClick={() =>
                          handleReview(
                            match._id,
                            currentUserId === match.learner._id
                              ? match.teacher._id
                              : match.learner._id
                          )
                        }
                        disabled={submitting === match._id}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                      >
                        {submitting === match._id
                          ? "Submitting..."
                          : "Submit Review"}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
