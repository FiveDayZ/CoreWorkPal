import type React from "react";
import type { CoreCatStarParticle } from "../../animation/animationTypes";

export function ClickStars({ stars }: { stars: CoreCatStarParticle[] }) {
  return (
    <>
      {stars.map((star) => (
        <span
          className="corecat-click-star"
          key={star.id}
          style={
            {
              "--star-delay": `${star.delayMs}ms`,
              "--star-dx": `${star.dx}px`,
              "--star-dy": `${star.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}
