import { AppShell } from "@/components/layout/app-shell";
import QuizResultModal from "@/components/landing/QuizResultModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <QuizResultModal />
    </AppShell>
  );
}
