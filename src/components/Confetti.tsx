import React, { useMemo, CSSProperties, ReactElement } from "react";
import "./Confetti.css";

/* eslint-disable react-hooks/purity */

const COLORS = ["#06d6a0", "#8b5cf6", "#f59e0b", "#ef476f", "#118ab2", "#ffd166", "#06d6a0"];
const SHAPES = ["50%", "0%", "30%"];

/**
 * Type for a confetti piece
 */
interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  borderRadius: string;
  width: number;
  height: number;
  delay: number;
  fallDuration: number;
}

/**
 * Confetti component props
 */
interface ConfettiProps {
  /** Number of confetti pieces to generate */
  count?: number;
  /** Total duration of the animation in milliseconds */
  duration?: number;
}

/**
 * Random number generator helper
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Confetti component
 * Displays animated falling confetti pieces
 *
 * @param {ConfettiProps} props - Component props
 * @returns {ReactElement} Confetti animation container
 */
export default function Confetti({ count = 60, duration = 3000 }: ConfettiProps): ReactElement {
  // Math.random in useMemo is safe: useMemo controls execution and we want different values per dependency change
  /* eslint-disable-next-line react-hooks/purity */
  const pieces = useMemo((): ConfettiPiece[] => {
    // Math.random() is acceptable here since useMemo controls when this computation runs
    // and we want different values each time the dependency changes
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
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              borderRadius: p.borderRadius,
              width: `${p.width}px`,
              height: `${p.height}px`,
              "--fall-delay": `${p.delay}s`,
              "--fall-duration": `${p.fallDuration}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
