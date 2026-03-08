"use client";

import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/providers/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Sun,
  Globe,
  Bell,
  User,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { httpsCallable } from "firebase/functions";
import { functions, firestore } from "@/lib/firebase/web-client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useLocalizedHref } from "@/hooks/use-localized-href";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/use-locale";
import { useSubscription } from "@/hooks/useSubscription";

export default function SettingsPage() {
  const to = useLocalizedHref();
  const locale = useLocale();
  const isFr = locale === "fr";
  const t = useTranslations("settings");
  const { user, loading: authLoading, logout } = useAuth();
  const {
    subscription,
    loading: subscriptionLoading,
    isMonthlyPlan,
    isYearlyPlan,
    daysActive,
    isAnnualUpgradeEligible,
  } = useSubscription();
  const {
    preferences,
    loading: settingsLoading,
    updatePreferences,
  } = useSettings();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOpeningAnnualUpgrade, setIsOpeningAnnualUpgrade] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const copy = useMemo(
    () => ({
      title: isFr ? "Paramètres" : "Settings",
      subtitle: isFr
        ? "Gérez vos préférences et les paramètres de votre compte."
        : "Manage your preferences and account settings.",
      tabs: {
        general: isFr ? "Général" : "General",
        account: isFr ? "Compte" : "Account",
        privacy: isFr ? "Confidentialité" : "Privacy",
      },
      language: {
        title: isFr ? "Langue et région" : "Language and region",
        description: isFr
          ? "Personnalisez votre langue et vos préférences horaires."
          : "Adjust your language and time preferences.",
        label: isFr ? "Langue" : "Language",
        placeholder: isFr ? "Choisir une langue" : "Choose a language",
        english: isFr ? "Anglais (US)" : "English (US)",
        french: isFr ? "Français" : "French",
        timezoneLabel: isFr ? "Fuseau horaire" : "Time zone",
        timezonePlaceholder: isFr
          ? "Choisir un fuseau horaire"
          : "Choose a time zone",
        local: isFr ? "Local" : "Local",
      },
      appearance: {
        title: isFr ? "Apparence" : "Appearance",
        description: isFr
          ? "Personnalisez l'affichage d'Aurum sur votre appareil."
          : "Customize how Aurum looks on your device.",
        themeLabel: isFr ? "Thème" : "Theme",
        themeDescription: isFr
          ? "Choisissez votre thème visuel préféré."
          : "Choose the visual theme you prefer.",
        themePlaceholder: isFr ? "Choisir un thème" : "Choose a theme",
        light: isFr ? "Clair" : "Light",
        dark: isFr ? "Sombre" : "Dark",
        system: isFr ? "Système" : "System",
      },
      notifications: {
        title: isFr ? "Notifications" : "Notifications",
        description: isFr
          ? "Gérez la manière dont nous communiquons avec vous."
          : "Control how we reach out to you.",
        analysisLabel: isFr ? "Alertes d'analyses" : "Insight alerts",
        analysisDescription: isFr
          ? "Recevez une notification quand vos analyses hebdomadaires sont prêtes."
          : "Get notified when your weekly insights are ready.",
      },
      profile: {
        title: isFr ? "Profil" : "Profile",
        description: isFr ? "Vos informations de compte." : "Your account details.",
        email: "Email",
        displayName: isFr ? "Nom affiché" : "Display name",
      },
      subscription: {
        title: isFr ? "Abonnement" : "Subscription",
        description: isFr
          ? "Gérez votre formule d'abonnement Aurum."
          : "Manage your Aurum subscription plan.",
        currentPlan: isFr ? "Formule actuelle" : "Current plan",
        noPlan: isFr ? "Aucune formule active" : "No active plan",
        pricing: isFr ? "Voir les tarifs" : "View pricing",
        monthly: isFr ? "Mensuel" : "Monthly",
        yearly: isFr ? "Annuel" : "Yearly",
        trial: isFr ? "Essai en cours" : "Trial active",
        paymentIssue: isFr ? "Paiement à mettre à jour" : "Payment issue",
        canceled: isFr ? "Abonnement annulé" : "Subscription canceled",
        active: isFr ? "Abonnement actif" : "Active subscription",
        manage: isFr ? "Gérer la facturation" : "Manage billing",
        annualOfferBadge: isFr ? "2 mois offerts" : "2 months free",
        annualOfferTitle: isFr
          ? "Passez à l'annuel, sans changer votre rythme"
          : "Move to yearly, without changing your rhythm",
        annualOfferBody: isFr
          ? "Vous utilisez Aurum depuis déjà quelques mois. Si vous savez que vous souhaitez continuer, le forfait annuel vous offre 2 mois."
          : "You have already been using Aurum for a few months. If you know you want to continue, the yearly plan gives you 2 months free.",
        annualOfferMeta: isFr
          ? "Proposé après 3 mois d'abonnement mensuel, directement dans votre espace de facturation Stripe."
          : "Shown after 3 months on monthly billing, directly inside your Stripe billing space.",
        annualOfferCta: isFr ? "Voir l'offre annuelle" : "See yearly offer",
        annualOfferLoading: isFr ? "Ouverture..." : "Opening...",
        annualOfferErrorTitle: isFr ? "Facturation indisponible" : "Billing unavailable",
        annualOfferErrorDescription: isFr
          ? "Impossible d'ouvrir votre espace de facturation pour le moment."
          : "We could not open your billing space right now.",
        monthlySince: isFr
          ? `Abonné mensuel depuis ${daysActive ?? 0} jours`
          : `Monthly subscriber for ${daysActive ?? 0} days`,
      },
      danger: {
        title: isFr ? "Zone sensible" : "Sensitive zone",
        description: isFr
          ? "Actions irréversibles sur le compte."
          : "Irreversible account actions.",
        trigger: isFr ? "Supprimer le compte" : "Delete account",
        dialogTitle: isFr
          ? "Confirmez-vous cette suppression ?"
          : "Confirm account deletion?",
        dialogDescription: isFr
          ? "Cette action est irréversible. Elle supprimera définitivement votre compte et vos données de nos serveurs."
          : "This action is irreversible. It will permanently delete your account and your data from our servers.",
        confirmLabel: isFr
          ? 'Tapez "SUPPRIMER" pour confirmer'
          : 'Type "DELETE" to confirm',
        confirmPlaceholder: isFr ? "SUPPRIMER" : "DELETE",
        cancel: isFr ? "Annuler" : "Cancel",
        confirm: isFr ? "Supprimer le compte" : "Delete account",
        keyword: isFr ? "SUPPRIMER" : "DELETE",
      },
      data: {
        title: isFr ? "Vos données" : "Your data",
        description: isFr
          ? "Gérez vos données personnelles et vos exports."
          : "Manage your personal data and exports.",
        exportLabel: isFr ? "Exporter mes données" : "Export my data",
        exportDescription: isFr
          ? "Téléchargez une copie de toutes vos entrées et analyses (JSON)."
          : "Download a copy of all your entries and insights (JSON).",
        exportButton: isFr ? "Télécharger le JSON" : "Download JSON",
      },
      legal: {
        title: isFr ? "Mentions légales" : "Legal",
        privacy: isFr ? "Politique de confidentialité" : "Privacy policy",
        terms: isFr ? "Conditions d'utilisation" : "Terms of use",
      },
    }),
    [isFr]
  );

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== copy.danger.keyword) return;

    setIsDeleting(true);
    try {
      const deleteAccountFn = httpsCallable(functions, "deleteUserAccount");
      await deleteAccountFn();

      await logout();
      router.push(to("/"));
      toast({
        title: t("deleteSuccessTitle"),
        description: t("deleteSuccessDescription"),
      });
    } catch (error) {
      console.error("Account deletion failed:", error);
      toast({
        title: t("deleteErrorTitle"),
        description: t("deleteErrorDescription"),
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const entriesSnapshot = await getDocs(
        collection(firestore, "users", user.uid, "entries")
      );
      const decryptedEntries = entriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          date:
            data.date instanceof Timestamp
              ? data.date.toDate().toISOString()
              : data.date,
          content: data.content || "[No content]",
          mood: data.mood,
          tags: data.tags,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
        };
      });

      const insightsSnapshot = await getDocs(
        collection(firestore, "users", user.uid, "insights")
      );
      const insights = insightsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          insightText: data.insightText,
          periodStart:
            data.periodStart instanceof Timestamp
              ? data.periodStart.toDate().toISOString()
              : data.periodStart,
          periodEnd:
            data.periodEnd instanceof Timestamp
              ? data.periodEnd.toDate().toISOString()
              : data.periodEnd,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
        };
      });

      const exportData = {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName ?? "",
          exportedAt: new Date().toISOString(),
        },
        entries: decryptedEntries,
        insights,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aurum-data-${(new Date().toISOString() ?? "").split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t("exportSuccessTitle"),
        description: t("exportSuccessDescription"),
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: t("exportErrorTitle"),
        description: t("exportErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAnnualUpgrade = async () => {
    if (!user) return;
    setIsOpeningAnnualUpgrade(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/stripe/create-annual-upgrade-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.url) {
        throw new Error(payload?.error || 'Unable to open annual offer');
      }

      window.location.assign(payload.url as string);
    } catch (error) {
      console.error('Annual upgrade launch failed:', error);
      toast({
        title: copy.subscription.annualOfferErrorTitle,
        description: copy.subscription.annualOfferErrorDescription,
        variant: 'destructive',
      });
      setIsOpeningAnnualUpgrade(false);
    }
  };

  const currentPlanLabel =
    subscription.status === 'active'
      ? isYearlyPlan
        ? copy.subscription.yearly
        : isMonthlyPlan
          ? copy.subscription.monthly
          : copy.subscription.active
      : subscription.status === 'trialing'
        ? copy.subscription.trial
        : subscription.status === 'past_due'
          ? copy.subscription.paymentIssue
          : subscription.status === 'canceled'
            ? copy.subscription.canceled
            : null;

  if (authLoading || settingsLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif text-primary">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">{copy.tabs.general}</TabsTrigger>
          <TabsTrigger value="account">{copy.tabs.account}</TabsTrigger>
          <TabsTrigger value="privacy">{copy.tabs.privacy}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {copy.language.title}
              </CardTitle>
              <CardDescription>{copy.language.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">{copy.language.label}</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(val: any) => updatePreferences({ language: val })}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder={copy.language.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{copy.language.english}</SelectItem>
                    <SelectItem value="fr">{copy.language.french}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">{copy.language.timezoneLabel}</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(val) => updatePreferences({ timezone: val })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder={copy.language.timezonePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                      {copy.language.local} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-primary" />
                {copy.appearance.title}
              </CardTitle>
              <CardDescription>{copy.appearance.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{copy.appearance.themeLabel}</Label>
                  <p className="text-sm text-muted-foreground">
                    {copy.appearance.themeDescription}
                  </p>
                </div>
                <Select
                  value={preferences.theme}
                  onValueChange={(val: any) => updatePreferences({ theme: val })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={copy.appearance.themePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{copy.appearance.light}</SelectItem>
                    <SelectItem value="dark">{copy.appearance.dark}</SelectItem>
                    <SelectItem value="system">{copy.appearance.system}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                {copy.notifications.title}
              </CardTitle>
              <CardDescription>{copy.notifications.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{copy.notifications.analysisLabel}</Label>
                  <p className="text-sm text-muted-foreground">
                    {copy.notifications.analysisDescription}
                  </p>
                </div>
                <Switch
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({ notificationsEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {copy.profile.title}
              </CardTitle>
              <CardDescription>{copy.profile.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{copy.profile.email}</Label>
                  <Input value={user?.email || ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>{copy.profile.displayName}</Label>
                  <Input value={user?.displayName || ""} readOnly disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                {copy.subscription.title}
              </CardTitle>
              <CardDescription>{copy.subscription.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">{copy.subscription.currentPlan}</p>
                  <p className="text-sm text-muted-foreground">{currentPlanLabel || copy.subscription.noPlan}</p>
                </div>
                <Button asChild variant="outline">
                  <Link href={to("/pricing")}>{copy.subscription.pricing}</Link>
                </Button>
              </div>

              {isAnnualUpgradeEligible ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-foreground">
                  <div className="mb-3 inline-flex rounded-full border border-amber-200 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-900">
                    {copy.subscription.annualOfferBadge}
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-lg">{copy.subscription.annualOfferTitle}</p>
                    <p className="text-sm text-muted-foreground">{copy.subscription.annualOfferBody}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{copy.subscription.monthlySince}</p>
                    <p className="text-xs text-muted-foreground">{copy.subscription.annualOfferMeta}</p>
                  </div>
                  <div className="mt-4 flex justify-start">
                    <Button onClick={() => void handleAnnualUpgrade()} disabled={isOpeningAnnualUpgrade}>
                      {isOpeningAnnualUpgrade ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isOpeningAnnualUpgrade ? copy.subscription.annualOfferLoading : copy.subscription.annualOfferCta}
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">{copy.danger.title}</CardTitle>
              <CardDescription>{copy.danger.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">{copy.danger.trigger}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{copy.danger.dialogTitle}</DialogTitle>
                    <DialogDescription>{copy.danger.dialogDescription}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="confirm-delete">{copy.danger.confirmLabel}</Label>
                      <Input
                        id="confirm-delete"
                        placeholder={copy.danger.confirmPlaceholder}
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteConfirmation("") }>
                      {copy.danger.cancel}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirmation !== copy.danger.keyword || isDeleting}
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {copy.danger.confirm}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{copy.data.title}</CardTitle>
              <CardDescription>{copy.data.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{copy.data.exportLabel}</Label>
                  <p className="text-sm text-muted-foreground">{copy.data.exportDescription}</p>
                </div>
                <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {copy.data.exportButton}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{copy.legal.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="link" className="px-0 flex items-center gap-2" asChild>
                <Link href={to("/privacy")} target="_blank" rel="noopener noreferrer">
                  {copy.legal.privacy} <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
              <Separator />
              <Button variant="link" className="px-0 flex items-center gap-2" asChild>
                <Link href={to("/terms")} target="_blank" rel="noopener noreferrer">
                  {copy.legal.terms} <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
