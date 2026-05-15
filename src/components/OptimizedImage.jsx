// src/components/OptimizedImage.jsx
import React, { useState } from 'react';
import styles from './OptimizedImage.module.css';

const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={styles.container}>
      {/* Show skeleton while loading (but not if error) */}
      {!isLoaded && !error && (
        <div className={`${styles.skeleton} ${className}`} />
      )}
      
      {/* Always show img, just control opacity with CSS */}
      <img
        src={src}
        alt={alt}
        className={`
          ${styles.image} 
          ${isLoaded ? styles.loaded : styles.loading}
          ${error ? styles.error : ''}
          ${className || ''}
        `}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          console.error('Failed to load:', src);
          setError(true);
          setIsLoaded(true); // Mark as "loaded" to hide skeleton
        }}
        {...props}
      />
      
      {/* Show error message if needed */}
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;