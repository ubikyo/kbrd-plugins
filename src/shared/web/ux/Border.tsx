import { Group, NumberInput, Select } from "@mantine/core";

import Color from "./Color";

export type BorderStyleValue = "solid" | "dashed-short" | "dashed-long";

export type BorderValue = {
  color: string;
  style: BorderStyleValue;
  width: number;
};

const STYLE_OPTIONS: { value: BorderStyleValue; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed-short", label: "Short dash" },
  { value: "dashed-long", label: "Long dash" },
];

type Props = {
  value: BorderValue;
  onChange: (value: BorderValue) => void;
  disabled?: boolean;
};

/**
 * One-line color / style / width control for a border. Every Mantine
 * field here is the bare `unstyled` variant (see `Color`) — no
 * background or border of its own — and never shows its own label; a
 * caller that wants one wraps this in its own labeled row (or, like
 * `kbrd.layout-key`'s own Border setting, a section whose own title
 * already says what it is).
 */
export default function Border({ value, onChange, disabled = false }: Props) {
  return (
    <Group gap="xs" wrap="nowrap" align="center" style={{ width: "fit-content" }}>
      <Color
        aria-label="Border color"
        value={value.color}
        disabled={disabled}
        onChange={(color) => onChange({ ...value, color })}
      />
      <Select
        variant="unstyled"
        size="xs"
        // Sized to fit its own longest option ("Short dash"/"Long dash")
        // rather than stretched to fill its container — see `Color`'s own
        // `w` for why that needs to be explicit.
        w={110}
        aria-label="Border style"
        allowDeselect={false}
        data={STYLE_OPTIONS}
        value={value.style}
        disabled={disabled}
        onChange={(next) =>
          onChange({ ...value, style: (next as BorderStyleValue | null) ?? value.style })
        }
        styles={{ input: { background: "none", border: "none" } }}
      />
      <NumberInput
        variant="unstyled"
        size="xs"
        w={60}
        aria-label="Border width"
        min={0}
        allowDecimal={false}
        clampBehavior="strict"
        value={value.width}
        disabled={disabled}
        onChange={(next) =>
          onChange({ ...value, width: typeof next === "number" ? next : 0 })
        }
        styles={{ input: { background: "none", border: "none" } }}
      />
    </Group>
  );
}
