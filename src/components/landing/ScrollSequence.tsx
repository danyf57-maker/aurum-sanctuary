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
  const [error, setError] = useState<string | null>(null);

  // Préchargement des images
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError(null);
      const imagePromises = Array.from({ length: frameCount }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = getImagePath(i);
          img.onload = () => resolve(img);
          img.onerror = reject; // En cas d'erreur, la promesse est rejetée.
        });
      });

      try {
        // Promise.all préserve l'ordre, donc le tri manuel est inutile.
        const loadedImages = await Promise.all(imagePromises);
        setImages(loadedImages);
      } catch (err) {
        console.error("Erreur de chargement d'une ou plusieurs images:", err);
        setError("Une erreur est survenue lors du chargement de la séquence d'images. Veuillez vérifier que les images se trouvent bien dans le dossier `public/images/sequence` et que leurs noms de fichiers sont corrects (ex: I_want_to_1080p_202601271616_000.jpg).");
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
    scrollFraction = Math.min(1, Math.max(0, scrollFraction));

    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(scrollFraction * frameCount)
    );
    
    const context = canvas.getContext('2d');
    if (!context) return;

    const img = images[frameIndex];
    if (!img) return;

    // Calcule le ratio pour que l'image couvre le canvas (similaire à `object-fit: cover`)
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    
    const centerX = (canvas.width - img.width * ratio) / 2;
    const centerY = (canvas.height - img.height * ratio) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, img.width, img.height, centerX, centerY, img.width * ratio, img.height * ratio);

  }, [images]);

  // Initialiser le canvas et la taille
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading || images.length === 0 || error) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawImage(); // Redessine l'image actuelle après le redimensionnement
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Appel initial pour définir la taille et dessiner la première image
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [loading, images, drawImage, error]);

  // Gérer le défilement
  useEffect(() => {
    if (error) return; // Ne pas attacher l'écouteur de scroll en cas d'erreur.

    const onScroll = () => {
        window.requestAnimationFrame(drawImage);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [drawImage, error]);

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
        {loading && (
            <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white' }}>
                <p>Chargement de la séquence...</p>
            </div>
        )}
        {error && (
             <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1917', color: 'white', padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>
                <div style={{ maxWidth: '600px', border: '1px solid #fca5a5', padding: '2rem', borderRadius: '8px', background: 'rgba(153, 27, 27, 0.125)' }}>
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
            display: loading || error ? 'none' : 'block'
            }}
        />
    </div>
  );
};

export default ScrollSequence;
