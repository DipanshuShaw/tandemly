
"use client";

import React, { useEffect, useState } from "react";


import { API_URL } from "@/lib/api";

interface UserData {
  name: string;
  email: string;
  number?: string;
  bio?: string;
  address?: string;

  languages: string[];

  tokens: number;

  rating: number;

  completedSessions: number;

  reliabilityScore: number;
}

const InputField: React.FC<{
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange?: (val: string) => void;
}> = ({
  label,
  id,
  type = "text",
  value,
  onChange,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-text-secondary mb-1"
    >
      {label}
    </label>

    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) =>
        onChange &&
        onChange(e.target.value)
      }
      className="w-full px-4 py-2 border border-border bg-surface rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
    />
  </div>
);

const YourProfile: React.FC = () => {
  const [user, setUser] =
    useState<UserData | null>(null);

  const [userLanguages, setUserLanguages] =
    useState<string[]>([]);

  const [newLanguage, setNewLanguage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let timer:
      | ReturnType<
          typeof setTimeout
        >
      | undefined;

    if (message) {
      timer = setTimeout(() => {
        setMessage("");
      }, 5000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href =
        "/login";
      return;
    }

    fetch(
      `${API_URL}/api/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to fetch user data"
          );
        }

        return res.json();
      })
      .then((data) => {
        setUser(data);

        setUserLanguages(
          data.languages || []
        );
      })
      .catch((err) => {
        console.error(
          "Error fetching user data:",
          err
        );
      });
  }, []);

  const handleAddLanguage = () => {
    const trimmedLang =
      newLanguage.trim();

    if (
      trimmedLang &&
      !userLanguages
        .map((l) =>
          l.toLowerCase()
        )
        .includes(
          trimmedLang.toLowerCase()
        )
    ) {
      setUserLanguages([
        ...userLanguages,
        trimmedLang,
      ]);

      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (
    lang: string
  ) => {
    setUserLanguages(
      userLanguages.filter(
        (l) => l !== lang
      )
    );
  };

  const handleSaveChanges =
    async () => {
      if (!user) return;

      setLoading(true);

      setMessage("");

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        window.location.href =
          "/login";

        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/users/profile`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: user.name,

              email: user.email,

              number:
                user.number,

              bio: user.bio,

              address:
                user.address,

              languages:
                userLanguages,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Failed to update profile"
          );
        }

        setMessage(
          "Profile updated successfully!"
        );

        setUser(
          data.user || user
        );
      } catch (err: any) {
        setMessage(
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

if (!user) {
  return (
    <div className="text-center mt-10 text-lg">
      Loading user data...
    </div>
  );
}

return (
  <div className="max-w-4xl mx-auto transition-colors duration-300">
    {/* PAGE TITLE */}
    <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
      Your Profile
    </h2>

    {/* STATS */}
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 rounded-xl border bg-white dark:bg-gray-900">
        <p className="text-sm text-muted-foreground">
          Tokens
        </p>

        <p className="text-2xl font-bold">
          {user.tokens}
        </p>
      </div>

      <div className="p-4 rounded-xl border bg-white dark:bg-gray-900">
        <p className="text-sm text-muted-foreground">
          Rating
        </p>

        <p className="text-2xl font-bold">
          {user.rating}
        </p>
      </div>

      <div className="p-4 rounded-xl border bg-white dark:bg-gray-900">
        <p className="text-sm text-muted-foreground">
          Sessions
        </p>

        <p className="text-2xl font-bold">
          {user.completedSessions}
        </p>
      </div>
    </div>

    <form
      className="
        p-8 rounded-2xl shadow-lg space-y-6
        bg-white border border-gray-200
        dark:bg-gray-900 dark:border-gray-700
      "
      onSubmit={(e) => {
        e.preventDefault();
        handleSaveChanges();
      }}
    >
      {/* INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Full Name"
          id="name"
          value={user.name}
          onChange={(val) =>
            setUser({
              ...user,
              name: val,
            })
          }
        />

        <InputField
          label="Email Address"
          id="email"
          type="email"
          value={user.email}
          onChange={(val) =>
            setUser({
              ...user,
              email: val,
            })
          }
        />

        <InputField
          label="Phone Number"
          id="number"
          value={user.number || ""}
          onChange={(val) =>
            setUser({
              ...user,
              number: val,
            })
          }
        />

        <InputField
          label="Address"
          id="address"
          value={user.address || ""}
          onChange={(val) =>
            setUser({
              ...user,
              address: val,
            })
          }
        />
      </div>

      {/* LANGUAGES */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Languages
        </label>

        <div className="flex flex-wrap gap-2 mb-3">
          {userLanguages.map((lang) => (
            <span
              key={lang}
              className="
                flex items-center gap-2
                px-3 py-1 rounded-full
                bg-emerald-100
                text-emerald-700
              "
            >
              {lang}

              <button
                type="button"
                onClick={() =>
                  handleRemoveLanguage(lang)
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newLanguage}
            placeholder="Add a language"
            onChange={(e) =>
              setNewLanguage(
                e.target.value
              )
            }
            className="
              flex-1 px-4 py-2 rounded-xl border
            "
          />

          <button
            type="button"
            onClick={handleAddLanguage}
            className="
              px-5 py-2 rounded-xl
              bg-green-600 text-white
            "
          >
            Add
          </button>
        </div>
      </div>

      {/* BIO */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium mb-1"
        >
          Your Bio
        </label>

        <textarea
          id="bio"
          rows={4}
          value={user.bio || ""}
          onChange={(e) =>
            setUser({
              ...user,
              bio: e.target.value,
            })
          }
          className="
            w-full px-4 py-2 rounded-xl border
          "
        />
      </div>

      {/* RELIABILITY */}
      <div className="p-4 rounded-xl border">
        <p className="text-sm text-muted-foreground">
          Reliability Score
        </p>

        <p className="text-2xl font-bold text-green-500">
          {user.reliabilityScore}
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <p className="text-green-500">
          {message}
        </p>
      )}

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="
            px-8 py-3 rounded-xl
            bg-green-600 text-white
          "
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
);
  }



  export default YourProfile