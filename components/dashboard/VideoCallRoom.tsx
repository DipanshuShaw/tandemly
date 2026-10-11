"use client";

import React, { useEffect, useRef } from "react";
import { Video, ExternalLink, Copy, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { getSocket } from "@/lib/socket";

interface VideoCallRoomProps {
  matchId: string;
  otherUserName: string;
  open: boolean;
  onClose: () => void;
}

export default function VideoCallRoom({
  matchId,
  otherUserName,
  open,
  onClose,
}: VideoCallRoomProps) {
  const notified = useRef(false);

  // Deterministic, unguessable-enough room name — derived from the
  // match's own (24-char hex) id rather than anything predictable.
  const roomName = `tandemly-call-${matchId}`;
  const callUrl = `https://meet.jit.si/${roomName}`;

  useEffect(() => {
    if (!open) return;

    // Let the other participant know a call is live, once per open.
    if (!notified.current) {
      const socket = getSocket();
      socket?.emit("start_call", { matchId });
      notified.current = true;
    }

    return () => {
      notified.current = false;
    };
  }, [open, matchId]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(callUrl);
      toast.success("Call link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border p-0">
        <DialogHeader className="flex-row items-center justify-between border-b p-3 space-y-0">
          <DialogTitle className="flex items-center gap-2 text-sm font-medium font-display">
            <Video className="size-4 text-primary" />
            Call with {otherUserName}
          </DialogTitle>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={copyLink}
              className="size-8"
              aria-label="Copy call link"
            >
              <Copy className="size-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              asChild
              className="size-8"
            >
              <a href={callUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </DialogHeader>

        <div className="relative flex-1 bg-black">
          {open && (
            <iframe
              src={`${callUrl}#config.prejoinPageEnabled=false`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="h-full w-full border-0"
              title="Tandemly video call"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
