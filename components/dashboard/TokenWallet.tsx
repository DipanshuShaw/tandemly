"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "@/lib/api";
import { PageHeader, EmptyState, SkeletonCard, staggerContainer, fadeUp } from "./ui-kit";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: "earn" | "spend";
  date: string;
}

interface WalletData {
  tokens: number;
  transactions: Transaction[];
}

const TOKEN_PACKS = [
  { tokens: 20, price: 5 },
  { tokens: 50, price: 10 },
  { tokens: 120, price: 20, bestValue: true },
];

export default function TokenWallet() {
  const [activeTab, setActiveTab] = useState<"balance" | "transactions">(
    "balance"
  );

  const [wallet, setWallet] = useState<WalletData>({
    tokens: 0,
    transactions: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch(`${API_URL}/api/users/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setWallet(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader icon={Wallet} eyebrow="Economy" title="Token Wallet" subtitle="Loading your balance..." />
        <SkeletonCard className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Wallet}
        eyebrow="Economy"
        title="Token Wallet"
        subtitle="Tokens you've earned by teaching, and spent to learn — Tandemly's fair-exchange currency."
      />

      {/* Tabs */}
      <div className="relative flex w-fit gap-1 rounded-2xl border bg-card p-1">
        {(["balance", "transactions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="wallet-tab-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-ink to-amber-gold"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Balance */}
      {activeTab === "balance" && (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-amber-gold/15 via-amber-gold/5 to-transparent p-8 text-center shadow-sm sm:text-left">
            <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-amber-gold/20 blur-3xl" />

            <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-gold/20 text-amber-gold">
                <Coins className="size-8" />
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available Tokens
                </p>
                <h2 className="text-6xl font-bold font-display leading-none text-amber-gold">
                  {wallet.tokens}
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TOKEN_PACKS.map((pack) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={pack.tokens}
                className={`relative rounded-3xl border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-lg ${
                  pack.bestValue ? "border-amber-gold" : ""
                }`}
              >
                {pack.bestValue && (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-gold px-3 py-1 text-sm font-semibold text-indigo-ink shadow-sm">
                    Best Value
                  </span>
                )}

                <p className="text-4xl font-bold font-display">{pack.tokens}</p>
                <p className="text-muted-foreground">Tokens</p>

                <button
                  onClick={() =>
                    toast("Buying tokens is not available right now.")
                  }
                  className="mt-6 w-full rounded-xl bg-amber-gold py-2 font-medium text-indigo-ink shadow transition-colors hover:bg-amber-gold/90"
                >
                  Buy for ${pack.price}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      {activeTab === "transactions" && (
        <div className="rounded-3xl border bg-card p-2 shadow-sm">
          {wallet.transactions.length === 0 ? (
            <EmptyState
              icon={Coins}
              title="No transactions yet"
              subtitle="Token activity from completed matches will show up here."
            />
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="show">
              {wallet.transactions.map((t) => (
                <motion.div
                  variants={fadeUp}
                  key={t._id}
                  className="flex items-center justify-between gap-3 rounded-2xl p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-9 items-center justify-center rounded-xl ${
                        t.type === "earn"
                          ? "bg-amber-gold/10 text-amber-gold"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.type === "earn" ? (
                        <ArrowUpRight className="size-4" />
                      ) : (
                        <ArrowDownRight className="size-4" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-sm text-muted-foreground">{t.date}</p>
                    </div>
                  </div>

                  <span
                    className={`font-bold ${
                      t.type === "earn" ? "text-amber-gold" : "text-red-500"
                    }`}
                  >
                    {t.type === "earn" ? "+" : "-"}
                    {t.amount}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
