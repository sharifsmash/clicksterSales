import React from 'react';
import { cn } from '../../lib/utils';

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  vertical?: boolean;
  children: React.ReactNode;
  repeat?: number;
}

export const Marquee: React.FC<MarqueeProps> = ({
  className,
  reverse = false,
  vertical = false,
  children,
  repeat = 2,
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden [--duration:40s] [--gap:1rem]',
        vertical && '[--orientation:vertical]',
        className
      )}
    >
      <div
        className={cn(
          'flex min-w-full shrink-0 gap-[--gap] py-4',
          'animate-marquee',
          vertical && 'flex-col',
          reverse && 'direction-reverse'
        )}
      >
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <React.Fragment key={i}>{children}</React.Fragment>
          ))}
      </div>
    </div>
  );
};