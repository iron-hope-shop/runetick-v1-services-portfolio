const imageCache = new Map();

export const getCachedImage = (src) => {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }
  if (isLocalStorageAvailable()) {
    const cached = localStorage.getItem(`img_cache_${src}`);
    if (cached) {
      imageCache.set(src, cached);
      return cached;
    }
  }
  return null;
};

export const setCachedImage = (src, dataUrl) => {
  imageCache.set(src, dataUrl);
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(`img_cache_${src}`, dataUrl);
    } catch (e) {
      console.warn('Failed to cache image in localStorage:', e);
    }
  }
};

// Helper function to check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};