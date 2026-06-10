"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

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
  };

  teachingSkill: {
    _id: string;
    name: string;
  };

  status: string;

  chatEnabled: boolean;

  startedAt: string;
}

export default function CurrentMatch() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const [completing, setCompleting] =
    useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/matches/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setMatches(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async (
    matchId: string
  ) => {
    try {
      setCompleting(matchId);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/matches/complete`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            matchId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to complete match"
        );
        return;
      }

      alert("Match completed");

      fetchMatches();
    } catch (error) {
      console.error(error);
    } finally {
      setCompleting(null);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        Loading Active Matches...
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-10 border rounded-2xl text-center">
        <h2 className="text-xl font-semibold">
          No Active Matches
        </h2>

        <p className="text-muted-foreground mt-2">
          Accept a match request to
          start learning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Active Matches
        </h1>

        <p className="text-muted-foreground mt-2">
          Manage your ongoing skill
          exchanges.
        </p>
      </div>

      <div className="grid gap-6">
        {matches.map((match) => (
          <div
            key={match._id}
            className="border rounded-2xl p-6 bg-card shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  Match #
                  {match._id.slice(-6)}
                </h2>

                <div className="mt-4 space-y-2">
                  <p>
                    <span className="font-medium">
                      Learner:
                    </span>{" "}
                    {match.learner?.name}
                  </p>

                  <p>
                    <span className="font-medium">
                      Teacher:
                    </span>{" "}
                    {match.teacher?.name}
                  </p>

                  <p>
                    <span className="font-medium">
                      Learning:
                    </span>{" "}
                    {
                      match.learningSkill
                        ?.name
                    }
                  </p>

                  <p>
                    <span className="font-medium">
                      Teaching:
                    </span>{" "}
                    {
                      match.teachingSkill
                        ?.name
                    }
                  </p>

                  <p>
                    <span className="font-medium">
                      Status:
                    </span>{" "}
                    {match.status}
                  </p>

                  <p>
                    <span className="font-medium">
                      Chat:
                    </span>{" "}
                    {match.chatEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </p>

                  <p>
                    <span className="font-medium">
                      Started:
                    </span>{" "}
                    {new Date(
                      match.startedAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  disabled
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white opacity-70"
                >
                  Chat Coming Soon
                </button>

                <button
                  onClick={() =>
                    handleCompleteMatch(
                      match._id
                    )
                  }
                  disabled={
                    completing ===
                    match._id
                  }
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  {completing ===
                  match._id
                    ? "Completing..."
                    : "Complete Match"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}