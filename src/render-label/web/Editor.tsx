import {
  ColorInput,
  Input,
  Select,
  Slider,
  Stack,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";

import type { LabelConfig } from "./index";
import Placement from "../../shared/web/Placement";
import PropertyRow from "../../shared/web/PropertyRow";
import { fontSizeMarks, fontSizeValue } from "../../shared/web/fontSize";

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
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadFonts()
      .then((values) => {
        if (!cancelled) {
          setFonts(values);
          setFontError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setFonts([]);
          setFontError(
            cause instanceof Error ? cause.message : "Unable to load fonts",
          );
        }
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
      <PropertyRow label="Text">
        <TextInput
          w="100%"
          aria-label="Text"
          value={config.text}
          disabled={disabled}
          error={config.text.trim() ? undefined : "Text is required"}
          success={Boolean(config.text.trim())}
          onChange={(event) => set("text", event.currentTarget.value)}
        />
      </PropertyRow>
      <PropertyRow label="Font">
        <Select
          w="100%"
          aria-label="Font"
          placeholder="Choose a font"
          searchable
          allowDeselect={false}
          data={fonts}
          value={config.font ?? "Inter_18pt-Regular.ttf"}
          disabled={disabled}
          error={fontError || undefined}
          success={!fontError && fonts.length > 0}
          onChange={(value) => value && set("font", value)}
        />
      </PropertyRow>
      <PropertyRow label="Size" align="top">
        <Input.Wrapper w="100%" pb="sm">
          <Slider
            labelAlwaysOn
            mt="xl"
            min={2}
            max={12}
            step={0.1}
            disabled={disabled}
            value={fontSizeValue(config.size)}
            onChange={(value) => set("size", value)}
            marks={fontSizeMarks}
            styles={{
              markLabel: { fontSize: 11, whiteSpace: "nowrap" },
            }}
          />
        </Input.Wrapper>
      </PropertyRow>
      <PropertyRow label="Color">
        <ColorInput
          w="100%"
          aria-label="Color"
          format="hex"
          value={config.color}
          disabled={disabled}
          error={/^#[0-9a-f]{6}$/i.test(config.color) ? undefined : "Invalid color"}
          success={/^#[0-9a-f]{6}$/i.test(config.color)}
          swatches={swatches}
          closeOnColorSwatchClick
          onChange={(value) => set("color", value)}
        />
      </PropertyRow>
      <Placement
        config={config}
        onChange={onChange}
        disabled={disabled}
      />
    </Stack>
  );
}
