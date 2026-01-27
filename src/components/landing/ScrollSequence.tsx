'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

const frameCount = 80; // De 000 à 079

const getImagePath = (frame: number) =>
  `/sequence/I_want_to_1080p_202601271616_${String(frame).padStart(3, '0')}.jpg`;

const ScrollSequence = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // All images for the animation
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  // Is the animation ready to play?
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main effect for preloading and setting up the scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let isCancelled = false;

    // Draws an image on the canvas, fitting it with 'cover'
    const drawImageToCanvas = (img: HTMLImageElement) => {
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

    const preload = async () => {
      // 1. Load the very first image
      const firstImage = new Image();
      firstImage.src = getImagePath(0);

      try {
        // Wait for the image to be fully decoded
        await firstImage.decode();
        if (isCancelled) return;

        // Draw it immediately, so the user sees something
        drawImageToCanvas(firstImage);

        // A resize listener for the static first image
        const initialResize = () => drawImageToCanvas(firstImage);
        window.addEventListener('resize', initialResize);

        // 2. Now, load all the other images in the background
        const allImagePromises = Array.from({ length: frameCount }, (_, i) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            const path = getImagePath(i);
            img.src = path;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(path)); // Reject with the path
          });
        });

        const allImages = await Promise.all(allImagePromises);
        if (isCancelled) return;

        // All images are ready
        setImages(allImages);
        setIsAnimationReady(true);

        // Clean up the initial resize listener
        window.removeEventListener('resize', initialResize);
      } catch (err: any) {
        console.error("Erreur de chargement d'image:", err.message);
        setError(`Impossible de charger l'image à l'adresse : "${err.message}". Vérifiez que le fichier existe bien dans le dossier "public${err.message}" et que le nom est exact.`);
      }
    };

    preload();

    return () => {
      isCancelled = true;
    };
  }, []);

  // This is the animation function that runs on scroll
  const drawImageOnScroll = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isAnimationReady || images.length === 0) return;

    const { top, height } = container.getBoundingClientRect();
    const scrollableHeight = height - window.innerHeight;
    
    // Calculate scroll progress within the container
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

    // Draw the correct frame
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerX = (canvas.width - img.width * ratio) / 2;
    const centerY = (canvas.height - img.height * ratio) / 2;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, img.width, img.height, centerX, centerY, img.width * ratio, img.height * ratio);
  }, [images, isAnimationReady]);

  // Effect to handle scroll and resize once the animation is ready
  useEffect(() => {
    if (!isAnimationReady) return;

    const onScroll = () => window.requestAnimationFrame(drawImageOnScroll);
    const onResize = () => {
        // Redraw current frame on resize
        const canvas = canvasRef.current;
        const img = images[0]; // Just use first image for resize dimensions
        if(canvas && img) {
            drawImageOnScroll();
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    
    // Draw the first frame of the animation sequence
    drawImageOnScroll();

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
    </div>
  );
};

export default ScrollSequence;
