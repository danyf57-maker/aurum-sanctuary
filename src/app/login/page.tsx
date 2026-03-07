/**
 * Login Page
 *
 * Email/password login with Google OAuth option.
 */

"use client";

import { Suspense, useState, useEffect } from "react";
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
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics/client";
import { useLocale } from "@/hooks/use-locale";

interface QuizData {
  answers: string[];
  completedAt: string;
  profile: string | null;
}

const QUIZ_STORAGE_KEY = "aurum-quiz-data";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

function LoginForm() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const { signInWithEmail, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [info, setInfo] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [showQuizTeaser, setShowQuizTeaser] = useState(false);

  const rawRedirectUrl = searchParams.get("redirect");
  const redirectUrl =
    rawRedirectUrl &&
    rawRedirectUrl.startsWith("/") &&
    !rawRedirectUrl.startsWith("//")
      ? rawRedirectUrl
      : "/dashboard";
  const verified = searchParams.get("verified");
  const checkEmail = searchParams.get("check_email");

  useEffect(() => {
    const quizComplete = searchParams.get("quiz") === "complete";
    if (quizComplete) {
      const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (saved) {
        try {
          const data: QuizData = JSON.parse(saved);
          setQuizData(data);
          setShowQuizTeaser(true);
        } catch {
          // Invalid quiz data, ignore
        }
      }
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    setInfo(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

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
      if ((error as Error)?.message === "EMAIL_NOT_VERIFIED") {
        setInfo(
          isFr
            ? "Votre email n'est pas encore vérifié. Nous venons de renvoyer un message."
            : "Your email is not verified yet. We just sent a new verification message."
        );
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
      router.push(redirectUrl);
    } catch {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">
            {isFr ? "Chargement..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isFr ? "Connexion" : "Sign in"}</CardTitle>
          <CardDescription>
            {isFr
              ? "Connectez-vous à votre compte Aurum Sanctuary"
              : "Sign in to your Aurum Sanctuary account"}
          </CardDescription>

          {showQuizTeaser && quizData?.profile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30"
            >
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  {isFr ? "Votre profil vous attend" : "Your profile is waiting"}
                </span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {isFr
                  ? "Votre profil de réflexion est prêt ! Connectez-vous pour découvrir votre résultat personnalisé."
                  : "Your reflection profile is ready. Sign in to discover your personalized result."}
              </p>
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {verified && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {isFr
                ? "Email vérifié. Vous pouvez vous connecter."
                : "Email verified. You can now sign in."}
            </div>
          )}
          {checkEmail && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {isFr
                ? "Un email de vérification vient d'être envoyé. Merci de vérifier votre boîte de réception."
                : "A verification email has been sent. Please check your inbox."}
            </div>
          )}
          {info && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {info}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
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
            {isFr ? "Continuer avec Google" : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {isFr ? "Ou continuer avec" : "Or continue with"}
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                required
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isFr ? "Mot de passe" : "Password"}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {isFr ? "Mot de passe oublié ?" : "Forgot password?"}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isFr
                  ? "Connexion..."
                  : "Signing in..."
                : isFr
                  ? "Se connecter"
                  : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {isFr ? "Pas encore de compte ?" : "Don't have an account yet?"}{" "}
            <Link href="/signup" className="text-primary hover:underline">
              {isFr ? "S'inscrire" : "Sign up"}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
