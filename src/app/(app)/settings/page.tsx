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

export default function SettingsPage() {
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
    if (deleteConfirmation !== "DELETE") return;

    setIsDeleting(true);
    try {
      const deleteAccountFn = httpsCallable(functions, "deleteUserAccount");
      await deleteAccountFn();

      await logout();
      router.push("/");
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
    } catch (error) {
      console.error("Account deletion failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
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
      a.download = `aurum-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
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
        <h1 className="text-3xl font-serif text-primary">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Language & Region
              </CardTitle>
              <CardDescription>
                Customize your language and time settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(val: any) =>
                    updatePreferences({ language: val })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(val) => updatePreferences({ timezone: val })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
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
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how Aurum looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred visual theme.
                  </p>
                </div>
                <Select
                  value={preferences.theme}
                  onValueChange={(val: any) =>
                    updatePreferences({ theme: val })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
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
                Manage how we communicate with you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Insight Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when your weekly insights are ready.
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
                Profile Info
              </CardTitle>
              <CardDescription>
                Your personal account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={user?.displayName || ""} readOnly disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your Aurum subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">Free Tier</p>
                </div>
                <Button variant="outline">Upgrade to Pro</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="confirm-delete">
                        Type "DELETE" to confirm
                      </Label>
                      <Input
                        id="confirm-delete"
                        placeholder="DELETE"
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
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirmation !== "DELETE" || isDeleting}
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Delete Account
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
              <CardTitle>Your Data</CardTitle>
              <CardDescription>
                Control your personal data and exports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of all your journal entries and insights
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
                  Download JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="link"
                className="px-0 flex items-center gap-2"
                asChild
              >
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
              <Separator />
              <Button
                variant="link"
                className="px-0 flex items-center gap-2"
                asChild
              >
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  Terms of Service <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
