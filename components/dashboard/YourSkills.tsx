"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Trash2,
  Plus,
  Coins,
  Sparkles,
  CheckCircle2,
  XCircle,
  History,
  Layers,
} from "lucide-react";

import { API_URL } from "@/lib/api";
import { useUserProfile } from "@/contexts/UserProfileContext";
import SkillSelector from "../SkillSelector";
import AssessmentModal from "./AssessmentModal";
import AssessmentHistoryDialog from "./AssessmentHistoryDialog";
import { PageHeader, StatChip, Pill, EmptyState, staggerContainer, fadeUp } from "./ui-kit";

interface Skill {
  _id: string;
  name: string;
  category: string;
}

const PROFICIENCY_DOTS: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const PRIORITY_TONE: Record<string, "muted" | "amber" | "red"> = {
  Low: "muted",
  Medium: "amber",
  High: "red",
};

function ProficiencyDots({ level }: { level: string }) {
  const filled = PROFICIENCY_DOTS[level] || 1;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`size-1.5 rounded-full ${
            i <= filled ? "bg-primary" : "bg-muted-foreground/25"
          }`}
        />
      ))}
    </span>
  );
}

export default function YourSkills() {
  const { profile, loading: profileLoading, refetchProfile } =
    useUserProfile();

  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  const [selectedOfferSkill, setSelectedOfferSkill] = useState("");
  const [selectedWantSkill, setSelectedWantSkill] = useState("");

  const [tokenCost, setTokenCost] = useState(10);
  const [proficiency, setProficiency] = useState("Intermediate");
  const [priority, setPriority] = useState("Medium");

  const [addingOffered, setAddingOffered] = useState(false);
  const [addingWanted, setAddingWanted] = useState(false);

  const [skillsLoading, setSkillsLoading] = useState(true);

  const [assessingSkill, setAssessingSkill] = useState<
    { skillId: string; skillName: string; proficiency: string } | null
  >(null);

  const [historySkill, setHistorySkill] = useState<
    { skillId: string; skillName: string } | null
  >(null);

  const loading = profileLoading || skillsLoading;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_URL}/api/skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const skillsData = await res.json();

      setAllSkills(skillsData);
    } catch (error) {
      console.error(error);
    } finally {
      setSkillsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const offeredIds = useMemo(
    () => new Set(profile?.skillsOffered.map((s) => s.skill._id)),
    [profile]
  );

  const wantedIds = useMemo(
    () => new Set(profile?.skillsWanted.map((s) => s.skill._id)),
    [profile]
  );

  const offerableSkills = allSkills.filter(
    (s) => !offeredIds.has(s._id)
  );

  const wantableSkills = allSkills.filter(
    (s) => !wantedIds.has(s._id)
  );

  const addOfferedSkill = async () => {
    if (!selectedOfferSkill) return;

    try {
      setAddingOffered(true);

      await fetch(`${API_URL}/api/users/skills/offered`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillId: selectedOfferSkill,
          tokenCost,
          proficiency,
        }),
      });

      setSelectedOfferSkill("");
      setTokenCost(10);
      setProficiency("Intermediate");

      refetchProfile();
    } catch (error) {
      console.error(error);
    } finally {
      setAddingOffered(false);
    }
  };

  const addWantedSkill = async () => {
    if (!selectedWantSkill) return;

    try {
      setAddingWanted(true);

      await fetch(`${API_URL}/api/users/skills/wanted`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillId: selectedWantSkill,
          priority,
        }),
      });

      setSelectedWantSkill("");
      setPriority("Medium");

      refetchProfile();
    } catch (error) {
      console.error(error);
    } finally {
      setAddingWanted(false);
    }
  };

  const removeOfferedSkill = async (skillId: string) => {
    try {
      await fetch(
        `${API_URL}/api/users/skills/offered/${skillId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      refetchProfile();
    } catch (error) {
      console.error(error);
    }
  };

  const removeWantedSkill = async (skillId: string) => {
    try {
      await fetch(
        `${API_URL}/api/users/skills/wanted/${skillId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      refetchProfile();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        Loading Skills...
      </div>
    );
  }

  const offeredCount = profile?.skillsOffered.length ?? 0;
  const wantedCount = profile?.skillsWanted.length ?? 0;
  const assessedCount =
    profile?.skillsOffered.filter((s) => s.assessmentStatus === "assessed")
      .length ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Layers}
        eyebrow="Your Portfolio"
        title="Your Skills"
        subtitle="What you can teach, what you're hoping to learn, and the evidence behind it."
        action={
          <div className="flex gap-3">
            <StatChip icon={GraduationCap} label="Teaching" value={offeredCount} />
            <StatChip icon={CheckCircle2} label="Assessed" value={assessedCount} tone="amber" />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* TEACH */}
        <div className="flex flex-col gap-5 rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold font-display leading-tight">
                Skills I Can Teach
              </h2>
              <p className="text-xs text-muted-foreground">
                Earn tokens — verify with an assessment for extra credibility
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <SkillSelector
              skills={offerableSkills}
              selectedSkill={selectedOfferSkill}
              onSelect={setSelectedOfferSkill}
            />

            <AnimatePresence>
              {selectedOfferSkill && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl bg-muted/60 p-3"
                >
                  <div className="flex items-center gap-1.5 text-sm">
                    <Coins className="size-4 text-amber-gold" />
                    <input
                      type="number"
                      min={1}
                      value={tokenCost}
                      onChange={(e) =>
                        setTokenCost(Number(e.target.value))
                      }
                      className="w-20 rounded-lg border bg-background p-1.5"
                      placeholder="Tokens"
                    />
                  </div>

                  <select
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    className="rounded-lg border bg-background p-1.5 text-sm"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>

                  <button
                    onClick={addOfferedSkill}
                    disabled={addingOffered}
                    className="ml-auto flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Plus className="size-4" />
                    {addingOffered ? "Adding..." : "Add"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-2.5"
          >
            {offeredCount === 0 && (
              <EmptyState
                icon={GraduationCap}
                title="Nothing listed yet"
                subtitle="Add a skill above to start teaching and earning tokens."
              />
            )}

            {profile?.skillsOffered.map((item) => {
              const status = item.assessmentStatus || "not_assessed";

              return (
                <motion.div
                  variants={fadeUp}
                  key={item.skill._id}
                  className="group rounded-2xl border bg-background p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{item.skill.name}</span>
                        <ProficiencyDots level={item.proficiency} />
                        <span className="text-xs text-muted-foreground">
                          {item.proficiency}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Pill tone="amber" icon={Coins}>
                          {item.tokenCost} tokens
                        </Pill>

                        {status === "assessed" && (
                          <Pill tone="primary" icon={CheckCircle2}>
                            Assessed — {item.assessmentScore}%
                          </Pill>
                        )}

                        {status === "failed" && (
                          <Pill tone="red" icon={XCircle}>
                            Not Passed
                          </Pill>
                        )}

                        {status === "not_assessed" && (
                          <Pill tone="muted">Not Assessed</Pill>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeOfferedSkill(item.skill._id)}
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground sm:opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-500 focus:opacity-100 sm:group-hover:opacity-100"
                      aria-label={`Remove ${item.skill.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() =>
                        setAssessingSkill({
                          skillId: item.skill._id,
                          skillName: item.skill.name,
                          proficiency: item.proficiency,
                        })
                      }
                      className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      <Sparkles className="size-3.5" />
                      {status === "not_assessed" ? "Take Assessment" : "Retake"}
                    </button>

                    {status !== "not_assessed" && (
                      <button
                        onClick={() =>
                          setHistorySkill({
                            skillId: item.skill._id,
                            skillName: item.skill.name,
                          })
                        }
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
                      >
                        <History className="size-3.5" />
                        History
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* LEARN */}
        <div className="flex flex-col gap-5 rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-gold/10 text-amber-gold">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold font-display leading-tight">
                Skills I Want to Learn
              </h2>
              <p className="text-xs text-muted-foreground">
                Spend tokens here — priority helps us match you sooner
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <SkillSelector
              skills={wantableSkills}
              selectedSkill={selectedWantSkill}
              onSelect={setSelectedWantSkill}
            />

            <AnimatePresence>
              {selectedWantSkill && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl bg-muted/60 p-3"
                >
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="rounded-lg border bg-background p-1.5 text-sm"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>

                  <button
                    onClick={addWantedSkill}
                    disabled={addingWanted}
                    className="ml-auto flex items-center gap-1 rounded-lg bg-amber-gold px-3 py-1.5 text-sm font-medium text-indigo-ink transition-colors hover:bg-amber-gold/90 disabled:opacity-50"
                  >
                    <Plus className="size-4" />
                    {addingWanted ? "Adding..." : "Add"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-2.5"
          >
            {wantedCount === 0 && (
              <EmptyState
                icon={BookOpen}
                title="Nothing listed yet"
                subtitle="Add a skill above so we know what to match you with."
              />
            )}

            {profile?.skillsWanted.map((item) => (
              <motion.div
                variants={fadeUp}
                key={item.skill._id}
                className="group flex items-center justify-between gap-3 rounded-2xl border bg-background p-4 transition-colors hover:border-amber-gold/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold">{item.skill.name}</span>
                  <Pill tone={PRIORITY_TONE[item.priority] || "muted"}>
                    {item.priority} priority
                  </Pill>
                </div>

                <button
                  onClick={() => removeWantedSkill(item.skill._id)}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground sm:opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-500 focus:opacity-100 sm:group-hover:opacity-100"
                  aria-label={`Remove ${item.skill.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {assessingSkill && (
        <AssessmentModal
          skillId={assessingSkill.skillId}
          skillName={assessingSkill.skillName}
          proficiency={assessingSkill.proficiency}
          open={!!assessingSkill}
          onClose={() => setAssessingSkill(null)}
          onComplete={() => refetchProfile()}
        />
      )}

      {historySkill && (
        <AssessmentHistoryDialog
          skillId={historySkill.skillId}
          skillName={historySkill.skillName}
          open={!!historySkill}
          onClose={() => setHistorySkill(null)}
        />
      )}
    </div>
  );
}
