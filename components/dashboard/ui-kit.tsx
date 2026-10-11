"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

/* =========================================================
   Shared visual language for the whole dashboard, so every
   section — matching, skills, inbox, wallet, etc. — reads as
   one cohesive product instead of a pile of one-off pages.
========================================================= */

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
} as const;

/* ---------------- Page Header ---------------- */

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-amber-gold/5 to-transparent p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-amber-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-20 size-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-ink to-amber-gold text-white shadow-md shadow-indigo-ink/20">
            <Icon className="size-6" />
          </div>

          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold font-display leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/* ---------------- Stat Chip ---------------- */

export function StatChip({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: "primary" | "amber";
}) {
  const toneClasses =
    tone === "amber"
      ? "bg-amber-gold/10 text-amber-gold"
      : "bg-primary/10 text-primary";

  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3">
      <div className={`flex size-9 items-center justify-center rounded-xl ${toneClasses}`}>
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-none">{label}</p>
        <p className="text-lg font-bold font-display leading-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Empty State ---------------- */

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-card/50 px-6 py-16 text-center"
    >
      <div className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-amber-gold/15">
        <Icon className="size-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold font-display">{title}</h3>
      {subtitle && (
        <p className="max-w-sm text-sm text-muted-foreground">{subtitle}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}

/* ---------------- Skeletons ---------------- */

export function SkeletonCard({ className = "h-40" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-3xl border bg-card ${className}`}
    >
      <div className="h-full w-full rounded-3xl bg-gradient-to-br from-muted to-transparent" />
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  className = "h-56",
  cols = "sm:grid-cols-2 xl:grid-cols-3",
}: {
  count?: number;
  className?: string;
  cols?: string;
}) {
  return (
    <div className={`grid gap-5 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className={className} />
      ))}
    </div>
  );
}

/* ---------------- Section Badge ---------------- */

export function Pill({
  children,
  tone = "muted",
  icon: Icon,
}: {
  children: React.ReactNode;
  tone?: "muted" | "primary" | "amber" | "red";
  icon?: LucideIcon;
}) {
  const toneClasses: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-gold/10 text-amber-gold",
    red: "bg-red-500/10 text-red-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {Icon && <Icon className="size-3" />}
      {children}
    </span>
  );
}

/* ---------------- Match Score Ring ---------------- */

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-muted"
          fill="none"
        />
        <defs>
          <linearGradient id="score-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#29225E" />
            <stop offset="100%" stopColor="#F6A821" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke="url(#score-ring-gradient)"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold font-display">{score}%</span>
      </div>
    </div>
  );
}
