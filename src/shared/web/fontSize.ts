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

// A `Select`'s own `data` shape for the same named sizes — the dropdown
// only ever offers one of these named steps (`FontSize` also accepts an
// arbitrary number, e.g. from before Size was a dropdown, but nothing
// currently writes one — see `fontSizeValue` for what still reads one).
export const fontSizeOptions: { value: NamedFontSize; label: string }[] = (
  Object.keys(namedFontSizes) as NamedFontSize[]
).map((size) => ({ value: size, label: size.toUpperCase() }));

export function fontSizeValue(size: FontSize | undefined) {
  if (typeof size === "number" && Number.isFinite(size)) return size;
  return namedFontSizes[typeof size === "string" ? size : "md"];
}
