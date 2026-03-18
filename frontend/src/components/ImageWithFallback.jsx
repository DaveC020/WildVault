import React, { useState } from 'react';

export function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);
  const fallbackSrc = 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=800';

  return (
    <img 
      src={error ? fallbackSrc : src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
}
