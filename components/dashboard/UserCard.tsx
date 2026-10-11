"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Coins, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "@/lib/api";
import { ScoreRing, Pill } from "./ui-kit";

interface RecommendationUser {
  _id: string;
  name: string;
  bio?: string;
  languages: string[];

  skillsOffered: {
    skill: {
      _id: string;
      name: string;
    };
    tokenCost: number;
    proficiency: string;
    assessmentStatus?: "not_assessed" | "assessed" | "failed";
    assessmentScore?: number | null;
  }[];

  skillsWanted: {
    skill: {
      _id: string;
      name: string;
    };
    priority: string;
  }[];
}

interface Props {
  user: RecommendationUser;

  matchScore: number;

  reasons: string[];

  mySkills: {
    skill: {
      _id: string;
      name: string;
    };
    tokenCost: number;
    proficiency: string;
  }[];

  skillMap: Record<string, string>;

  myTokens: number;
}

export default function UserCard({
  user,
  matchScore,
  reasons,
  mySkills,
  skillMap,
  myTokens,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [learnSkill, setLearnSkill] = useState("");

  const [teachSkill, setTeachSkill] = useState("");

  const selectedLearnCost = useMemo(() => {
    if (!learnSkill) return null;

    const match = user.skillsOffered?.find((item) => {
      const id =
        typeof item.skill === "string"
          ? item.skill
          : item.skill._id;

      return id === learnSkill;
    });

    return match?.tokenCost ?? null;
  }, [learnSkill, user.skillsOffered]);

  const insufficientTokens =
    selectedLearnCost !== null && myTokens < selectedLearnCost;

  const handleSendRequest = async () => {
    try {
      if (!learnSkill || !teachSkill) {
        toast.error("Please select both skills.");
        return;
      }

      if (insufficientTokens) {
        return;
      }

      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/matches/request`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            receiverId: user._id,
            learnSkill,
            teachSkill,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send request");
        return;
      }

      toast.success("Request sent successfully");

      setLearnSkill("");
      setTeachSkill("");
    } catch (error) {
      console.error(error);

      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const initials = user.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-ink to-amber-gold" />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-ink to-amber-gold text-base font-bold text-white shadow-sm">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold font-display">
                {user.name}
              </h3>
              {user.languages?.length > 0 && (
                <p className="truncate text-xs text-muted-foreground">
                  {user.languages.join(" · ")}
                </p>
              )}
            </div>
          </div>

          <ScoreRing score={matchScore} />
        </div>

        {user.bio && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {user.bio}
          </p>
        )}

        {/* Skills Offered */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {user.skillsOffered?.map((item) => (
            <span
              key={item.skill._id}
              className="inline-flex items-center gap-1 rounded-full bg-amber-gold/10 px-2.5 py-1 text-xs font-medium text-amber-gold"
            >
              {item.skill.name} · {item.tokenCost}🪙
              {item.assessmentStatus === "assessed" && (
                <span className="flex items-center gap-0.5 text-primary">
                  <CheckCircle2 className="size-3" />
                  {item.assessmentScore}%
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Reasons */}
        {reasons?.length > 0 && (
          <div className="mt-4 space-y-1.5 rounded-2xl bg-muted/60 p-3">
            {reasons.slice(0, 3).map((reason) => (
              <div key={reason} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex-1 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Skill you want to learn
            </label>

            <select
              value={learnSkill}
              onChange={(e) => setLearnSkill(e.target.value)}
              className="w-full rounded-xl border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select skill</option>

              {user.skillsOffered?.map((item, index) => {
                const skillId =
                  typeof item.skill === "string"
                    ? item.skill
                    : item.skill._id;

                const skillName =
                  typeof item.skill === "string"
                    ? skillMap[item.skill] || item.skill
                    : item.skill.name;

                return (
                  <option key={index} value={skillId}>
                    {skillName} ({item.tokenCost} tokens)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Skill you'll teach in exchange
            </label>

            <select
              value={teachSkill}
              onChange={(e) => setTeachSkill(e.target.value)}
              className="w-full rounded-xl border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select skill</option>

              {mySkills?.map((item) => (
                <option key={item.skill._id} value={item.skill._id}>
                  {item.skill.name}
                </option>
              ))}
            </select>
          </div>

          {selectedLearnCost !== null && (
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                insufficientTokens
                  ? "bg-red-500/10 text-red-500"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {insufficientTokens ? (
                <AlertTriangle className="size-4 shrink-0" />
              ) : (
                <Coins className="size-4 shrink-0" />
              )}

              {insufficientTokens ? (
                <span>
                  Need {selectedLearnCost} tokens, you have {myTokens}
                </span>
              ) : (
                <span>
                  Costs {selectedLearnCost} tokens · You have {myTokens}
                </span>
              )}
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSendRequest}
          disabled={loading || insufficientTokens || !learnSkill || !teachSkill}
          className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : insufficientTokens
              ? "Not Enough Tokens"
              : "Send Match Request"}
        </motion.button>
      </div>
    </motion.div>
  );
}
