"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  CalendarClock,
  Video,
  PhoneIncoming,
  Users2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useUserProfile } from "@/contexts/UserProfileContext";
import ChatWindow from "./ChatWindow";
import SessionScheduler from "./SessionScheduler";
import VideoCallRoom from "./VideoCallRoom";
import { PageHeader, Pill, EmptyState, SkeletonGrid, staggerContainer, fadeUp } from "./ui-kit";

interface MatchUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface Match {
  _id: string;

  learner: MatchUser;
  teacher: MatchUser;

  learningSkill: {
    _id: string;
    name: string;
  };

  teachingSkill: {
    _id: string;
    name: string;
  };

  status: string;

  chatEnabled: boolean;

  startedAt: string;
}

interface UpcomingSession {
  match: string;
  scheduledTime: string;
}

export default function CurrentMatch() {
  const { profile } = useUserProfile();
  const currentUserId = profile?._id || null;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const [completing, setCompleting] =
    useState<string | null>(null);

  const [activeChatMatchId, setActiveChatMatchId] = useState<
    string | null
  >(null);

  const [activeScheduleMatchId, setActiveScheduleMatchId] = useState<
    string | null
  >(null);

  const [activeCallMatchId, setActiveCallMatchId] = useState<
    string | null
  >(null);

  const [upcomingByMatch, setUpcomingByMatch] = useState<
    Record<string, string>
  >({});

  const fetchMatches = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/matches/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setMatches(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSessions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/sessions/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: UpcomingSession[] = await res.json();

      const map: Record<string, string> = {};

      (Array.isArray(data) ? data : []).forEach((s) => {
        // sessions come back sorted ascending — keep the earliest per match
        if (!map[s.match]) map[s.match] = s.scheduledTime;
      });

      setUpcomingByMatch(map);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteMatch = async (
    matchId: string
  ) => {
    try {
      setCompleting(matchId);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/matches/complete`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            matchId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message ||
            "Failed to complete match"
        );
        return;
      }

      toast.success("Match completed");

      fetchMatches();
    } catch (error) {
      console.error(error);
    } finally {
      setCompleting(null);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchUpcomingSessions();

    const socket = getSocket();

    if (!socket) return;

    // If a request you sent just got accepted, the new match
    // should show up here immediately.
    const handleRequestUpdate = (payload: { status: string }) => {
      if (payload.status === "accepted") {
        fetchMatches();
      }
    };

    const refreshSessions = () => fetchUpcomingSessions();

    const handleCallInvite = (payload: { matchId: string; from: string }) => {
      const match = matches.find((m) => m._id === payload.matchId);
      const callerName = match ? otherUserFor(match).name : "Someone";

      toast(`${callerName} started a video call`, {
        icon: <PhoneIncoming className="size-4" />,
        description: "Tap Join to hop into the call.",
        action: {
          label: "Join",
          onClick: () => setActiveCallMatchId(payload.matchId),
        },
      });
    };

    socket.on("match_request_updated", handleRequestUpdate);
    socket.on("session_proposed", refreshSessions);
    socket.on("session_updated", refreshSessions);
    socket.on("call_invite", handleCallInvite);

    return () => {
      socket.off("match_request_updated", handleRequestUpdate);
      socket.off("session_proposed", refreshSessions);
      socket.off("session_updated", refreshSessions);
      socket.off("call_invite", handleCallInvite);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches.length]);

  function otherUserFor(match: Match): MatchUser {
    return match.learner._id === currentUserId
      ? match.teacher
      : match.learner;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader icon={Users2} eyebrow="In Progress" title="Active Matches" subtitle="Loading your ongoing skill exchanges..." />
        <SkeletonGrid count={3} className="h-64" cols="" />
      </div>
    );
  }

  const activeChatMatch = matches.find(
    (m) => m._id === activeChatMatchId
  );

  const activeScheduleMatch = matches.find(
    (m) => m._id === activeScheduleMatchId
  );

  const activeCallMatch = matches.find(
    (m) => m._id === activeCallMatchId
  );

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Users2}
        eyebrow="In Progress"
        title="Active Matches"
        subtitle="Manage your ongoing skill exchanges — chat, schedule, call, and wrap them up when you're done."
      />

      {matches.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No active matches"
          subtitle="Accept a match request, or send one from Find A Match or Browse Skills, to get started."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-5"
        >
          {matches.map((match) => {
            const other = otherUserFor(match);
            const initials = other.name?.charAt(0).toUpperCase();

            return (
              <motion.div
                variants={fadeUp}
                key={match._id}
                className="overflow-hidden rounded-3xl border bg-card shadow-sm"
              >
                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-ink to-amber-gold font-bold text-white shadow-sm">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-semibold font-display leading-tight">
                        {currentUserId === match.learner._id
                          ? `Learning ${match.learningSkill?.name} from ${match.teacher?.name}`
                          : `Teaching ${match.learningSkill?.name} to ${match.learner?.name}`}
                      </h2>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Pill tone="primary">
                          Learning: {match.learningSkill?.name}
                        </Pill>
                        <Pill tone="amber">
                          Teaching: {match.teachingSkill?.name}
                        </Pill>
                        <Pill>{match.status}</Pill>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Started {new Date(match.startedAt).toLocaleDateString()}
                      </p>

                      {upcomingByMatch[match._id] && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                          <CalendarClock className="size-4" />
                          Next session:{" "}
                          {new Date(
                            upcomingByMatch[match._id]
                          ).toLocaleString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t bg-muted/30 px-6 py-4">
                  <button
                    onClick={() => setActiveChatMatchId(match._id)}
                    disabled={!match.chatEnabled}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageCircle className="size-4" />
                    Chat
                  </button>

                  <button
                    onClick={() => setActiveScheduleMatchId(match._id)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <CalendarClock className="size-4" />
                    Schedule
                  </button>

                  <button
                    onClick={() => setActiveCallMatchId(match._id)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-amber-gold/40 px-4 py-2 text-sm font-medium text-amber-gold transition-colors hover:bg-amber-gold/10"
                  >
                    <Video className="size-4" />
                    Video Call
                  </button>

                  <button
                    onClick={() => handleCompleteMatch(match._id)}
                    disabled={completing === match._id}
                    className="ml-auto flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  >
                    <CheckCircle className="size-4" />
                    {completing === match._id ? "Completing..." : "Complete Match"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {activeChatMatch && currentUserId && (
        <ChatWindow
          matchId={activeChatMatch._id}
          currentUserId={currentUserId}
          otherUser={otherUserFor(activeChatMatch)}
          chatEnabled={activeChatMatch.chatEnabled}
          open={!!activeChatMatchId}
          onClose={() => setActiveChatMatchId(null)}
        />
      )}

      {activeScheduleMatch && currentUserId && (
        <SessionScheduler
          matchId={activeScheduleMatch._id}
          currentUserId={currentUserId}
          otherUserName={otherUserFor(activeScheduleMatch).name}
          open={!!activeScheduleMatchId}
          onClose={() => {
            setActiveScheduleMatchId(null);
            fetchUpcomingSessions();
          }}
        />
      )}

      {activeCallMatch && (
        <VideoCallRoom
          matchId={activeCallMatch._id}
          otherUserName={otherUserFor(activeCallMatch).name}
          open={!!activeCallMatchId}
          onClose={() => setActiveCallMatchId(null)}
        />
      )}
    </div>
  );
}
