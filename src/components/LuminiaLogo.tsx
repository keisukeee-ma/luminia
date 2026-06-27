export default function LuminiaLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Luminia"
    >
      <g stroke="#1C2B38" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
        <line x1="12" y1="7"    x2="12"   y2="3"   />
        <line x1="16.3" y1="9.5"  x2="19.8" y2="7.5" />
        <line x1="16.3" y1="14.5" x2="19.8" y2="16.5"/>
        <line x1="12"   y1="17"   x2="12"   y2="21"  />
        <line x1="7.7"  y1="14.5" x2="4.2"  y2="16.5"/>
        <line x1="7.7"  y1="9.5"  x2="4.2"  y2="7.5" />
      </g>
      <circle cx="12" cy="12" r="5" fill="#A8843C" opacity="0.15" />
      <circle cx="12" cy="12" r="3.5" fill="#A8843C" />
    </svg>
  );
}
