"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    ChevronRight,
    Menu,
    X,
    Moon,
    Sun,
    BookOpen,
} from "lucide-react"


import { Button } from "@/components/ui/button"
import { Search, Plus, History, Settings, LogOut } from "lucide-react"

// import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '@/components/dashboard/constants';
import FindMatch from '@/components/dashboard/FindMatch';
import CurrentMatch from '@/components/dashboard/CurrentMatch';
import MatchHistory from '@/components/dashboard/MatchHistory';
import YourSkills from '@/components/dashboard/YourSkills';
import Inbox from '@/components/dashboard/Inbox';
import TokenWallet from '@/components/dashboard/TokenWallet';
import Reviews from '@/components/dashboard/Reviews';
import YourProfile from '@/components/dashboard/YourProfile';
import { useTheme } from "next-themes"

export default function Dashboard() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    type SectionKey = "search" | "add-skill" | "matches" | "classes"

const sections: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: "search", label: "Search Learners/Teachers", icon: Search },
  { key: "add-skill", label: "Add Skill", icon: Plus },
  { key: "matches", label: "Previous Matches", icon: History },
  { key: "classes", label: "My Classes", icon: BookOpen },
]


    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

const Sidebar: React.FC<{ activeView: string; setActiveView: (view: string) => void }> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-bg text-text-primary flex-shrink-0 p-6 flex flex-col border-r border-border">
        <div className="m-6"></div>
      <nav className="flex flex-col space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveView(item.name)}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-colors duration-200 text-text-primary ${
              activeView === item.name
                ? 'bg-green-500 text-primary-text font-semibold'
                : 'hover:bg-primary-light'
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


  const [activeView, setActiveView] = useState('Your Profile');

  const renderContent = () => {
    switch (activeView) {
      case 'Find A Match':
        return <FindMatch />;
      case 'Current Match':
        return <CurrentMatch />;
      case 'Match History':
        return <MatchHistory />;
      case 'Your Skills':
        return <YourSkills />;
      case 'Inbox':
        return <Inbox />;
      case 'Token Wallet':
        return <TokenWallet />;
      case 'Reviews':
        return <Reviews />;
      case 'Your Profile':
        return <YourProfile />;
      default:
        return <FindMatch />;
    }
  };


    return (
        <div className="flex min-h-[100dvh] flex-col bg-background">
            <header
                className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
                    }`}
            >
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-green-700 via-lime-600 to-blue-500 flex items-center justify-center text-primary-foreground">
                            T
                        </div>
                        <span>Tandemly</span>
                    </div>



                    {/* Desktop user / login */}
                    <div className="hidden md:flex gap-4 items-center">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                            {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                        </Button>

                        <Link href="/" className="text-sm font-medium rounded-full text-white dark:text-black p-2.5 bg-green-500 hover:bg-green-500/90">
                            Log Out
                            <ChevronRight className=" size-3 inline ml-2" />
                        </Link>

                    </div>

                    {/* Mobile menu toggle */}
                    <div className="flex items-center gap-4 md:hidden">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                            {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
                    >
                        <div className="container py-4 flex flex-col gap-4">

                            <div className="flex flex-col gap-2 pt-2 border-t">
                                <Link href="/" className="rounded-full p-2.5 bg-green-500 hover:bg-green-500/90">
                                    Log Out
                                    <ChevronRight className="ml-1 size-4 inline" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </header>



            <main className="overflow-hidden">
                    <div className="flex flex-col h-screen font-sans bg-bg">

      <div className="flex flex-grow overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-y-auto m-6 p-8 bg-bg">
          {renderContent()}
        </main>
      </div>
    </div>
            </main>






            <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
                <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-bold">
                                <div className="size-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-primary-foreground">
                                    T
                                </div>
                                <span>Tandemly</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The peer-to-peer skill exchange platform. Learn anything, teach everything, grow together.
                            </p>
                            <div className="flex gap-4">
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="size-5"
                                    >
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                    </svg>
                                    <span className="sr-only">Facebook</span>
                                </Link>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="size-5"
                                    >
                                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                    </svg>
                                    <span className="sr-only">Twitter</span>
                                </Link>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="size-5"
                                    >
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                        <rect width="4" height="12" x="2" y="9"></rect>
                                        <circle cx="4" cy="4" r="2"></circle>
                                    </svg>
                                    <span className="sr-only">LinkedIn</span>
                                </Link>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Skills
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Teachers
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold">Resources</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Community
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        API Docs
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} Tandemly. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}




