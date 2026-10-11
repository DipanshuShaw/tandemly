"use client";

import React, { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_URL } from "@/lib/api";
import { getSocket } from "@/lib/socket";

interface RequestUser {
  _id: string;
  name: string;
  bio?: string;
}

interface MatchRequest {
  _id: string;
  from: RequestUser;
  teachSkill: { _id: string; name: string };
  learnSkill: { _id: string; name: string };
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const SEEN_KEY = "tandemly_seen_pending_count";

export default function NotificationsBell() {
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const fetchRequests = async (
    notifyIfNew: boolean
  ): Promise<MatchRequest[]> => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/matches/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const list: MatchRequest[] = Array.isArray(data) ? data : [];

      setRequests(list);

      if (notifyIfNew) {
        const lastSeen = Number(localStorage.getItem(SEEN_KEY) || 0);

        if (list.length > lastSeen) {
          const newOnes = list.length - lastSeen;

          toast.success(
            newOnes === 1
              ? "New match request"
              : `${newOnes} new match requests`,
            {
              description: "Someone wants to swap skills with you.",
            }
          );
        }

        localStorage.setItem(SEEN_KEY, String(list.length));
      }

      return list;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Notify once on mount (e.g. right after login), and stay
  // connected afterward so a request that arrives while this tab
  // is open shows up immediately — no reopening the bell or
  // logging back in required.
  useEffect(() => {
    fetchRequests(true);

    const socket = getSocket();

    if (!socket) return;

    const handleNewRequest = () => {
      fetchRequests(true);
    };

    socket.on("new_match_request", handleNewRequest);

    return () => {
      socket.off("new_match_request", handleNewRequest);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Refresh the list every time the bell is opened, and mark
      // everything currently visible as "seen" so the badge clears.
      fetchRequests(false).then((list) => {
        localStorage.setItem(SEEN_KEY, String(list.length));
      });
    }
  };

  const respond = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      setActingOn(requestId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/matches/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ requestId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || `Failed to ${action} request`);
        return;
      }

      toast.success(
        action === "accept" ? "Request accepted" : "Request declined"
      );

      const remaining = requests.filter((r) => r._id !== requestId);
      setRequests(remaining);
      localStorage.setItem(SEEN_KEY, String(remaining.length));
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setActingOn(null);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative rounded-full p-2 hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          {requests.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {requests.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-4 py-3">
          Match Requests Received
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : requests.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No one has sent you a request yet.
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className="border-b last:border-b-0 px-4 py-3 space-y-2 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-ink to-amber-gold text-xs font-semibold text-white">
                    {request.from?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {request.from?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wants to learn{" "}
                      <span className="font-medium text-foreground">
                        {request.learnSkill?.name}
                      </span>{" "}
                      · will teach{" "}
                      <span className="font-medium text-foreground">
                        {request.teachSkill?.name}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => respond(request._id, "accept")}
                    disabled={actingOn === request._id}
                    className="flex items-center justify-center gap-1 flex-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium py-1.5 disabled:opacity-50"
                  >
                    <Check className="size-3.5" />
                    Accept
                  </button>

                  <button
                    onClick={() => respond(request._id, "reject")}
                    disabled={actingOn === request._id}
                    className="flex items-center justify-center gap-1 flex-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1.5 disabled:opacity-50"
                  >
                    <X className="size-3.5" />
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
