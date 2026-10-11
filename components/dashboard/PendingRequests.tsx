"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Send } from "lucide-react";

import { API_URL } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { PageHeader, Pill, EmptyState, SkeletonGrid, staggerContainer, fadeUp } from "./ui-kit";

interface RequestUser {
  _id: string;
  name: string;
  bio?: string;
}

interface MatchRequest {
  _id: string;

  to: RequestUser;

  teachSkill: {
    _id: string;
    name: string;
  };

  learnSkill: {
    _id: string;
    name: string;
  };

  status: "pending" | "accepted" | "rejected";

  createdAt: string;
}

const STATUS_STYLES: Record<
  string,
  { tone: "amber" | "primary" | "red"; icon: React.ReactNode; label: string }
> = {
  pending: {
    tone: "amber",
    icon: <Clock className="size-3.5" />,
    label: "Waiting for response",
  },
  accepted: {
    tone: "primary",
    icon: <CheckCircle2 className="size-3.5" />,
    label: "Accepted",
  },
  rejected: {
    tone: "red",
    icon: <XCircle className="size-3.5" />,
    label: "Declined",
  },
};

export default function PendingRequests() {
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/matches/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const socket = getSocket();

    if (!socket) return;

    // The person you sent a request to just accepted or declined
    // it — refresh so the status badge updates without needing a
    // page reload or fresh login.
    const handleUpdate = () => {
      fetchRequests();
    };

    socket.on("match_request_updated", handleUpdate);

    return () => {
      socket.off("match_request_updated", handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader icon={Send} eyebrow="Outgoing" title="Pending Requests" subtitle="Loading your sent requests..." />
        <SkeletonGrid count={3} className="h-32" cols="" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Send}
        eyebrow="Outgoing"
        title="Pending Requests"
        subtitle="Every match request you've sent, and where it stands."
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={Send}
          title="You haven't sent any requests"
          subtitle="Head over to Find A Match to reach out to someone."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {requests.map((request) => {
            const status =
              STATUS_STYLES[request.status] || STATUS_STYLES.pending;

            return (
              <motion.div
                variants={fadeUp}
                key={request._id}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-ink to-amber-gold font-semibold text-white">
                      {request.to?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold font-display">
                        {request.to?.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Pill tone="primary">
                          Learn: {request.learnSkill?.name}
                        </Pill>
                        <Pill tone="amber">
                          Teach: {request.teachSkill?.name}
                        </Pill>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Sent{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>

                  <Pill tone={status.tone}>
                    <span className="flex items-center gap-1.5">
                      {status.icon}
                      {status.label}
                    </span>
                  </Pill>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
