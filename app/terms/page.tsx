import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Terms of Service — Tandemly",
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold font-display mb-2">1. Using Tandemly</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tandemly is a peer-to-peer platform for exchanging skills: you teach something you
              know, and spend tokens you've earned to learn something new. By creating an
              account, you agree to use the platform honestly — the profile information and
              skills you list should be accurate, and you shouldn't impersonate anyone else.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">2. Tokens</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tokens are Tandemly's internal unit for valuing skill exchanges. New accounts start
              with a token balance to get going. Tokens have no cash value, cannot be redeemed
              for money, and exist only to keep exchanges on the platform fair.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">3. Matches, sessions, and conduct</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you send or accept a match request, you're agreeing to make a good-faith
              effort to follow through on the skill exchange. Scheduling a session is a mutual
              commitment between you and your match — please be respectful of each other's time.
              Harassment, hate speech, or abusive behavior toward other users, in chat, on a
              call, or anywhere else on the platform, is not tolerated and may result in account
              suspension.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">4. Reviews</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reviews should reflect your genuine experience with a match. We may remove reviews
              that are abusive, fraudulent, or unrelated to an actual completed match.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">5. Account termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can stop using Tandemly at any time. We may suspend or terminate accounts that
              violate these terms, including fraudulent token activity, harassment, or repeated
              no-shows on scheduled sessions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">6. No warranty</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tandemly connects learners and teachers but doesn't vet the accuracy of what any
              user teaches, or guarantee the outcome of any session. Video calls are provided via
              a third-party service and are used at your own discretion. Tandemly is provided
              "as is," without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">7. Changes to these terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms as Tandemly evolves. Continuing to use Tandemly after a
              change means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-display mb-2">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these terms? Reach us at{" "}
              <a href="mailto:support@tandemlylearn.app" className="underline underline-offset-2">
                support@tandemlylearn.app
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
