/**
 * Signup Page
 *
 * Email/password signup with Google OAuth option.
 */

"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Shield } from "lucide-react";
import { trackEvent } from "@/lib/analytics/client";
import { localizeHref } from "@/lib/i18n/path";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "next-intl";
import { resolveMessage } from "@/lib/i18n/resolve-message";

function makeSignupSchema(v: Record<string, string>) {
  return z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, v.firstNameRequired)
        .max(40, v.firstNameTooLong),
      email: z.string().email(v.invalidEmail),
      password: z
        .string()
        .min(8, v.passwordMinLength)
        .regex(/[A-Z]/, v.passwordUppercase)
        .regex(/[a-z]/, v.passwordLowercase)
        .regex(/[0-9]/, v.passwordDigit),
      confirmPassword: z.string(),
      acceptTerms: z.boolean().refine((val) => val === true, {
        message: v.termsRequired,
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: v.passwordsMismatch,
      path: ["confirmPassword"],
    });
}

function SignupPage() {
  const { user, signUpWithEmail, signInWithGoogle, loading: authLoading } = useAuth();
  const locale = useLocale();
  const to = (href: string) => localizeHref(href, locale);
  const tSign = useTranslations("signup");
  const signupSchema = makeSignupSchema({
    firstNameRequired: tSign("validation.firstNameRequired"),
    firstNameTooLong: tSign("validation.firstNameTooLong"),
    invalidEmail: tSign("validation.invalidEmail"),
    passwordMinLength: tSign("validation.passwordMinLength"),
    passwordUppercase: tSign("validation.passwordUppercase"),
    passwordLowercase: tSign("validation.passwordLowercase"),
    passwordDigit: tSign("validation.passwordDigit"),
    termsRequired: tSign("validation.termsRequired"),
    passwordsMismatch: tSign("validation.passwordsMismatch"),
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isInAppBrowser = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /FBAN|FBAV|Instagram|Line|LinkedInApp|Snapchat|Twitter|GSA|WebView|wv/i.test(
      ua
    );
  }, []);
  const redirectAfterGoogle = "/sanctuary/write";
  const loginHref = to("/login");
  const signupFallback = locale === "fr"
    ? {
        title: "Creer un compte",
        description:
          "Cree ton espace d'ecriture prive. Ecris librement, recois une lecture psychologique profonde, et remarque les motifs recurrents dans le temps.",
        encrypted: "Chiffre par defaut et prive par conception",
        languagePolicy:
          "Lors de ta premiere visite, Aurum s'ouvre dans la langue de ton navigateur. Ensuite, il garde la langue que tu choisis. Les reponses suivent la langue dans laquelle tu ecris.",
        existingAccountBannerTitle: "Vous avez deja un compte ?",
        existingAccountBannerBody:
          "Ouvre cette page dans Safari ou dans Chrome, puis connecte-toi la-bas. Si ton compte marche dans Safari, retourne dans Safari. S'il marche dans Chrome, retourne dans Chrome.",
        existingAccountBannerCta: "Aller a la connexion",
        firstName: "Prenom",
      }
    : {
        title: "Create an account",
        description:
          "Create your private writing space. Write freely, receive deep psychological reflection, and notice recurring patterns over time.",
        encrypted: "Encrypted by default and private by design",
        languagePolicy:
          "On your first visit, Aurum opens in your browser language. After that, it keeps the language you choose. Aurum replies in the language you write in.",
        existingAccountBannerTitle: "Already have an account?",
        existingAccountBannerBody:
          "Open this page in Safari or Chrome, then sign in there. If your account works in Safari, go back to Safari. If it works in Chrome, go back to Chrome.",
        existingAccountBannerCta: "Go to sign in",
        firstName: "First name",
      };

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectAfterGoogle);
    }
  }, [authLoading, redirectAfterGoogle, router, user]);

  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const acceptTerms = formData.get("acceptTerms") === "on";

    // Validate
    const result = signupSchema.safeParse({
      firstName,
      email,
      password,
      confirmPassword,
      acceptTerms,
    });
    if (!result.success) {
      const fieldErrors: {
        firstName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        acceptTerms?: string;
      } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await signUpWithEmail(result.data.email, result.data.password, result.data.firstName);
      void trackEvent({
        name: "signup",
        params: { method: "email", source: "signup_page" },
      });
      router.push(to(`/login?check_email=1&email=${encodeURIComponent(result.data.email)}`));
    } catch (error) {
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";
      if (errorCode === "auth/email-already-in-use") {
        const existingAccountParams = new URLSearchParams({
          email,
          existing: "1",
        });
        router.push(to(`/login?${existingAccountParams.toString()}`));
        return;
      }
      if ((error as Error)?.message === "EMAIL_NOT_VERIFIED") {
        setInfo(tSign("checkEmail"));
      }
      // Other error toasts shown by AuthProvider
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      void trackEvent({
        name: "signup",
        params: { method: "google", source: "signup_page" },
      });
      router.push(redirectAfterGoogle);
    } catch (error) {
      // Error toast shown by AuthProvider
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{tSign("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{resolveMessage(tSign("title"), signupFallback.title)}</CardTitle>
          <CardDescription>
            {resolveMessage(tSign("description"), signupFallback.description)}
          </CardDescription>

          <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              {resolveMessage(tSign("encrypted"), signupFallback.encrypted)}
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-700">
            {resolveMessage(tSign("languagePolicy"), signupFallback.languagePolicy)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {info && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {info}
            </div>
          )}
          {isInAppBrowser && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
              <p className="font-medium">
                {resolveMessage(tSign("existingAccountBannerTitle"), signupFallback.existingAccountBannerTitle)}
              </p>
              <p className="mt-1 text-amber-800">
                {resolveMessage(tSign("existingAccountBannerBody"), signupFallback.existingAccountBannerBody)}
              </p>
              <Button asChild variant="secondary" className="mt-3 w-full">
                <Link href={loginHref}>
                  {resolveMessage(tSign("existingAccountBannerCta"), signupFallback.existingAccountBannerCta)}
                </Link>
              </Button>
              <p className="mt-3 text-amber-800">{tSign("inAppBrowser")}</p>
            </div>
          )}
          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={loading || isInAppBrowser}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {tSign("google")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {tSign("or")}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {resolveMessage(tSign("firstName"), signupFallback.firstName)}
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder={tSign("firstNamePlaceholder")}
                autoComplete="given-name"
                required
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={tSign("emailPlaceholder")}
                required
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{tSign("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {tSign("passwordHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{tSign("confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                name="acceptTerms"
                disabled={loading}
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {tSign("acceptTerms")}{" "}
                <Link
                  href={to("/terms")}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  {tSign("terms")}
                </Link>{" "}
                {tSign("and")}{" "}
                <Link
                  href={to("/privacy")}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  {tSign("privacy")}
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? tSign("creating") : tSign("create")}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {tSign("emailNote")}
            </p>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {tSign("alreadyAccount")}{" "}
            <Link href={to("/login")} className="text-primary hover:underline">
              {tSign("signIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function SignupPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          </div>
        </div>
      }
    >
      <SignupPage />
    </Suspense>
  );
}
