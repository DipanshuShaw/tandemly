"use client";
import React, { useState, useEffect } from "react";

interface SkillsObject {
  [skill: string]: number; // skillName: value
}

const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<SkillsObject>({});
  const [newSkill, setNewSkill] = useState("");
  const [newSkillValue, setNewSkillValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
  let timer: ReturnType<typeof setTimeout> | undefined;
    if (message) {
      timer = setTimeout(() => {
        setMessage('');
      }, 5000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  // Fetch user skills on mount
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5000/api/user/skills", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSkills(data.skills || {}))
      .catch(() => setMessage("Error fetching skills"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill) return;

    setSkills({
      ...skills,
      [trimmedSkill]: newSkillValue || 0,
    });

    setNewSkill("");
    setNewSkillValue(0);
  };

  const handleRemoveSkill = (skill: string) => {
    const updatedSkills = { ...skills };
    delete updatedSkills[skill];
    setSkills(updatedSkills);
  };

  const handleSkillValueChange = (skill: string, value: number) => {
    setSkills({
      ...skills,
      [skill]: value,
    });
  };

  const handleSaveChanges = () => {
    if (!token) return;

    fetch("http://localhost:5000/api/user/skills", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ skills }),
    })
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to update skills"));
  };

  if (loading) return <div className="text-center mt-10">Loading skills...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-surface p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-text-primary mb-6 border-b border-border pb-4">
        Manage Your Skills
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add new skill..."
          className="flex-1 p-3 border rounded-lg"
        />
        <input
          type="number"
          value={newSkillValue}
          onChange={(e) => setNewSkillValue(Number(e.target.value))}
          placeholder="Value"
          className="w-24 p-3 border rounded-lg"
        />
        <button
          onClick={handleAddSkill}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(skills).length > 0 ? (
          Object.entries(skills).map(([skill, value]) => (
            <span
              key={skill}
              className="border-2 px-4 py-2 bg-primary-light text-primary-dark-text rounded-full flex items-center gap-2"
            >
              {skill}
              <input
                type="number"
                value={value || 0}
                onChange={(e) => handleSkillValueChange(skill, Number(e.target.value))}
                className="w-16 p-1 border rounded-lg text-center"
              />
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="bg-red-500 border-2 rounded-full px-1.5 font-bold "
              >
                ✕
              </button>
            </span>
          ))
        ) : (
          <p className="text-gray-500">No skills added yet.</p>
        )}
      </div>

      <button
        onClick={handleSaveChanges}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
      >
        Save Changes
      </button>

      {message && <p className="mt-4 text-center text-green-500">{message}</p>}
    </div>
  );
};

export default SkillsManager;
