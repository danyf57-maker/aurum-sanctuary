/**
 * Login Page
 *
 * Email/password login with Google OAuth option.
 */

"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { trackEvent } from "@/lib/analytics/client";
import { localizeHref } from "@/lib/i18n/path";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "next-intl";

function LoginForm() {
  const { user, signInWithEmail, signInWithGoogle, resendVerificationEmail, loading: authLoading } = useAuth();
  const locale = useLocale();
  const t = useTranslations("login");
  const to = (href: string) => localizeHref(href, locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [info, setInfo] = useState<string | null>(null);
  const isInAppBrowser = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /FBAN|FBAV|Instagram|Line|LinkedInApp|Snapchat|Twitter|GSA|WebView|wv/i.test(ua);
  }, []);
  const authRoutePrefixes = ["/login", "/signup", "/forgot-password"];

  const rawRedirectUrl = searchParams.get("redirect") ?? searchParams.get("callbackUrl");
  const unsafeRedirectUrl =
    rawRedirectUrl && rawRedirectUrl.startsWith("/") && !rawRedirectUrl.startsWith("//")
      ? rawRedirectUrl
      : "/sanctuary/write";
  const redirectUrl = authRoutePrefixes.some((route) => unsafeRedirectUrl.startsWith(route))
    || unsafeRedirectUrl === "/dashboard"
    || unsafeRedirectUrl.startsWith("/dashboard?")
    ? "/sanctuary/write"
    : unsafeRedirectUrl;
  const verified = searchParams.get("verified");
  const checkEmail = searchParams.get("check_email");
  const existingAccount = searchParams.get("existing");
  const prefilledEmail = searchParams.get("email") ?? "";
  const onboardingPills = [
    t("pillPrivate"),
    t("pillGuided"),
    t("pillClarity"),
    t("pillPatterns"),
  ];

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectUrl);
    }
  }, [authLoading, redirectUrl, router, user]);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    setInfo(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const loginSchema = z.object({
      email: z.string().email(t("invalidEmail")),
      password: z.string().min(6, t("passwordMin")),
    });

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await signInWithEmail(email, password);
      void trackEvent({
        name: "login",
        params: { method: "email", source: "login_page" },
      });
      router.push(redirectUrl);
    } catch (error) {
      const message = (error as Error)?.message;
      if (message === "EMAIL_NOT_VERIFIED") {
        setInfo(t("emailNotVerified"));
      } else if (message === "ACCOUNT_USES_GOOGLE_INAPP") {
        setInfo(t("googleAccountInAppBrowser"));
      } else if (message === "ACCOUNT_USES_GOOGLE") {
        setInfo(t("googleAccountGoogle"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      void trackEvent({
        name: "login",
        params: { method: "google", source: "login_page" },
      });
      setTimeout(() => {
        router.replace(redirectUrl);
        setLoading(false);
      }, 1500);
    } catch {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!prefilledEmail) return;
    setResendingVerification(true);
    try {
      await resendVerificationEmail(prefilledEmail);
      setInfo(t("checkEmail"));
    } finally {
      setResendingVerification(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>

          <div className="mt-4 flex flex-wrap gap-2">
            {onboardingPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600"
              >
                {pill}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-700">
            {t("languagePolicy")}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {verified && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {t("verified")}
            </div>
          )}
          {checkEmail && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {t("checkEmail")}
              {prefilledEmail && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={loading || resendingVerification}
                  >
                    {resendingVerification ? t("resendingVerification") : t("resendVerification")}
                  </Button>
                </div>
              )}
            </div>
          )}
          {existingAccount && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {t("existingAccountInfo")}
            </div>
          )}
          {info && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {info}
              {prefilledEmail && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={loading || resendingVerification}
                  >
                    {resendingVerification ? t("resendingVerification") : t("resendVerification")}
                  </Button>
                </div>
              )}
            </div>
          )}
          {isInAppBrowser && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {t("inAppBrowser")}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading || isInAppBrowser}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t("google")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t("or")}</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                defaultValue={prefilledEmail}
                required
                disabled={loading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required disabled={loading} />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <Link href={to("/forgot-password")} className="text-sm text-primary hover:underline">
                {t("forgot")}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("signingIn") : t("signIn")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("noAccount")} <Link href={to("/signup")} className="text-primary hover:underline">{t("signUp")}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations("login");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t("loading")}</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
