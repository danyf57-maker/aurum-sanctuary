import ScrollSequence from '@/components/landing/ScrollSequence';

export default function Home() {
  return (
    <main>
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h1>Découvrez le produit</h1>
      </div>
      
      {/* L'animation commence ici */}
      <ScrollSequence />
      
      {/* La suite du contenu */}
      <div style={{ height: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h2>Suite du contenu...</h2>
      </div>
    </main>
  );
}
