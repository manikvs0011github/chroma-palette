import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ColorPicker } from "@/components/ColorPicker";
import { CopyButton } from "@/components/CopyButton";
import {
  hsvToHex,
  hsvToHsl,
  hsvToRgb,
  rgbString,
  hslString,
  hexToHsv,
  type HSV,
} from "@/lib/color";

const SAVED_KEY = "chroma.saved.colors";

function loadSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chroma — Color Picker" },
      {
        name: "description",
        content: "Pick any color and copy it as HEX, RGB, or HSL.",
      },
      { property: "og:title", content: "Chroma — Color Picker" },
      {
        property: "og:description",
        content: "Pick any color and copy it as HEX, RGB, or HSL.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PickerPage,
});

function PickerPage() {
  const [hsv, setHsv] = useState<HSV>({ h: 212, s: 78, v: 96 });
  const [saved, setSaved] = useState<string[]>([]);
  const [hexInput, setHexInput] = useState("");

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const hex = hsvToHex(hsv);
  const rgb = hsvToRgb(hsv);
  const hsl = hsvToHsl(hsv);

  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  function saveColor() {
    setSaved((prev) => {
      if (prev.includes(hex)) return prev;
      const next = [hex, ...prev].slice(0, 12);
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeColor(c: string) {
    setSaved((prev) => {
      const next = prev.filter((x) => x !== c);
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }

  function applyHex(value: string) {
    setHexInput(value);
    const next = hexToHsv(value);
    if (next) setHsv(next);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">Color Picker</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          Find the exact color you need.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Drag the square to choose a shade, slide the rainbow for hue, and copy
          the value in any format.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          <ColorPicker hsv={hsv} onChange={setHsv} />
        </div>

        <div className="flex flex-col gap-5">
          <div
            className="glass-card flex items-center justify-between gap-4 rounded-3xl p-5 sm:p-6"
            style={{ backgroundColor: hex }}
          >
            <span
              className="font-display text-2xl font-bold sm:text-3xl"
              style={{ color: "oklch(0.16 0 0)" }}
            >
              {hex}
            </span>
            <CopyButton value={hex} label="Copy HEX" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ValueCard
              label="HEX"
              value={hex}
              input={
                <input
                  value={hexInput}
                  onChange={(e) => applyHex(e.target.value)}
                  spellCheck={false}
                  className="focus-ring w-full rounded-lg border border-input bg-background/50 px-3 py-2 font-mono text-sm uppercase"
                />
              }
            />
            <ValueCard label="RGB" value={rgbString(rgb)} sub={rgbString(rgb)} />
            <ValueCard label="HSL" value={hslString(hsl)} sub={hslString(hsl)} />
            <div className="glass-card flex items-center justify-between rounded-2xl p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Save
              </span>
              <button
                onClick={saveColor}
                className="focus-ring rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Save color
              </button>
            </div>
          </div>

          {saved.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Saved colors
                </span>
                <button
                  onClick={() => {
                    setSaved([]);
                    localStorage.removeItem(SAVED_KEY);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {saved.map((c) => (
                  <button
                    key={c}
                    title={c}
                    onClick={() => applyHex(c)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      removeColor(c);
                    }}
                    className="h-10 w-10 rounded-lg ring-1 ring-border transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Tap to load · right-click to remove
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ValueCard({
  label,
  value,
  sub,
  input,
}: {
  label: string;
  value: string;
  sub?: string;
  input?: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <CopyButton value={value} />
      </div>
      {input ?? (
        <p className="font-mono text-sm">{sub}</p>
      )}
    </div>
  );
}
