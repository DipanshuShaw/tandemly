"use client";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import

interface DecodedToken {
  id: string;
  email: string;
  name: string;
}

interface UserData {
  name: string;
  email: string;
  number?: string;
  bio?: string;
  languages: string[];
}

const InputField: React.FC<{
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange?: (val: string) => void;
}> = ({ label, id, type = "text", value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="w-full px-4 py-2 border border-border bg-surface rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
    />
  </div>
);

const YourProfile: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [userLanguages, setUserLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


    useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;    if (message) {
        timer = setTimeout(() => {
          setMessage('');
        }, 5000);
      }
  
      return () => {
        clearTimeout(timer);
      };
    }, [message]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      console.log("Decoded Token:", decoded);

      fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch user data");
          const data = await res.json();
          setUser(data);
          setUserLanguages(data.languages || []);
        })
        .catch((err) => console.error("Error fetching user data:", err));
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  const handleAddLanguage = () => {
    const trimmedLang = newLanguage.trim();
    if (
      trimmedLang &&
      !userLanguages.map((l) => l.toLowerCase()).includes(trimmedLang.toLowerCase())
    ) {
      setUserLanguages([...userLanguages, trimmedLang]);
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setUserLanguages(userLanguages.filter((l) => l !== lang));
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "/login";

    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          number: user.number,
          bio: user.bio,
          languages: userLanguages,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setMessage("Profile updated successfully!");
      setUser(data.user || user); // Update local state with new user data
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center mt-10 text-lg">Loading user data...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-text-primary mb-6">Your Profile</h2>

      <form
        className="bg-surface p-8 rounded-2xl shadow-lg space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveChanges();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Full Name"
            id="name"
            value={user.name}
            onChange={(val) => setUser({ ...user, name: val })}
          />
          <InputField
            label="Email Address"
            id="email"
            type="email"
            value={user.email}
            onChange={(val) => setUser({ ...user, email: val })}
          />
          <InputField
            label="Number"
            id="number"
            value={user.number || ""}
            onChange={(val) => setUser({ ...user, number: val })}
          />
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Languages</label>
          <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] ">
            {userLanguages.map((lang) => (
              <span
                key={lang}
                className="border-2 flex items-center gap-2 bg-primary-light text-primary-dark-text text-sm font-medium px-3 py-1 rounded-full"
              >
                {lang}
                <button type="button" onClick={() => handleRemoveLanguage(lang)} className="focus:outline-none -mr-1 border-2 p-1 rounded-full bg-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLanguage();
                }
              }}
              placeholder="Add a language"
              className="flex-grow px-4 py-2 border border-border bg-surface rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={handleAddLanguage}
              className="px-5 py-2 bg-primary text-primary-text font-semibold rounded-xl shadow-md hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1">
            Your Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={user.bio || ""}
            onChange={(e) => setUser({ ...user, bio: e.target.value })}
            className="w-full px-4 py-2 border border-border bg-surface rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-primary text-primary-text font-semibold rounded-xl shadow-md hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default YourProfile;
