export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <main className="h-full">{children}</main>
        </div>
    );
}
