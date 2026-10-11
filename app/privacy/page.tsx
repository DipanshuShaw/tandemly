import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Privacy Policy — Tandemly",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/">
            <Logo className="h-10 w-auto" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold font-display mb-2">1. What we collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account, we collect your name, email address, and password
              (stored securely as a one-way hash — we never store or can see your plain-text
              password). If you sign in with Google, we receive your name, email, and profile
              photo from Google instead of a password.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              As you use Tandemly, we also store the information you choose to add to your
              profile (bio, phone number, address, languages, profile picture), the skills you
              list as offered or wanted, your token balance and transaction history, match
              requests you send or receive, chat messages within your matches, scheduled
              sessions, and reviews you give or receive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">2. How we use it</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use this information to operate the core of Tandemly: matching you with
              relevant learners and teachers, enabling chat and video calls between matched
              users, tracking your token balance, scheduling sessions, and showing your public
              reviews. We do not sell your personal data to third parties, and we do not use
              your data for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">3. Who can see what</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your name, profile picture, bio, languages, skills, and rating are visible to
              other users so they can decide whether to match with you. Chat messages within a
              match are only visible to the two participants of that match. Your email, phone
              number, and address are never shown to other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">4. Video calls</h2>
            <p className="text-muted-foreground leading-relaxed">
              Video calls happen through a third-party service (Jitsi Meet). We don't record or
              store the contents of your calls — the call itself takes place directly between
              you and the other participant's browsers, outside of our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">5. Your choices</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can update or remove most of your profile information at any time from Your
              Profile. To request a full copy or deletion of your account data, contact us at{" "}
              <a href="mailto:support@tandemlylearn.app" className="underline underline-offset-2">
                support@tandemlylearn.app
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">6. Changes to this policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy as Tandemly evolves. If we make material changes,
              we'll update the date at the top of this page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
