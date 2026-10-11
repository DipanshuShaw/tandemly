"use client";

import React, { useEffect, useState } from "react";
import { CalendarClock, Check, X, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { API_URL } from "@/lib/api";
import { getSocket } from "@/lib/socket";

interface SessionItem {
  _id: string;
  match: string;
  proposedBy: { _id: string; name: string };
  scheduledTime: string;
  duration: number;
  notes?: string;
  status: "proposed" | "confirmed" | "declined" | "cancelled";
}

interface SessionSchedulerProps {
  matchId: string;
  currentUserId: string;
  otherUserName: string;
  open: boolean;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  proposed: "bg-amber-gold/10 text-amber-gold",
  confirmed: "bg-primary/10 text-primary",
  declined: "bg-red-500/10 text-red-500",
  cancelled: "bg-muted text-muted-foreground",
};

export default function SessionScheduler({
  matchId,
  currentUserId,
  otherUserName,
  open,
  onClose,
}: SessionSchedulerProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/sessions/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    fetchSessions();

    const socket = getSocket();

    if (!socket) return;

    const refresh = (payload: any) => {
      if (payload?.match === matchId) fetchSessions();
    };

    socket.on("session_proposed", refresh);
    socket.on("session_updated", refresh);

    return () => {
      socket.off("session_proposed", refresh);
      socket.off("session_updated", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, matchId]);

  const handlePropose = async () => {
    if (!date || !time) {
      toast.error("Pick a date and time first");
      return;
    }

    const scheduledTime = new Date(`${date}T${time}`);

    if (isNaN(scheduledTime.getTime()) || scheduledTime.getTime() < Date.now()) {
      toast.error("Pick a time in the future");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/sessions/propose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          scheduledTime: scheduledTime.toISOString(),
          duration,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to propose session");
        return;
      }

      toast.success("Session proposed");
      setDate("");
      setTime("");
      fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error("Failed to propose session");
    } finally {
      setSubmitting(false);
    }
  };

  const respond = async (sessionId: string, action: "confirm" | "decline") => {
    try {
      setActingOn(sessionId);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/sessions/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || `Failed to ${action} session`);
        return;
      }

      fetchSessions();
    } catch (error) {
      console.error(error);
    } finally {
      setActingOn(null);
    }
  };

  const cancel = async (sessionId: string) => {
    try {
      setActingOn(sessionId);

      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/api/sessions/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      fetchSessions();
    } catch (error) {
      console.error(error);
    } finally {
      setActingOn(null);
    }
  };

  const upcoming = sessions.filter((s) =>
    ["proposed", "confirmed"].includes(s.status)
  );

  const past = sessions.filter((s) =>
    ["declined", "cancelled"].includes(s.status)
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border p-0">
        <DialogHeader className="border-b p-4 space-y-0">
          <DialogTitle className="flex items-center gap-2 font-display">
            <CalendarClock className="size-5 text-primary" />
            Schedule with {otherUserName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Propose form */}
          <div className="rounded-xl border p-4 space-y-3">
            <p className="text-sm font-medium">Propose a session</p>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="border rounded-lg p-1.5 text-sm bg-background"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>

              <Button
                onClick={handlePropose}
                disabled={submitting}
                size="sm"
                className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4 mr-1" />
                Propose
              </Button>
            </div>
          </div>

          {/* Sessions list */}
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading sessions...
            </p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sessions scheduled yet.
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((s) => {
                const isMine = s.proposedBy._id === currentUserId;

                return (
                  <div
                    key={s._id}
                    className="rounded-xl border p-3 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(s.scheduledTime).toLocaleString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.duration} min · proposed by{" "}
                        {isMine ? "you" : s.proposedBy.name}
                      </p>

                      <span
                        className={`inline-block mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[s.status]}`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      {s.status === "proposed" && !isMine && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={actingOn === s._id}
                            onClick={() => respond(s._id, "confirm")}
                            className="size-8 text-primary hover:bg-primary/10"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={actingOn === s._id}
                            onClick={() => respond(s._id, "decline")}
                            className="size-8 text-red-500 hover:bg-red-500/10"
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      )}

                      {(s.status === "proposed" || s.status === "confirmed") && (
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={actingOn === s._id}
                          onClick={() => cancel(s._id)}
                          className="size-8 text-muted-foreground hover:bg-accent"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
