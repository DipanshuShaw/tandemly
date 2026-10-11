"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GoogleSignInButton from "./GoogleSignInButton"
import { API_URL } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Optional leading "+", then 7-15 digits — loosely matches the E.164
// international format without being overly strict about country-specific
// numbering rules.
const PHONE_RE = /^\+?[0-9]{7,15}$/;

function passwordStrength(password: string) {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak" };
  if (score <= 3) return { score, label: "Okay" };
  return { score, label: "Strong" };
}

export function RegisterForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [number, setNumber] = useState("")
  const [address, setAddress] = useState("")
  const [languages, setLanguages] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [stepOneError, setStepOneError] = useState<string | null>(null)

  const strength = useMemo(() => passwordStrength(password), [password])
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const nextStep = () => {
    if (!name.trim() || !email.trim() || !number.trim()) {
      setStepOneError("Please fill in every field before continuing.")
      return
    }

    if (!EMAIL_RE.test(email)) {
      setStepOneError("Enter a valid email address.")
      return
    }

    if (!PHONE_RE.test(number)) {
      setStepOneError("Enter a valid phone number (7-15 digits).")
      return
    }

    setStepOneError(null)
    setStep(2)
  }

  const handlePhoneChange = (value: string) => {
    // Keep only digits and a single optional leading "+" as the user
    // types, so the field can never hold letters or symbols.
    const cleaned = value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "")
    setNumber(cleaned)
  }

  const prevStep = () => setStep(1)

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (strength.score <= 1) {
      setError("That password is too weak — add a mix of uppercase, lowercase, numbers, or symbols.")
      return
    }

    if (!passwordsMatch) {
      setError("Passwords don't match.")
      return
    }

    if (!agree) {
      setError("You must agree to the Terms & Conditions")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          number,
          address,
          languages: languages
            .split(",")
            .map((lang) => lang.trim())
            .filter(Boolean),
          password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Registration failed")

      setSuccess("Account created! Taking you to your dashboard...")

      // Registration already returns a session token — no need to
      // send the person through a second manual login.
      localStorage.setItem("token", data.token)

      setTimeout(() => router.push("/dashboard"), 800)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submitHandler} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold font-display">Create an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to register
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step > s
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
              )}
            >
              {step > s ? <Check className="size-3.5" /> : s}
            </div>
            {s === 1 && (
              <div
                className={cn(
                  "h-0.5 w-10 rounded-full transition-colors",
                  step > 1 ? "bg-primary/40" : "bg-secondary"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        {step === 1 && (
          <>
            <div className="grid gap-3">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="number">Phone Number</Label>
              <Input
                id="number"
                type="tel"
                inputMode="tel"
                placeholder="1234567890"
                value={number}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
              />
            </div>

            {stepOneError && <p className="text-sm text-red-500">{stepOneError}</p>}

            <Button type="button" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={nextStep}>
              Next
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-3">
              <Label htmlFor="address">Address</Label>
              <Input id="address" type="text" placeholder="City, State" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="languages">Languages (comma-separated)</Label>
              <Input id="languages" type="text" placeholder="English,Hindi" value={languages} onChange={(e) => setLanguages(e.target.value)} required />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          i < strength.score
                            ? strength.score <= 1
                              ? "bg-red-500"
                              : strength.score <= 3
                                ? "bg-amber-gold"
                                : "bg-primary"
                            : "bg-secondary"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {strength.label} · at least 8 characters
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500">Passwords don't match</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="terms" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="/terms" className="underline underline-offset-2">Terms & Conditions</a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>
              </Label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-primary">{success}</p>}

            <div className="flex justify-between gap-2">
              <Button type="button" onClick={prevStep} variant="outline">Back</Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading || strength.score <= 1 || !passwordsMatch}
              >
                {loading ? "Registering..." : "Create Account"}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t mt-4">
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>

      <GoogleSignInButton label="Sign up with Google" />

      <div className="text-center text-sm mt-2">
        Already have an account? <a href="/Login" className="underline underline-offset-4">Login</a>
      </div>
    </form>
  )
}
