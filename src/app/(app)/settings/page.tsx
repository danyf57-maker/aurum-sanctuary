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
  Moon,
  Sun,
  Globe,
  Bell,
  User,
  Lock,
  ExternalLink,
  Fingerprint,
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useLocalizedHref } from "@/hooks/use-localized-href";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const to = useLocalizedHref();
  const t = useTranslations("settings");
  const { user, loading: authLoading, logout } = useAuth();
  const {
    preferences,
    loading: settingsLoading,
    updatePreferences,
  } = useSettings();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "SUPPRIMER") return;

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
      // 1. Fetch Entries
      const entriesSnapshot = await getDocs(
        collection(firestore, "users", user.uid, "entries")
      );
      const decryptedEntries = entriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        // TABULA RASA: Export plaintext content directly
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

      // 2. Fetch Insights
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

      // 3. Bundle Data
      const exportData = {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName ?? "",
          exportedAt: new Date().toISOString(),
        },
        entries: decryptedEntries,
        insights: insights,
      };

      // 4. Trigger Download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aurum-data-${
        (new Date().toISOString() ?? "").split("T")[0]
      }.json`;
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

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif text-primary">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et les paramètres de votre compte.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Langue et région
              </CardTitle>
              <CardDescription>
                Personnalisez votre langue et vos préférences horaires.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(val: any) =>
                    updatePreferences({ language: val })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Choisir une langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">Anglais (US)</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(val) => updatePreferences({ timezone: val })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Choisir un fuseau horaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem
                      value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                    >
                      Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </SelectItem>
                    {/* Add more timezones as needed */}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-primary" />
                Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'affichage d'Aurum sur votre appareil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Thème</Label>
                  <p className="text-sm text-muted-foreground">
                    Choisissez votre thème visuel préféré.
                  </p>
                </div>
                <Select
                  value={preferences.theme}
                  onValueChange={(val: any) =>
                    updatePreferences({ theme: val })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Choisir un thème" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez la manière dont nous communiquons avec vous.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Alertes d'analyses</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez une notification quand vos analyses hebdomadaires sont prêtes.
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

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profil
              </CardTitle>
              <CardDescription>
                Vos informations de compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Nom affiché</Label>
                  <Input value={user?.displayName || ""} readOnly disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Abonnement
              </CardTitle>
              <CardDescription>
                Gérez votre formule d'abonnement Aurum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">Formule actuelle</p>
                  <p className="text-sm text-muted-foreground">Aucune formule active</p>
                </div>
                <Button asChild variant="outline">
                  <Link href={to("/pricing")}>Voir les tarifs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Zone sensible</CardTitle>
              <CardDescription>Actions irréversibles sur le compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Supprimer le compte</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmez-vous cette suppression&nbsp;?</DialogTitle>
                    <DialogDescription>
                      Cette action est irréversible. Elle supprimera définitivement votre compte
                      et vos données de nos serveurs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="confirm-delete">
                        Tapez "SUPPRIMER" pour confirmer
                      </Label>
                      <Input
                        id="confirm-delete"
                        placeholder="SUPPRIMER"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirmation("")}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirmation !== "SUPPRIMER" || isDeleting}
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Supprimer le compte
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vos données</CardTitle>
              <CardDescription>
                Gérez vos données personnelles et vos exports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Exporter mes données</Label>
                  <p className="text-sm text-muted-foreground">
                    Téléchargez une copie de toutes vos entrées et analyses
                    (JSON).
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Télécharger le JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentions légales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="link"
                className="px-0 flex items-center gap-2"
                asChild
              >
                <Link href={to("/privacy")} target="_blank" rel="noopener noreferrer">
                  Politique de confidentialité <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
              <Separator />
              <Button
                variant="link"
                className="px-0 flex items-center gap-2"
                asChild
              >
                <Link href={to("/terms")} target="_blank" rel="noopener noreferrer">
                  Conditions d'utilisation <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
