"use client";
import React, { useEffect, useState } from "react";

interface SkillsMap {
  [key: string]: number;
}

interface User {
  _id: string;
  name: string;
  bio?: string;
  email: string;
  languages: string[];
  skills: SkillsMap;
  tokens: number;
  isOnline?: boolean;
}

const UserCard: React.FC<{ user: User }> = ({ user }) => (
  <div className="bg-surface rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
    <div className="p-6">
      <h3 className="text-xl font-bold text-text-primary mb-2">{user.name}</h3>
      <p className="text-text-secondary text-sm mb-3">
        {user.bio || "No bio available"}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(user.skills)
          .slice(0, 3)
          .map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 text-sm font-medium bg-primary-light text-primary-dark-text rounded-full"
            >
              {skill} ({user.skills[skill]})
            </span>
          ))}
      </div>

      {/* Languages */}
      <div className="flex flex-wrap gap-2 mb-3">
        {user.languages.map((lang) => (
          <span
            key={lang}
            className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full"
          >
            {lang}
          </span>
        ))}
      </div>

      <p className="text-sm text-primary font-semibold mb-4">
        Tokens: {user.tokens ?? 0}
      </p>

      <button className="w-full bg-primary text-primary-text py-2 rounded-lg hover:opacity-90 transition-opacity">
        View Profile
      </button>
    </div>
  </div>
);

const FindMatch: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Filters
  const [skillFilter, setSkillFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const [tokenRange, setTokenRange] = useState<[number, number]>([0, 100]);

  const languagesList = ["English", "Hindi", "Spanish", "French", "German"];

  // Fetch current user + all users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/Login";
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, usersRes] = await Promise.all([
          fetch("http://localhost:5000/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/user/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const usersData = await usersRes.json();

        const currentEmail = profileData?.user?.email || null;
        setCurrentUserEmail(currentEmail);

        // Filter out the current user
        const others = (usersData || []).filter(
          (u: User) => u.email !== currentEmail
        );

        setUsers(others);
        setFilteredUsers(others);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
 const applyFilters = () => {
  let filtered = users;

  // Skill filter
  if (skillFilter.trim()) {
    const lower = skillFilter.toLowerCase();
    filtered = filtered.filter((user) =>
      Object.keys(user.skills).some((skill) =>
        skill.toLowerCase().includes(lower)
      )
    );
  }

  // Language filter
  if (languageFilter.length > 0) {
    filtered = filtered.filter((user) =>
      user.languages.some((lang) => languageFilter.includes(lang))
    );
  }

  // Token filter — based on the skill token requirement
  filtered = filtered.filter((user) =>
    Object.entries(user.skills).some(
      ([skill, tokenCost]) =>
        tokenCost >= tokenRange[0] && tokenCost <= tokenRange[1]
    )
  );

  setFilteredUsers(filtered);
};


  // Toggle language selection
  const toggleLanguage = (lang: string) => {
    setLanguageFilter((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  };

  if (loading)
    return <div className="text-center mt-10 text-lg">Loading users...</div>;

  return (
    <div className="space-y-8 overflow-hidden">
      {/* Filters Section */}
      <div className="bg-surface p-6 rounded-2xl shadow-md border border-border space-y-6">
        <h2 className="text-2xl font-semibold text-text-primary">
          Find a Match
        </h2>

        {/* Skill Search */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Search by Skill
          </label>
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="e.g. Python, Guitar, Cooking..."
            className="w-full px-4 py-2 border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Filter by Language
          </label>
          <div className="flex flex-wrap gap-3">
            {languagesList.map((lang) => (
              <label
                key={lang}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={languageFilter.includes(lang)}
                  onChange={() => toggleLanguage(lang)}
                />
                <span>{lang}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Token Range Filter */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Filter by Token Range
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={tokenRange[0]}
              min={0}
              onChange={(e) =>
                setTokenRange([Number(e.target.value), tokenRange[1]])
              }
              className="w-20 px-2 py-1 border rounded-lg text-center"
            />
            <span>to</span>
            <input
              type="number"
              value={tokenRange[1]}
              min={tokenRange[0]}
              onChange={(e) =>
                setTokenRange([tokenRange[0], Number(e.target.value)])
              }
              className="w-20 px-2 py-1 border rounded-lg text-center"
            />
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end">
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-primary text-white rounded-xl shadow-md hover:opacity-90 transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="grid overflow-hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => <UserCard key={user._id} user={user} />)
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No users found with the selected filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default FindMatch;
