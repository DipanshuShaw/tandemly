"use client";

import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";


import { API_URL } from "@/lib/api";

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

interface UserProfile {
  skillsOffered: {
    skill: {
      _id: string;
      name: string;
      category: string;
    };
    tokenCost: number;
    proficiency: string;
  }[];
}

export default function FindMatch() {
  const [recommendations, setRecommendations] = useState<
    Recommendation[]
  >([]);
  const [skillMap, setSkillMap] = useState<Record<string, string>>({});

  const [profile, setProfile] =
  useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

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
        profileRes,
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
          `${API_URL}/api/users/profile`,
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

      const profileData =
        await profileRes.json();

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

      console.log(
        "PROFILE DATA:",
        profileData
      );

      console.log(
        "RECOMMENDATIONS:",
        recommendationData
      );

      console.log(
        "SKILL MAP:",
        map
      );

      setRecommendations(
        recommendationData
      );

      setProfile(profileData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium">
          Loading Recommendations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">
          Find Skill Matches
        </h1>

        <p className="text-muted-foreground mt-2">
          Discover users with mutual skill
          exchange opportunities.
        </p>
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <div className="p-10 border rounded-2xl text-center">
          <h2 className="text-xl font-semibold">
            No Matches Found
          </h2>

          <p className="text-muted-foreground mt-2">
            Add more offered and wanted skills
            to improve recommendations.
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {recommendations.map(
          (recommendation) => (
<UserCard
  key={recommendation.user._id}
  user={recommendation.user}
  matchScore={recommendation.matchScore}
  reasons={recommendation.reasons}
  mySkills={profile?.skillsOffered || []}
  skillMap={skillMap}
/>
          )
        )}
      </div>
    </div>
  );
}