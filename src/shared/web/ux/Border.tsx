import {
  Box,
  Combobox,
  Group,
  InputBase,
  useCombobox,
} from "@mantine/core";

import Color from "./Color";
import NumberField from "./NumberField";

export type BorderStyleValue = "solid" | "dashed" | "dotted";

export type BorderValue = {
  color: string;
  style: BorderStyleValue;
  width: number;
};

// Deliberately the same three words CSS uses for its own `border-style`,
// which is what lets each option be drawn with nothing but a `border-top`
// in that style — no hand-built dash patterns to keep in step with the
// names.
const STYLE_OPTIONS: BorderStyleValue[] = ["solid", "dashed", "dotted"];

/** Each style as the SVG dash pattern that draws it, for the renderers
 * that paint a border rather than preview one (`stroke-dasharray`, in the
 * unscaled space `vector-effect: non-scaling-stroke` gives them — so the
 * lengths read as pixels on screen, whatever the display's own zoom).
 * `undefined` for `solid`: no pattern at all is the line. */
export const BORDER_DASHES: Record<BorderStyleValue, string | undefined> = {
  solid: undefined,
  dashed: "4 3",
  dotted: "1 2",
};

/** What the border-style dropdown shows instead of a word: a short rule
 * drawn in the style itself, both in the closed field and in each option
 * of the list. `aria-hidden` because it says nothing a screen reader can
 * use — the name is carried by its own `aria-label` (see the two callers
 * below). */
function StylePreview({ style }: { style: BorderStyleValue }) {
  return (
    <Box
      aria-hidden
      style={{
        width: 20,
        // No height and no other side: the element *is* the line.
        borderTop: `1px ${style} currentColor`,
      }}
    />
  );
}

type Props = {
  value: BorderValue;
  onChange: (value: BorderValue) => void;
  disabled?: boolean;
};

/**
 * One-line color / style / width control for a border, handing back all
 * three as one `BorderValue`. Every Mantine field here is the bare
 * `unstyled` variant (see `Color`) — no background or border of its own —
 * and never shows its own label; a caller that wants one wraps this in its
 * own labeled row (or, like `render-key`'s own Border group, a section
 * whose own title already says what it is).
 *
 * The color field is the one place here that deliberately opts out of
 * `Color`'s Opacity half: a border that can be faded to nothing while
 * still costing its width is a worse control than a plain `#rrggbb` one,
 * so `value.color` stays 6-digit hex.
 */
export default function Border({ value, onChange, disabled = false }: Props) {
  const styles = useCombobox({
    onDropdownClose: () => styles.resetSelectedOption(),
  });

  return (
    <Group
      gap="xs"
      wrap="nowrap"
      align="center"
      style={{ width: "fit-content" }}
    >
      <Color
        aria-label="Border color"
        value={value.color}
        disabled={disabled}
        onChange={(color) => onChange({ ...value, color })}
      />
      {/* A plain `Select` can only put text in its own input, so the
          closed field would fall back to the word this is meant to
          replace — hence Mantine's `Combobox` primitive, whose target is
          any element we like (their own "custom select" pattern). */}
      <Combobox
        store={styles}
        // `bottom`, not Popover's usual `bottom-start`: the list is wider
        // than the 40px field it belongs to, so it's centred on it rather
        // than hung off its left edge.
        position="bottom"
        // Combobox's own default is `width: "target"`, which pins the list
        // to the field's exact 40px — same width, so nothing to centre.
        // Sized to its own options instead, and the centring shows.
        width="auto"
        styles={{
          dropdown: { borderRadius: 2 },
          option: { padding: "10px 5px" },
        }}
        onOptionSubmit={(option) => {
          onChange({ ...value, style: option as BorderStyleValue });
          styles.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            variant="unstyled"
            size="xs"
            w={40}
            pointer
            rightSection={<Combobox.Chevron size="xs" />}
            rightSectionPointerEvents="none"
            aria-label={`Border style, ${value.style}`}
            disabled={disabled}
            onClick={() => styles.toggleDropdown()}
            styles={{
              input: {
                background: "none",
                border: "none",
                // A button, not a text input: its content needs centring
                // by hand, and the chevron its own room (see `Color` for
                // why `unstyled` leaves no padding of its own).
                display: "flex",
                alignItems: "center",
                paddingInlineEnd: 18,
              },
              section: { width: "auto" },
            }}
          >
            <StylePreview style={value.style} />
          </InputBase>
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options>
            {STYLE_OPTIONS.map((style) => (
              <Combobox.Option value={style} key={style} aria-label={style}>
                <StylePreview style={style} />
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <NumberField
        aria-label="Border width"
        width={20}
        min={0}
        max={100}
        value={value.width}
        disabled={disabled}
        onChange={(width) => onChange({ ...value, width })}
      />
    </Group>
  );
}
