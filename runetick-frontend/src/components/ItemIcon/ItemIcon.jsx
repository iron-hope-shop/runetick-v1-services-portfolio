import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { useImageCache } from '../ImageCacheContext/ImageCacheContext';

const DEFAULT_IMAGE_URL = 'https://oldschool.runescape.wiki/images/Bank_note.png';

export const ItemIcon = React.memo(({ src, alt, size }) => {
  const { getCachedImage, setCachedImage } = useImageCache();
  
  const [imageSrc, setImageSrc] = useState(() => {
    const cachedImage = getCachedImage(src);
    return cachedImage || src;
  });

  const loadImage = useCallback(() => {
    const cachedSrc = getCachedImage(src);
    if (cachedSrc) {
      setImageSrc(cachedSrc);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setCachedImage(src, dataUrl);
      setImageSrc(dataUrl);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setCachedImage(src, DEFAULT_IMAGE_URL);
      setImageSrc(DEFAULT_IMAGE_URL);
    };
    img.src = src;
  }, [src, getCachedImage, setCachedImage]);

  useEffect(() => {
    setImageSrc(null);
    loadImage();
  }, [src, loadImage]);

  useEffect(() => {
    if (!getCachedImage(src)) {
      loadImage();
    }
  }, [src, loadImage, getCachedImage]);

  const memoizedSrc = useMemo(() => imageSrc, [imageSrc]);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={memoizedSrc}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
});