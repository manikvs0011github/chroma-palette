import { useCallback, useRef, useState } from "react";
import type { HSV } from "@/lib/color";

interface ColorPickerProps {
  hsv: HSV;
  onChange: (hsv: HSV) => void;
}

export function ColorPicker({ hsv, onChange }: ColorPickerProps) {
  const squareRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hueDragging, setHueDragging] = useState(false);

  const updateSV = useCallback(
    (clientX: number, clientY: number) => {
      const el = squareRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
      onChange({ h: hsv.h, s: x / rect.width, v: 1 - y / rect.height });
    },
    [hsv.h, onChange]
  );

  const updateHue = useCallback(
    (clientX: number) => {
      const el = hueRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      onChange({ h: (x / rect.width) * 360, s: hsv.s, v: hsv.v });
    },
    [hsv.s, hsv.v, onChange]
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={squareRef}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setDragging(true);
          updateSV(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging && updateSV(e.clientX, e.clientY)}
        onPointerUp={() => setDragging(false)}
        className="relative aspect-square w-full touch-none cursor-crosshair rounded-2xl overflow-hidden shadow-lg ring-1 ring-border"
        style={{
          backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
          backgroundImage:
            "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
      >
        <div
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            borderColor: "#ffffff",
            backgroundColor: "transparent",
          }}
        />
      </div>

      <div
        ref={hueRef}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setHueDragging(true);
          updateHue(e.clientX);
        }}
        onPointerMove={(e) => hueDragging && updateHue(e.clientX)}
        onPointerUp={() => setHueDragging(false)}
        className="relative h-7 w-full touch-none cursor-pointer rounded-full shadow-inner ring-1 ring-border"
        style={{
          background:
            "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-8 w-4 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 shadow"
          style={{
            left: `${(hsv.h / 360) * 100}%`,
            borderColor: "#ffffff",
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
          }}
        />
      </div>
    </div>
  );
}
