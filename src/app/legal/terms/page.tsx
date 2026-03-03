import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service | Aurum",
  description: "Read Aurum terms of service.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="container mx-auto max-w-4xl animate-fade-in py-20 md:py-28">
        <header className="mb-12 text-center">
          <h1 className="mb-4 font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">Last updated: January 29, 2026</p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="https://aurumdiary.com">Back to aurumdiary.com</Link>
            </Button>
          </div>
        </header>

        <div className="prose prose-lg prose-stone mx-auto font-body">
          <h2>1. Service purpose</h2>
          <p>
            Aurum is a journaling application designed for personal introspection. The service is provided as
            is, without guarantees of uninterrupted availability or performance.
          </p>

          <h2>2. Access and user account</h2>
          <p>
            Core features may require an account. You are responsible for your account security and login
            credentials. You agree not to use the service for illegal or unauthorized purposes.
          </p>

          <h2>3. User content</h2>
          <p>
            You retain full ownership of the content you create in Aurum. By using the service, you grant a
            limited, non-exclusive, worldwide license only to provide the service to you (storage, display,
            and analysis by the Aurum engine for your own insights).
          </p>

          <h2>4. Analysis and reflections</h2>
          <p>
            Aurum uses an automated analysis engine to generate insights. These reflections are not medical,
            psychological, or professional advice. They are reflection tools, not diagnoses.
          </p>

          <h2>5. Aurum intellectual property</h2>
          <p>
            The application, branding, design, and source code (excluding user content) are owned by the
            Aurum project. Unauthorized reproduction or distribution is prohibited.
          </p>

          <h2>6. Liability</h2>
          <p>
            Aurum is a support tool and does not replace licensed mental health professionals. We are not
            liable for decisions made based on generated insights.
          </p>

          <h2>7. Termination</h2>
          <p>
            You may stop using the service and delete your account at any time from the "My Data" page. We
            may suspend or terminate access in case of terms violations.
          </p>

          <h2>8. Changes to terms</h2>
          <p>
            We may update these terms at any time. Continued use after updates means acceptance of revised
            terms.
          </p>

          <h2>9. Governing law</h2>
          <p>
            These terms are governed by French law. Any dispute related to interpretation or enforcement falls
            under the jurisdiction of Paris courts.
          </p>
        </div>
      </div>
    </div>
  );
}
