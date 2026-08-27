export type NamedFontSize = "xs" | "sm" | "md" | "lg" | "xl";
export type FontSize = NamedFontSize | number;

const namedFontSizes: Record<NamedFontSize, number> = {
  xs: 2.5,
  sm: 3.2,
  md: 4,
  lg: 5,
  xl: 6,
};

export const fontSizeMarks = Object.entries(namedFontSizes).map(
  ([label, value]) => ({ label, value }),
);

export function fontSizeValue(size: FontSize | undefined) {
  if (typeof size === "number" && Number.isFinite(size)) return size;
  return namedFontSizes[typeof size === "string" ? size : "md"];
}
