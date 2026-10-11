"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { API_URL } from "@/lib/api";
import GoogleIcon from "./ui/GoogleIcon";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_ID = "google-identity-services";

interface GoogleSignInButtonProps {
  label?: string;
}

/**
 * Renders Google's own "Sign in with Google" button (via Google
 * Identity Services) and exchanges the resulting ID token for a
 * Tandemly session through POST /api/auth/google.
 *
 * Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID (frontend) and
 * GOOGLE_CLIENT_ID (backend) to be set to a Client ID from
 * https://console.cloud.google.com/apis/credentials — until then
 * this renders a disabled placeholder explaining that.
 */
export default function GoogleSignInButton({
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const buttonHostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(false);

  const handleCredential = async (response: { credential: string }) => {
    try {
      setExchanging(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google sign-in failed");
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setExchanging(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const renderButton = () => {
      if (!window.google || !buttonHostRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });

      buttonHostRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(buttonHostRef.current, {
        theme: resolvedTheme === "dark" ? "filled_black" : "outline",
        size: "large",
        shape: "pill",
        width: 320,
        text: "continue_with",
      });
    };

    if (window.google) {
      renderButton();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);

    if (existing) {
      existing.addEventListener("load", renderButton);
      return () => existing.removeEventListener("load", renderButton);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.body.appendChild(script);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID to enable this"
        className="flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-sm text-muted-foreground opacity-60 cursor-not-allowed"
      >
        <GoogleIcon className="size-4" />
        {label} (not configured)
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={buttonHostRef} className="flex justify-center [&>div]:!w-full" />
      {exchanging && (
        <p className="text-xs text-muted-foreground">Signing you in...</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
