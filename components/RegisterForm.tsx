"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GoogleIcon from "./ui/GoogleIcon"
import { API_URL } from "@/lib/api";


export function RegisterForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [number, setNumber] = useState("")
  const [address, setAddress] = useState("")
  const [languages, setLanguages] = useState("")
  const [password, setPassword] = useState("")
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const nextStep = () => setStep(2)
  const prevStep = () => setStep(1)

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!agree) {
      setError("You must agree to the Terms & Conditions")
      setLoading(false)
      return
    }

    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          number,
          address,
          languages: languages.split(",").map((lang) => lang.trim()),
          password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Registration failed")

      setSuccess("Account created successfully! Redirecting to dashboard...")
      // redirect after short delay
      setTimeout(() => router.push("/Login"), 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => alert("Google signup not available")

  return (
    <form onSubmit={submitHandler} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to register
        </p>
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
              <Input id="number" type="text" placeholder="1234567890" value={number} onChange={(e) => setNumber(e.target.value)} required />
            </div>

            <Button type="button" className="w-full" onClick={nextStep}>
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
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
            {success && <p className="text-sm text-green-500">{success}</p>}

            <div className="flex justify-between gap-2">
              <Button type="button" onClick={prevStep} variant="outline">Back</Button>
              {/* <Button type="submit" className="flex-1" disabled={loading} onSubmit={location.href = '/dashboard'}>
                {loading ? "Registering..." : "Submit"}
              </Button> */}
              <button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Registering..." : "Submit"}
              </button>
              
            </div>
          </>
        )}
      </div>

      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t mt-4">
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>

      <Button type="button" variant="outline" className="w-full mt-2" onClick={handleGoogle}>
        <GoogleIcon /> Sign up with Google
      </Button>

      <div className="text-center text-sm mt-2">
        Already have an account? <a href="/Login" className="underline underline-offset-4">Login</a>
      </div>
    </form>
  )
}
