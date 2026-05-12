/**
 * Internal sandbox route.
 * Keep experimental UI here only when it is intentionally under review.
 */
export default function SandboxPage() {
    return (
        <main className="min-h-screen bg-stone-50">
            <div className="bg-amber-100 p-2 text-center text-[10px] uppercase tracking-widest text-amber-800 font-bold border-b border-amber-200 sticky top-0 z-[100]">
                Mode bac à sable
            </div>
            <div className="container py-20">
                <h1 className="font-headline text-4xl text-stone-900">Sandbox Aurum</h1>
                <p className="mt-4 max-w-2xl text-stone-600">
                    Ajoute ici uniquement les prototypes actifs. Les anciennes maquettes de landing ont été retirées pour garder le bundle propre.
                </p>
            </div>
        </main>
    );
}
