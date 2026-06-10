"use client";

import React, {
  useEffect,
  useState,
} from "react";

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
          "http://localhost:5000/api/matches/history",
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
        "http://localhost:5000/api/reviews",
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
        alert(data.message);
        return;
      }

      alert(
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
      <div className="flex justify-center items-center h-48">
        Loading Match History...
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-10 border rounded-2xl text-center">
        <h2 className="text-xl font-semibold">
          No Match History
        </h2>

        <p className="text-muted-foreground mt-2">
          Complete a match to see it
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Match History
        </h1>

        <p className="text-muted-foreground mt-2">
          Your completed skill
          exchange sessions.
        </p>
      </div>

      <div className="grid gap-6">
        {matches.map((match) => {
          const hasReviewed =
            currentUserId ===
              match.learner._id
              ? match.learnerRated
              : match.teacherRated;

          return (

            <div
              key={match._id}
              className="border rounded-2xl p-6 bg-card shadow-sm"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Match #
                  {match._id.slice(-6)}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">
                      Learner
                    </p>

                    <p>
                      {
                        match.learner
                          .name
                      }
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {
                        match.learner
                          .email
                      }
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">
                      Teacher
                    </p>

                    <p>
                      {
                        match.teacher
                          .name
                      }
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {
                        match.teacher
                          .email
                      }
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <p>
                    <span className="font-medium">
                      Learned:
                    </span>{" "}
                    {
                      match
                        .learningSkill
                        .name
                    }
                  </p>

                  <p>
                    <span className="font-medium">
                      Taught:
                    </span>{" "}
                    {
                      match
                        .teachingSkill
                        .name
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
                      Tokens:
                    </span>{" "}
                    {
                      match.tokensTransferred
                    }
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                  <p>
                    Started:
                    {" "}
                    {new Date(
                      match.startedAt
                    ).toLocaleString()}
                  </p>

                  <p>
                    Ended:
                    {" "}
                    {new Date(
                      match.endedAt
                    ).toLocaleString()}
                  </p>
                </div>

{hasReviewed ? (
  <div className="border-t pt-4 mt-4">
    <div className=" text-green-500 p-3 rounded-lg">
      ✓ Review Submitted
    </div>
  </div>
) : (
  <div className="border-t pt-4 mt-4">
    <h3 className="font-semibold mb-3">
      Leave Review
    </h3>

    <select
      value={
        rating[match._id] || 5
      }
      onChange={(e) =>
        setRating({
          ...rating,
          [match._id]:
            Number(
              e.target.value
            ),
        })
      }
      className="w-full border rounded-lg p-2 mb-3"
    >
      <option value={5}>
        ⭐⭐⭐⭐⭐
      </option>

      <option value={4}>
        ⭐⭐⭐⭐
      </option>

      <option value={3}>
        ⭐⭐⭐
      </option>

      <option value={2}>
        ⭐⭐
      </option>

      <option value={1}>
        ⭐
      </option>
    </select>

    <textarea
      value={
        comment[match._id] || ""
      }
      onChange={(e) =>
        setComment({
          ...comment,
          [match._id]:
            e.target.value,
        })
      }
      placeholder="Write review..."
      className="w-full border rounded-lg p-2 mb-3"
    />

    <button
      onClick={() =>
        handleReview(
          match._id,
          currentUserId ===
            match.learner._id
            ? match.teacher._id
            : match.learner._id
        )
      }
      disabled={
        submitting ===
        match._id
      }
      className="px-4 py-2 bg-green-600 text-white rounded-lg"
    >
      {submitting ===
      match._id
        ? "Submitting..."
        : "Submit Review"}
    </button>
  </div>
)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
