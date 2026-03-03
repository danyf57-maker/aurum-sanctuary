/**
 * Privacy Policy Page
 *
 * Explains how data is handled, encrypted, and processed according to privacy-by-design principles.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const lastUpdated = "January 29, 2026";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-serif">Privacy Policy</CardTitle>
          <p className="mt-2 text-muted-foreground">Last updated: {lastUpdated}</p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="https://aurumdiary.com">Back to aurumdiary.com</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="prose prose-slate mt-8 max-w-none dark:prose-invert">
          <section>
            <h2 className="mt-6 text-2xl font-serif">1. Introduction</h2>
            <p>
              At Aurum Sanctuary, we believe mental wellbeing requires strict confidentiality. This policy
              explains how we protect your data through a privacy-by-design architecture.
            </p>
          </section>

          <section>
            <h2 className="mt-6 text-2xl font-serif">2. Data We Collect</h2>
            <ul>
              <li>
                <strong>Account data:</strong> Email and profile information (securely stored using Firebase).
              </li>
              <li>
                <strong>Journal entries:</strong> Encrypted on your device (client-side encryption). We do not
                keep persistent plaintext access to your content.
              </li>
              <li>
                <strong>Metadata:</strong> Entry frequency and session duration (used for lightweight product
                analytics).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mt-6 text-2xl font-serif">3. How We Use Your Data</h2>
            <p>Your data is used only to:</p>
            <ul>
              <li>Provide and improve Application features.</li>
              <li>Generate personalized reflections through the Aurum engine (ephemeral processing).</li>
              <li>Manage your subscription and preferences.</li>
            </ul>
          </section>

          <section>
            <h2 className="mt-6 text-2xl font-serif">4. Security Architecture</h2>
            <p>Our system relies on three pillars:</p>
            <ol>
              <li>
                <strong>Strong encryption:</strong> Industry-standard algorithms are used (AES-256).
              </li>
              <li>
                <strong>Admin-blind design:</strong> System administrators cannot decrypt your content.
                Decryption keys are managed by KMS services with strict access controls.
              </li>
              <li>
                <strong>Ephemeral processing:</strong> During Aurum analysis, text is decrypted in memory only
                and is never written as plaintext to disk.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mt-6 text-2xl font-serif">5. Your Rights (GDPR)</h2>
            <p>Under GDPR, you have the following rights:</p>
            <ul>
              <li>
                <strong>Right of access:</strong> You can view your data at any time.
              </li>
              <li>
                <strong>Right to rectification:</strong> You can edit your information.
              </li>
              <li>
                <strong>Right to erasure:</strong> You can delete your account and associated data.
              </li>
              <li>
                <strong>Portability:</strong> You can export your data in a structured format.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mt-6 text-2xl font-serif">6. Data Retention</h2>
            <p>
              We keep your data while your account is active. If you delete your account, encrypted data and
              related metadata are permanently removed from active systems within 30 days, including backups.
            </p>
          </section>

          <section className="mt-12 rounded-lg bg-slate-100 p-6 dark:bg-slate-900">
            <p className="text-sm italic">
              We never sell your personal data to third parties. Aurum Sanctuary is funded through user
              subscriptions.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
