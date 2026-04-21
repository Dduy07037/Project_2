import type { TargetAndTransition, Transition, Variants } from 'framer-motion';

export const transitions = {
  fast: { duration: 0.12, ease: [0.16, 1, 0.3, 1] } as Transition,
  normal: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } as Transition,
  slow: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } as Transition,
  page: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } as Transition,
  spring: { type: 'spring', stiffness: 320, damping: 28 } as Transition,
  springTight: { type: 'spring', stiffness: 420, damping: 32 } as Transition,
  springBounce: { type: 'spring', stiffness: 460, damping: 30 } as Transition,
  smooth: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } as Transition,
  glowPulse: { duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } as Transition,
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: transitions.page },
  exit: { opacity: 0, y: -8, transition: transitions.fast },
};

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
};

export const scaleFadeVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  enter: { opacity: 1, scale: 1, y: 0, transition: transitions.slow },
  exit: { opacity: 0, scale: 0.99, y: 6, transition: transitions.fast },
};

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: transitions.slow },
  exit: { opacity: 0, y: 8, transition: transitions.fast },
};

export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: 12 },
  enter: { opacity: 1, x: 0, transition: transitions.slow },
  exit: { opacity: 0, x: 8, transition: transitions.fast },
};

export const staggerContainer: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: transitions.slow },
};

export const staggerList: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.02,
    },
  },
};

export const staggerListItem: Variants = {
  initial: { opacity: 0, y: 6 },
  enter: { opacity: 1, y: 0, transition: transitions.normal },
};

export const toastVariants: Variants = {
  initial: { opacity: 0, x: 20, y: 4 },
  enter: { opacity: 1, x: 0, y: 0, transition: transitions.slow },
  exit: { opacity: 0, x: 12, y: -4, transition: transitions.fast },
};

export const sidebarVariants: Variants = {
  expanded: { width: 272, transition: transitions.slow },
  collapsed: { width: 88, transition: transitions.slow },
};

export const cardHover: TargetAndTransition = {
  y: -2,
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
};

export const buttonTap: TargetAndTransition = {
  scale: 0.985,
  transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] as const },
};

export const glowPulseVariants: Variants = {
  rest: { opacity: 0.8 },
  pulse: {
    opacity: [0.8, 1, 0.8],
    transition: { duration: 1.8, ease: 'easeInOut', repeat: Infinity },
  },
};

export const counterVariants: Variants = {
  initial: { opacity: 0, y: -6 },
  enter: { opacity: 1, y: 0, transition: transitions.normal },
};
