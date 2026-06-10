"use client";

import React, { useEffect, useState } from "react";

interface RequestUser {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  languages: string[];
}

interface MatchRequest {
  _id: string;

  from: RequestUser;

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

export default function PendingRequests() {
  const [requests, setRequests] = useState<
    MatchRequest[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const fetchRequests = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/matches/received",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (
    requestId: string
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/matches/accept",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            requestId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to accept request"
        );

        return;
      }

      alert("Request accepted");

      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (
    requestId: string
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/matches/reject",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            requestId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to reject request"
        );

        return;
      }

      alert("Request rejected");

      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        Loading Requests...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Pending Requests
        </h1>

        <p className="text-muted-foreground mt-2">
          Review incoming skill exchange
          requests.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="p-10 border rounded-2xl text-center">
          <h2 className="text-xl font-semibold">
            No Pending Requests
          </h2>

          <p className="text-muted-foreground mt-2">
            When someone wants to exchange
            skills with you, it will appear
            here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div
              key={request._id}
              className="border rounded-2xl p-6 bg-card shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    {request.from?.name}
                  </h3>

                  <p className="text-muted-foreground mt-1">
                    {request.from?.bio ||
                      "No bio available"}
                  </p>

                  <div className="mt-4 space-y-2">
                    <p>
                      <span className="font-medium">
                        Wants To Learn:
                      </span>{" "}
                      {request.learnSkill?.name}
                    </p>

                    <p>
                      <span className="font-medium">
                        Will Teach:
                      </span>{" "}
                      {request.teachSkill?.name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleAccept(
                        request._id
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      handleReject(
                        request._id
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}