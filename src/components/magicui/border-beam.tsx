import React, { useEffect, useRef } from 'react';

interface BorderBeamProps {
  duration?: number;
  className?: string;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  duration = 5,
  className = '',
}) => {
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const beam = beamRef.current;
    if (!beam) return;

    const animate = () => {
      beam.animate([
        { left: '0%', top: '0%', width: '0%', height: '2px' },
        { left: '100%', top: '0%', width: '0%', height: '2px' },
        { left: '100%', top: '0%', width: '2px', height: '0%' },
        { left: '100%', top: '100%', width: '2px', height: '0%' },
        { left: '0%', top: '100%', width: '0%', height: '2px' },
        { left: '0%', top: '100%', width: '0%', height: '2px' },
        { left: '0%', top: '0%', width: '2px', height: '0%' },
        { left: '0%', top: '0%', width: '2px', height: '0%' },
      ], {
        duration: duration * 1000,
        iterations: Infinity,
      });
    };

    animate();

    return () => {
      beam.getAnimations().forEach(anim => anim.cancel());
    };
  }, [duration]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        ref={beamRef}
        className="absolute bg-white opacity-75"
        style={{ boxShadow: '0 0 8px 1px rgba(255, 255, 255, 0.5)' }}
      />
    </div>
  );
};