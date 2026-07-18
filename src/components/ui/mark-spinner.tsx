export function MarkSpinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 22 L56 32 L32 56 Z" pathLength={100} strokeDasharray="54 46">
        <animate
          attributeName="stroke-dashoffset"
          from="100"
          to="0"
          dur="1.8s"
          begin="0s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M78 78 L44 68 L68 44 Z" pathLength={100} strokeDasharray="54 46">
        <animate
          attributeName="stroke-dashoffset"
          from="100"
          to="0"
          dur="1.8s"
          begin="-0.6s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M25 75 L75 25" pathLength={100} strokeDasharray="54 46">
        <animate
          attributeName="stroke-dashoffset"
          from="100"
          to="0"
          dur="1.8s"
          begin="-1.2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
