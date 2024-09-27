import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedListProps {
  children: React.ReactNode;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};