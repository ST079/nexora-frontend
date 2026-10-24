// Shared motion vocabulary. Everything here respects the visitor's reduced
// motion setting through <MotionConfig reducedMotion="user"> in redux/provider.js.

export const EASE_OUT = [0.16, 1, 0.3, 1];

export const spring = { type: "spring", stiffness: 420, damping: 32 };
export const softSpring = { type: "spring", stiffness: 260, damping: 26 };
export const bouncy = { type: "spring", stiffness: 520, damping: 18 };

// Entrance animation for page sections: `<motion.div {...fadeUp(0.1)}>`.
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE_OUT },
});

// Same, but plays when the element scrolls into view (once).
export const revealUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: EASE_OUT },
});

// Parent/child pair for lists: `<motion.ul variants={stagger()} initial="hidden"
// animate="show">` with `<motion.li variants={item}>` children.
export const stagger = (gap = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const popIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: bouncy },
};

// Modal panel: rises and settles with a spring; the backdrop just fades.
export const modalPanel = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: softSpring },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.15 } },
};

export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Hover lift for cards and tappable tiles.
export const lift = {
  whileHover: { y: -4 },
  whileTap: { scale: 0.98 },
  transition: spring,
};
