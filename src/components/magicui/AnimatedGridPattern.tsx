import React from 'react';
import { cn } from '../../lib/utils';

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  className?: string;
}

const AnimatedGridPattern: React.FC<AnimatedGridPatternProps> = ({
  width = 30,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 200,
  maxOpacity = 0.1,
  duration = 5,
  repeatDelay = 0,
  className = '',
}) => {
  return (
    <svg
      className={cn('absolute inset-0', className)}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="smallGrid"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#smallGrid)" />
      {Array.from({ length: numSquares }).map((_, i) => (
        <rect
          key={i}
          width={width}
          height={height}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          x={x}
          y={y}
          strokeDasharray={strokeDasharray}
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values={`0; ${maxOpacity}; 0.0`}
            dur={`${duration}s`}
            repeatCount="indefinite"
            begin={`${(i / numSquares) * duration}s`}
          />
        </rect>
      ))}
    </svg>
  );
};

export default AnimatedGridPattern;