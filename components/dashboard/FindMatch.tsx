"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Coins } from "lucide-react";
import UserCard from "./UserCard";

import { API_URL } from "@/lib/api";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { PageHeader, StatChip, SkeletonGrid, EmptyState, staggerContainer, fadeUp } from "./ui-kit";

interface Recommendation {
  user: {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    languages: string[];

    skillsOffered: {
      skill: {
        _id: string;
        name: string;
        category: string;
      };
      tokenCost: number;
      proficiency: string;
    }[];

    skillsWanted: {
      skill: {
        _id: string;
        name: string;
        category: string;
      };
      priority: string;
    }[];
  };

  matchScore: number;
  reasons: string[];
}

export default function FindMatch() {
  const { profile, loading: profileLoading } = useUserProfile();

  const [recommendations, setRecommendations] = useState<
    Recommendation[]
  >([]);
  const [skillMap, setSkillMap] = useState<Record<string, string>>({});

  const [dataLoading, setDataLoading] = useState(true);

  const loading = profileLoading || dataLoading;

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/Login";
    return;
  }

  const fetchData = async () => {
    try {
      const [
        recommendationRes,
        skillsRes,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/matches/recommended`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        fetch(
          `${API_URL}/api/skills`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      const recommendationData =
        await recommendationRes.json();

      const skillsData =
        await skillsRes.json();

      const map: Record<
        string,
        string
      > = {};

      skillsData.forEach(
        (skill: any) => {
          map[skill._id] =
            skill.name;
        }
      );

      setSkillMap(map);

      setRecommendations(
        recommendationData
      );
    } catch (error) {
      console.error(error);
    } finally {
      setDataLoading(false);
    }
  };

  fetchData();
}, []);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Sparkles}
        eyebrow="Discovery"
        title="Find Your Match"
        subtitle="People whose skills line up with what you want to learn — and who'd love to learn what you teach."
        action={
          <StatChip
            icon={Coins}
            label="Your balance"
            value={`${profile?.tokens ?? 0} tokens`}
            tone="amber"
          />
        }
      />

      {loading ? (
        <SkeletonGrid count={6} className="h-80" />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matches yet"
          subtitle="Add a few more skills to your profile so we can find people whose skills line up with yours."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {recommendations.map((recommendation) => (
            <motion.div variants={fadeUp} key={recommendation.user._id}>
              <UserCard
                user={recommendation.user}
                matchScore={recommendation.matchScore}
                reasons={recommendation.reasons}
                mySkills={profile?.skillsOffered || []}
                skillMap={skillMap}
                myTokens={profile?.tokens ?? 0}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
