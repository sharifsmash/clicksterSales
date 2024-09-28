import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MagicButtonProps {
  children?: React.ReactNode;
}

const MagicButton: React.FC<MagicButtonProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateMain = useTransform(scrollYProgress, [0, 1], [0, 5]);
  const rotateImages = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      <motion.div
        className="relative"
        style={{ rotate: rotateMain, y: translateY }}
      >
        <img src="/assets/Screen.png" alt="Main" className="w-full rounded-lg shadow-xl" />
        
        <motion.img
          src="/assets/generating_AI_analysis.png"
          alt="Generating AI Analysis"
          className="absolute -top-8 -left-8 w-56 object-cover rounded-lg shadow-lg"
          style={{ rotate: rotateImages, y: translateY }}
        />
        
        <motion.img
          src="/assets/login.png"
          alt="Login"
          className="absolute -bottom-8 left-1/4 w-56 object-cover rounded-lg shadow-lg"
          style={{ rotate: rotateImages, y: translateY }}
        />
        
        <motion.img
          src="/assets/success.png"
          alt="Success"
          className="absolute -top-8 right-1/4 w-56 object-cover rounded-lg shadow-lg"
          style={{ rotate: rotateImages, y: translateY }}
        />

        <motion.img
          src="/assets/management.png"
          alt="Management"
          className="absolute -bottom-8 -right-8 w-56 object-cover rounded-lg shadow-lg"
          style={{ rotate: rotateImages, y: translateY }}
        />
      </motion.div>
      {children}
    </div>
  );
};

export default MagicButton;
