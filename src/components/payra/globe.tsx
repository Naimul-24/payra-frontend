import { cn } from "@/lib/utils";

/**
 * Abstract white digital globe: network lines, nodes and a soft glow.
 * Pure SVG/CSS so it renders instantly and stays crisp on any screen.
 */
export function PayraGlobe({ className }: { className?: string }) {
  const nodes = [
    [90, 60],
    [150, 42],
    [58, 118],
    [176, 128],
    [112, 168],
    [70, 176],
    [200, 84],
    [128, 100],
  ];

  return (
    <div className={cn("relative aspect-square w-full max-w-[520px]", className)}>
      <div className="absolute inset-[12%] rounded-full bg-primary-foreground/12 blur-3xl" />
      <svg viewBox="0 0 240 240" className="relative size-full animate-float" role="img" aria-label="Global payment network illustration">
        <defs>
          <radialGradient id="payra-globe-glow" cx="42%" cy="34%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="60%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="120" cy="120" r="100" fill="url(#payra-globe-glow)" />
        <circle cx="120" cy="120" r="98" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1" />

        <g className="origin-center animate-spin-slow" stroke="white" fill="none" strokeWidth="0.9">
          <ellipse cx="120" cy="120" rx="98" ry="38" strokeOpacity="0.28" />
          <ellipse cx="120" cy="120" rx="98" ry="66" strokeOpacity="0.2" />
          <ellipse cx="120" cy="120" rx="40" ry="98" strokeOpacity="0.24" />
          <ellipse cx="120" cy="120" rx="72" ry="98" strokeOpacity="0.16" />
          <line x1="22" y1="120" x2="218" y2="120" strokeOpacity="0.28" />
        </g>

        {/* abstract continents */}
        <g fill="white" fillOpacity="0.85">
          <path d="M62 92c10-14 26-18 38-12s8 18 20 20 22-8 30 0-6 20-18 22-16 12-30 10-24-10-30-20-16-8-10-20Z" />
          <path d="M132 148c8-8 22-8 30-2s6 16-4 20-22 4-28-4-4-10 2-14Z" fillOpacity="0.55" />
          <path d="M74 150c8-4 18-2 22 6s-2 16-12 16-18-6-18-12 2-8 8-10Z" fillOpacity="0.5" />
        </g>

        {/* network lines */}
        <g stroke="white" strokeOpacity="0.5" strokeWidth="0.8">
          <path d="M90 60 L150 42 M90 60 L58 118 M150 42 L200 84 M58 118 L112 168 M112 168 L176 128 M176 128 L200 84 M128 100 L90 60 M128 100 L176 128 M70 176 L112 168" />
        </g>

        {/* nodes */}
        <g>
          {nodes.map(([x, y], i) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="6" fill="white" fillOpacity="0.14">
                <animate
                  attributeName="r"
                  values="4;9;4"
                  dur={`${3 + (i % 4)}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={x} cy={y} r="2.6" fill="white" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
