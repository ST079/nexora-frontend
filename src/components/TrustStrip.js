import { BadgeCheck, CreditCard, PackageCheck, Sparkle, Store, Truck, Wallet } from "lucide-react";

// Only things the store actually does. No delivery-time or returns promises
// until the business commits to them.
const FACTS = [
  { icon: Wallet, text: "Pay with Khalti" },
  { icon: CreditCard, text: "Card payments by Stripe" },
  { icon: Truck, text: "Cash on delivery" },
  { icon: PackageCheck, text: "Live stock counts" },
  { icon: BadgeCheck, text: "Track every order" },
  { icon: Store, text: "Trusted merchants" },
];

// One run of the band. It is rendered twice so the marquee loops seamlessly.
const Run = ({ hidden }) => (
  <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
    {FACTS.map(({ icon: Icon, text }) => (
      <li key={text} className="flex items-center gap-3 px-5 sm:px-7">
        <Icon size={18} strokeWidth={2.2} aria-hidden />
        <span className="whitespace-nowrap font-display text-lg font-semibold tracking-tight sm:text-xl">
          {text}
        </span>
        <Sparkle size={14} className="ml-5 fill-current sm:ml-7" aria-hidden />
      </li>
    ))}
  </ul>
);

const TrustStrip = () => {
  return (
    <section aria-label="Why shop with Nexora" className="relative overflow-hidden py-10 sm:py-14">
      {/* Back band: ink, running the other way */}
      <div
        aria-hidden
        className="absolute inset-x-[-5%] top-1/2 flex -translate-y-1/2 rotate-2 bg-night py-3.5 text-on-night/80"
      >
        <div className="flex animate-marquee [animation-direction:reverse]">
          <Run hidden />
          <Run hidden />
        </div>
      </div>

      {/* Front band: marigold, pauses on hover so it can be read */}
      <div className="group relative mx-[-5%] flex rotate-[-1.5deg] bg-marigold py-3.5 text-on-marigold shadow-lift">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
          <Run />
          <Run hidden />
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
