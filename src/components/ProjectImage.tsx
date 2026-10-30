import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ProjectImageProps {
  src: string;
  alt: string;
  className?: string;
  isFirst?: boolean;
  onLoad?: () => void;
}

export const ProjectImage: React.FC<ProjectImageProps> = ({ src, alt, className, isFirst = false, onLoad }) => {
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const settledRef = useRef(false);

  const settle = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  useEffect(() => {
    settledRef.current = false;
    setIsLoading(true);
    const img = imgRef.current;
    if (img?.complete && img.naturalHeight > 0) {
      settle();
    }
  }, [src, settle]);

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-auto block bg-white ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        onLoad={settle}
        onError={settle}
        referrerPolicy="no-referrer"
        loading={isFirst ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={isFirst ? 'high' : 'auto'}
      />
    </div>
  );
};
