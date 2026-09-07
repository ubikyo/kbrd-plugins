import { Box, Group, Select, TextInput } from "@mantine/core";
import { Color, PropertyGroup } from "@kbrd/plugins/web";
import { useEffect, useState } from "react";

import type { LabelConfig } from "./index";
import { fontSizeOptions } from "../../shared/web/fontSize";
import type { NamedFontSize } from "../../shared/web/fontSize";

// The fields this editor's one property group owns — adding the group
// writes all of them, removing it clears all of them, and the group counts
// as present as soon as any one of them is stored.
const TYPOGRAPHY_KEYS = ["text", "font", "size", "color"] as const;

type Props = {
  // Already merged over the plugin's `defaultConfig` by the host, so every
  // field below has a value to show even when the instance stores none.
  config: LabelConfig;
  // What the instance actually stores — the difference between "set to the
  // default value" and "not set", which is what the property group's own
  // open/closed state means. See `PluginEditorProps` in kbrd-web.
  definedConfig?: Partial<LabelConfig>;
  onChange: (value: Partial<LabelConfig>) => void;
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

export default function MappingEditor({
  config,
  definedConfig,
  onChange,
  disabled = false,
}: Props) {
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

  // Every write builds on what's stored, not on the merged view — editing
  // one field must not silently set every other one to its default.
  const stored: Partial<LabelConfig> = definedConfig ?? config;

  function set<K extends keyof LabelConfig>(key: K, value: LabelConfig[K]) {
    onChange({ ...stored, [key]: value });
  }

  const typographySet = TYPOGRAPHY_KEYS.some(
    (key) => stored[key] !== undefined,
  );

  // `+` stores the values already on show (the defaults, unless something
  // was set); `×` drops them again, leaving the renderer back on its own
  // defaults.
  function addTypography() {
    const added: Partial<LabelConfig> = { ...stored };
    for (const key of TYPOGRAPHY_KEYS) {
      (added as Record<string, unknown>)[key] = config[key];
    }
    onChange(added);
  }

  function removeTypography() {
    const remaining: Partial<LabelConfig> = { ...stored };
    for (const key of TYPOGRAPHY_KEYS) delete remaining[key];
    onChange(remaining);
  }

  return (
    <PropertyGroup
      title="Typography"
      active={typographySet}
      onAdd={addTypography}
      onRemove={removeTypography}
    >
      <TextInput
        variant="unstyled"
        size="xs"
        aria-label="Text"
        value={config.text}
        disabled={disabled}
        onChange={(event) => set("text", event.currentTarget.value)}
      />
      <Group gap="xs" wrap="nowrap" mt="xs">
        <Select
          variant="unstyled"
          size="xs"
          style={{ flex: 1, minWidth: 0 }}
          aria-label="Font"
          placeholder="Choose a font"
          searchable
          allowDeselect={false}
          data={fonts}
          value={config.font}
          disabled={disabled}
          error={fontError || undefined}
          onChange={(value) => value && set("font", value)}
        />
        <Select
          variant="unstyled"
          size="xs"
          w={64}
          aria-label="Size"
          allowDeselect={false}
          data={fontSizeOptions}
          value={config.size}
          disabled={disabled}
          onChange={(value) => value && set("size", value as NamedFontSize)}
        />
      </Group>
      <Box mt="xs">
        <Color
          aria-label="Text color"
          value={config.color}
          disabled={disabled}
          onChange={(value) => set("color", value)}
        />
      </Box>
    </PropertyGroup>
  );
}
