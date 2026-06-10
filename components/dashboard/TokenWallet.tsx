
"use client";

import React, {
  useEffect,
  useState,
} from "react";

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

export default function TokenWallet() {
  const [activeTab, setActiveTab] =
    useState<
      "balance" | "transactions"
    >("balance");

  const [wallet, setWallet] =
    useState<WalletData>({
      tokens: 0,
      transactions: [],
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) return;

    fetch(
      "http://localhost:5000/api/users/wallet",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) =>
        setWallet(data)
      )
      .catch((err) =>
        console.error(err)
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        Loading Wallet...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Token Wallet
        </h1>

        <p className="text-muted-foreground mt-2">
          Manage your Tandemly
          token balance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() =>
            setActiveTab(
              "balance"
            )
          }
          className={`px-4 py-2 rounded-lg ${
            activeTab ===
            "balance"
              ? "bg-green-500 text-white"
              : "bg-secondary"
          }`}
        >
          Balance
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "transactions"
            )
          }
          className={`px-4 py-2 rounded-lg ${
            activeTab ===
            "transactions"
              ? "bg-blue-500 text-white"
              : "bg-secondary"
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Balance */}
      {activeTab ===
        "balance" && (
        <div className="border rounded-2xl p-8 bg-card shadow-sm">
          <p className="text-lg text-muted-foreground">
            Available Tokens
          </p>

          <h2 className="text-6xl font-bold m-4">
            {wallet.tokens}
          </h2>



          
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { tokens: 20, price: 5 },
            { tokens: 50, price: 10 },
            { tokens: 120, price: 20, bestValue: true },
          ].map((pack) => (
            <div
              key={pack.tokens}
              className={`
                relative p-6 rounded-2xl shadow-md border text-center transition
                bg-white border-gray-200
                hover:shadow-lg

                dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl
                ${pack.bestValue ? "border-blue-500 dark:border-blue-400" : ""}
              `}
            >
              {pack.bestValue && (
                <span
                  className="
                    absolute top-0 -translate-y-1/2 
                    left-1/2 -translate-x-1/2 
                    bg-blue-600 text-white px-3 py-1 text-sm font-semibold rounded-full
                    dark:bg-blue-500
                  "
                >
                  Best Value
                </span>
              )}

              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {pack.tokens}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Tokens</p>

              <button
                onClick={() =>
                  alert("Buying tokens is not available right now.")
                }
                className="
                  w-full mt-6 py-2 rounded-lg shadow font-medium transition
                  text-white bg-gradient-to-r from-emerald-600 to-blue-600
                  hover:opacity-90
                  dark:from-emerald-500 dark:to-blue-500
                "
              >
                Buy for ${pack.price}
              </button>
            </div>
          ))}
        </div>






        </div>
      )}

      {/* Transactions */}
      {activeTab ===
        "transactions" && (
        <div className="border rounded-2xl p-6 bg-card shadow-sm">
          {wallet.transactions
            .length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold">
                No Transactions
              </h3>

              <p className="text-muted-foreground mt-2">
                Transaction
                history will
                appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wallet.transactions.map(
                (t) => (
                  <div
                    key={t._id}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">
                        {
                          t.description
                        }
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {t.date}
                      </p>
                    </div>

                    <span
                      className={
                        t.type ===
                        "earn"
                          ? "text-green-500 font-bold"
                          : "text-red-500 font-bold"
                      }
                    >
                      {t.type ===
                      "earn"
                        ? "+"
                        : "-"}
                      {t.amount}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}




