import ScrollSequence from '@/components/landing/ScrollSequence';

export default function Home() {
  return (
    <main>
      {/* L'animation commence ici */}
      <ScrollSequence />
      {/* La suite du contenu */}
      <div style={{ height: '100vh', background: 'white' }}>
        <div className="container mx-auto py-20">
          <h2 className="text-3xl font-bold">La suite de votre contenu</h2>
          <p className="mt-4 text-lg">Cette section apparaît après l'animation par défilement.</p>
        </div>
      </div>
    </main>
  );
}
