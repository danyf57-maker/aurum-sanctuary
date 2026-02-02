
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const frameCount = 52; // De 000 à 051

const getImagePath = (frame: number) =>
  `/sequence/herosection_000_${String(frame).padStart(3, '0')}.jpg`;


const ScrollSequence = () => {
  const [thought, setThought] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const opacityHero = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const opacitySanctuary = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const ySanctuary = useTransform(scrollYProgress, [0.7, 0.9], ['5vh', '0vh']);

  const drawImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerX = (canvas.width - img.width * ratio) / 2;
    const centerY = (canvas.height - img.height * ratio) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, img.width, img.height, centerX, centerY, img.width * ratio, img.height * ratio);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    let isCancelled = false;
    const loadImages = async () => {
      try {
        const imagePromises = Array.from({ length: frameCount }, (_, i) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.src = getImagePath(i);
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(getImagePath(i)));
          });
        });

        const loadedImages = await Promise.all(imagePromises);
        if (isCancelled) return;

        setImages(loadedImages);
      } catch (err: any) {
        console.error("Erreur de chargement d'image:", err.message);
        setError(`Impossible de charger une image pour l'animation. Vérifiez que le fichier existe bien.`);
      }
    };
    loadImages();

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const img = images[0];
    if (img) {
      drawImage(img);
      setIsAnimationReady(true);
    }

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const frameIndex = Math.min(
        images.length - 1,
        Math.floor(latest * images.length)
      );
      const currentImg = images[frameIndex];
      if (currentImg) {
        requestAnimationFrame(() => drawImage(currentImg));
      }
    });

    return () => unsubscribe();
  }, [images, scrollYProgress, drawImage]);

  return (
    <div ref={containerRef} style={{ height: '800vh', position: 'relative' }}>
      {error && (
        <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1917', color: 'white', padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>
          <div style={{ maxWidth: '800px', border: '1px solid #fca5a5', padding: '2rem', borderRadius: '8px', background: 'rgba(153, 27, 27, 0.125)' }}>
            <h3 style={{ color: '#fca5a5', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>Erreur d'animation</h3>
            <p style={{ color: '#fed7d7', textAlign: 'left', lineHeight: '1.5' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Fallback visible until animation is ready */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: '#1c1917',
        display: isAnimationReady ? 'none' : 'block'
      }} />

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          display: error ? 'none' : 'block',
          visibility: isAnimationReady ? 'visible' : 'hidden',
        }}
      />
      <div style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: '100vh',
        marginTop: '-100vh',
        display: error ? 'none' : 'block',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }} />

        <motion.div style={{
          opacity: opacityHero,
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: 'white',
          padding: '0 1.5rem'
        }}>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-stone-400 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)] leading-[1.1] max-w-4xl px-4">
            Aurum : Le sanctuaire qui transforme votre chaos en clarté.
          </h1>
          
          <div className="mt-6 md:mt-12 w-full max-w-2xl bg-white/10 backdrop-blur-xl p-5 md:p-10 rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg md:text-2xl font-headline mb-4 md:mb-6 text-stone-100/90 tracking-wide uppercase text-[10px] md:text-xs font-semibold">
              Que déposez-vous aujourd'hui ?
            </h2>
            
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="Écrivez ici l'essentiel..."
              className="w-full h-24 md:h-32 bg-transparent border-0 focus:ring-0 text-xl md:text-2xl font-handwriting text-white placeholder:text-stone-400/60 resize-none leading-relaxed italic mb-4"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="h-12 md:h-14 px-8 text-base md:text-lg rounded-xl w-full sm:w-auto shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href={`/sanctuary/write?initial=${encodeURIComponent(thought)}`}>
                  Essayer sans compte
                </Link>
              </Button>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="text-[10px] text-stone-300/80 uppercase tracking-[0.2em] font-medium">100% Anonyme</span>
                <span className="text-[9px] text-stone-400/60 uppercase tracking-widest">Zéro engagement • Privé</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            opacity: opacitySanctuary,
            y: ySanctuary,
          }}
        >
          <div className="text-center flex flex-col items-center p-4">
            <h1 className="text-6xl lg:text-7xl font-headline tracking-tighter text-white">Prêt à commencer ?</h1>
            <p className="max-w-md text-stone-200 my-8 font-light">
              Rejoignez ceux qui ont déjà retrouvé leur calme intérieur grâce au Sanctuaire.
            </p>
            <div className="flex gap-5 items-center">
              <Button asChild size="lg" className="h-14 px-10">
                <Link href="/signup">Créer mon espace privé</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Soft Dawn Gradient Transition */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '25vh',
          background: 'linear-gradient(to bottom, transparent, #F9F7F2)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default ScrollSequence;
