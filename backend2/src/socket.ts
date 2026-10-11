import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

import User from "./models/User";
import Match from "./models/Match";
import Message from "./models/Message";

interface JwtPayload {
  id: string;
}

interface AuthedSocket extends Socket {
  userId?: string;
}

const matchRoom = (matchId: string) => `match:${matchId}`;

/**
 * Confirms the socket's user is a learner/teacher on this match,
 * and that the match is still active with chat enabled.
 */
const canAccessMatch = async (
  matchId: string,
  userId: string
) => {
  const match = await Match.findById(matchId);

  if (!match) return { ok: false as const };

  const isParticipant =
    match.learner.toString() === userId ||
    match.teacher.toString() === userId;

  if (!isParticipant) return { ok: false as const };

  return { ok: true as const, match };
};

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://tandemlylearn.vercel.app",
      ],
      credentials: true,
    },
  });

  /* ==========================
     AUTH MIDDLEWARE
  ========================== */

  io.use(async (socket: AuthedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Not authorized"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const user = await User.findById(decoded.id).select(
        "-password"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();

      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  /* ==========================
     CONNECTION
  ========================== */

  io.on("connection", (socket: AuthedSocket) => {
    const userId = socket.userId!;

    // A personal room, independent of any match room, so the
    // backend can push account-level events (new match request
    // received, a sent request being accepted/rejected) to every
    // tab/device this user has open — without them needing to
    // reopen a dropdown or log back in to see it.
    socket.join(userId);

    socket.on("join_match", async (matchId: string) => {
      try {
        const access = await canAccessMatch(matchId, userId);

        if (!access.ok) {
          socket.emit("chat_error", {
            message: "Not authorized for this match",
          });
          return;
        }

        socket.join(matchRoom(matchId));

        const room = io.sockets.adapter.rooms.get(
          matchRoom(matchId)
        );

        const peerAlreadyOnline = (room?.size || 0) > 1;

        socket.emit("joined_match", {
          matchId,
          chatEnabled: access.match.chatEnabled,
          peerOnline: peerAlreadyOnline,
        });

        // let anyone already in the room know this user is now online
        socket.to(matchRoom(matchId)).emit("presence", {
          userId,
          online: true,
        });
      } catch (error) {
        socket.emit("chat_error", {
          message: "Could not join chat",
        });
      }
    });

    socket.on("leave_match", (matchId: string) => {
      socket.leave(matchRoom(matchId));

      socket.to(matchRoom(matchId)).emit("presence", {
        userId,
        online: false,
      });
    });

    socket.on(
      "send_message",
      async ({
        matchId,
        content,
      }: {
        matchId: string;
        content: string;
      }) => {
        try {
          const trimmed = (content || "").trim();

          if (!trimmed) return;

          const access = await canAccessMatch(matchId, userId);

          if (!access.ok) {
            socket.emit("chat_error", {
              message: "Not authorized for this match",
            });
            return;
          }

          if (!access.match.chatEnabled) {
            socket.emit("chat_error", {
              message: "Chat is disabled for this match",
            });
            return;
          }

          const created = await Message.create({
            match: matchId,
            sender: userId,
            content: trimmed.slice(0, 2000),
          });

          const populated = await created.populate(
            "sender",
            "name profilePicture"
          );

          io.to(matchRoom(matchId)).emit(
            "new_message",
            populated
          );
        } catch (error) {
          socket.emit("chat_error", {
            message: "Message failed to send",
          });
        }
      }
    );

    socket.on(
      "start_call",
      async ({ matchId }: { matchId: string }) => {
        try {
          const access = await canAccessMatch(matchId, userId);

          if (!access.ok) {
            socket.emit("chat_error", {
              message: "Not authorized for this match",
            });
            return;
          }

          const otherUserId =
            access.match.learner.toString() === userId
              ? access.match.teacher.toString()
              : access.match.learner.toString();

          // Target the other participant's personal room directly,
          // so the invite reaches them wherever they are in the
          // dashboard — not only if they happen to have this match's
          // chat window open already.
          io.to(otherUserId).emit("call_invite", {
            matchId,
            from: userId,
          });
        } catch (error) {
          socket.emit("chat_error", {
            message: "Could not start the call",
          });
        }
      }
    );

    socket.on(
      "typing",
      ({ matchId }: { matchId: string }) => {
        socket
          .to(matchRoom(matchId))
          .emit("typing", { userId });
      }
    );

    socket.on(
      "stop_typing",
      ({ matchId }: { matchId: string }) => {
        socket
          .to(matchRoom(matchId))
          .emit("stop_typing", { userId });
      }
    );

    socket.on(
      "mark_read",
      async ({ matchId }: { matchId: string }) => {
        try {
          const access = await canAccessMatch(matchId, userId);

          if (!access.ok) return;

          await Message.updateMany(
            {
              match: matchId,
              sender: { $ne: userId },
              isRead: false,
            },
            { isRead: true }
          );

          socket.to(matchRoom(matchId)).emit("messages_read", {
            matchId,
            readerId: userId,
          });
        } catch (error) {
          // silent - read receipts are non-critical
        }
      }
    );

    socket.on("disconnect", () => {
      socket.rooms.forEach((room) => {
        if (room.startsWith("match:")) {
          socket.to(room).emit("presence", {
            userId,
            online: false,
          });
        }
      });
    });
  });

  return io;
};
