import type React from "react";

const cubes = Array.from({ length: 8 }, (_, index) => ({
  delay: index * 130,
  x: 112 + (index % 3) * 9,
  y: 76 + Math.floor(index / 3) * 11,
}));

export function DataCubes({ count }: { count: number }) {
  return (
    <div className="corecat-data-cubes" aria-hidden="true">
      {cubes.slice(0, count).map((cube, index) => (
        <span
          className="corecat-data-cube"
          key={index}
          style={
            {
              "--data-cube-delay": `${cube.delay}ms`,
              "--data-cube-x": `${cube.x}px`,
              "--data-cube-y": `${cube.y}px`,
            } as React.CSSProperties
          }
        />
      ))}
      <span className="corecat-pouch-glow" />
    </div>
  );
}
