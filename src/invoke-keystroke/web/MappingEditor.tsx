import { MultiSelect, NumberInput, Select, Stack } from "@mantine/core";

import type { KeystrokeConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

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
  const keys = Array.isArray(config.keys) ? config.keys : [];

  return (
    <Stack gap="md">
      <PropertyRow label="Keys">
        <MultiSelect
          w="100%"
          searchable
          clearable
          data={data}
          value={keys}
          disabled={disabled}
          placeholder="Select a key combination"
          maxValues={14}
          error={keys.length === 0 ? "Select at least one key" : undefined}
          success={keys.length > 0}
          onChange={(keys) => onChange({ ...config, keys })}
        />
      </PropertyRow>
      <PropertyRow label="Behavior">
        <Select
          w="100%"
          size="xs"
          allowDeselect={false}
          data={[
            { value: "hold", label: "Hold while pressed" },
            { value: "tap", label: "Tap once" },
          ]}
          value={behavior}
          disabled={disabled}
          success
          onChange={(value) =>
            onChange({ ...config, behavior: value === "tap" ? "tap" : "hold" })
          }
        />
      </PropertyRow>
      {behavior === "tap" && (
        <PropertyRow label="Duration">
          <NumberInput
            w="100%"
            size="xs"
            min={10}
            max={5000}
            step={10}
            suffix=" ms"
            value={config.durationMs ?? 50}
            disabled={disabled}
            error={
              (config.durationMs ?? 50) < 10 || (config.durationMs ?? 50) > 5000
                ? "Duration must be between 10 and 5000 ms"
                : undefined
            }
            success={
              (config.durationMs ?? 50) >= 10 &&
              (config.durationMs ?? 50) <= 5000
            }
            onChange={(value) =>
              onChange({ ...config, durationMs: Number(value) || 50 })
            }
          />
        </PropertyRow>
      )}
    </Stack>
  );
}
