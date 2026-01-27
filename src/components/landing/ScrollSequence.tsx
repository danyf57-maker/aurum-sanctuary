'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const frameCount = 52; // De 000 à 051

const getImagePath = (frame: number) =>
  `/sequence/herosection_000_${String(frame).padStart(3, '0')}.jpg`;

const ScrollSequence = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Framer Motion scroll hook
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Hero text fades out quickly
  const opacityHero = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  
  // Parallax text fades in, moves, then fades out
  const yParallax = useTransform(scrollYProgress, [0.08, 0.4], ["10vh", "-15vh"]);
  const opacityParallax = useTransform(scrollYProgress, [0.08, 0.15, 0.35, 0.4], [0, 0.9, 0.9, 0]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let isCancelled = false;

    const drawInitialImage = (img: HTMLImageElement) => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerX = (canvas.width - img.width * ratio) / 2;
        const centerY = (canvas.height - img.height * ratio) / 2;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, img.width, img.height, centerX, centerY, img.width * ratio, img.height * ratio);
    };
    
    const loadImages = async () => {
      try {
        // Load the first image first to display it quickly
        const firstImage = new Image();
        firstImage.src = getImagePath(0);
        await firstImage.decode();

        if (isCancelled) return;
        drawInitialImage(firstImage);

        // Preload all other images in the background
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
        setIsAnimationReady(true);
      } catch (err: any) {
        console.error("Erreur de chargement d'image:", err.message);
        setError(`Impossible de charger l'image à l'adresse : "${err.message}". Vérifiez que le fichier existe bien dans le dossier "public${err.message}" et que le nom est exact.`);
      }
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  }, []);

  const drawImageOnScroll = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isAnimationReady || images.length === 0) return;

    const { top, height } = container.getBoundingClientRect();
    const scrollableHeight = height - window.innerHeight;
    
    let scrollFraction = (-top) / scrollableHeight;
    scrollFraction = Math.min(1, Math.max(0, scrollFraction));

    const frameIndex = Math.min(
      images.length - 1,
      Math.floor(scrollFraction * images.length)
    );
    
    const context = canvas.getContext('2d');
    if (!context) return;

    const img = images[frameIndex];
    if (!img) return;

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerX = (canvas.width - img.width * ratio) / 2;
    const centerY = (canvas.height - img.height * ratio) / 2;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, img.width, img.height, centerX, centerY, img.width * ratio, img.height * ratio);
  }, [images, isAnimationReady]);

  useEffect(() => {
    if (!isAnimationReady) return;

    const onScroll = () => window.requestAnimationFrame(drawImageOnScroll);
    const onResize = () => {
        const canvas = canvasRef.current;
        if(canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawImageOnScroll();
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    
    onResize(); // Initial draw on resize setup

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isAnimationReady, images, drawImageOnScroll]);


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
      <canvas
        ref={canvasRef}
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
            <p className="mt-4 text-xl md:text-2xl text-stone-200 max-w-2xl drop-shadow-xl">
                Le silence qui vous écoute.
            </p>
          </motion.div>

          {/* Parallax text (Middle layer) */}
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
              y: yParallax,
              opacity: opacityParallax,
              color: '#F5F1E8',
            }}
          >
            <h2 className="font-headline text-4xl text-center">
              L'endroit où vos mots se posent.
            </h2>
          </motion.div>
      </div>
    </div>
  );
};

export default ScrollSequence;
