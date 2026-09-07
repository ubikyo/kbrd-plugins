import { ActionIcon, ColorInput, Text } from "@mantine/core";

type Props = {
  value: string;
  onChange: (value: string) => void;
  // When given, a `×` at the end of the field hands the color back to
  // "none". What "none" is stays the caller's business — `render-key`'s
  // own Background writes fully transparent, which is also what it starts
  // out as. Callers whose color is always set leave this out and get no
  // button (e.g. `Border`, where clearing the color would just make the
  // border invisible while still costing its width).
  onClear?: () => void;
  disabled?: boolean;
  "aria-label": string;
};

/**
 * A bare Mantine `ColorInput` — the `unstyled` variant, no background or
 * border of its own, and no visible label (only `aria-label`, for
 * accessibility) — for compact rows that build their own layout instead
 * of relying on Mantine's usual bordered-field chrome. First used inside
 * `Border`'s own color field, and directly wherever a color is the only
 * field needed (e.g. `kbrd.layout-key`'s own Background setting).
 */
export default function Color({
  value,
  onChange,
  onClear,
  disabled = false,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <ColorInput
      variant="unstyled"
      size="xs"
      // Sized to its own content, not stretched to fill whatever
      // container it's dropped into (a CSS grid's own `1fr` track
      // otherwise stretches a block-level input to its full width even
      // with no explicit `w="100%"` — see `Border`'s own fields).
      w={115}
      format="hexa"
      // The native browser EyeDropper picker is one more affordance than
      // this compact a field has room for — the swatch + hex text is
      // already the whole point of it.
      withEyeDropper={false}
      rightSection={
        onClear ? (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xs"
            radius={0}
            aria-label={`Clear ${ariaLabel}`}
            disabled={disabled}
            onClick={onClear}
          >
            <Text size="xs" span>
              ×
            </Text>
          </ActionIcon>
        ) : undefined
      }
      // The section is inert by default (it only ever holds Mantine's own
      // eye-dropper icon), so the `×` inside it would never receive the
      // click without this.
      rightSectionPointerEvents="all"
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      onChange={onChange}
      styles={{
        input: {
          background: "none",
          border: "none",
          // Mantine's own `unstyled` variant zeroes *every* input padding,
          // `padding-inline-start` included — which is also what makes
          // room for the color swatch (the input's `leftSection`). Without
          // this the hex text renders flush left, right on top of it.
          paddingInlineStart: 25,
          // Same reason on this side, for the `×`: without it the hex text
          // runs underneath the button. Kept at 0 when there's no button,
          // so the hex sits as far right as the field allows.
          paddingInlineEnd: onClear ? 20 : 0,
          // Display only — Mantine writes the hex back in lowercase and
          // that's what stays in the config; this just keeps the field
          // reading as `#FFFFFFFF` rather than `#ffffffff`.
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
  );
}
