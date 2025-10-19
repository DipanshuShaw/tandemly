"use client";
import React, { useEffect, useState } from "react";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "earn" | "spend" | "purchase";
  date: string;
}

interface WalletData {
  tokens: number;
  transactions: Transaction[];
}

const TokenWallet: React.FC = () => {
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

    fetch("http://localhost:5000/api/user/wallet", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setWallet(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="text-center mt-10 text-lg">Loading wallet...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-6">
        Token Wallet
      </h2>

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("balance")}
          className={`px-6 py-3 font-semibold text-lg transition-colors ${
            activeTab === "balance"
              ? "border-b-2 border-primary text-primary"
              : "text-text-secondary"
          }`}
        >
          Balance
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-6 py-3 font-semibold text-lg transition-colors ${
            activeTab === "transactions"
              ? "border-b-2 border-primary text-primary"
              : "text-text-secondary"
          }`}
        >
          Transactions
        </button>
      </div>

      {activeTab === "balance" && (
        <div className="space-y-8">
          <div className="bg-primary text-primary-text p-8 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-medium opacity-80">Available Tokens</h3>
            <p className="text-6xl font-bold mt-2">{wallet.tokens}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-16">
            {[
              { tokens: 20, price: 5 },
              { tokens: 50, price: 10 },
              { tokens: 120, price: 20, bestValue: true },
            ].map((pack) => (
              <div
                key={pack.tokens}
                className={`relative bg-surface p-6 rounded-2xl shadow-md border text-center ${
                  pack.bestValue ? "border-secondary" : "border-border"
                }`}
              >
                {pack.bestValue && (
                  <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-secondary text-white px-3 py-1 text-sm font-semibold rounded-full">
                    Best Value
                  </span>
                )}
                <p className="text-4xl font-bold text-text-primary">
                  {pack.tokens}
                </p>
                <p className="text-text-secondary">Tokens</p>
                <button
                  onClick={() =>
                    alert("Buying tokens is not available right now.")
                  }
                  className="w-full mt-6 bg-primary text-primary-text py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Buy for ${pack.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-surface p-6 rounded-2xl shadow-lg">
          {wallet.transactions.length === 0 ? (
            <p className="text-center text-gray-500">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {wallet.transactions.map((t) => (
                <li
                  key={t.id}
                  className="py-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-text-primary">
                      {t.description}
                    </p>
                    <p className="text-sm text-text-secondary">{t.date}</p>
                  </div>
                  <span
                    className={`font-bold text-lg ${
                      t.type === "earn" || t.type === "purchase"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {t.type === "earn" || t.type === "purchase" ? "+" : "-"}
                    {t.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenWallet;
