import { Box, Text } from "@mantine/core";
import type { ReactNode } from "react";

// What separates the marker from the value it introduces.
const GAP = 5;
// Rough width of one character at the `size="xs"` these fields all use.
// Approximate on purpose: a section sized to its own content can't report
// its width back to the input, and the input needs a fixed padding to
// clear it — so the room is derived from the marker's length instead of
// measured. Fine for the short words these markers are ("X", "Text"); a
// long one would want a real measurement.
const CHARACTER = 6.5;
// What an icon marker is assumed to take instead — the size every one of
// them is rendered at (see `ICON_SIZE` in `IconToggle`). Same bargain as
// `CHARACTER`: assumed, not measured.
const ICON = 16;

/**
 * The white marker shown at the start of a property field — "X", "Y",
 * "Text", or a small icon where a word would be one too many (a
 * dimension's width/height, say). Drawn as the input's own `leftSection`
 * rather than through Mantine's `prefix`, which folds the text into the
 * formatted value inside the one `<input>`, where it can carry neither
 * its own colour nor its own spacing. Being inside the field also means
 * the bottom border the Properties tab draws under an unstyled input runs
 * beneath it.
 *
 * Decorative: every field carries its own `aria-label`, so the marker is
 * never the accessible name and must not swallow a click meant for the
 * input (see `leftSectionPointerEvents` at each call site).
 */
export function leadSection(lead: ReactNode) {
  if (lead === undefined || lead === null || lead === false) return undefined;
  return typeof lead === "string" ? (
    <Text size="xs" c="#ffffff">
      {lead}
    </Text>
  ) : (
    // `flex` so an icon sits on the field's own centre line rather than on
    // the text baseline it has none of; the colour is inherited by the
    // glyph, which draws in `currentColor`.
    <Box c="#ffffff" style={{ display: "flex", alignItems: "center" }}>
      {lead}
    </Box>
  );
}

/** The `padding-inline-start` an input needs to clear that marker — an
 * `unstyled` input has none of its own to build on. `extra` is for a
 * marker the `CHARACTER`/`ICON` approximation underestimates (a glyph
 * wider than a digit, say), which would otherwise sit right against its
 * own value. */
export function leadRoom(lead: ReactNode, extra = 0) {
  if (lead === undefined || lead === null || lead === false) return 0;
  const marker =
    typeof lead === "string" ? Math.ceil(lead.length * CHARACTER) : ICON;
  return marker + GAP + extra;
}
