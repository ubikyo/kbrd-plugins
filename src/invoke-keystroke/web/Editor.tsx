import { Group, MultiSelect, NumberInput, Select, Stack, Text } from "@mantine/core";

import type { KeystrokeConfig } from "./index";

const modifiers = [
  ["LEFT_CTRL", "Left Ctrl"],
  ["LEFT_SHIFT", "Left Shift"],
  ["LEFT_ALT", "Left Alt"],
  ["LEFT_META", "Left Meta"],
  ["RIGHT_CTRL", "Right Ctrl"],
  ["RIGHT_SHIFT", "Right Shift"],
  ["RIGHT_ALT", "Right Alt"],
  ["RIGHT_META", "Right Meta"],
] as const;

const special = [
  "ENTER", "ESCAPE", "BACKSPACE", "TAB", "SPACE", "DELETE", "INSERT",
  "HOME", "END", "PAGE_UP", "PAGE_DOWN", "UP", "DOWN", "LEFT", "RIGHT",
  "CAPS_LOCK", "NUM_LOCK", "PRINT_SCREEN", "SCROLL_LOCK", "PAUSE",
] as const;

const punctuation = [
  "MINUS", "EQUAL", "LEFT_BRACKET", "RIGHT_BRACKET", "BACKSLASH",
  "SEMICOLON", "APOSTROPHE", "GRAVE", "COMMA", "PERIOD", "SLASH",
] as const;

const data = [
  {
    group: "Modifiers",
    items: modifiers.map(([value, label]) => ({ value, label })),
  },
  {
    group: "Letters",
    items: Array.from({ length: 26 }, (_, index) => {
      const value = String.fromCharCode(65 + index);
      return { value, label: value };
    }),
  },
  {
    group: "Numbers",
    items: "1234567890".split("").map((value) => ({ value, label: value })),
  },
  {
    group: "Function keys",
    items: Array.from({ length: 12 }, (_, index) => {
      const value = `F${index + 1}`;
      return { value, label: value };
    }),
  },
  {
    group: "Special keys",
    items: special.map((value) => ({ value, label: value.replaceAll("_", " ") })),
  },
  {
    group: "Punctuation",
    items: punctuation.map((value) => ({ value, label: value.replaceAll("_", " ") })),
  },
];

export default function Editor({
  config,
  onChange,
  disabled = false,
}: {
  config: KeystrokeConfig;
  onChange: (value: KeystrokeConfig) => void;
  disabled?: boolean;
}) {
  const behavior = config.behavior === "tap" ? "tap" : "hold";

  return (
    <Stack gap="md">
      <Stack gap={6}>
        <Text size="sm">Keys</Text>
        <MultiSelect
          searchable
          clearable
          data={data}
          value={Array.isArray(config.keys) ? config.keys : []}
          disabled={disabled}
          placeholder="Select a key combination"
          maxValues={14}
          onChange={(keys) => onChange({ ...config, keys })}
        />
      </Stack>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm">Behavior</Text>
        <Select
          w={160}
          size="xs"
          allowDeselect={false}
          data={[
            { value: "hold", label: "Hold while pressed" },
            { value: "tap", label: "Tap once" },
          ]}
          value={behavior}
          disabled={disabled}
          onChange={(value) =>
            onChange({ ...config, behavior: value === "tap" ? "tap" : "hold" })
          }
        />
      </Group>
      {behavior === "tap" && (
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm">Duration</Text>
          <NumberInput
            w={160}
            size="xs"
            min={10}
            max={5000}
            step={10}
            suffix=" ms"
            value={config.durationMs ?? 50}
            disabled={disabled}
            onChange={(value) =>
              onChange({ ...config, durationMs: Number(value) || 50 })
            }
          />
        </Group>
      )}
    </Stack>
  );
}
