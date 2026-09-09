import React from 'react';

interface LogoProps {
  className?: string;
}

/** Official Tasty Pizza logo supplied by the restaurant. */
export const Logo: React.FC<LogoProps> = ({ className = '' }) => (
  <img
    src="/tasty-pizza-brand.webp"
    alt="Tasty Pizza"
    className={`block object-contain ${className}`}
    loading="eager"
    decoding="async"
  />
);

export default Logo;
