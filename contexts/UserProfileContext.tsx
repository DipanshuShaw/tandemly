"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_URL } from "@/lib/api";

interface Skill {
  _id: string;
  name: string;
  category?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  address?: string;
  number?: string;
  profilePicture?: string;
  languages: string[];
  tokens: number;
  rating: number;
  reviewCount: number;
  completedSessions: number;
  reliabilityScore: number;
  skillsOffered: {
    skill: Skill;
    tokenCost: number;
    proficiency: string;
    assessmentStatus?: "not_assessed" | "assessed" | "failed";
    assessmentScore?: number | null;
    lastAssessedAt?: string;
  }[];
  skillsWanted: {
    skill: Skill;
    priority: string;
  }[];
  [key: string]: any;
}

interface UserProfileContextValue {
  profile: UserProfile | null;
  loading: boolean;
  /** Re-fetch after a mutation (e.g. saved profile edits, added a skill). */
  refetchProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(
  null
);

/**
 * Fetches the current user's profile once and shares it across every
 * dashboard section, instead of each section (Find Match, Your
 * Skills, Current Match, Inbox, etc.) independently re-fetching the
 * identical /api/users/profile data on every mount — which was
 * turning "switch tabs" into a fresh network round-trip each time.
 */
export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <UserProfileContext.Provider
      value={{ profile, loading, refetchProfile: fetchProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);

  if (!ctx) {
    throw new Error(
      "useUserProfile must be used within a UserProfileProvider"
    );
  }

  return ctx;
}
