import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ColorPicker } from "@/components/ColorPicker";
import { CopyButton } from "@/components/CopyButton";
import {
  hsvToHex,
  hsvToHsl,
  paletteSchemes,
  contrastColor,
  type HSV,
} from "@/lib/color";

export const Route = createFileRoute("/palettes")({
  head: () => ({
    meta: [
      { title: "Chroma — Palettes" },
      {
        name: "description",
        content: "Generate harmonious color palettes from any base color.",
      },
      { property: "og:title", content: "Chroma — Palettes" },
      {
        property: "og:description",
        content: "Generate harmonious color palettes from any base color.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PalettesPage,
});

function PalettesPage() {
  const [hsv, setHsv] = useState<HSV>({ h: 26, s: 85, v: 98 });
  const baseHex = hsvToHex(hsv);
  const hsl = hsvToHsl(hsv);

  const schemes = useMemo(() => paletteSchemes(baseHex), [baseHex]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">Palettes</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          Build a palette from one color.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick a base color and instantly get complementary, analogous, triadic,
          tetradic, and monochromatic sets. Tap a swatch to copy.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          <ColorPicker hsv={hsv} onChange={setHsv} />
          <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ backgroundColor: baseHex }}>
            <span
              className="font-display text-lg font-bold"
              style={{ color: contrastColor(baseHex) }}
            >
              {baseHex}
            </span>
            <CopyButton value={baseHex} label="Copy" />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {hsl.h}° · {hsl.s}% · {hsl.l}%
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {schemes.map((scheme) => (
            <div key={scheme.name} className="glass-card rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold">
                  {scheme.name}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {scheme.colors.length} colors
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {scheme.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => navigator.clipboard?.writeText(c).catch(() => {})}
                    className="group relative flex h-24 flex-col justify-end overflow-hidden rounded-xl ring-1 ring-border transition-transform hover:scale-[1.03]"
                    style={{ backgroundColor: c }}
                  >
                    <span
                      className="px-2 py-1.5 text-left font-mono text-xs"
                      style={{ color: contrastColor(c) }}
                    >
                      {c}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-center text-xs text-muted-foreground">
            Click any swatch to copy its HEX value
          </p>
        </div>
      </div>
    </div>
  );
}
