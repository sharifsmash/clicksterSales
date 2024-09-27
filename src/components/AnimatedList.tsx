import React, { useState, useEffect } from 'react';

interface AnimatedListProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, delay = 1000, className = '' }) => {
  const [visibleItems, setVisibleItems] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleItems((prev) => Math.min(prev + 1, children.length));
    }, delay);

    return () => clearInterval(interval);
  }, [children.length, delay]);

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`transition-opacity duration-500 ${index < visibleItems ? 'opacity-100' : 'opacity-0'}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
};