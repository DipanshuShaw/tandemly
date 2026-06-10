"use client";

import React, { useEffect, useState } from "react";

interface Skill {
  _id: string;
  name: string;
  category: string;
}

import SkillSelector from "../SkillSelector";

interface UserProfile {
  skillsOffered: {
    skill: Skill;
    tokenCost: number;
    proficiency: string;
  }[];

  skillsWanted: {
    skill: Skill;
    priority: string;
  }[];
}

export default function YourSkills() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

    const [search, setSearch] =
  useState("");

  const [selectedSkill, setSelectedSkill] =
    useState("");

    const filteredSkills =
  allSkills.filter((skill) =>
    skill.name
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )
  );

  const [tokenCost, setTokenCost] =
    useState(10);

  const [proficiency, setProficiency] =
    useState("Intermediate");

  const [priority, setPriority] =
    useState("Medium");

  const [loading, setLoading] =
    useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const fetchData = async () => {
    try {
      const [skillsRes, profileRes] =
        await Promise.all([
          fetch(
            "http://localhost:5000/api/skills",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://localhost:5000/api/users/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      const skillsData = await skillsRes.json();

      const profileData =
        await profileRes.json();

      setAllSkills(skillsData);
      setProfile(profileData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addOfferedSkill =
    async () => {
      if (!selectedSkill) return;

      try {
        await fetch(
          "http://localhost:5000/api/users/skills/offered",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              skillId: selectedSkill,
              tokenCost,
              proficiency,
            }),
          }
        );

        setSelectedSkill("");
        setTokenCost(10);
        setProficiency(
          "Intermediate"
        );
        setPriority("Medium");

        fetchData();
      } catch (error) {
        console.error(error);
      }
    };

  const addWantedSkill =
    async () => {
      if (!selectedSkill) return;

      try {
        await fetch(
          "http://localhost:5000/api/users/skills/wanted",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              skillId: selectedSkill,
              priority,
            }),
          }
        );

        setSelectedSkill("");
        setTokenCost(10);
        setProficiency(
          "Intermediate"
        );
        setPriority("Medium");

        fetchData();
      } catch (error) {
        console.error(error);
      }
    };

  const removeOfferedSkill =
    async (skillId: string) => {
      try {
        await fetch(
          `http://localhost:5000/api/users/skills/offered/${skillId}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        fetchData();
      } catch (error) {
        console.error(error);
      }
    };

  const removeWantedSkill =
    async (skillId: string) => {
      try {
        await fetch(
          `http://localhost:5000/api/users/skills/wanted/${skillId}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        fetchData();
      } catch (error) {
        console.error(error);
      }
    };

  if (loading) {
    return (
      <div className="text-center">
        Loading Skills...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">
        Your Skills
      </h1>

      {/* Add Skill */}
      <div className="border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Add Skill
        </h2>

<SkillSelector
  skills={allSkills}
  selectedSkill={
    selectedSkill
  }
onSelect={(
  skillId: string
) =>
  setSelectedSkill(
    skillId
  )
}
/>

{/* <div className="border rounded-lg mt-2 max-h-48 overflow-y-auto">
  {filteredSkills.map((skill) => (
    <button
      key={skill._id}
      type="button"
      onClick={() => {
        setSelectedSkill(
          skill._id
        );

        setSearch(
          skill.name
        );
      }}
      className={`w-full text-left p-2 hover:bg-secondary ${
        selectedSkill ===
        skill._id
          ? "bg-secondary"
          : ""
      }`}
    >
      {skill.name}
    </button>
  ))}
</div> */}

{selectedSkill && (
  <div className="mt-3 text-sm text-green-500">
    Selected Skill:{" "}
    {
      allSkills.find(
        (s) =>
          s._id ===
          selectedSkill
      )?.name
    }
  </div>
)}

        <div className="mt-4 flex gap-3">
          <input
            type="number"
            value={tokenCost}
            onChange={(e) =>
              setTokenCost(
                Number(e.target.value)
              )
            }
            className="border rounded-lg p-2"
            placeholder="Token Cost"
          />

          <select
            value={proficiency}
            onChange={(e) =>
              setProficiency(
                e.target.value
              )
            }
            className="border rounded-lg p-2"
          >
            <option>
              Beginner
            </option>
            <option>
              Intermediate
            </option>
            <option>
              Advanced
            </option>
          </select>

          <button
            onClick={addOfferedSkill}
            className="bg-green-500 text-white px-4 rounded-lg"
          >
            Add Offered
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <select
            value={priority}
            onChange={(e) =>
              setPriority(
                e.target.value
              )
            }
            className="border rounded-lg p-2"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <button
            onClick={addWantedSkill}
            className="bg-blue-500 text-white px-4 rounded-lg"
          >
            Add Wanted
          </button>
        </div>
      </div>

      {/* Offered Skills */}
      <div className="border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Skills Offered
        </h2>

        <div className="space-y-3">
          {profile?.skillsOffered.length === 0 && (
            <p className="text-muted-foreground">
              No offered skills yet.
            </p>
          )}
          {profile?.skillsOffered.map(
            (item) => (
              <div
                key={`${item.skill._id}-${item.proficiency}`}
                className="flex justify-between items-center"
              >
                <span>
                  {item.skill.name} •{" "}
                  {item.proficiency} •{" "}
                  {item.tokenCost} Tokens
                </span>

                <button
                  onClick={() =>
                    removeOfferedSkill(
                      item.skill._id
                    )
                  }
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            )
          )}

        </div>
      </div>

      {/* Wanted Skills */}
      <div className="border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Skills Wanted
        </h2>

        <div className="space-y-3">
          {profile?.skillsWanted.length === 0 && (
            <p className="text-muted-foreground">
              No wanted skills yet.
            </p>
          )}
          {profile?.skillsWanted.map(
            (item) => (
              <div
                key={`${item.skill._id}-${item.priority}`}
                className="flex justify-between items-center"
              >
                <span>
                  {item.skill.name} •{" "}
                  {item.priority}
                </span>

                <button
                  onClick={() =>
                    removeWantedSkill(
                      item.skill._id
                    )
                  }
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}