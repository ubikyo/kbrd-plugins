import {
  ANCHOR_FACTORS,
  anchorParts,
  type AnchorValue,
} from "./ux/AnchorGrid";
import { DEFAULT_UNIT, UNIT_ORIGIN, type Unit } from "./ux/UnitSelect";

/**
 * The geometry the web renderers share, so a `%`/`mm` value means exactly
 * the same thing wherever it's read — and so it keeps meaning the same
 * thing as in `shared/dev/placement.py`, which is the Kivy side of these
 * very formulas.
 *
 * Every length here is in the SVG's own space, which is the display's:
 * one millimetre of config is one unit of `viewBox` (see `Display` in
 * kbrd-web, and the font size every label already reads straight off its
 * config).
 */

/** How far along one axis a coordinate lands, measured from the cell's own
 * leading edge on it: a share of the cell in `%`, a plain offset in `mm`. */
export function offsetIn(
  unit: Unit | undefined,
  value: number | undefined,
  extent: number,
) {
  const resolved = unit ?? DEFAULT_UNIT;
  const coordinate = value ?? UNIT_ORIGIN[resolved];
  return resolved === "mm"
    ? coordinate
    : // A share of the cell is only ever a share of it: the editor's own
      // fields stop at 0 and 100, and a stored value from anywhere else
      // (an older config, a hand-edited one) is held to the same range.
      (extent * Math.min(100, Math.max(0, coordinate))) / 100;
}

/** How long a side comes out: a share of the cell's own side in `%`, that
 * many units in `mm`. Same formula as `offsetIn` — a size and a
 * coordinate are measured the same way — but kept as its own name because
 * a caller reads much better for it. */
export function sizeIn(
  unit: Unit | undefined,
  value: number | undefined,
  extent: number,
) {
  return Math.max(0, offsetIn(unit, value, extent));
}

/** The top-left corner of a `width`x`height` box whose `anchor` point is
 * the one landing on (`pointX`, `pointY`) — the box pushed back from the
 * point by whichever of its own nine points is anchored there. */
export function anchoredCorner(
  anchor: AnchorValue | undefined,
  pointX: number,
  pointY: number,
  width: number,
  height: number,
) {
  const { vertical, horizontal } = anchorParts(anchor);
  return {
    x: pointX - width * (ANCHOR_FACTORS[horizontal] ?? 0),
    y: pointY - height * (ANCHOR_FACTORS[vertical] ?? 0),
  };
}
