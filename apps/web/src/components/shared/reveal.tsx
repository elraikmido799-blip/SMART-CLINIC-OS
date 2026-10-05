'use client';

import { motion } from 'motion/react';
import { fadeUp } from '@/lib/motion';

// الظهور مع الـScroll في كل الصفحات. ممنوع على صورة الـHero أو العنوان الرئيسي (بيبطّأ الـLCP)
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
