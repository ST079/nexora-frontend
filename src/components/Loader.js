import React from "react";

const Loader = ({ label = "Loading" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 bg-ink dark:bg-[#f0efe8] animate-blink"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
      <p className="eyebrow dark:text-[#8b8fa8]">{label}…</p>
    </div>
  );
};

export default Loader;