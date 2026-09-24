import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  rgbString,
  hslString,
  contrastColor,
  type RGB,
  type HSL,
} from "@/lib/color";

export const Route = createFileRoute("/converter")({
  head: () => ({
    meta: [
      { title: "Chroma — Converter" },
      {
        name: "description",
        content: "Convert colors between HEX, RGB, and HSL formats.",
      },
      { property: "og:title", content: "Chroma — Converter" },
      {
        property: "og:description",
        content: "Convert colors between HEX, RGB, and HSL formats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConverterPage,
});

const START = "#4F8CFF";

function parseRgb(s: string): RGB | null {
  const m = s.match(/(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/);
  if (!m) return null;
  const nums = [m[1], m[2], m[3]].map(Number);
  if (nums.some((n) => n < 0 || n > 255)) return null;
  return { r: nums[0], g: nums[1], b: nums[2] };
}

function parseHsl(s: string): HSL | null {
  const m = s.match(/(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/);
  if (!m) return null;
  const h = Number(m[1]);
  const sat = Number(m[2]);
  const l = Number(m[3]);
  if (sat < 0 || sat > 100 || l < 0 || l > 100) return null;
  return { h: ((h % 360) + 360) % 360, s: sat, l };
}

function ConverterPage() {
  const [hex, setHex] = useState(START);
  const [hexInput, setHexInput] = useState(START);
  const [rgbInput, setRgbInput] = useState("");
  const [hslInput, setHslInput] = useState("");
  const active = useRef<"hex" | "rgb" | "hsl" | null>(null);

  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb);

  useEffect(() => {
    if (active.current !== "hex") setHexInput(hex);
    if (active.current !== "rgb") setRgbInput(rgbString(rgb));
    if (active.current !== "hsl") setHslInput(hslString(hsl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  function commitHex(value: string) {
    setHexInput(value);
    active.current = "hex";
    const r = hexToRgb(value);
    if (r) setHex(rgbToHex(r));
  }

  function commitRgb(value: string) {
    setRgbInput(value);
    active.current = "rgb";
    const r = parseRgb(value);
    if (r) setHex(rgbToHex(r));
  }

  function commitHsl(value: string) {
    setHslInput(value);
    active.current = "hsl";
    const h = parseHsl(value);
    if (h) {
      const r = hslToRgb(h);
      setHex(rgbToHex(r));
    }
  }

  const hsv = rgbToHsv(rgb);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">Converter</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          Convert between HEX, RGB & HSL.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Type in any field — the others update live. Copy whichever you need.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div
          className="glass-card flex min-h-[220px] flex-col justify-between rounded-3xl p-6"
          style={{ backgroundColor: hex }}
        >
          <span
            className="font-display text-3xl font-bold"
            style={{ color: contrastColor(hex) }}
          >
            {hex}
          </span>
          <div className="text-xs" style={{ color: contrastColor(hex) }}>
            <p>HSV {hsv.h}° {hsv.s}% {hsv.v}%</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="HEX" value={hex}>
            <input
              value={hexInput}
              onFocus={() => (active.current = "hex")}
              onChange={(e) => commitHex(e.target.value)}
              spellCheck={false}
              className="focus-ring w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 font-mono text-sm uppercase"
            />
          </Field>
          <Field label="RGB" value={rgbString(rgb)}>
            <input
              value={rgbInput}
              onFocus={() => (active.current = "rgb")}
              onChange={(e) => commitRgb(e.target.value)}
              spellCheck={false}
              placeholder="r, g, b"
              className="focus-ring w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 font-mono text-sm"
            />
          </Field>
          <Field label="HSL" value={hslString(hsl)}>
            <input
              value={hslInput}
              onFocus={() => (active.current = "hsl")}
              onChange={(e) => commitHsl(e.target.value)}
              spellCheck={false}
              placeholder="h, s%, l%"
              className="focus-ring w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 font-mono text-sm"
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            Tip: enter RGB as “255, 99, 71” and HSL as “9, 100%, 64%”.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <CopyButton value={value} />
      </div>
      {children}
    </div>
  );
}
