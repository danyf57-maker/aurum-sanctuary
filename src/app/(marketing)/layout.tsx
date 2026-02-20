import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { DesktopInstallPrompt } from '@/components/pwa/DesktopInstallPrompt';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <DesktopInstallPrompt />
            <Footer />
        </div>
    );
}
