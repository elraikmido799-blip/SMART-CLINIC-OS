import type { Variants } from 'motion/react';

// الحركات المتكررة في الموقع بتتعرّف هنا بس

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
};
