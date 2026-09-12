import { Box, Text } from "@mantine/core";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** What separates every marker from the value it introduces — one figure
 * for every field in these panels, whatever the marker is and whichever
 * plugin the field belongs to. Measured from the end of the marker's own
 * text, colon included. */
const GAP = 5;

// Rough width of one character at the `size="xs"` these fields all use,
// and of an icon marker (the size every one of them is rendered at — see
// `ICON_SIZE` in `IconToggle`). Both are the first paint's stand-in only:
// the marker is measured once it's on the page, so a wrong guess here
// costs a frame's worth of a loose gap rather than a permanently wrong
// one.
const CHARACTER = 6.5;
const ICON = 16;

/**
 * A marker that reads as a label gets the colon that introduces its
 * value — "URL :", "Open :", "Use this browser :". A single character
 * doesn't: the arrows a coordinate pair is marked with (see `Position`)
 * and the icons a dimension uses are pointing at their field, not naming
 * it, and "↔ :" is punctuation after a picture.
 *
 * The space before the colon is French typography, and it's a
 * non-breaking one: a plain space would let the colon fall to a line of
 * its own, away from the word it belongs to.
 */
function labelled(lead: string) {
  return lead.length > 1 ? `${lead}\u00a0:` : lead;
}

function estimateWidth(lead: ReactNode) {
  return typeof lead === "string"
    ? Math.ceil(labelled(lead).length * CHARACTER)
    : ICON;
}

/**
 * The white marker shown at the start of a property field — "Text :",
 * "Use this browser :", or a small icon where a word would be one too many
 * (a dimension's width/height, say) — together with the room the value
 * beside it needs to clear it. A marker that names its field carries the
 * colon that introduces the value; see `labelled` for the one that
 * doesn't.
 *
 * Drawn as the input's own `leftSection` rather than through Mantine's
 * `prefix`, which folds the text into the formatted value inside the one
 * `<input>`, where it can carry neither its own colour nor its own
 * spacing. Being inside the field also means the bottom border the
 * Properties tab draws under an unstyled input runs beneath it.
 *
 * `room` is measured rather than derived from the marker's length. The
 * section is sized to its own content and can't report that width back to
 * the input, which needs a fixed padding to clear it — so the width is
 * read off the page and `GAP` added to it. That's what keeps the gap the
 * same whether the marker is "X", an arrow, or a whole question, and it's
 * why no field needs a fudge factor of its own for a marker wider than
 * the estimate would have it.
 *
 * `extra` is room *before* the marker, for a field that insets it from
 * its own left edge — rare, and not the default: a marker starts where
 * its field does.
 *
 * The estimate above stands in for the first paint, before there's
 * anything to measure — the marker never overlaps its own value, the gap
 * only settles from approximate to exact.
 *
 * Decorative: every field carries its own `aria-label`, so the marker is
 * never the accessible name and must not swallow a click meant for the
 * input (see `leftSectionPointerEvents` at each call site).
 */
export function useLeadSection(
  lead: ReactNode,
  { color = "var(--kbrd-color-contrast)", extra = 0 }: {
    color?: string;
    extra?: number;
  } = {},
) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  // No dependency on `lead` itself: an icon marker is a fresh element on
  // every render, which would re-run this every time. The observer covers
  // a changed marker anyway — new text is a new width for the same box.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setWidth(node.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (lead === undefined || lead === null || lead === false) {
    return { section: undefined, room: 0 };
  }

  return {
    section: (
      // `flex` so an icon sits on the field's own centre line rather than
      // on the text baseline it has none of; the colour is inherited by a
      // glyph, which draws in `currentColor`.
      <Box
        ref={ref}
        c={color}
        style={{ display: "flex", alignItems: "center" }}
      >
        {typeof lead === "string" ? (
          <Text size="xs" c={color}>
            {labelled(lead)}
          </Text>
        ) : (
          lead
        )}
      </Box>
    ),
    room: (width ?? estimateWidth(lead)) + GAP + extra,
  };
}
