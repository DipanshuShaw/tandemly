"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  Star,
  CheckCircle2,
  ShieldCheck,
  ImageIcon,
  X,
} from "lucide-react";

import { API_URL } from "@/lib/api";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { staggerContainer, fadeUp } from "./ui-kit";

interface UserData {
  name: string;
  email: string;
  number?: string;
  bio?: string;
  address?: string;
  profilePicture?: string;

  languages: string[];

  tokens: number;
  rating: number;
  completedSessions: number;
  reliabilityScore: number;
}

const StatCard = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) => (
  <div className="rounded-2xl border bg-card p-4 flex items-center gap-3 transition-shadow hover:shadow-md">
    <div className={`p-2.5 rounded-xl ${accent}`}>{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold leading-tight">{value}</p>
    </div>
  </div>
);

const Field = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  readOnly,
  helperText,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  helperText?: string;
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-muted-foreground mb-1"
    >
      {label}
    </label>

    <input
      type={type}
      id={id}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={`w-full px-4 py-2 border rounded-xl shadow-sm outline-none transition-colors ${readOnly
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
        }`}
    />

    {helperText && (
      <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
    )}
  </div>
);

export default function YourProfile() {
  const {
    profile: sharedProfile,
    loading: profileLoading,
    refetchProfile,
  } = useUserProfile();

  const [user, setUser] = useState<UserData | null>(null);
  const [userLanguages, setUserLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  // Seed the local editable draft from the shared profile once it
  // loads — editing happens on this local copy, then PUT + refetch
  // syncs it back so every other section sees the update too.
  useEffect(() => {
    if (sharedProfile) {
      setUser(sharedProfile as unknown as UserData);
      setUserLanguages(sharedProfile.languages || []);
    }
  }, [sharedProfile]);

  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();

    if (
      trimmed &&
      !userLanguages
        .map((l) => l.toLowerCase())
        .includes(trimmed.toLowerCase())
    ) {
      setUserLanguages([...userLanguages, trimmed]);
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setUserLanguages(userLanguages.filter((l) => l !== lang));
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/Login";
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: user.number,
          bio: user.bio,
          address: user.address,
          profilePicture: user.profilePicture,
          languages: userLanguages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      setUser(data.user || user);

      // Keep every other dashboard section (header, Find A Match's
      // token banner, etc.) in sync with the change.
      refetchProfile();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading || !user) {
    return (
      <div className="flex justify-center items-center h-48">
        Loading Profile...
      </div>
    );
  }

  const initials = user.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl sm:text-4xl font-bold font-display">Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          How other learners and teachers see you on Tandemly.
        </p>
      </motion.div>

      {/* Hero */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-indigo-ink/10 via-amber-gold/5 to-indigo-ink/10 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left"
      >
        <div className="pointer-events-none absolute -right-14 -top-14 size-48 rounded-full bg-amber-gold/10 blur-3xl" />
        <div className="relative shrink-0">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover border-4 border-background shadow-md"
            />
          ) : (
            <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-indigo-ink to-amber-gold border-4 border-background shadow-md">
              {initials || "?"}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold font-display">{user.name}</h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>

          {user.bio && (
            <p className="mt-2 text-sm max-w-xl">{user.bio}</p>
          )}

          {userLanguages.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
              {userLanguages.map((lang) => (
                <span
                  key={lang}
                  className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Coins className="size-5 text-amber-gold" />}
          label="Tokens"
          value={user.tokens}
          accent="bg-amber-gold/10"
        />

        <StatCard
          icon={<Star className="size-5 text-amber-gold" />}
          label="Rating"
          value={user.rating?.toFixed?.(1) ?? user.rating}
          accent="bg-amber-gold/10"
        />

        <StatCard
          icon={<CheckCircle2 className="size-5 text-primary" />}
          label="Sessions"
          value={user.completedSessions}
          accent="bg-primary/10"
        />

        <StatCard
          icon={<ShieldCheck className="size-5 text-primary" />}
          label="Reliability"
          value={`${user.reliabilityScore}%`}
          accent="bg-primary/10"
        />
      </motion.div>

      {/* Edit form */}
      <motion.form
        variants={fadeUp}
        className="p-6 sm:p-8 rounded-3xl border bg-card shadow-sm space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveChanges();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Full Name"
            id="name"
            value={user.name}
            readOnly
            helperText="Contact support to change your name."
          />

          <Field
            label="Email Address"
            id="email"
            type="email"
            value={user.email}
            readOnly
            helperText="Contact support to change your email."
          />

          <Field
            label="Phone Number"
            id="number"
            value={user.number || ""}
            onChange={(val) => setUser({ ...user, number: val })}
          />

          <Field
            label="Address"
            id="address"
            value={user.address || ""}
            onChange={(val) => setUser({ ...user, address: val })}
          />
        </div>

        {/* Profile picture URL */}
        <div>
          <label
            htmlFor="profilePicture"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Profile Picture URL
          </label>

          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              type="url"
              id="profilePicture"
              value={user.profilePicture || ""}
              placeholder="https://example.com/your-photo.jpg"
              onChange={(e) =>
                setUser({ ...user, profilePicture: e.target.value })
              }
              className="flex-1 px-4 py-2 border rounded-xl shadow-sm bg-background outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Paste a link to an image — it'll be shown on your matches and chats.
          </p>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Languages
          </label>

          {userLanguages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {userLanguages.map((lang) => (
                <span
                  key={lang}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Remove ${lang}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newLanguage}
              placeholder="Add a language"
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLanguage();
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <button
              type="button"
              onClick={handleAddLanguage}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Your Bio
          </label>

          <textarea
            id="bio"
            rows={4}
            maxLength={500}
            value={user.bio || ""}
            onChange={(e) => setUser({ ...user, bio: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {(user.bio || "").length}/500
          </p>
        </div>

        {/* Message */}
        {message && (
          <p
            className={
              message.type === "success"
                ? "text-primary text-sm font-medium"
                : "text-red-600 dark:text-red-400 text-sm font-medium"
            }
          >
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
