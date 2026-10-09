'use client';

import { motion } from 'motion/react';
import { fadeUp, stagger } from '@/lib/motion';

type RevealGroupProps = {
  as?: 'ul' | 'ol';
  className?: string;
  children: React.ReactNode;
};

/** List العناصر بتاعتها بتظهر ورا بعض مع الـScroll. العناصر جواها <RevealItem> */
export function RevealGroup({ as = 'ul', className, children }: RevealGroupProps) {
  const Tag = as === 'ol' ? motion.ol : motion.ul;
  return (
    <Tag
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.li className={className} variants={fadeUp}>
      {children}
    </motion.li>
  );
}
