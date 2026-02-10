import React, { useState, useEffect, useRef } from 'react';
import { generateImage } from '../services/geminiService';
import { SparklesIcon } from './icons/Icons';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackPrompt?: string;
}

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, fallbackPrompt, className, ...props }) => {
  // FIX: Initialize with undefined and handle src logic in useEffect to support Blob URLs and prevent type errors.
  const [imgSrc, setImgSrc] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const generationAttempted = useRef(false);

  useEffect(() => {
    // FIX: This effect now correctly handles `src` being a string, a Blob, or undefined.
    const currentSrc = src as (string | Blob | undefined);

    // If no src is provided initially, we treat it as an immediate need to generate.
    if (!currentSrc && fallbackPrompt) {
        setHasError(true); 
        return; // Early return
    }
    
    let objectUrl: string | undefined;

    if (typeof currentSrc === 'string') {
        setImgSrc(currentSrc);
    } else if (typeof Blob !== 'undefined' && currentSrc instanceof Blob) {
        objectUrl = URL.createObjectURL(currentSrc);
        setImgSrc(objectUrl);
    } else {
        // If src is undefined or another type, clear imgSrc
        setImgSrc(undefined);
    }

    setHasError(false);
    setIsGenerating(false);
    generationAttempted.current = false;
    
    // Cleanup function to revoke the object URL to prevent memory leaks.
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, fallbackPrompt]);

  // Effect to trigger generation when error state is active
  useEffect(() => {
    const triggerGeneration = async () => {
        // Only generate if we have an error, we aren't currently generating, we have a prompt, AND we haven't tried yet.
        if (hasError && !isGenerating && fallbackPrompt && !generationAttempted.current) {
            setIsGenerating(true);
            generationAttempted.current = true; // Mark as attempted to prevent infinite retry loops on 429s

            // Stagger requests with a random delay (500ms to 3000ms) to avoid hitting rate limits instantly
            const delay = 500 + Math.random() * 2500;
            await new Promise(r => setTimeout(r, delay));

            try {
                const generatedUrl = await generateImage(fallbackPrompt);
                if (generatedUrl) {
                    setImgSrc(generatedUrl);
                    setHasError(false); 
                } else {
                    // API Quota exceeded or error: Fallback to a nice placeholder
                    console.warn("Using placeholder due to generation limit.");
                    setImgSrc('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop');
                    setHasError(false);
                }
            } catch (e) {
                console.error("Failed to generate fallback image", e);
                setImgSrc('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop');
                setHasError(false);
            } finally {
                setIsGenerating(false);
            }
        }
    };

    triggerGeneration();
  }, [hasError, isGenerating, fallbackPrompt]);

  const handleError = () => {
    // Only set error if we haven't tried generating yet
    if (!isGenerating && !generationAttempted.current) {
        setHasError(true);
    }
  };

  if (isGenerating) {
      return (
          <div className={`${className} flex flex-col items-center justify-center bg-gray-50 border border-gray-200 animate-pulse`}>
              <SparklesIcon className="w-8 h-8 text-lime-600 mb-2 animate-bounce" />
              <span className="text-gray-500 text-xs font-medium tracking-wide">Growing Image...</span>
          </div>
      );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default SmartImage;
