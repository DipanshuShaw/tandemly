"use client";

import { useState } from "react";

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
    skillMap: Record<string, string>;
  }[];
}

export default function UserCard({
  user,
  matchScore,
  reasons,
  mySkills,
  skillMap
}: Props) {

    console.log("USER:", user);
  console.log("USER SKILLS OFFERED:", user.skillsOffered);
  console.log("MY SKILLS:", mySkills);

  
  const [loading, setLoading] =
    useState(false);

  const [learnSkill, setLearnSkill] =
    useState("");

  const [teachSkill, setTeachSkill] =
    useState("");

  const handleSendRequest = async () => {
    try {
      if (!learnSkill || !teachSkill) {
        alert(
          "Please select both skills."
        );
        return;
      }

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/matches/request",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

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
        alert(
          data.message ||
          "Failed to send request"
        );
        return;
      }

      alert("Request sent successfully");

      setLearnSkill("");
      setTeachSkill("");
    } catch (error) {
      console.error(error);

      alert("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border shadow-sm bg-card">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">
          {user.name}
        </h3>

        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {matchScore}
        </span>
      </div>

      <p className="text-muted-foreground mt-2">
        {user.bio || "No bio available"}
      </p>

      {/* Languages */}
      <div className="mt-4">
        <h4 className="font-semibold mb-2">
          Languages
        </h4>

        <div className="flex flex-wrap gap-2">
          {user.languages?.map(
            (lang) => (
              <span
                key={lang}
                className="px-2 py-1 rounded-full bg-secondary text-sm"
              >
                {lang}
              </span>
            )
          )}
        </div>
      </div>

      {/* Skills Offered */}
      <div className="mt-4">
        <h4 className="font-semibold mb-2">
          Skills Offered
        </h4>

        <div className="flex flex-wrap gap-2">
          {user.skillsOffered?.map(
            (item) => (
              <span
                key={item.skill._id}
                className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm"
              >
                {item.skill.name}
              </span>
            )
          )}
        </div>
      </div>

      {/* Reasons */}
      <div className="mt-4">
        <h4 className="font-semibold mb-2">
          Why Matched
        </h4>

        <ul className="text-sm space-y-1">
          {reasons?.map((reason) => (
            <li key={reason}>
              ✓ {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Learn Skill */}
<div className="mt-5">
  <label className="block text-sm font-medium mb-1">
    Skill You Want To Learn
  </label>

  <select
    value={learnSkill}
    onChange={(e) =>
      setLearnSkill(e.target.value)
    }
    className="w-full border rounded-lg p-2"
  >
    <option value="">
      Select Skill
    </option>

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
    <option
      key={index}
      value={skillId}
    >
      {skillName}
    </option>
  );
})}
  </select>
</div>

      {/* Teach Skill */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">
          Skill You Will Teach
        </label>

        <select
          value={teachSkill}
          onChange={(e) =>
            setTeachSkill(
              e.target.value
            )
          }
          className="w-full border rounded-lg p-2"
        >
          <option value="">
            Select Skill
          </option>

          {mySkills?.map((item) => (
            <option
              key={item.skill._id}
              value={item.skill._id}
            >
              {item.skill.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSendRequest}
        disabled={loading}
        className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg disabled:opacity-60"
      >
        {loading
          ? "Sending..."
          : "Send Match Request"}
      </button>
    </div>
  );
}