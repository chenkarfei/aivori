'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
}

const PULL_THRESHOLD = 80;

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 360]);
  const opacity = useTransform(y, [0, PULL_THRESHOLD / 2, PULL_THRESHOLD], [0, 0.5, 1]);
  const scale = useTransform(y, [0, PULL_THRESHOLD], [0.8, 1]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = y.on('change', (latest) => {
      setPullProgress(Math.min(latest / PULL_THRESHOLD, 1));
    });
    return () => unsubscribe();
  }, [y]);

  const handleDragStart = () => {
    // Only allow drag if at the top of the page
    if (window.scrollY > 0) {
      y.stop();
    }
  };

  const handleDragEnd = () => {
    if (y.get() >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      animate(y, 0, { type: 'spring', bounce: 0.3 });
    }
  };

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 8000); // Longer delay to ensure user sees it, but reload is the goal
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Refresh Indicator */}
      <motion.div
        style={{
          y: useTransform(y, (v) => Math.min(v, PULL_THRESHOLD + 20)),
          opacity: opacity,
          scale: scale,
          rotate: isRefreshing ? 0 : rotate,
        }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-[var(--color-theme-orange)]/10"
      >
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
        >
          <RefreshCw 
            size={24} 
            className={isRefreshing ? "text-[var(--color-theme-orange)]" : "text-[var(--color-theme-green)]"} 
          />
        </motion.div>
      </motion.div>

      {/* Draggable Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 500 }}
        dragElastic={0.15}
        style={{ y }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
