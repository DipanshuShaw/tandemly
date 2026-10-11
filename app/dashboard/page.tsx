"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronRight,
    Menu,
    X,
    Moon,
    Sun,
    History,
    LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"

import { NAV_ITEMS } from '@/components/dashboard/constants';
import FindMatch from '@/components/dashboard/FindMatch';
import BrowseSkills from '@/components/dashboard/BrowseSkills';
import PendingRequests from "@/components/dashboard/PendingRequests";
import CurrentMatch from '@/components/dashboard/CurrentMatch';
import MatchHistory from '@/components/dashboard/MatchHistory';
import YourSkills from '@/components/dashboard/YourSkills';
import Inbox from '@/components/dashboard/Inbox';
import TokenWallet from '@/components/dashboard/TokenWallet';
import Reviews from '@/components/dashboard/Reviews';
import YourProfile from '@/components/dashboard/YourProfile';
import NotificationsBell from '@/components/dashboard/NotificationsBell';
import { useTheme } from "next-themes"
import {
    UserProfileProvider,
    useUserProfile,
} from "@/contexts/UserProfileContext";

const ALL_NAV_ITEMS = [
    ...NAV_ITEMS,
    { name: "Pending Requests", icon: <History size={20} /> },
];

// Defined at module scope (not inside DashboardShell) so its component
// identity stays stable across re-renders. When a component like this
// is redefined inline inside another component's body, React treats it
// as a brand-new component type on every re-render — including the
// re-render triggered by clicking a nav item itself — which was forcing
// every nav button to fully unmount and remount instead of just
// updating in place. That broke the layoutId shared-element animation:
// instead of sliding smoothly from the previously active tab, it had no
// "previous position" to animate from and fell back to sliding in from
// a default position every time.
const NavButton = ({
    item,
    onClick,
    listId,
    isActive,
}: {
    item: { name: string; icon: React.ReactNode };
    onClick: () => void;
    listId: string;
    isActive: boolean;
}) => {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive
                    ? "text-white"
                    : "text-foreground/80 hover:bg-accent hover:text-foreground"
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId={`active-nav-pill-${listId}`}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-ink to-amber-gold shadow-md shadow-indigo-ink/20"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
            )}

            <span className={`relative z-10 ${isActive ? "text-white" : "text-indigo-ink dark:text-amber-gold"}`}>
                {item.icon}
            </span>
            <span className="relative z-10">{item.name}</span>
        </button>
    );
};

export default function Dashboard() {
    // Fetches the profile once here and shares it with every dashboard
    // section below, instead of each one independently re-fetching the
    // same data on every mount.
    return (
        <UserProfileProvider>
            <DashboardShell />
        </UserProfileProvider>
    );
}

function DashboardShell() {
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

    const { profile: user, loading } = useUserProfile();

    const [activeView, setActiveView] = useState("Find A Match");

    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/Login";
        }
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            localStorage.removeItem("token");
            window.location.href = "/Login";
        }
    }, [loading, user]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/Login";
    };

    const renderContent = () => {
        switch (activeView) {
            case "Find A Match":
                return <FindMatch />;

            case "Browse Skills":
                return <BrowseSkills />;

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

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">
                        Loading Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[100dvh] flex-col bg-background">
            <header
                className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled
                        ? "bg-background/80 shadow-sm border-b border-border"
                        : "bg-transparent"
                    }`}
            >
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Logo iconOnly className="h-11 w-11 sm:hidden" />
                        <Logo className="hidden sm:block h-11 w-auto" />
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:flex gap-2 items-center">
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

                        <NotificationsBell />

                        <div className="flex items-center gap-2 pl-1 pr-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-ink to-amber-gold text-xs font-semibold text-white">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {user?.name}
                            </span>
                        </div>

                        <Button
                            onClick={handleLogout}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            Log Out
                            <ChevronRight className="size-3 ml-2" />
                        </Button>
                    </div>

                    {/* Mobile */}
                    <div className="flex items-center gap-2 md:hidden">
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

                        <NotificationsBell />

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

                {/* Mobile Menu — full navigation */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b border-border max-h-[calc(100dvh-4rem)] overflow-y-auto"
                        >
                            <div className="container py-4 flex flex-col gap-4 px-4">
                                <div className="text-center text-sm text-muted-foreground">
                                    Welcome, {user?.name}
                                </div>

                                <nav className="flex flex-col gap-1.5">
                                    {ALL_NAV_ITEMS.map((item) => (
                                        <NavButton
                                            key={item.name}
                                            item={item}
                                            listId="mobile"
                                            isActive={activeView === item.name}
                                            onClick={() => {
                                                setActiveView(item.name);
                                                setMobileMenuOpen(false);
                                            }}
                                        />
                                    ))}
                                </nav>

                                <div className="flex flex-col gap-2 pt-3 border-t border-border">
                                    <Button
                                        onClick={handleLogout}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Log Out
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="flex flex-1 overflow-hidden">
                <div className="flex flex-1 flex-col min-h-0">
                    <div className="flex flex-1 min-h-0">
                        {/* Desktop sidebar */}
                        <aside className="hidden md:flex w-64 flex-shrink-0 flex-col gap-1.5 border-r border-border bg-background p-4">
                            <nav className="flex flex-col gap-1.5">
                                {ALL_NAV_ITEMS.map((item) => (
                                    <NavButton
                                        key={item.name}
                                        item={item}
                                        listId="desktop"
                                        isActive={activeView === item.name}
                                        onClick={() =>
                                            setActiveView(item.name)
                                        }
                                    />
                                ))}
                            </nav>

                            <button
                                onClick={() => setActiveView("Your Profile")}
                                className="mt-auto flex items-center gap-3 rounded-2xl border bg-gradient-to-br from-primary/5 to-amber-gold/5 p-3 text-left transition-colors hover:border-primary/30"
                            >
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-ink to-amber-gold text-sm font-semibold text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {user?.name}
                                    </p>
                                    <p className="truncate text-xs text-amber-gold font-medium">
                                        {user?.tokens ?? 0} tokens
                                    </p>
                                </div>
                            </button>
                        </aside>

                        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
                            {renderContent()}
                        </main>
                    </div>
                </div>
            </main>

            <footer className="border-t border-border bg-background">
                <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                    <div className="flex items-center gap-2">
                        <Logo iconOnly className="h-7 w-7" />
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
                        <span className="text-primary font-medium">
                            ● Connected
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
