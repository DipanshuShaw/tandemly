"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Circle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { API_URL } from "@/lib/api";
import { getSocket } from "@/lib/socket";

interface ChatMessage {
  _id: string;
  match: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatWindowProps {
  matchId: string;
  currentUserId: string;
  otherUser: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  chatEnabled: boolean;
  open: boolean;
  onClose: () => void;
}

export default function ChatWindow({
  matchId,
  currentUserId,
  otherUser,
  chatEnabled,
  open,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history + wire up the socket whenever the chat is opened
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadHistory = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/api/messages/${matchId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!cancelled) {
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHistory();

    const socket = getSocket();

    if (!socket) return;

    const handleConnect = () => {
      setConnected(true);
      socket.emit("join_match", matchId);
    };

    const handleDisconnect = () => setConnected(false);

    const handleJoined = (payload: { peerOnline: boolean }) => {
      setPeerOnline(!!payload.peerOnline);
      socket.emit("mark_read", { matchId });
    };

    const handlePresence = (payload: {
      userId: string;
      online: boolean;
    }) => {
      if (payload.userId === otherUser._id) {
        setPeerOnline(payload.online);
      }
    };

    const handleNewMessage = (message: ChatMessage) => {
      if (message.match !== matchId) return;

      setMessages((prev) => [...prev, message]);

      if (message.sender._id !== currentUserId) {
        socket.emit("mark_read", { matchId });
      }
    };

    const handleTyping = (payload: { userId: string }) => {
      if (payload.userId === otherUser._id) setPeerTyping(true);
    };

    const handleStopTyping = (payload: { userId: string }) => {
      if (payload.userId === otherUser._id) setPeerTyping(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("joined_match", handleJoined);
    socket.on("presence", handlePresence);
    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      cancelled = true;

      socket.emit("leave_match", matchId);

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("joined_match", handleJoined);
      socket.off("presence", handlePresence);
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);

      setPeerTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, matchId]);

  // Auto-scroll to the newest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  const handleSend = () => {
    const trimmed = draft.trim();

    if (!trimmed || !chatEnabled) return;

    const socket = getSocket();

    socket?.emit("send_message", { matchId, content: trimmed });
    socket?.emit("stop_typing", { matchId });

    setDraft("");
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);

    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing", { matchId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { matchId });
    }, 1500);
  };

  const initials = otherUser.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex h-[600px] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border p-0">
        <DialogHeader className="flex-row items-center justify-between border-b p-4 space-y-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profilePicture} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>

              <Circle
                className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${
                  peerOnline
                    ? "fill-primary text-primary"
                    : "fill-muted-foreground/40 text-muted-foreground/40"
                }`}
              />
            </div>

            <div className="text-left">
              <DialogTitle asChild>
                <p className="font-semibold leading-tight">
                  {otherUser.name}
                </p>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {peerTyping
                  ? "typing..."
                  : peerOnline
                    ? "Online"
                    : connected
                      ? "Offline"
                      : "Connecting..."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
              <p>No messages yet.</p>
              <p>Say hello to {otherUser.name.split(" ")[0]}!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const isMine = message.sender._id === currentUserId;

                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`mt-1 text-[10px] ${
                            isMine
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {new Date(
                            message.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {peerTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-muted-foreground">
                    typing...
                  </div>
                </motion.div>
              )}

              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-3">
          {chatEnabled ? (
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => handleDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="rounded-xl"
              />

              <Button
                onClick={handleSend}
                disabled={!draft.trim()}
                size="icon"
                className="shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="size-4" />
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Chat is disabled for this match.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
