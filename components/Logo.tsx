"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface LogoProps {
  className?: string;
  /** Render just the icon mark (no wordmark) — good for tight spaces. */
  iconOnly?: boolean;
}

/**
 * Tandemly's brand mark. Swaps between the light/dark full lockup
 * (icon + "tandemly" wordmark) depending on the active theme, since
 * the dark variant carries its own Deep Ink Violet backing and the
 * light variant is tuned for a light surface. iconOnly always uses
 * the standalone two-circle mark, which works on either surface.
 */
export function Logo({ className = "h-8 w-auto", iconOnly = false }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (iconOnly) {
    return (
      <img
        src="/tandemly-icon.svg"
        alt="Tandemly"
        className={className}
      />
    );
  }

  // Default to the light lockup until mounted so server and first
  // client render match (next-themes only knows the real theme
  // after hydration).
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <img
      src={isDark ? "/tandemly-logo-dark.svg" : "/tandemly-logo-light.svg"}
      alt="Tandemly"
      className={className}
    />
  );
}
