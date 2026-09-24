export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };
export type HSV = { h: number; s: number; v: number };

const clamp255 = (n: number) => Math.round(Math.min(Math.max(n, 0), 255));

export function hexToRgb(hex: string): RGB | null {
  let h = hex.replace(/^#/, "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const to = (n: number) => clamp255(n).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return { r: clamp255((r1 + m) * 255), g: clamp255((g1 + m) * 255), b: clamp255((b1 + m) * 255) };
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return { r: clamp255((r1 + m) * 255), g: clamp255((g1 + m) * 255), b: clamp255((b1 + m) * 255) };
}

export const hsvToHex = (h: HSV) => rgbToHex(hsvToRgb(h));
export const hsvToHsl = (h: HSV) => rgbToHsl(hsvToRgb(h));
export const hslToHex = (h: HSL) => rgbToHex(hslToRgb(h));
export const hexToHsv = (hex: string): HSV | null => {
  const r = hexToRgb(hex);
  return r ? rgbToHsv(r) : null;
};

export const rgbString = ({ r, g, b }: RGB) => `rgb(${r}, ${g}, ${b})`;
export const hslString = ({ h, s, l }: HSL) => `hsl(${h}, ${s}%, ${l}%)`;

export function contrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 140 ? "#0b0f1a" : "#ffffff";
}

export interface PaletteSet {
  name: string;
  colors: string[];
}

export function paletteSchemes(baseHex: string): PaletteSet[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb);
  const mk = (h: number, s = hsl.s, l = hsl.l) =>
    hslToHex({ h: ((h % 360) + 360) % 360, s, l });
  return [
    { name: "Complementary", colors: [baseHex, mk(hsl.h + 180)] },
    { name: "Analogous", colors: [mk(hsl.h - 30), baseHex, mk(hsl.h + 30)] },
    { name: "Triadic", colors: [baseHex, mk(hsl.h + 120), mk(hsl.h + 240)] },
    { name: "Tetradic", colors: [baseHex, mk(hsl.h + 90), mk(hsl.h + 180), mk(hsl.h + 270)] },
    {
      name: "Monochromatic",
      colors: [0, 1, 2, 3, 4].map((i) =>
        hslToHex({ h: hsl.h, s: Math.max(hsl.s, 35), l: 22 + i * 15 })
      ),
    },
  ];
}
