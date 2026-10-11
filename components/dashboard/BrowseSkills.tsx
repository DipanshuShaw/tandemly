"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  Star,
  AlertTriangle,
  Users,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "@/lib/api";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { PageHeader, EmptyState, SkeletonGrid, staggerContainer, fadeUp } from "./ui-kit";

interface Skill {
  _id: string;
  name: string;
  category: string;
  description?: string;
}

interface Teacher {
  _id: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  tokenCost: number;
  proficiency: string;
  assessmentStatus?: "not_assessed" | "assessed" | "failed";
  assessmentScore?: number | null;
}

export default function BrowseSkills() {
  const { profile: myProfile, loading: profileLoading } = useUserProfile();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const [requestingFor, setRequestingFor] = useState<string | null>(null);
  const [teachSkillChoice, setTeachSkillChoice] = useState("");
  const [sending, setSending] = useState(false);

  const loading = profileLoading || skillsLoading;

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/skills`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((skillsData) => {
        setSkills(Array.isArray(skillsData) ? skillsData : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setSkillsLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(skills.map((s) => s.category));
    return ["All", ...Array.from(set).sort()];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchesCategory = category === "All" || s.category === category;
      const matchesSearch = s.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [skills, category, search]);

  const openSkill = async (skill: Skill) => {
    setSelectedSkill(skill);
    setTeachersLoading(true);
    setRequestingFor(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/skills/${skill._id}/teachers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      setTeachers(data.teachers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setTeachersLoading(false);
    }
  };

  const sendRequest = async (teacher: Teacher) => {
    if (!selectedSkill) return;

    if (!teachSkillChoice) {
      toast.error("Pick a skill to offer in exchange");
      return;
    }

    try {
      setSending(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/matches/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: teacher._id,
          learnSkill: selectedSkill._id,
          teachSkill: teachSkillChoice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send request");
        return;
      }

      toast.success(`Request sent to ${teacher.name}`);
      setRequestingFor(null);
      setTeachSkillChoice("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send request");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader icon={Compass} eyebrow="Discovery" title="Browse Skills" subtitle="Loading the catalog..." />
        <SkeletonGrid count={6} className="h-36" />
      </div>
    );
  }

  // ---------- Teacher list view ----------
  if (selectedSkill) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedSkill(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to all skills
        </button>

        <PageHeader
          icon={Compass}
          eyebrow={selectedSkill.category}
          title={selectedSkill.name}
          subtitle={
            selectedSkill.description ||
            `People currently teaching ${selectedSkill.name} on Tandemly.`
          }
        />

        {teachersLoading ? (
          <SkeletonGrid count={4} className="h-56" />
        ) : teachers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No one teaches this yet"
            subtitle="Check back later, or add it to your own skills to be the first."
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2"
          >
            {teachers.map((teacher) => {
              const insufficientTokens =
                (myProfile?.tokens ?? 0) < teacher.tokenCost;

              return (
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  key={teacher._id}
                  className="flex flex-col gap-3 rounded-3xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-ink to-amber-gold font-semibold text-white">
                      {teacher.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {teacher.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3 fill-amber-gold text-amber-gold" />
                        {teacher.rating?.toFixed?.(1) ?? teacher.rating} ·{" "}
                        {teacher.reviewCount} reviews
                      </div>
                    </div>

                    <span className="ml-auto shrink-0 rounded-full bg-amber-gold/10 px-2 py-1 text-xs font-medium text-amber-gold">
                      {teacher.tokenCost} 🪙
                    </span>
                  </div>

                  {teacher.bio && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {teacher.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {teacher.proficiency}
                    </span>

                    {teacher.assessmentStatus === "assessed" && (
                      <span className="flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <CheckCircle2 className="size-3" />
                        Assessed — {teacher.assessmentScore}%
                      </span>
                    )}
                  </div>

                  {requestingFor === teacher._id ? (
                    <div className="space-y-2 border-t pt-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Teach in exchange
                      </label>

                      <select
                        value={teachSkillChoice}
                        onChange={(e) => setTeachSkillChoice(e.target.value)}
                        className="w-full rounded-lg border bg-background p-2 text-sm"
                      >
                        <option value="">Select a skill</option>
                        {myProfile?.skillsOffered.map((s) => (
                          <option key={s.skill._id} value={s.skill._id}>
                            {s.skill.name}
                          </option>
                        ))}
                      </select>

                      {insufficientTokens && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500">
                          <AlertTriangle className="size-3.5" />
                          You need {teacher.tokenCost} tokens, you have{" "}
                          {myProfile?.tokens ?? 0}.
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => sendRequest(teacher)}
                          disabled={sending || insufficientTokens}
                          className="flex-1 rounded-lg bg-primary py-1.5 text-sm text-primary-foreground disabled:opacity-50"
                        >
                          {sending ? "Sending..." : "Send Request"}
                        </button>
                        <button
                          onClick={() => setRequestingFor(null)}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setRequestingFor(teacher._id);
                        setTeachSkillChoice("");
                      }}
                      disabled={!myProfile?.skillsOffered.length}
                      className="mt-1 w-full rounded-xl bg-primary py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Request to Learn
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    );
  }

  // ---------- Skill catalog view ----------
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Compass}
        eyebrow="Discovery"
        title="Browse Skills"
        subtitle="Explore what people are teaching and find your next skill directly."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full rounded-xl border bg-background py-2 pl-9 pr-4 outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-accent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredSkills.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No skills found"
          subtitle="Try a different search term or category."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredSkills.map((skill) => (
            <motion.button
              variants={fadeUp}
              whileHover={{ y: -4 }}
              key={skill._id}
              onClick={() => openSkill(skill)}
              className="rounded-3xl border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{skill.name}</p>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="size-4" />
                </div>
              </div>

              <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {skill.category}
              </span>

              {skill.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {skill.description}
                </p>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
