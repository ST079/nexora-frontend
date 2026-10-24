import { CheckCircle2, ClipboardCheck, Clock, Truck } from "lucide-react";

const TIMELINE = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
// A dollar sign read as "paid", but confirmation doesn't mean payment (COD).
const ICONS = [Clock, ClipboardCheck, Truck, CheckCircle2];

const OrderTimeline = ({ status }) => {
  const current = TIMELINE.indexOf(status?.toUpperCase());
  if (current === -1) return null;

  return (
    <div className="card-frame p-6">
      <p className="eyebrow dark:text-[#8b8fa8] mb-5">Order progress</p>
      <ol className="flex items-start">
        {TIMELINE.map((step, i) => {
          const done = i <= current;
          const active = i === current;
          const Icon = ICONS[i];
          return (
            <li
              key={step}
              aria-current={active ? "step" : undefined}
              className="flex-1 flex flex-col items-center"
            >
              <div className="w-full flex items-center">
                {i > 0 && (
                  <div
                    className={`flex-1 h-px ${i <= current ? "bg-signal" : "bg-hairline dark:bg-[#262932]"}`}
                  />
                )}
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center border transition-colors ${
                    active
                      ? "border-signal bg-signal text-paper"
                      : done
                        ? "border-signal bg-signal/10 text-signal"
                        : "border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8]"
                  }`}
                >
                  <Icon size={14} aria-hidden />
                </div>
                {i < TIMELINE.length - 1 && (
                  <div
                    className={`flex-1 h-px ${i < current ? "bg-signal" : "bg-hairline dark:bg-[#262932]"}`}
                  />
                )}
              </div>
              <p
                className={`font-mono text-[10px] uppercase tracking-widest mt-2 text-center ${
                  done
                    ? "text-ink dark:text-[#f0efe8]"
                    : "text-slate dark:text-[#8b8fa8]"
                }`}
              >
                {step}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderTimeline;
