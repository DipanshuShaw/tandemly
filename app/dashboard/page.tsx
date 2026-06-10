"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    ChevronRight,
    Menu,
    X,
    Moon,
    Sun,
    History
} from "lucide-react"


import { Button } from "@/components/ui/button"

// import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '@/components/dashboard/constants';
import FindMatch from '@/components/dashboard/FindMatch';
import PendingRequests from "@/components/dashboard/PendingRequests";
import CurrentMatch from '@/components/dashboard/CurrentMatch';
import MatchHistory from '@/components/dashboard/MatchHistory';
import YourSkills from '@/components/dashboard/YourSkills';
import Inbox from '@/components/dashboard/Inbox';
import TokenWallet from '@/components/dashboard/TokenWallet';
import Reviews from '@/components/dashboard/Reviews';
import YourProfile from '@/components/dashboard/YourProfile';
import { useTheme } from "next-themes"
import { API_URL } from "@/lib/api";


export default function Dashboard() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll
            );
    }, []);


    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [user, setUser] = useState<any>(null);

    const [activeView, setActiveView] = useState("Find A Match");

    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/Login";
            return;
        }

        fetch(`${API_URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((data) => {
                setUser(data);
            })
            .catch(() => {
                localStorage.removeItem("token");
                window.location.href = "/Login";
            });
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/Login";
    };

    const Sidebar: React.FC<{
        activeView: string;
        setActiveView: (view: string) => void;
    }> = ({ activeView, setActiveView }) => {
        return (
            <aside className="w-64 bg-bg text-text-primary flex-shrink-0 p-6 flex flex-col border-r border-border">
                <div className="m-6"></div>

                <nav className="flex flex-col space-y-2">
                    {[
                        ...NAV_ITEMS,
                        {
                            name: "Pending Requests",
                            icon: <History size={18} />,
                        },
                    ].map((item) => (
                        <button
                            key={item.name}
                            onClick={() =>
                                setActiveView(item.name)
                            }
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-colors duration-200 text-text-primary ${activeView === item.name
                                    ? "bg-green-500 text-primary-text font-semibold"
                                    : "hover:bg-primary-light"
                                }`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>
        );
    };

    const renderContent = () => {
        switch (activeView) {
            case "Find A Match":
                return <FindMatch />;

            case "Pending Requests":
                return <PendingRequests />;

            case "Current Match":
                return <CurrentMatch />;

            case "Match History":
                return <MatchHistory />;

            case "Your Skills":
                return <YourSkills />;

            case "Inbox":
                return <Inbox />;

            case "Token Wallet":
                return <TokenWallet />;

            case "Reviews":
                return <Reviews />;

            case "Your Profile":
                return <YourProfile />;

            default:
                return <FindMatch />;
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">
                    Loading Dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-h-[100dvh] flex-col bg-background">
            <header
                className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled
                        ? "bg-background/80 shadow-sm"
                        : "bg-transparent"
                    }`}
            >
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-green-700 via-lime-600 to-blue-500 flex items-center justify-center text-primary-foreground">
                            T
                        </div>
                        <span>Tandemly</span>
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:flex gap-4 items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full"
                        >
                            {theme === "dark" ? (
                                <Sun className="size-[18px]" />
                            ) : (
                                <Moon className="size-[18px]" />
                            )}
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            Welcome, {user?.name}
                        </div>

                        <Button
                            onClick={handleLogout}
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            Log Out
                            <ChevronRight className="size-3 ml-2" />
                        </Button>
                    </div>

                    {/* Mobile */}
                    <div className="flex items-center gap-4 md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full"
                        >
                            {theme === "dark" ? (
                                <Sun className="size-[18px]" />
                            ) : (
                                <Moon className="size-[18px]" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                setMobileMenuOpen(!mobileMenuOpen)
                            }
                        >
                            {mobileMenuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
                    >
                        <div className="container py-4 flex flex-col gap-4">
                            <div className="text-center text-sm text-muted-foreground">
                                Welcome, {user?.name}
                            </div>

                            <div className="flex flex-col gap-2 pt-2 border-t">
                                <Button
                                    onClick={handleLogout}
                                    className="bg-green-500 hover:bg-green-600"
                                >
                                    Log Out
                                    <ChevronRight className="ml-1 size-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </header>

            <main className="overflow-hidden">
                <div className="flex flex-col min-h-screen font-sans bg-bg">
                    <div className="flex flex-grow overflow-hidden">
                        <Sidebar
                            activeView={activeView}
                            setActiveView={setActiveView}
                        />

                        <main className="flex-1 overflow-y-auto m-6 p-8 bg-bg">
                            {renderContent()}
                        </main>
                    </div>
                </div>
            </main>






            <footer className="border-t border-border bg-background">
                <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Tandemly
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                            Learn • Teach • Grow Together
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-500 font-medium">
                            Connected
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    )
}




