import { AppShell } from "@/components/layout/app-shell";
import QuizResultModal from "@/components/landing/QuizResultModal";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <QuizResultModal />
      <InstallPrompt />
    </AppShell>
  );
}
