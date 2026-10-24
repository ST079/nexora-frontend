// Sends a small copy of the product photo from `fromEl` into whichever cart
// button is on screen (header on desktop, tab bar on phones), then nudges it.
// Plain DOM and the Web Animations API, so any component can call it.
export const CART_TARGET_ATTR = "data-cart-target";

const visibleCartTarget = () =>
  [...document.querySelectorAll(`[${CART_TARGET_ATTR}]`)].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });

export const flyToCart = (fromEl, imageSrc) => {
  if (typeof window === "undefined" || !fromEl) return;
  const target = visibleCartTarget();
  if (!target) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const from = fromEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, from.height, 120);

  const ghost = document.createElement("div");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "999px",
    backgroundImage: `url("${imageSrc}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "var(--color-signal)",
    boxShadow: "var(--shadow-lift)",
    zIndex: 9999,
    pointerEvents: "none",
  });
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const flight = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.55}px, ${dy * 0.2 - 80}px) scale(0.55)`,
        opacity: 1,
        offset: 0.55,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.4 },
    ],
    { duration: 720, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
  );

  flight.onfinish = () => {
    ghost.remove();
    target.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.25)" },
        { transform: "scale(0.92)" },
        { transform: "scale(1)" },
      ],
      { duration: 420, easing: "ease-out" },
    );
  };
};
