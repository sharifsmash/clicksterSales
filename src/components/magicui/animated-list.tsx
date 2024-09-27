import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedListProps {
  children: React.ReactNode;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children }) => {
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const childrenArray = React.Children.toArray(children);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev < childrenArray.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 1000); // 1 second delay between each item

    return () => clearInterval(timer);
  }, [childrenArray.length]);

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: 1, 
          height: 'auto'
        }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden"
      >
        <div className="space-y-4">
          {childrenArray.slice(0, visibleItems).map((child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {child}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};