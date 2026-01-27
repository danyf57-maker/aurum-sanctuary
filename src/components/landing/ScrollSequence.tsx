'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

const frameCount = 80; // De 000 à 079

const getImagePath = (frame: number) =>
  `/images/sequence/I_want_to_1080p_202601271616_${String(frame).padStart(3, '0')}.jpg`;

const ScrollSequence = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loading, setLoading] = useState(true);

  // Préchargement des images
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      const imagePromises = Array.from({ length: frameCount }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = getImagePath(i);
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      });

      try {
        const loadedImages = await Promise.all(imagePromises);
        // Trier pour s'assurer que l'ordre est correct même si le chargement est asynchrone
        loadedImages.sort((a, b) => {
            const aNum = parseInt(a.src.split('_').pop()?.split('.')[0] || '0');
            const bNum = parseInt(b.src.split('_').pop()?.split('.')[0] || '0');
            return aNum - bNum;
        });
        setImages(loadedImages);
      } catch (error) {
        console.error("Erreur de chargement d'une ou plusieurs images:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || images.length === 0) return;

    const { top, height } = container.getBoundingClientRect();
    const scrollableHeight = height - window.innerHeight;
    let scrollFraction = (-top) / scrollableHeight;
    scrollFraction = Math.min(1, Math.max(0, scrollFraction)); // Clamp between 0 and 1

    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(scrollFraction * frameCount)
    );
    
    const context = canvas.getContext('2d');
    if (!context) return;

    const img = images[frameIndex];
    if (!img) return;

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio); // 'cover' effect
    
    const centerX = (canvas.width - img.width * ratio) / 2;
    const centerY = (canvas.height - img.height * ratio) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, img.width, img.height, centerX, centerY, img.width * ratio, img.height * ratio);

  }, [images]);

  // Initialiser le canvas et la taille
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading || images.length === 0) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawImage();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Dessiner la première image
    const firstImage = images[0];
    if (firstImage) {
        firstImage.onload = () => drawImage();
        if (firstImage.complete) drawImage();
    }


    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [loading, images, drawImage]);

  // Gérer le défilement
  useEffect(() => {
    const onScroll = () => {
        window.requestAnimationFrame(drawImage);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [drawImage]);

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
        {loading && (
            <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white' }}>
                <p>Chargement de la séquence...</p>
            </div>
        )}
        <canvas
            ref={canvasRef}
            style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            height: '100vh',
            display: loading ? 'none' : 'block'
            }}
        />
    </div>
  );
};

export default ScrollSequence;
