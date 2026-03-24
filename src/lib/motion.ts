import type { Variants, Transition } from 'framer-motion';

// ─── Transition Presets ───
export const transitions = {
    fast: { duration: 0.1, ease: 'easeOut' } as Transition,
    normal: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } as Transition,
    slow: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as Transition,
    page: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } as Transition,
    spring: { type: 'spring', stiffness: 120, damping: 14 } as Transition,
    springTight: { type: 'spring', stiffness: 260, damping: 22 } as Transition,
    springBounce: { type: 'spring', stiffness: 350, damping: 18 } as Transition,
    smooth: { duration: 0.6, ease: [0.45, 0.05, 0.55, 0.95] } as Transition,
    glowPulse: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } as Transition,
};

// ─── Page Variants (crossfade + scale-up) ───
export const pageVariants: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.99,
        transition: { duration: 0.3, ease: 'easeIn' },
    },
};

// ─── Fade Variants ───
export const fadeVariants: Variants = {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: transitions.normal },
    exit: { opacity: 0, transition: transitions.fast },
};

// ─── Scale Fade (for modals, popovers) ───
export const scaleFadeVariants: Variants = {
    initial: { opacity: 0, scale: 0.92, filter: 'blur(4px)' },
    enter: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: { type: 'spring', stiffness: 200, damping: 20 },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(2px)',
        transition: { duration: 0.2, ease: 'easeOut' },
    },
};

// ─── Slide variants ───
export const slideUpVariants: Variants = {
    initial: { opacity: 0, y: 24 },
    enter: { opacity: 1, y: 0, transition: transitions.slow },
    exit: { opacity: 0, y: 12, transition: transitions.normal },
};

export const slideRightVariants: Variants = {
    initial: { opacity: 0, x: 24 },
    enter: { opacity: 1, x: 0, transition: transitions.slow },
    exit: { opacity: 0, x: 24, transition: transitions.normal },
};

// ─── Stagger Container (slowed, more dramatic) ───
export const staggerContainer: Variants = {
    initial: {},
    enter: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.08,
        },
    },
};

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 16, scale: 0.97 },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
};

// ─── Stagger for table rows / list items ───
export const staggerList: Variants = {
    initial: {},
    enter: {
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.02,
        },
    },
};

export const staggerListItem: Variants = {
    initial: { opacity: 0, x: -8 },
    enter: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
};

// ─── Toast ───
export const toastVariants: Variants = {
    initial: { opacity: 0, x: 60, scale: 0.9, filter: 'blur(4px)' },
    enter: {
        opacity: 1,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { type: 'spring', stiffness: 200, damping: 18 },
    },
    exit: {
        opacity: 0,
        x: 40,
        scale: 0.95,
        filter: 'blur(2px)',
        transition: { duration: 0.25, ease: 'easeIn' },
    },
};

// ─── Sidebar ───
export const sidebarVariants: Variants = {
    expanded: { width: 260, transition: transitions.slow },
    collapsed: { width: 72, transition: transitions.slow },
};

// ─── Card Hover (lift + glow) ───
export const cardHover = {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.25, ease: 'easeOut' },
};

// ─── Button Press (scale down, tactile) ───
export const buttonTap = {
    scale: 0.95,
    transition: { duration: 0.08, ease: 'easeOut' },
};

// ─── Glow Pulse (for timer or emphasis) ───
export const glowPulseVariants: Variants = {
    rest: { boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)' },
    pulse: {
        boxShadow: [
            '0 0 20px rgba(139, 92, 246, 0.15)',
            '0 0 40px rgba(139, 92, 246, 0.35)',
            '0 0 20px rgba(139, 92, 246, 0.15)',
        ],
        transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
};

// ─── Number counter animation helper ───
export const counterVariants: Variants = {
    initial: { opacity: 0, y: -8, scale: 0.9 },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
};
