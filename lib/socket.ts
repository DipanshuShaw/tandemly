import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/api";

let socket: Socket | null = null;

/**
 * Returns a shared Socket.IO connection authenticated with the
 * user's JWT. Reused across the app so the dashboard doesn't open
 * a new websocket every time a chat window is opened.
 */
export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) return null;

  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
