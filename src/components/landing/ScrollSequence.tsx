'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

const frameCount = 80;
const imageFileName = (index: number) => `I_want_to_1080p_202601271616_${index.toString().padStart(3, '0')}.jpg`;
const imagePath = (index: number) => `/images/sequence/${imageFileName(index)}`;

const ScrollSequence = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload images and update loading state
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = imagePath(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          // Ensure images are sorted correctly by their source filename
          imagesRef.current = images.sort((a, b) => a.src.localeCompare(b.src));
          setIsLoaded(true);
        }
      };
      images.push(img);
    }
  }, []);

  const drawImage = useCallback(() => {
    if (!isLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const img = imagesRef.current[frameIndexRef.current];
    if (!img) return;

    // Use 'cover' logic to fill the canvas while maintaining aspect ratio
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (canvas.width - img.width * ratio) / 2;
    const centerShiftY = (canvas.height - img.height * ratio) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShiftX,
      centerShiftY,
      img.width * ratio,
      img.height * ratio
    );
  }, [isLoaded]);

  // Update frame index on scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { top, height } = container.getBoundingClientRect();
    const scrollableHeight = height - window.innerHeight;

    let newFrameIndex = 0;
    if (top < 0 && top > -scrollableHeight) {
      const scrollFraction = Math.abs(top) / scrollableHeight;
      newFrameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
      );
    } else if (top <= -scrollableHeight) {
      newFrameIndex = frameCount - 1;
    }
    
    if (newFrameIndex !== frameIndexRef.current) {
      frameIndexRef.current = newFrameIndex;
      // Use requestAnimationFrame for smoother animations
      requestAnimationFrame(drawImage);
    }
  }, [drawImage]);

  // Resize canvas and redraw on window resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    requestAnimationFrame(drawImage);
  }, [drawImage]);

  // Set up event listeners and draw initial frame
  useEffect(() => {
    if (isLoaded) {
      handleResize(); // Draw initial frame
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isLoaded, handleResize, handleScroll]);

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default ScrollSequence;