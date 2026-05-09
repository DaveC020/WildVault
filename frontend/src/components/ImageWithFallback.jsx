import React, { useState, useEffect } from 'react';
import { getAuthToken, resolveApiUrl } from '../api/vaultApi';

export function ImageWithFallback({ src, alt, className, ...rest }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState('');
  const fallbackSrc = 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=800';

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
    setLoading(false);
    setResolvedSrc('');
  }, [src]);

  // Load image with authentication if it's a backend API URL
  useEffect(() => {
    if (!src) {
      setResolvedSrc('');
      return;
    }

    const isBackendImageUrl = typeof src === 'string' && src.includes('/api/items/') && src.includes('/image');

    if (isBackendImageUrl) {
      // Authenticated image fetch
      setLoading(true);
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
          const objectUrl = URL.createObjectURL(blob);
          setResolvedSrc(objectUrl);
          setError(false);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });

      // Cleanup object URLs on unmount
      return () => {
        if (resolvedSrc && resolvedSrc.startsWith('blob:')) {
          URL.revokeObjectURL(resolvedSrc);
        }
      };
    } else {
      // External URL - use as-is
      setResolvedSrc(resolveApiUrl(src));
      setError(false);
      setLoading(false);
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
