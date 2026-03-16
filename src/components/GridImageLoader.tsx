import React from 'react';

export const GridImageLoader: React.FC = () => {
  return (
    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 z-10">
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 animate-pulse"
          style={{
            animationDelay: `${(i % 4) * 0.1 + Math.floor(i / 4) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
