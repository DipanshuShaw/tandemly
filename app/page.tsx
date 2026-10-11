"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Logo } from "@/components/Logo"
import {
  Check,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
  Star,
  Zap,
  Coins,
  Shield,
  Globe,
  MessageCircle,
  Compass,
  CalendarClock,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { API_URL } from "@/lib/api"

const heroContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
} as const

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [testimonials, setTestimonials] = useState<any[]>([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)

  const [feedbackName, setFeedbackName] = useState("")
  const [feedbackEmail, setFeedbackEmail] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/reviews/featured`).then((res) => res.json()),
      fetch(`${API_URL}/api/feedback/featured`).then((res) => res.json()),
    ])
      .then(([reviews, feedback]) => {
        const fromReviews = (Array.isArray(reviews) ? reviews : []).map((r: any) => ({
          _id: r._id,
          rating: r.rating,
          quote: r.comment,
          name: r.reviewer?.name || "A Tandemly user",
          context: r.match?.learningSkill?.name
            ? `Learned ${r.match.learningSkill.name} on Tandemly`
            : "Tandemly user",
          createdAt: r.createdAt,
        }))

        const fromFeedback = (Array.isArray(feedback) ? feedback : []).map((f: any) => ({
          _id: f._id,
          rating: f.rating,
          quote: f.message,
          name: f.name,
          context: "Shared feedback on Tandemly",
          createdAt: f.createdAt,
        }))

        const combined = [...fromReviews, ...fromFeedback].sort(
          (a, b) => (b.rating - a.rating) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        )

        setTestimonials(combined.slice(0, 9))
      })
      .catch((err) => console.error(err))
      .finally(() => setTestimonialsLoading(false))
  }, [])

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackError(null)

    if (!feedbackName || !feedbackEmail || !feedbackMessage) {
      setFeedbackError("Please fill in every field.")
      return
    }

    try {
      setFeedbackSubmitting(true)

      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: feedbackName,
          email: feedbackEmail,
          rating: feedbackRating,
          message: feedbackMessage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit feedback")
      }

      setFeedbackSubmitted(true)
      setFeedbackName("")
      setFeedbackEmail("")
      setFeedbackRating(5)
      setFeedbackMessage("")
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to submit feedback")
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const features = [
    {
      title: "Smart Skill Matching",
      description:
        "Our matching algorithm connects you with the perfect learning partners based on your skills and interests.",
      icon: <Zap className="size-5" />,
    },
    {
      title: "Token Economy",
      description:
        "Earn tokens by teaching others and spend them to learn new skills. Fair value exchange for everyone.",
      icon: <Coins className="size-5" />,
    },
    {
      title: "Browse Skills",
      description:
        "Search and filter every skill on the platform, see who's teaching it, and reach out directly — no waiting on the matcher.",
      icon: <Compass className="size-5" />,
    },
    {
      title: "Session Scheduling",
      description:
        "Propose a time, the other person confirms — every match keeps its own shared schedule of upcoming sessions.",
      icon: <CalendarClock className="size-5" />,
    },
    {
      title: "Built-in Video Calls",
      description:
        "Hop on a face-to-face video call with your learning partner in one click, right from your match — no extra app required.",
      icon: <Video className="size-5" />,
    },
    {
      title: "Real-time Chat & Alerts",
      description:
        "Message your learning partners instantly, and get notified the moment a match request or reply comes in — no refreshing needed.",
      icon: <MessageCircle className="size-5" />,
    },
    {
      title: "Global Community",
      description:
        "Connect with learners and teachers from around the world. Expand your network while gaining knowledge.",
      icon: <Globe className="size-5" />,
    },
    {
      title: "Secure Transactions",
      description:
        "All token transactions are secure and transparent. Built-in fraud prevention keeps your account safe.",
      icon: <Shield className="size-5" />,
    },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
        isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo iconOnly className="h-11 w-11 xs:hidden" />
          <Logo className="hidden xs:block h-11 w-auto" />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            How It Works
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Testimonials
          </Link>
          <Link href="#feedback" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Feedback
          </Link>
          <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            FAQ
          </Link>
        </nav>

        {/* Desktop user / login */}
        <div className="hidden md:flex gap-4 items-center">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>

          {user ? (
            <span className="text-sm font-medium text-muted-foreground">Welcome, {user.name}</span>
          ) : (
            <Link href="/Login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Log in
            </Link>
          )}

          <Link href="/signup">
            <Button className="rounded-full bg-primary hover:bg-primary/90">
              Get Started
              <ChevronRight className="ml-1 size-4" />
            </Button>
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
            <Link href="#features" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="#how-it-works" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </Link>
            <Link href="#testimonials" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Testimonials
            </Link>
            <Link href="#feedback" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Feedback
            </Link>
            <Link href="#faq" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t">
              {user ? (
                <span className="py-2 text-sm font-medium">Welcome, {user.name}</span>
              ) : (
                <Link href="/Login" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Log in
                </Link>
              )}
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90">
                  Get Started
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden relative">
          <div className="container px-4 md:px-6 relative">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

            <motion.div
              variants={heroContainer}
              initial="hidden"
              animate="show"
              className="text-center max-w-4xl mx-auto mb-12"
            >
              <motion.div variants={heroItem}>
                <Badge
                  className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                  variant="secondary"
                >
                  Now Live
                </Badge>
              </motion.div>
              <motion.h1 variants={heroItem} className="text-4xl md:text-5xl lg:text-7xl font-bold font-display tracking-tight mb-6 text-balance">
                The complete platform to{" "}
                <span className="bg-gradient-to-r from-indigo-ink to-amber-gold bg-clip-text text-transparent">
                  exchange skills
                </span>
              </motion.h1>
              <motion.p variants={heroItem} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
                Connect with learners and teachers worldwide. Trade your expertise for new skills using our innovative
                token economy. Learn anything, teach everything.
              </motion.p>
              <motion.div variants={heroItem} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" className="w-full sm:w-auto rounded-full h-12 px-8 text-base bg-primary hover:bg-primary/90">
                      Start Learning
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="#features">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto rounded-full h-12 px-8 text-base border-border hover:bg-muted bg-transparent"
                    >
                      Explore Skills
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div variants={heroItem} className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  <span>Global community</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  <span>Secure transactions</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                variant="secondary"
              >
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-balance">
                Everything You Need to Learn & Teach
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg text-balance">
                Our comprehensive platform connects learners and teachers through an innovative token-based economy,
                making skill exchange fair and rewarding for everyone.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <motion.div key={i} variants={item} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur transition-shadow hover:shadow-lg hover:border-primary/20">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                variant="secondary"
              >
                How It Works
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-balance">
                Simple Process, Powerful Results
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg text-balance">
                Get started in minutes and begin exchanging skills with our global community of learners and teachers.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0"></div>

              {[
                {
                  step: "01",
                  title: "Create Your Profile",
                  description:
                    "List the skills you can teach and what you want to learn. Set your availability and preferences.",
                },
                {
                  step: "02",
                  title: "Get Matched",
                  description:
                    "Our smart algorithm finds perfect learning partners based on mutual interests and skill compatibility.",
                },
                {
                  step: "03",
                  title: "Start Exchanging",
                  description:
                    "Begin learning and teaching using our token system. Earn tokens by teaching, spend them to learn.",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-ink to-amber-gold text-white text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                variant="secondary"
              >
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-balance">
                Loved by Learners & Teachers Worldwide
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg text-balance">
                See how our community is growing and achieving their learning goals.
              </p>
            </motion.div>

            {testimonialsLoading ? (
              <div className="text-center text-muted-foreground py-12">
                Loading testimonials...
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-muted-foreground">
                  No reviews yet — be one of the first to leave one after your session.
                </p>
                <Link href="/signup">
                  <Button className="rounded-full bg-primary hover:bg-primary/90">
                    Get Started
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((review, i) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    whileHover={{ y: -6 }}
                  >
                    <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur transition-shadow hover:shadow-lg hover:border-primary/20">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex mb-4">
                          {Array(review.rating)
                            .fill(0)
                            .map((_, j) => (
                              <Star key={j} className="size-4 text-amber-gold fill-amber-gold" />
                            ))}
                        </div>
                        <p className="text-lg mb-6 flex-grow">{review.quote}</p>
                        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                          <div className="size-10 rounded-full bg-gradient-to-br from-indigo-ink to-amber-gold flex items-center justify-center text-white font-medium">
                            {review.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {review.context}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>



        {/* Feedback Section */}
        <section id="feedback" className="w-full py-20 md:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                variant="secondary"
              >
                Feedback
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-balance">
                Help Us Make Tandemly Better
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg text-balance">
                Something you loved, or something that could be better? We read every message.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-xl mx-auto"
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur">
                <CardContent className="p-6 md:p-8">
                  {feedbackSubmitted ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-6" />
                      </div>
                      <h3 className="text-xl font-bold font-display">Thank you!</h3>
                      <p className="text-muted-foreground">
                        Your feedback means a lot to us.
                      </p>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setFeedbackSubmitted(false)}
                      >
                        Send more feedback
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="feedback-name" className="text-sm font-medium">
                            Name
                          </label>
                          <input
                            id="feedback-name"
                            type="text"
                            value={feedbackName}
                            onChange={(e) => setFeedbackName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Your name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="feedback-email" className="text-sm font-medium">
                            Email
                          </label>
                          <input
                            id="feedback-email"
                            type="email"
                            value={feedbackEmail}
                            onChange={(e) => setFeedbackEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">How's your experience?</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setFeedbackRating(n)}
                              aria-label={`${n} star${n > 1 ? "s" : ""}`}
                            >
                              <Star
                                className={`size-6 transition-colors ${
                                  n <= feedbackRating
                                    ? "fill-amber-gold text-amber-gold"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="feedback-message" className="text-sm font-medium">
                          Message
                        </label>
                        <textarea
                          id="feedback-message"
                          rows={4}
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          placeholder="Tell us what's on your mind..."
                        />
                      </div>

                      {feedbackError && (
                        <p className="text-sm text-red-500">{feedbackError}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={feedbackSubmitting}
                        className="w-full rounded-full bg-primary hover:bg-primary/90"
                      >
                        {feedbackSubmitting ? "Sending..." : "Send Feedback"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                variant="secondary"
              >
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-balance">Frequently Asked Questions</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg text-balance">
                Find answers to common questions about our skill exchange platform.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "How does the token system work?",
                    answer:
                      "You earn tokens by teaching skills to others and spend tokens to learn from teachers. Every new account starts with 100 tokens to get going. Tokens exist purely inside Tandemly to keep exchanges fair — they have no cash value and can't be bought or redeemed for real money.",
                  },
                  {
                    question: "How are skills matched?",
                    answer:
                      "Our matching engine ranks potential partners by mutual skill fit — whether they teach what you want to learn and want to learn what you teach — along with shared languages and their rating from past matches. You can also skip matching entirely and search the skill catalog directly with Browse Skills.",
                  },
                  {
                    question: "What skills can I teach or learn?",
                    answer:
                      "Almost anything you can teach one-on-one — from programming and design to languages, music, and more. You list what you can teach and what you want to learn on your profile, each with its own token cost or priority.",
                  },
                  {
                    question: "How do I show I'm good at a skill?",
                    answer:
                      "You set a proficiency level (Beginner, Intermediate, Advanced) on each skill you offer, and your rating builds up from reviews left by people you've actually taught. There's no separate certification step — your track record on the platform speaks for itself.",
                  },
                  {
                    question: "How do I actually meet with my match?",
                    answer:
                      "Once a match is accepted, you can chat in real time, propose and confirm a session time together, and start a video call right from your match — no separate app or link needed.",
                  },
                  {
                    question: "Is my personal information safe?",
                    answer:
                      "Your password is never stored in plain text, and your email, phone number, and address are never shown to other users. Chat messages within a match are only visible to the two people in that match. See our Privacy Policy for the full details.",
                  },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <AccordionItem value={`item-${i}`} className="border-b border-border/40 py-2">
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-indigo-ink to-amber-gold text-white relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl text-balance">
                Join a growing community of learners and teachers exchanging skills and growing together. Your
                next skill is just a match away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto rounded-full h-12 px-8 text-base">
                    Start Learning Today
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full h-12 px-8 text-base bg-transparent border-white text-white hover:bg-white/10"
                  >
                    Explore Skills
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-4">
                Free to join. 100 tokens to start. Begin learning immediately.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <Logo className="h-12 w-auto" />
              <p className="text-sm text-muted-foreground">
                The peer-to-peer skill exchange platform. Learn anything, teach everything, grow together.
              </p>
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
                  <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#feedback" className="text-muted-foreground hover:text-foreground transition-colors">
                    Feedback
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@tandemlylearn.app" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
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
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
