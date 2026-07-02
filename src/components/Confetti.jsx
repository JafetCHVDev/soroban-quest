import React, { useMemo } from "react";
import "./Confetti.css";

const COLORS = ["#06d6a0", "#8b5cf6", "#f59e0b", "#ef476f", "#118ab2", "#ffd166", "#06d6a0"];
const SHAPES = ["50%", "0%", "30%"];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Confetti({ count = 60, duration = 3000 }) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      borderRadius: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      width: randomBetween(6, 12),
      height: randomBetween(6, 12),
      delay: randomBetween(0, duration / 1000),
      fallDuration: randomBetween(1.5, 3.5),
    }));
  }, [count, duration]);

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            borderRadius: p.borderRadius,
            width: `${p.width}px`,
            height: `${p.height}px`,
            "--fall-delay": `${p.delay}s`,
            "--fall-duration": `${p.fallDuration}s`,
          }}
        />
      ))}
    </div>
  );
}
