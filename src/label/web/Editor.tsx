import {
  Box,
  ColorPicker,
  Input,
  Select,
  Slider,
  Stack,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";

import type { LabelConfig } from "./index";
import Placement from "../../shared/web/Placement";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const swatches = [
  "#ffffff",
  "#adb5bd",
  "#ff6b6b",
  "#ffd43b",
  "#51cf66",
  "#339af0",
  "#845ef7",
  "#000000",
];

type Props = {
  config: LabelConfig;
  onChange: (value: LabelConfig) => void;
  disabled?: boolean;
};

type FontOption = { value: string; label: string };
let fontsRequest: Promise<FontOption[]> | undefined;

function loadFonts() {
  fontsRequest ??= fetch("/api/fonts").then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as FontOption[];
  });
  return fontsRequest;
}

export default function Editor({ config, onChange, disabled = false }: Props) {
  const [fonts, setFonts] = useState<FontOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    void loadFonts()
      .then((values) => {
        if (!cancelled) setFonts(values);
      })
      .catch(() => {
        if (!cancelled) setFonts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function set<K extends keyof LabelConfig>(key: K, value: LabelConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <Stack gap="md">
      <TextInput
        label="Text"
        value={config.text}
        disabled={disabled}
        onChange={(event) => set("text", event.currentTarget.value)}
      />
      <Select
        label="Font"
        placeholder="Choose a font"
        searchable
        allowDeselect={false}
        data={fonts}
        value={config.font ?? "Inter_18pt-Regular.ttf"}
        disabled={disabled}
        onChange={(value) => value && set("font", value)}
      />
      <Input.Wrapper label="Size" pb="sm">
        <Slider
          mt="xs"
          min={0}
          max={4}
          step={1}
          restrictToMarks
          disabled={disabled}
          value={sizes.indexOf(config.size)}
          onChange={(value) => set("size", sizes[value])}
          marks={sizes.map((label, value) => ({ value, label }))}
        />
      </Input.Wrapper>
      <Input.Wrapper label="Color">
        <Box
          mt="xs"
          style={{
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? "none" : undefined,
          }}
        >
          <ColorPicker
            fullWidth
            format="hex"
            value={config.color}
            onChange={(value) => set("color", value)}
            swatches={swatches}
          />
        </Box>
      </Input.Wrapper>
      <Placement config={config} onChange={onChange} disabled={disabled} />
    </Stack>
  );
}
