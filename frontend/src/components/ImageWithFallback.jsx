import React, { useState, useEffect } from 'react';
import { getAuthToken, resolveApiUrl } from '../api/vaultApi';

export function ImageWithFallback({ src, alt, className, ...rest }) {
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState('');
  const fallbackSrc = 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=800';

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
    setResolvedSrc('');
  }, [src]);

  // Load image with authentication if it's a backend API URL
  useEffect(() => {
    let objectUrl = '';

    if (!src) {
      setResolvedSrc('');
      return;
    }

    const isBackendImageUrl = typeof src === 'string' && src.includes('/api/items/') && src.includes('/image');

    if (isBackendImageUrl) {
      // Authenticated image fetch
      const fullUrl = resolveApiUrl(src);
      const token = getAuthToken();

      fetch(fullUrl, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          if (blob.size === 0) {
            throw new Error('Empty blob');
          }
          objectUrl = URL.createObjectURL(blob);
          setResolvedSrc(objectUrl);
          setError(false);
        })
        .catch(() => {
          setError(true);
        });

      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    } else {
      // External URL - use as-is
      setResolvedSrc(resolveApiUrl(src));
      setError(false);
    }
  }, [src]);

  const displaySrc = error ? fallbackSrc : resolvedSrc;

  return (
    <img 
      src={displaySrc} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  );
}
