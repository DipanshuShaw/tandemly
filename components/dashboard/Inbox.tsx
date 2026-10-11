"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Inbox as InboxIcon } from "lucide-react";

import { API_URL } from "@/lib/api";
import { useUserProfile } from "@/contexts/UserProfileContext";
import ChatWindow from "./ChatWindow";
import { PageHeader, EmptyState, SkeletonGrid, staggerContainer, fadeUp } from "./ui-kit";

interface ConvoUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface ConvoMatch {
  _id: string;
  learner: ConvoUser;
  teacher: ConvoUser;
  learningSkill: { _id: string; name: string };
  teachingSkill: { _id: string; name: string };
  status: "active" | "completed" | "cancelled";
  chatEnabled: boolean;
}

interface Conversation {
  match: ConvoMatch;
  lastMessage: {
    _id: string;
    content: string;
    createdAt: string;
    sender: { _id: string; name: string };
  } | null;
  unreadCount: number;
}

const formatRelativeTime = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString();
};

export default function Inbox() {
  const { profile } = useUserProfile();
  const currentUserId = profile?._id || null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const fetchInbox = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const convoData = await res.json();

      setConversations(convoData.conversations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const otherUserFor = (match: ConvoMatch): ConvoUser =>
    match.learner._id === currentUserId ? match.teacher : match.learner;

  const activeConversation = conversations.find(
    (c) => c.match._id === activeMatchId
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader icon={InboxIcon} eyebrow="Messages" title="Inbox" subtitle="Loading your conversations..." />
        <SkeletonGrid count={4} className="h-20" cols="" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={InboxIcon}
        eyebrow="Messages"
        title="Inbox"
        subtitle="Every conversation from your current and past matches, in one place."
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="No conversations yet"
          subtitle="Once you have a match, you can chat with them here."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-3"
        >
          {conversations.map(({ match, lastMessage, unreadCount }) => {
            const other = otherUserFor(match);
            const isActive = match.status === "active";
            const mine =
              lastMessage?.sender?._id === currentUserId;

            return (
              <motion.button
                variants={fadeUp}
                whileHover={{ y: -2 }}
                key={match._id}
                onClick={() => setActiveMatchId(match._id)}
                className="flex items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-ink to-amber-gold text-white font-semibold">
                    {other.name?.charAt(0).toUpperCase()}
                  </div>

                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${isActive ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">
                      {other.name}
                    </p>

                    {lastMessage && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <p className="truncate text-sm text-muted-foreground">
                    {lastMessage
                      ? `${mine ? "You: " : ""}${lastMessage.content}`
                      : "No messages yet — say hello!"}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {isActive ? "Active match" : "Past match"}
                    </span>

                    <span className="text-[11px] text-muted-foreground truncate">
                      {match.learningSkill?.name} ↔ {match.teachingSkill?.name}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {unreadCount > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                      {unreadCount}
                    </span>
                  ) : (
                    <MessageCircle className="size-4 text-muted-foreground" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {activeConversation && currentUserId && (
        <ChatWindow
          matchId={activeConversation.match._id}
          currentUserId={currentUserId}
          otherUser={otherUserFor(activeConversation.match)}
          chatEnabled={activeConversation.match.chatEnabled}
          open={!!activeMatchId}
          onClose={() => {
            setActiveMatchId(null);
            fetchInbox();
          }}
        />
      )}
    </div>
  );
}
