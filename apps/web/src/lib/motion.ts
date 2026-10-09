import type { Variants } from 'motion/react';

// الحركات المتكررة في الموقع بتتعرّف هنا بس. transform و opacity بس (DEC-13)

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// خطوات Secret Seven: النقطة بتظهر، وبعدين الخط اللي بعدها بيترسم (فكرة "النقط بتتصف")
export const stepsStagger: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 18 } },
};

// الخط بيكبر من أوله (الـorigin متحدد بالـCSS: فوق في الموبايل، وبداية السطر في الكمبيوتر)
export const drawLine: Variants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { duration: 0.4, ease: 'easeOut', delay: 0.15 } },
};
