import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy | Aurum",
  description: "Learn how Aurum protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="container mx-auto max-w-4xl animate-fade-in py-20 md:py-28">
        <header className="mb-12 text-center">
          <h1 className="mb-4 font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: January 29, 2026</p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="https://aurumdiary.com">Back to aurumdiary.com</Link>
            </Button>
          </div>
        </header>

        <div className="prose prose-lg prose-stone mx-auto font-body">
          <p>
            Welcome to Aurum. Your privacy is central to our approach. This policy explains how we collect,
            use, and protect your personal data in line with GDPR principles.
          </p>

          <h2>1. Data controller</h2>
          <p>
            Aurum is currently operated as an independent product. For privacy requests, contact:
            <br />
            <strong>Aurum</strong>
            <br />
            Email: <a href="mailto:contact@aurumdiary.com">contact@aurumdiary.com</a>
          </p>

          <h2>2. Data collected and purpose</h2>
          <ul>
            <li>
              <strong>Account data:</strong> User ID, email, display name, and avatar for authentication,
              account security, and personalization.
            </li>
            <li>
              <strong>Journal content:</strong> Stored securely to provide your journal experience and
              generated insights.
            </li>
            <li>
              <strong>Usage data:</strong> Essential technical signals (for example session continuity and
              security controls).
            </li>
          </ul>

          <h2>3. Legal basis</h2>
          <ul>
            <li>
              <strong>Contract performance:</strong> Required to provide the service.
            </li>
            <li>
              <strong>Consent:</strong> For optional features when applicable.
            </li>
            <li>
              <strong>Legitimate interest:</strong> Security and reliability improvements.
            </li>
          </ul>

          <h2>4. Retention period</h2>
          <p>
            Account and journal data are retained while your account is active. You can request deletion at
            any time from <Link href="/account/data">My Data</Link>.
          </p>

          <h2>5. Your rights</h2>
          <p>
            Under GDPR, you have rights of access, rectification, erasure, portability, and objection. You
            can contact us at <a href="mailto:contact@aurumdiary.com">contact@aurumdiary.com</a>.
          </p>

          <h2>6. Security</h2>
          <p>
            We use secure infrastructure controls, encrypted transport (HTTPS), and strict access rules to
            protect your data.
          </p>

          <h2>7. International transfers</h2>
          <p>
            Some infrastructure providers may process data outside the EU under approved transfer mechanisms.
          </p>
        </div>
      </div>
    </div>
  );
}
