'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const frameCount = 52; // De 000 à 051

const getImagePath = (frame: number) =>
  `/sequence/herosection_000_${String(frame).padStart(3, '0')}.jpg`;


const ScrollSequence = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  
  useEffect(() => {
    // This runs only on the client, after the initial render.
    const updateSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);


  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // --- Text Animations ---
  // The first text fades out much earlier
  const opacityHero = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);

  // The new "Sanctuary" hero fades in at the end.
  const opacitySanctuary = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const ySanctuary = useTransform(scrollYProgress, [0.7, 0.9], ['5vh', '0vh']);
  

  const drawImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    if (canvasSize.width === 0 || canvasSize.height === 0 || images.length > 0) return;

    let isCancelled = false;

    const loadImages = async () => {
      try {
        const firstImage = new Image();
        firstImage.src = getImagePath(0);
        await firstImage.decode();
        if (isCancelled) return;
        drawImage(firstImage);
        setIsAnimationReady(true); // Show first frame immediately

        const allImagePromises = Array.from({ length: frameCount }, (_, i) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            const path = getImagePath(i);
            img.src = path;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(path));
          });
        });

        const allImages = await Promise.all(allImagePromises);
        if (isCancelled) return;

        setImages(allImages);
      } catch (err: any) {
        console.error("Erreur de chargement d'image:", err.message);
        setError(`Impossible de charger l'image à l'adresse : "${err.message}". Vérifiez que le fichier existe bien dans le dossier "public${err.message}" et que le nom est exact.`);
      }
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  }, [drawImage, canvasSize, images]);

  useEffect(() => {
    if (images.length === 0) return;
    
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const frameIndex = Math.min(
        images.length - 1,
        Math.floor(latest * images.length)
      );
      const img = images[frameIndex];
      if (img) {
        requestAnimationFrame(() => drawImage(img));
      }
    });

    return () => unsubscribe();
  }, [images, scrollYProgress, drawImage]);


  return (
    <div ref={containerRef} style={{ height: '800vh', position: 'relative' }}>
      {error && (
        <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1917', color: 'white', padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>
          <div style={{ maxWidth: '800px', border: '1px solid #fca5a5', padding: '2rem', borderRadius: '8px', background: 'rgba(153, 27, 27, 0.125)' }}>
            <h3 style={{color: '#fca5a5', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold'}}>Erreur d'animation</h3>
            <p style={{color: '#fed7d7', textAlign: 'left', lineHeight: '1.5' }}>{error}</p>
          </div>
        </div>
      )}
      {!isAnimationReady && !error && (
         <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1917', color: 'white', zIndex: 10 }}>
          {/* First frame will be drawn here on canvas, so no loader needed. */}
        </div>
      )}
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
        }}
      />
       {/* Overlay Container for all text */}
       <div style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          marginTop: '-100vh',
          display: error ? 'none' : 'block',
      }}>
          {/* Dark filter */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}/>

          {/* Hero text (Front layer) */}
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
          }}>
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-white drop-shadow-2xl">
                Aurum
            </h1>
            <p className="mt-4 text-3xl md:text-4xl text-stone-200 max-w-2xl drop-shadow-xl font-headline italic">
                Le silence qui vous écoute.
            </p>
          </motion.div>

          {/* Sanctuary Hero Content */}
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
                <h1 className="text-6xl lg:text-7xl font-headline tracking-tighter text-white">Le Sanctuaire</h1>
                <p className="text-2xl lg:text-3xl font-headline italic text-amber-300 my-6">Le silence qui vous écoute.</p>
                <p className="max-w-md text-stone-200 mb-12">
                    Un espace intime pour déposer ce qui vous traverse. Sans jugement. Sans bruit. Sans objectif de performance.
                </p>
                <div className="flex gap-5 items-center">
                    <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-stone-900">
                        <Link href="/sanctuary/write">Ouvrir mon sanctuaire</Link>
                    </Button>
                    <Link href="/sanctuary/write" className="text-sm text-stone-300 underline underline-offset-4">Essayer sans compte</Link>
                </div>
            </div>
          </motion.div>
      </div>
    </div>
  );
};

export default ScrollSequence;
