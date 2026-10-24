import React from "react";

// Three bouncing dots in the brand colours.
const Loader = ({ label = "Loading" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24" role="status">
      <div className="flex items-end gap-1.5" aria-hidden>
        {["bg-signal", "bg-marigold", "bg-blueprint"].map((tone, i) => (
          <span
            key={tone}
            className={`h-3 w-3 rounded-full ${tone} animate-bounce`}
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-slate">{label}…</p>
    </div>
  );
};

export default Loader;
