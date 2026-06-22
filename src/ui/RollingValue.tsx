import type React from "react";

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames.filter(Boolean).join(" ");
}

export function RollingValue({
  ariaLabel,
  className,
  value,
}: {
  ariaLabel?: string;
  className?: string;
  value: string;
}) {
  return (
    <span
      aria-label={ariaLabel ?? value}
      className={joinClassNames("cwp-roll-value", className)}
      role="text"
    >
      {Array.from(value).map((character, index) => (
        <span
          aria-hidden="true"
          className="cwp-roll-char"
          key={`${value}-${index}-${character}`}
          style={
            {
              "--roll-delay": `${Math.min(index, 8) * 14}ms`,
            } as React.CSSProperties
          }
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}
