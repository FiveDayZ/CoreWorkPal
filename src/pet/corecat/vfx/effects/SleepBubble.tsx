import type React from "react";

export function SleepBubble({ sleepBreath }: { sleepBreath: number }) {
  return (
    <span
      className="corecat-sleep-bubble"
      style={
        {
          "--sleep-bubble-scale": 0.12 + sleepBreath * 0.88,
          "--sleep-bubble-opacity": 0.35 + sleepBreath * 0.4,
        } as React.CSSProperties
      }
    />
  );
}
