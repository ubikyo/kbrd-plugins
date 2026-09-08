import { ColorInput, Group } from "@mantine/core";

import NumberField from "./NumberField";

type Props = {
  value: string;
  onChange: (value: string) => void;
  // Adds the Opacity field beside the hex one, and with it the alpha byte
  // in the value handed back. Off by default: a color with no use for
  // transparency is better off without a field that can only make it
  // vanish — `Border`'s own color leaves it out, and so gets plain
  // `#rrggbb`.
  withOpacity?: boolean;
  disabled?: boolean;
  "aria-label": string;
};

// With `withOpacity`, the two fields between them own one `#rrggbbaa`
// string: the ColorInput shows the `#rrggbb` half, the NumberInput the
// alpha half as a percentage. Alpha is kept out of the hex text on purpose
// — a raw `AA` byte is a worse way to say "50% opaque" than "50 %" is.
const OPAQUE = 100;

const rgbOf = (value: string) => value.slice(0, 7);

function alphaOf(value: string) {
  // Anything shorter than `#rrggbbaa` never had an alpha byte to read —
  // an old 6-digit value, or a half-typed one.
  if (value.length < 9) return OPAQUE;
  const byte = Number.parseInt(value.slice(7, 9), 16);
  return Number.isNaN(byte) ? OPAQUE : Math.round((byte / 255) * OPAQUE);
}

// Always writes the 8-digit form, whatever came in — the alpha field can
// only be read back from a value that actually carries it.
function withParts(rgb: string, alpha: number) {
  const byte = Math.round(
    (Math.min(OPAQUE, Math.max(0, alpha)) / OPAQUE) * 255,
  );
  return `${rgbOf(rgb)}${byte.toString(16).padStart(2, "0")}`;
}

/**
 * A bare Mantine `ColorInput` — the `unstyled` variant, no background or
 * border of its own, and no visible label (only `aria-label`, for
 * accessibility) — for compact rows that build their own layout instead
 * of relying on Mantine's usual bordered-field chrome. First used inside
 * `Border`'s own color field, and directly wherever a color is the only
 * field needed (e.g. `kbrd.layout-key`'s own Background setting).
 *
 * One value in, one value out either way: a caller hands it one string and
 * gets one back — `#rrggbbaa` with `withOpacity` (presented as a hex field
 * plus an opacity field), plain `#rrggbb` without it. An incoming value
 * carrying an alpha byte its caller no longer wants loses it on the next
 * edit, which is the point: the field's own mode decides the shape of what
 * gets stored.
 */
export default function Color({
  value,
  onChange,
  withOpacity = false,
  disabled = false,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <Group
      gap="xs"
      wrap="nowrap"
      align="center"
      style={{ width: "fit-content" }}
    >
      <ColorInput
        variant="unstyled"
        size="xs"
        // Sized to its own content, not stretched to fill whatever
        // container it's dropped into (a CSS grid's own `1fr` track
        // otherwise stretches a block-level input to its full width even
        // with no explicit `w="100%"` — see `Border`'s own fields).
        w={85}
        // `hex`, not `hexa`: the alpha half of the value belongs to the
        // opacity field beside this one, so neither the text nor the
        // picker's own slider should offer it here.
        format="hex"
        // The native browser EyeDropper picker is one more affordance than
        // this compact a field has room for — the swatch + hex text is
        // already the whole point of it.
        withEyeDropper={false}
        aria-label={ariaLabel}
        value={rgbOf(value)}
        disabled={disabled}
        onChange={(rgb) =>
          onChange(withOpacity ? withParts(rgb, alphaOf(value)) : rgbOf(rgb))
        }
        styles={{
          input: {
            background: "none",
            border: "none",
            // Mantine's own `unstyled` variant zeroes *every* input padding,
            // `padding-inline-start` included — which is also what makes
            // room for the color swatch (the input's `leftSection`). Without
            // this the hex text renders flush left, right on top of it.
            paddingInlineStart: 25,
            // Display only — Mantine writes the hex back in lowercase and
            // that's what stays in the config; this just keeps the field
            // reading as `#FFFFFF` rather than `#ffffff`.
            textTransform: "uppercase",
          },
          // The swatch itself defaults to a full circle — squared off to a
          // 3px radius instead. It's `--cs-radius` rather than
          // `borderRadius` because the color is painted by
          // absolutely-positioned overlay children that each read that
          // variable for their own radius; rounding off only the root would
          // leave them round.
          colorPreview: { "--cs-radius": "3px" } as React.CSSProperties,
          // The section holding that swatch is normally as wide as the
          // input is tall (`--section-size`), which on an unstyled field
          // just pads dead space around the swatch — let it shrink to the
          // swatch itself instead. The hex text's own offset comes from
          // `input`'s `padding-inline-start` above, not from this.
          section: { width: "auto" },
        }}
      />
      {withOpacity && (
        <NumberField
          aria-label="Opacity"
          width={40}
          min={0}
          max={OPAQUE}
          suffix="%"
          value={alphaOf(value)}
          disabled={disabled}
          onChange={(alpha) => onChange(withParts(value, alpha))}
        />
      )}
    </Group>
  );
}
