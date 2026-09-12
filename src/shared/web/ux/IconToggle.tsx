import { ActionIcon } from "@mantine/core";
import type { IconType } from "react-icons";

// The icon size every one of these buttons draws at; the box around it
// comes from `ActionIcon size="md"`. Exported because the controls that
// sit *beside* a row of them (a separator, a field's own icon marker)
// have to match it.
export const ICON_SIZE = 16;

// The corner each button is rounded by, on its own and inside an
// `ActionIcon.Group` alike — see the two style properties below.
const RADIUS = 4;

// `ActionIcon size="md"`, in pixels — what a button that states no `size`
// of its own comes out as, and what a `glyph` face has to be measured
// against when nothing else says how big the plate is.
const DEFAULT_BOX = 28;

// A glyph face is sized as a fraction of its own plate rather than
// pinned to `ICON_SIZE` like an icon is, because the two are bounded by
// different edges: an icon is a square and fits if its *height* does,
// while "AA" is about 1.4 characters wide per character and runs out of
// plate sideways first. At `ICON_SIZE` in a 20px button it would be
// wider than the button itself. This ratio keeps roughly a character's
// worth of air either side at every size the app actually uses.
const GLYPH_RATIO = 0.62;

// What "on" looks like. By default the border is the only thing saying
// it: a white rule for on, and nothing at all for off — transparent
// rather than absent, so switching one on doesn't shift the row by a
// pixel.
//
// `filled` trades that rule for the plate itself: the ground and the
// glyph swap roles (`--kbrd-color-contrast` against `--kbrd-color-body`,
// so white-on-black in the dark theme and black-on-white in the light
// one). It's the louder of the two, and what a row wants whenever the
// border alone doesn't carry: buttons sitting shoulder to shoulder
// inside an `ActionIcon.Group` (the Position block's alignments), where
// the rule is one of seven edges already drawn side by side; and small
// plates (both of those rows are 20px), where there isn't enough edge
// left for a 1px rule to say much. `--ai-hover` takes the same
// colour, so pointing at the button that's already on doesn't grey it
// back down.
const stateVars = (active: boolean, filled: boolean) =>
  active && filled
    ? {
        "--ai-bg": "var(--kbrd-color-contrast)",
        "--ai-hover": "var(--kbrd-color-contrast)",
        "--ai-color": "var(--kbrd-color-body)",
        "--ai-bd": "1px solid var(--kbrd-color-contrast)",
      }
    : {
        "--ai-bg": "transparent",
        "--ai-bd": `1px solid ${
          active ? "var(--kbrd-color-contrast)" : "transparent"
        }`,
      };

type Props = {
  // Both the accessible name and the native tooltip — a button drawn from
  // an icon carries no text of its own, and one drawn from a `glyph`
  // carries a sample rather than a name ("AA" is not "Uppercase").
  label: string;
  // Degrees to turn the glyph by, for a row built out of one glyph shown
  // at several angles (an alignment's up/down icons turned onto left and
  // right, a height marker turned into a width one).
  rotate?: number;
  active: boolean;
  // The button's own box, in pixels. Left off it's `ActionIcon`'s `md`,
  // the 28px square a button standing on its own row wants; a row tucked
  // under the fields it writes to passes something shorter.
  size?: number;
  // Paint the "on" state rather than outlining it — see `stateVars`.
  filled?: boolean;
  disabled?: boolean;
  onClick: () => void;
  // The button's face, of which exactly one is given. `Icon` is the usual
  // one; `glyph` is for a button whose face *is* text — the Typography
  // block's casing and script toggles, where the option is best shown by
  // an example of what it does ("Aa", "AA", "A²") and no icon says it
  // half as directly.
  //
  // Both are optional rather than a discriminated union, which reads
  // better but collapses under Storybook's own `Partial<Props>` args (a
  // union of two objects, each forbidding the other's key, leaves no
  // partial that can carry either). `Icon` wins if somehow both arrive.
  Icon?: IconType;
  glyph?: string;
};

/**
 * One of the little two-state icon buttons the property panels are built
 * from — a text emphasis, an alignment, a ratio lock. Both states are
 * drawn by hand: `default`'s own look is a filled grey plate, and no
 * variant gives a white rule. Set through Mantine's own vars so the
 * button keeps its hover and focus behaviour rather than having it
 * overridden away.
 */
export default function IconToggle({
  label,
  Icon,
  glyph,
  rotate,
  active,
  size,
  filled = false,
  disabled = false,
  onClick,
}: Props) {
  const glyphSize = Math.round((size ?? DEFAULT_BOX) * GLYPH_RATIO);

  return (
    <ActionIcon
      size={size ?? "md"}
      radius={RADIUS}
      aria-label={label}
      aria-pressed={active}
      title={label}
      variant="default"
      color="gray"
      disabled={disabled}
      style={
        {
          ...stateVars(active, filled),
          // An `ActionIcon.Group` squares off the corners its children
          // share and halves the border running between them, leaving a
          // strip rather than a row of buttons. These two put back what a
          // lone button has: the same radius on all four corners, and one
          // whole border all the way round. Inline, since what they undo
          // is set on the property itself (`border-radius: 0`) rather
          // than through a variable.
          borderRadius: RADIUS,
          borderWidth: 1,
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      {Icon ? (
        <Icon
          size={ICON_SIZE}
          style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
        />
      ) : (
        // `lineHeight: 1` so the face is exactly as tall as it is set,
        // with none of the leading a line of text would carry; `nowrap`
        // because a two-character face has to stay on one line even on
        // the smallest plate rather than break in half.
        <span
          aria-hidden
          style={{
            fontSize: glyphSize,
            lineHeight: 1,
            whiteSpace: "nowrap",
            transform: rotate ? `rotate(${rotate}deg)` : undefined,
          }}
        >
          {glyph}
        </span>
      )}
    </ActionIcon>
  );
}
