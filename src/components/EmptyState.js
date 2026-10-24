import { PackageSearch } from "lucide-react";

const EmptyState = ({ title, description, action, icon: Icon = PackageSearch }) => {
  return (
    <div className="relative overflow-hidden rounded-card border border-dashed border-ink/15 bg-panel/60 px-6 py-20 text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-signal/10 blur-3xl"
      />
      <span className="relative mx-auto mb-5 grid h-16 w-16 animate-float place-items-center rounded-[1.4rem] bg-signal-tint text-signal">
        <Icon size={28} aria-hidden strokeWidth={1.7} />
      </span>
      <p className="relative font-display text-2xl font-bold text-ink">{title}</p>
      {description && (
        <p className="relative mx-auto mt-2 max-w-md text-sm text-slate">{description}</p>
      )}
      {action && <div className="relative mt-6 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
