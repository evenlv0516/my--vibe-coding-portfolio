import React, { useState } from 'react';

interface ProjectImageProps {
  src: string;
  alt: string;
  className?: string;
  isFirst?: boolean;
  onLoad?: () => void;
}

export const ProjectImage: React.FC<ProjectImageProps> = ({ src, alt, className, isFirst = false, onLoad }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto block bg-white ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        onLoad={handleLoad}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
