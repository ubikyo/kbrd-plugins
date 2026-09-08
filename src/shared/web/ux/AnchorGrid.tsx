import { Box } from "@mantine/core";

export type AnchorVertical = "top" | "middle" | "bottom";
export type AnchorHorizontal = "left" | "center" | "right";
/** One of the nine points of a box, as `<vertical>-<horizontal>`. */
export type AnchorValue = `${AnchorVertical}-${AnchorHorizontal}`;

const VERTICALS: AnchorVertical[] = ["top", "middle", "bottom"];
const HORIZONTALS: AnchorHorizontal[] = ["left", "center", "right"];

const SQUARE = 7;
const GAP = 2;

/** The factor a box's own size is multiplied by to offset it from the
 * point — 0 leaves the point at its leading edge, 1 at its trailing one.
 * Exported so renderers resolve an anchor the same way this control
 * pictures it. */
export const ANCHOR_FACTORS: Record<AnchorVertical | AnchorHorizontal, number> =
  {
    top: 0,
    middle: 0.5,
    bottom: 1,
    left: 0,
    center: 0.5,
    right: 1,
  };

export function anchorParts(value: AnchorValue | undefined) {
  const [vertical, horizontal] = (value ?? "top-left").split("-");
  return {
    vertical: vertical as AnchorVertical,
    horizontal: horizontal as AnchorHorizontal,
  };
}

type Props = {
  value: AnchorValue;
  onChange: (value: AnchorValue) => void;
  disabled?: boolean;
  "aria-label": string;
};

/**
 * Nine 7px squares, one of which is on: which point of a box a pair of
 * coordinates addresses. Deliberately tiny and wordless, to sit inline
 * among the compact property fields rather than take a row of its own.
 *
 * Not to be confused with `Placement`'s own 3x3 picker, which chooses
 * where a box sits *on the element*. This one says which point *of the
 * box* the X/Y refer to — the two are complementary, and only this one is
 * of any use once explicit coordinates are in play.
 *
 * A radio group, not nine toggles: exactly one point is addressed at a
 * time, and picking another is what releases the last.
 */
export default function AnchorGrid({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <Box
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(3, ${SQUARE}px)`,
        gap: GAP,
        width: "fit-content",
      }}
    >
      {VERTICALS.flatMap((vertical) =>
        HORIZONTALS.map((horizontal) => {
          const point: AnchorValue = `${vertical}-${horizontal}`;
          const active = point === value;
          return (
            <Box
              key={point}
              component="button"
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${vertical} ${horizontal}`}
              disabled={disabled}
              onClick={() => onChange(point)}
              style={{
                width: SQUARE,
                height: SQUARE,
                padding: 0,
                // The 7px is the whole square, border included — without
                // this the border would be drawn outside it and each cell
                // would come to 9px.
                boxSizing: "border-box",
                cursor: disabled ? "default" : "pointer",
                backgroundColor: active ? "#ffffff" : "var(--kbrd-color-body)",
                border: `1px solid ${
                  active ? "#ffffff" : "var(--kbrd-border-color)"
                }`,
              }}
            />
          );
        }),
      )}
    </Box>
  );
}
