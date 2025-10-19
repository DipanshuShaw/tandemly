"use client";
import React, { useEffect, useState } from "react";

interface MatchUser {
  name: string;
  email: string;
  bio?: string;
  number?: string;
  languages?: string[];
  skills?: string[]; // optional, if you have skills field
}

interface CurrentMatchData {
  user: MatchUser | null;
  message?: string;
}

const CurrentMatch: React.FC = () => {
  const [match, setMatch] = useState<CurrentMatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/Login";
      return;
    }

    fetch("http://localhost:5000/api/user/current-match", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(errMsg || "Failed to fetch current match");
        }
        return res.json();
      })
      .then((data) => setMatch(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-10">Loading current session...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!match || !match.user) return <div className="text-center mt-10">No current session found.</div>;

  const { user } = match;

  return (
    <div className="max-w-4xl mx-auto bg-surface p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-text-primary mb-6 border-b border-border pb-4">
        Current Session
      </h2>
      <div className="bg-bg p-6 rounded-2xl border border-border flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-primary">{user.name}</h3>
          <p className="text-text-secondary mt-1">{user.bio || "No bio available"}</p>
          {user.number && (
            <p className="text-text-secondary mt-1">Phone: {user.number}</p>
          )}
          {user.languages && user.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {user.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 text-sm font-medium bg-primary-light text-primary-dark-text rounded-full"
                >
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-3 w-full md:w-auto">
          <button className="w-full px-6 py-3 bg-primary text-primary-text font-semibold rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105">
            Open Chat
          </button>
          <button className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105">
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentMatch;
