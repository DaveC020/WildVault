import React from 'react';
import wildVaultLogo from './WildVault Logo.svg';

export function Logo({ size = 'md', className = '' }) {
  const sizeClass = size === 'lg' ? 'logo-lg' : size === 'sm' ? 'logo-sm' : 'logo-md';
  const height = size === 'lg' ? '3rem' : size === 'sm' ? '1.5rem' : '2rem';
  const fontSize = size === 'lg' ? '1.5rem' : size === 'sm' ? '1rem' : '1.25rem';
  
  return (
    <div className={`logo-container ${sizeClass} ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900', color: '#0f172a' }}>
      <img src={wildVaultLogo} alt="WildVault" style={{ height }} />
      <span style={{ fontSize, letterSpacing: '-0.05em' }}>
        WILD<span style={{ color: '#4f46e5' }}>VAULT</span>
      </span>
    </div>
  );
}
