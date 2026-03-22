import { AppShell } from "@/components/layout/app-shell";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <InstallPrompt />
    </AppShell>
  );
}
