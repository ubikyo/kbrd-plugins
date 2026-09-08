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

// The border is the only thing saying whether a button is on: a white
// rule for on, and nothing at all for off — transparent rather than
// absent, so switching one on doesn't shift the row by a pixel.
const borderFor = (active: boolean) =>
  `1px solid ${active ? "#ffffff" : "transparent"}`;

type Props = {
  // Both the accessible name and the native tooltip — these buttons carry
  // no text of their own.
  label: string;
  Icon: IconType;
  // Degrees to turn the glyph by, for a row built out of one glyph shown
  // at several angles (an alignment's up/down icons turned onto left and
  // right, a height marker turned into a width one).
  rotate?: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
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
  rotate,
  active,
  disabled = false,
  onClick,
}: Props) {
  return (
    <ActionIcon
      size="md"
      radius={RADIUS}
      aria-label={label}
      aria-pressed={active}
      title={label}
      variant="default"
      color="gray"
      disabled={disabled}
      style={
        {
          "--ai-bg": "transparent",
          "--ai-bd": borderFor(active),
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
      <Icon
        size={ICON_SIZE}
        style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      />
    </ActionIcon>
  );
}
