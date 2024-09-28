import React from 'react';

interface ShineBorderProps {
  className?: string;
  duration?: number;
  color?: string | string[];
  borderRadius?: number;
  borderWidth?: number;
  children: React.ReactNode;
}

const ShineBorder: React.FC<ShineBorderProps> = ({
  className = '',
  duration = 14,
  color = '#FFFFFF',
  borderRadius = 8,
  borderWidth = 1,
  children,
}) => {
  const gradientColors = Array.isArray(color) ? color.join(', ') : color;

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes shine {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
        background: `linear-gradient(90deg, ${gradientColors})`,
        backgroundSize: '200% 200%',
        animation: `shine ${duration}s linear infinite`,
      }}
    >
      <div
        className="relative z-10 bg-white"
        style={{
          borderRadius: `${borderRadius - borderWidth}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ShineBorder;