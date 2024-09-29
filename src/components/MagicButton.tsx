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

  const translateY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const rotateImages = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const scaleMain = useTransform(scrollYProgress, [0, 1], [1, 1.25]); // Add this line for scaling

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      <motion.div
        className="relative"
        style={{ y: translateY, scale: scaleMain }} // Add scale here
      >
        <img src="/assets/Screen.png" alt="Main" className="w-full rounded-lg shadow-xl" />
        
        <motion.img
          src="/assets/generating_AI_analysis.png"
          alt="Generating AI Analysis"
          className="absolute -top-8 -left-8 w-56 object-cover rounded-lg shadow-lg"
          style={{ rotate: rotateImages, y: translateY }}
        />
        <motion.img
          src="/assets/automation.png"
          alt="Automation"
          className="absolute -bottom-8 left-[calc(25%-80px)] w-80 object-cover rounded-lg shadow-lg"
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
