import React, { createContext, useContext, useRef, useCallback } from 'react';

const ImageCacheContext = createContext();

export const useImageCache = () => useContext(ImageCacheContext);

export const ImageCacheProvider = ({ children }) => {
  const cacheRef = useRef(new Map());

  const getCachedImage = useCallback((src) => {
    if (cacheRef.current.has(src)) {
      return cacheRef.current.get(src);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(`img_cache_${src}`);
      if (cached) {
        cacheRef.current.set(src, cached);
        return cached;
      }
    }
    return null;
  }, []);

  const setCachedImage = useCallback((src, dataUrl) => {
    cacheRef.current.set(src, dataUrl);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`img_cache_${src}`, dataUrl);
      } catch (e) {
        console.warn('Failed to cache image in localStorage:', e);
      }
    }
  }, []);

  return (
    <ImageCacheContext.Provider value={{ getCachedImage, setCachedImage }}>
      {children}
    </ImageCacheContext.Provider>
  );
};